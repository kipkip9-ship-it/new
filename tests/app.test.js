'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { expect } = Code;
const { experiment, test } = exports.lab = Lab.script({
    timeout: 10000,
});
const createServer = require('../src/app');

// ---------------------------------------------------------------------------
// Helper: spin up a server, inject, stop. No DB touched.
// ---------------------------------------------------------------------------
const inject = async(method, url, payload) => {
    const server = await createServer();
    try {
        const options = { method, url };
        if (payload !== undefined) {
            options.payload = payload;
        }
        return await server.inject(options);
    } finally {
        await server.stop();
    }
};

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
experiment('Health check', () => {
    test('GET /health returns 200 with success payload', async() => {
        const response = await inject('GET', '/health');

        expect(response.statusCode).to.equal(200);
        expect(response.result).to.equal({
            status: 'success',
            message: 'Users API is running!',
        });
    });
});

// ---------------------------------------------------------------------------
// Users — validation
// ---------------------------------------------------------------------------
experiment('Users API validation', () => {
    test('GET /api/users/abc rejects non-numeric ID (400)', async() => {
        const response = await inject('GET', '/api/users/abc');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/users/0 rejects zero ID (400)', async() => {
        const response = await inject('GET', '/api/users/0');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/users/-5 rejects negative ID (400)', async() => {
        const response = await inject('GET', '/api/users/-5');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/users/1.5 rejects non-integer ID (400)', async() => {
        const response = await inject('GET', '/api/users/1.5');
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/users without first_name returns 400', async() => {
        const response = await inject('POST', '/api/users', {
            last_name: 'Doe',
            email: 'john@example.com',
            department_id: 1,
        });
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/users without email returns 400', async() => {
        const response = await inject('POST', '/api/users', {
            first_name: 'John',
            last_name: 'Doe',
            department_id: 1,
        });
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/users with invalid email format returns 400', async() => {
        const response = await inject('POST', '/api/users', {
            first_name: 'John',
            last_name: 'Doe',
            email: 'not-an-email',
            department_id: 1,
        });
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/users with invalid role returns 400', async() => {
        const response = await inject('POST', '/api/users', {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            department_id: 1,
            role: 'superuser',
        });
        expect(response.statusCode).to.equal(400);
    });

    test('PUT /api/users/1 with empty body returns 400 (.min(1))', async() => {
        const response = await inject('PUT', '/api/users/1', {});
        expect(response.statusCode).to.equal(400);
    });

    test('PUT /api/users/abc with empty body returns 400', async() => {
        const response = await inject('PUT', '/api/users/abc', {});
        expect(response.statusCode).to.equal(400);
    });
});

// ---------------------------------------------------------------------------
// Departments — validation
// ---------------------------------------------------------------------------
experiment('Departments API validation', () => {
    test('GET /api/departments/abc rejects non-numeric ID (400)', async() => {
        const response = await inject('GET', '/api/departments/abc');
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/departments without name returns 400', async() => {
        const response = await inject('POST', '/api/departments', {
            description: 'No name provided',
        });
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/departments with 1-char name returns 400', async() => {
        const response = await inject('POST', '/api/departments', {
            name: 'X',
        });
        expect(response.statusCode).to.equal(400);
    });

    test('PUT /api/departments/1 with empty body returns 400', async() => {
        const response = await inject('PUT', '/api/departments/1', {});
        expect(response.statusCode).to.equal(400);
    });
});

// ---------------------------------------------------------------------------
// Tasks — validation
// ---------------------------------------------------------------------------
experiment('Tasks API validation', () => {
    test('GET /api/tasks?status=bogus returns 400', async() => {
        const response = await inject('GET', '/api/tasks?status=bogus');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks?foo=bar returns 400 (.unknown(false))', async() => {
        const response = await inject('GET', '/api/tasks?foo=bar');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks/filter?status=bogus returns 400', async() => {
        const response = await inject('GET', '/api/tasks/filter?status=bogus');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks/filter?assigned_to=abc returns 400', async() => {
        const response = await inject('GET', '/api/tasks/filter?assigned_to=abc');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks/paginated?page=0 returns 400', async() => {
        const response = await inject('GET', '/api/tasks/paginated?page=0');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks/paginated?limit=101 returns 400', async() => {
        const response = await inject('GET', '/api/tasks/paginated?limit=101');
        expect(response.statusCode).to.equal(400);
    });

    test('GET /api/tasks/sort?sortBy=bogus returns 400', async() => {
        const response = await inject('GET', '/api/tasks/sort?sortBy=bogus');
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/tasks without title returns 400', async() => {
        const response = await inject('POST', '/api/tasks', {
            assigned_to: 1,
        });
        expect(response.statusCode).to.equal(400);
    });

    test('POST /api/tasks with invalid priority returns 400', async() => {
        const response = await inject('POST', '/api/tasks', {
            title: 'Do something',
            assigned_to: 1,
            priority: 'urgent',
        });
        expect(response.statusCode).to.equal(400);
    });
});

// ---------------------------------------------------------------------------
// Cross-cutting
// ---------------------------------------------------------------------------
experiment('Cross-cutting', () => {
    test('GET /api/nonexistent returns 404', async() => {
        const response = await inject('GET', '/api/nonexistent');
        expect(response.statusCode).to.equal(404);
    });
});