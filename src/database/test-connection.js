require('dotenv').config();

const pool = require('../config/database');

async function testConnection() {
    try {
        const result = await pool.query(`
      SELECT current_database() AS database,
             current_user AS username,
             NOW() AS server_time
    `);

        console.log('PostgreSQL connected successfully!');
        console.log(result.rows[0]);
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

testConnection();