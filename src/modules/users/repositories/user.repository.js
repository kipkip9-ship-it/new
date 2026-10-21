const pool = require('../../../config/database');
const Boom = require('@hapi/boom');

class UserRepository {
    async create({
        first_name,
        last_name,
        email,
        phone,
        department_id,
        role,
        status,
    }) {
        const query = `
            INSERT INTO users (
                first_name,
                last_name,
                email,
                phone,
                department_id,
                role,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await pool.query(query, [
            first_name,
            last_name,
            email,
            phone || null,
            department_id,
            role || 'staff',
            status || 'active',
        ]);

        return result.rows[0];
    }

    async findAll() {
        const query = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.department_id,
                d.name AS department_name,
                u.role,
                u.status,
                u.created_at,
                u.updated_at
            FROM users u
            JOIN departments d ON u.department_id = d.id
            ORDER BY u.id ASC
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    async findById(id) {
        const query = `
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.department_id,
                d.name AS department_name,
                u.role,
                u.status,
                u.created_at,
                u.updated_at
            FROM users u
            JOIN departments d ON u.department_id = d.id
            WHERE u.id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async update(id, data) {
        const query = `
            UPDATE users
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                department_id = COALESCE($5, department_id),
                role = COALESCE($6, role),
                status = COALESCE($7, status),
                updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `;

        const result = await pool.query(query, [
            data.first_name ? data.first_name : null,
            data.last_name ? data.last_name : null,
            data.email ? data.email : null,
            data.phone ? data.phone : null,
            data.department_id ? data.department_id : null,
            data.role ? data.role : null,
            data.status ? data.status : null,
            id,
        ]);

        return result.rows[0] || null;
    }

    async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM users WHERE id = $1 RETURNING id', [id]
            );

            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '23503') {
                throw Boom.conflict('Cannot delete user because it is referenced by other records');
            }

            throw error;
        }
    }
}

module.exports = UserRepository;