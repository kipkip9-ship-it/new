const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

async function migrate() {
    const client = await pool.connect();

    try {
        const migrationPath = path.join(
            __dirname,
            'migrations',
            '001_initial_schema.sql'
        );

        const sql = await fs.readFile(migrationPath, 'utf8');

        await client.query('BEGIN');

        await client.query(sql);

        await client.query('COMMIT');

        console.log('Database migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();