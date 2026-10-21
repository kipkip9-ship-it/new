const Boom = require('@hapi/boom');

class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async create(request, h) {
        try {
            const user = await this.userService.create(request.payload);

            return h.response({
                status: 'success',
                message: 'User created successfully',
                data: user,
            }).code(201);
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23505') {
                throw Boom.conflict('A user with this email already exists');
            }

            if (error.code === '23503') {
                throw Boom.badRequest('The specified department does not exist');
            }

            throw error;
        }
    }

    async findAll() {
        const users = await this.userService.findAll();

        return {
            status: 'success',
            data: users,
        };
    }

    async findById(request) {
        const user = await this.userService.findById(
            request.params.id
        );

        return {
            status: 'success',
            data: user,
        };
    }

    async update(request) {
        try {
            const user = await this.userService.update(
                request.params.id,
                request.payload
            );

            return {
                status: 'success',
                message: 'User updated successfully',
                data: user,
            };
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23505') {
                throw Boom.conflict('A user with this email already exists');
            }

            if (error.code === '23503') {
                throw Boom.badRequest('The specified department does not exist');
            }

            throw error;
        }
    }

    async delete(request, h) {
        await this.userService.delete(request.params.id);
        return h.response().code(204);
    }
}

module.exports = UserController;