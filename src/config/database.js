const path = require('node:path');

require('dotenv').config({
    path: path.resolve(
        __dirname,
        '..',
        '..',
        process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    ),
    override: true,
});

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error.message);
});

module.exports = pool;