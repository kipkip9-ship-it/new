'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { expect } = Code;
const { experiment, test, beforeEach } = exports.lab = Lab.script({ timeout: 15000 });

const createServer = require('../src/app');
const pool = require('../src/config/database');

beforeEach(async() => {
    console.log('--- TRUNCATING ---');
    await pool.query('TRUNCATE tasks, users, departments RESTART IDENTITY CASCADE;');
});

// Helper: seed a department, return it
const seedDepartment = async(name) => {
    const departmentName = name || `Engineering-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { rows } = await pool.query(
        'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *', [departmentName, 'Test department']
    );
    return rows[0];
};

// Helper: seed a user, return it
const seedUser = async(departmentId, email = 'seed@example.com') => {
    const { rows } = await pool.query(
        `INSERT INTO users (first_name, last_name, email, department_id, role, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, ['Seed', 'User', email, departmentId, 'staff', 'active']
    );
    return rows[0];
};

// Helper: inject against a fresh server
const inject = async(method, url, payload) => {
    const server = await createServer();
    try {
        const options = { method, url };
        if (payload !== undefined) options.payload = payload;
        return await server.inject(options);
    } finally {
        await server.stop();
    }
};

// ---------------------------------------------------------------------------
// Users — DB-backed
// ---------------------------------------------------------------------------
experiment('Users API (DB)', () => {
    test('POST /api/users creates a user (201)', async() => {
        const dept = await seedDepartment();

        const response = await inject('POST', '/api/users', {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane@example.com',
            department_id: Number(dept.id),
        });

        expect(response.statusCode).to.equal(201);
        expect(response.result.status).to.equal('success');
        expect(response.result.data.email).to.equal('jane@example.com');
    });

    test('POST /api/users duplicate email returns 409', async() => {
        const dept = await seedDepartment();
        await seedUser(dept.id, 'dup@example.com');

        const response = await inject('POST', '/api/users', {
            first_name: 'Another',
            last_name: 'Person',
            email: 'dup@example.com',
            department_id: Number(dept.id),
        });

        expect(response.statusCode).to.equal(409);
    });

    test('POST /api/users with nonexistent department returns 400', async() => {
        const response = await inject('POST', '/api/users', {
            first_name: 'Lost',
            last_name: 'Soul',
            email: 'lost@example.com',
            department_id: 99999,
        });

        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/users/{id} returns the user (200)', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'get@example.com');

        const response = await inject('GET', `/api/users/${user.id}`);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.email).to.equal('get@example.com');
    });

    test('GET /api/users/99999 returns 404', async() => {
        const response = await inject('GET', '/api/users/99999');
        expect(response.statusCode).to.equal(404);
    });

    test('PUT /api/users/{id} updates the user (200)', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'update@example.com');

        const response = await inject('PUT', `/api/users/${user.id}`, {
            first_name: 'Updated',
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.first_name).to.equal('Updated');
    });

    test('DELETE /api/users/{id} returns 204', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'del@example.com');

        const response = await inject('DELETE', `/api/users/${user.id}`);
        expect(response.statusCode).to.equal(204);
    });

    test('DELETE /api/users/{id} with assigned tasks returns 409', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'has-tasks@example.com');

        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Some task', user.id]
        );

        const response = await inject('DELETE', `/api/users/${user.id}`);
        expect(response.statusCode).to.equal(409);
    });
});

// ---------------------------------------------------------------------------
// Departments — DB-backed
// ---------------------------------------------------------------------------
experiment('Departments API (DB)', () => {
    test('POST /api/departments creates one (201)', async() => {
        const response = await inject('POST', '/api/departments', {
            name: 'Marketing',
        });

        expect(response.statusCode).to.equal(201);
        expect(response.result.data.name).to.equal('Marketing');
    });

    test('POST /api/departments duplicate name returns 409', async() => {
        await seedDepartment('Sales');

        const response = await inject('POST', '/api/departments', {
            name: 'Sales',
        });

        expect(response.statusCode).to.equal(409);
    });

    test('DELETE /api/departments/{id} with users returns 409', async() => {
        const dept = await seedDepartment('Blocked');
        await seedUser(dept.id, 'blocks@example.com');

        const response = await inject('DELETE', `/api/departments/${dept.id}`);
        expect(response.statusCode).to.equal(409);
    });
});

// ---------------------------------------------------------------------------
// Tasks — DB-backed
// ---------------------------------------------------------------------------
experiment('Tasks API (DB)', () => {
    test('POST /api/tasks creates one (201)', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'assignee@example.com');

        const response = await inject('POST', '/api/tasks', {
            title: 'Write tests',
            assigned_to: Number(user.id),
        });

        expect(response.statusCode).to.equal(201);
        expect(response.result.data.title).to.equal('Write tests');
    });

    test('POST /api/tasks with nonexistent assignee returns 400', async() => {
        const response = await inject('POST', '/api/tasks', {
            title: 'Impossible task',
            assigned_to: 99999,
        });

        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks lists tasks (200)', async() => {
        const response = await inject('GET', '/api/tasks');
        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
    });

    test('DELETE /api/tasks/{id} returns 204', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'taskowner@example.com');
        const { rows } = await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2) RETURNING *', ['To delete', user.id]
        );

        const response = await inject('DELETE', `/api/tasks/${rows[0].id}`);
        expect(response.statusCode).to.equal(204);
    });
});
// ---------------------------------------------------------------------------
// Success-path coverage — list, update, and task query endpoints
// ---------------------------------------------------------------------------
experiment('Users list (DB)', () => {
    test('GET /api/users returns an array of users (200)', async() => {
        const dept = await seedDepartment();
        await seedUser(dept.id, 'list1@example.com');
        await seedUser(dept.id, 'list2@example.com');

        const response = await inject('GET', '/api/users');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(2);
    });

    test('GET /api/users returns empty array when no users exist', async() => {
        const response = await inject('GET', '/api/users');

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(0);
    });
});

experiment('Departments list (DB)', () => {
    test('GET /api/departments returns an array of departments (200)', async() => {
        await seedDepartment('Eng');
        await seedDepartment('Sales');

        const response = await inject('GET', '/api/departments');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(2);
    });

    test('GET /api/departments returns empty array when no departments exist', async() => {
        const response = await inject('GET', '/api/departments');

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(0);
    });
});

experiment('Department update (DB)', () => {
    test('PUT /api/departments/{id} updates the name (200)', async() => {
        const dept = await seedDepartment('Original');

        const response = await inject('PUT', `/api/departments/${dept.id}`, {
            name: 'Renamed',
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data.name).to.equal('Renamed');
    });

    test('PUT /api/departments/{id} with duplicate name returns 409', async() => {
        await seedDepartment('Taken');
        const dept = await seedDepartment('Available');

        const response = await inject('PUT', `/api/departments/${dept.id}`, {
            name: 'Taken',
        });

        expect(response.statusCode).to.equal(409);
    });
});

experiment('Task update (DB)', () => {
    test('PUT /api/tasks/{id} updates the title (200)', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'task-update@example.com');
        const { rows } = await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2) RETURNING *', ['Original title', user.id]
        );

        const response = await inject('PUT', `/api/tasks/${rows[0].id}`, {
            title: 'Updated title',
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data.title).to.equal('Updated title');
    });

    test('PUT /api/tasks/{id} updates status and priority (200)', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'task-update2@example.com');
        const { rows } = await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2) RETURNING *', ['Status update test', user.id]
        );

        const response = await inject('PUT', `/api/tasks/${rows[0].id}`, {
            status: 'in_progress',
            priority: 'high',
        });

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.status).to.equal('in_progress');
        expect(response.result.data.priority).to.equal('high');
    });
});

experiment('Tasks filter (DB)', () => {
    test('GET /api/tasks/filter?status=pending returns matching tasks', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'filter@example.com');
        await pool.query(
            'INSERT INTO tasks (title, assigned_to, status) VALUES ($1, $2, $3)', ['Pending task', user.id, 'pending']
        );
        await pool.query(
            'INSERT INTO tasks (title, assigned_to, status) VALUES ($1, $2, $3)', ['Done task', user.id, 'completed']
        );

        const response = await inject('GET', '/api/tasks/filter?status=pending');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(1);
        expect(response.result.data[0].status).to.equal('pending');
    });

    test('GET /api/tasks/filter?priority=high returns matching tasks', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'filter2@example.com');
        await pool.query(
            'INSERT INTO tasks (title, assigned_to, priority) VALUES ($1, $2, $3)', ['High priority task', user.id, 'high']
        );
        await pool.query(
            'INSERT INTO tasks (title, assigned_to, priority) VALUES ($1, $2, $3)', ['Low priority task', user.id, 'low']
        );

        const response = await inject('GET', '/api/tasks/filter?priority=high');

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(1);
        expect(response.result.data[0].priority).to.equal('high');
    });
});

experiment('Tasks paginated (DB)', () => {
    test('GET /api/tasks/paginated?page=1&limit=10 returns pagination envelope', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'paginated@example.com');
        for (let i = 1; i <= 3; i++) {
            await pool.query(
                'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', [`Task ${i}`, user.id]
            );
        }

        const response = await inject('GET', '/api/tasks/paginated?page=1&limit=10');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(3);
    });

    test('GET /api/tasks/paginated respects limit', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'paginated2@example.com');
        for (let i = 1; i <= 5; i++) {
            await pool.query(
                'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', [`Paged ${i}`, user.id]
            );
        }

        const response = await inject('GET', '/api/tasks/paginated?page=1&limit=2');

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(2);
    });
});

experiment('Tasks search (DB)', () => {
    test('GET /api/tasks/search?title=Write returns matching tasks', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'search@example.com');
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Write documentation', user.id]
        );
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Read existing code', user.id]
        );

        const response = await inject('GET', '/api/tasks/search?title=Write');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(1);
        expect(response.result.data[0].title).to.include('Write');
    });

    test('GET /api/tasks/search with no matches returns empty array', async() => {
        const response = await inject('GET', '/api/tasks/search?title=zzzznomatch');

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(0);
    });
});

experiment('Tasks sort (DB)', () => {
    test('GET /api/tasks/sort?sortBy=title&order=asc returns sorted tasks', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'sort@example.com');
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Zebra', user.id]
        );
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Apple', user.id]
        );
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Mango', user.id]
        );

        const response = await inject('GET', '/api/tasks/sort?sortBy=title&order=asc');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
        expect(response.result.data.length).to.equal(3);
        expect(response.result.data[0].title).to.equal('Apple');
        expect(response.result.data[1].title).to.equal('Mango');
        expect(response.result.data[2].title).to.equal('Zebra');
    });

    test('GET /api/tasks/sort with default params returns 200', async() => {
        const dept = await seedDepartment();
        const user = await seedUser(dept.id, 'sortdefault@example.com');
        await pool.query(
            'INSERT INTO tasks (title, assigned_to) VALUES ($1, $2)', ['Some task', user.id]
        );

        const response = await inject('GET', '/api/tasks/sort');

        expect(response.statusCode).to.equal(200);
        expect(response.result.status).to.equal('success');
        expect(response.result.data).to.be.an.array();
    });
});