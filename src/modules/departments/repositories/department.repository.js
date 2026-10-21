const pool = require('../../../config/database');

class DepartmentRepository {
    async update(id, { name, description }) {
        const query = `
      UPDATE departments
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

        const result = await pool.query(query, [
            name ? name : null,
            description ? description : null,
            id,
        ]);

        return result.rows[0] ? result.rows[0] : null;
    }

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM departments WHERE id = $1 RETURNING id', [id]
        );

        return result.rowCount > 0;
    }
    async create({ name, description }) {
        const query = `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;

        const result = await pool.query(query, [
            name,
            description ? description : null,
        ]);

        return result.rows[0];
    }

    async findAll() {
        const result = await pool.query(
            'SELECT * FROM departments ORDER BY id ASC'
        );

        return result.rows;
    }

    async findById(id) {
        const result = await pool.query(
            'SELECT * FROM departments WHERE id = $1', [id]
        );

        return result.rows[0] ? result.rows[0] : null;
    }
}

module.exports = DepartmentRepository;