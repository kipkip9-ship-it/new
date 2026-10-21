require('dotenv').config();

const createServer = require('./app');

async function start() {
    const server = await createServer();

    try {
        await server.start();
        console.log(`Server running at ${server.info.uri}`);
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exitCode = 1;
    }
}

start();