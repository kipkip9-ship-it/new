const pool = require('../../../config/database');

class TaskRepository {


    async search({ title, status, priority }) {
        const conditions = [];
        const values = [];

        if (title) {
            values.push(`%${title}%`);
            conditions.push(`title ILIKE $${values.length}`);
        }

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (priority) {
            values.push(priority);
            conditions.push(`priority = $${values.length}`);
        }

        const whereClause = conditions.length ?
            `WHERE ${conditions.join(' AND ')}` :
            '';

        const query = `
        SELECT *
        FROM tasks
        ${whereClause}
        ORDER BY id ASC
    `;

        const result = await pool.query(query, values);

        return result.rows;
    }

    async findPaginated(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const dataQuery = `
        SELECT *
        FROM tasks
        ORDER BY id ASC
        LIMIT $1 OFFSET $2
    `;

        const countQuery = `
        SELECT COUNT(*) AS total
        FROM tasks
    `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [limit, offset]),
            pool.query(countQuery),
        ]);

        const total = Number(countResult.rows[0].total);

        return {
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findFiltered({ status, priority, assigned_to }) {
        const conditions = [];
        const values = [];

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (priority) {
            values.push(priority);
            conditions.push(`priority = $${values.length}`);
        }

        if (assigned_to) {
            values.push(assigned_to);
            conditions.push(`assigned_to = $${values.length}`);
        }

        let query = 'SELECT * FROM tasks';

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, values);
        return result.rows;
    }
    async create({
        title,
        description,
        assigned_to,
        status,
        priority,
        due_date,
    }) {
        const query = `
            INSERT INTO tasks (
                title,
                description,
                assigned_to,
                status,
                priority,
                due_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await pool.query(query, [
            title,
            description || null,
            assigned_to,
            status || 'pending',
            priority || 'medium',
            due_date || null,
        ]);

        return result.rows[0];
    }


    async findAll(filters = {}) {
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const values = [];

        if (filters.status) {
            values.push(filters.status);
            query += ` AND status = $${values.length}`;
        }

        if (filters.priority) {
            values.push(filters.priority);
            query += ` AND priority = $${values.length}`;
        }

        if (filters.assigned_to) {
            values.push(filters.assigned_to);
            query += ` AND assigned_to = $${values.length}`;
        }

        if (filters.due_date) {
            values.push(filters.due_date);
            query += ` AND due_date::date = $${values.length}::date`;
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, values);

        return result.rows;
    }

    async findById(id) {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1', [id]
        );

        return result.rows[0] || null;
    }



    async update(id, {
        title,
        description,
        assigned_to,
        status,
        priority,
        due_date,
    }) {
        const query = `
        UPDATE tasks
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            assigned_to = COALESCE($3, assigned_to),
            status = COALESCE($4, status),
            priority = COALESCE($5, priority),
            due_date = COALESCE($6, due_date),
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
    `;

        const result = await pool.query(query, [
            title ? title : null,
            description ? description : null,
            assigned_to ? assigned_to : null,
            status ? status : null,
            priority ? priority : null,
            due_date ? due_date : null,
            id,
        ]);

        return result.rows[0] || null;
    }

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING id', [id]
        );

        return result.rowCount > 0;
    }


    async sort({ sortBy = 'id', order = 'asc' }) {
        const allowedColumns = [
            'id',
            'title',
            'priority',
            'status',
            'due_date',
            'created_at',
        ];

        if (!allowedColumns.includes(sortBy)) {
            const error = new Error('Invalid sort field');
            error.statusCode = 400;
            throw error;
        }

        const normalizedOrder = order.toLowerCase();

        if (!['asc', 'desc'].includes(normalizedOrder)) {
            const error = new Error('Order must be asc or desc');
            error.statusCode = 400;
            throw error;
        }

        const priorityOrder = `
        CASE priority
            WHEN 'high' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low' THEN 3
            ELSE 4
        END
    `;

        const orderExpression =
            sortBy === 'priority' ?
            priorityOrder :
            `"${sortBy}"`;

        const query = `
        SELECT *
        FROM tasks
        ORDER BY ${orderExpression} ${normalizedOrder.toUpperCase()} NULLS LAST, id ASC
    `;

        const result = await pool.query(query);

        return result.rows;
    }
}

module.exports = TaskRepository;