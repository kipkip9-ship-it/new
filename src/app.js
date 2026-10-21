const Hapi = require('@hapi/hapi');
const departmentRoutes = require('./routes/department.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./modules/tasks/routes/task.routes');
const createServer = async() => {
    const server = Hapi.server({
        port: Number(process.env.PORT || 3000),
        host: process.env.HOST || 'localhost',

        debug: {
            request: ['error'],
        },

        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/health',
        handler: () => ({
            status: 'success',
            message: 'Users API is running!',
        }),
    });

    server.route(departmentRoutes);
    server.route(userRoutes);
    server.route(taskRoutes);

    return server;
};

module.exports = createServer;