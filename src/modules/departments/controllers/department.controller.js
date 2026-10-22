const Boom = require('@hapi/boom');
class DepartmentController {
    constructor(departmentService) {
        this.departmentService = departmentService;
    }

    async create(request, h) {
        try {
            const department = await this.departmentService.create(
                request.payload
            );

            return h.response({
                status: 'success',
                data: department,
            }).code(201);
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23505') {
                throw Boom.conflict('A department with this name already exists');
            }

            throw error;
        }
    }
    async findAll() {
        const departments = await this.departmentService.findAll();

        return {
            status: 'success',
            data: departments,
        };
    }

    async findById(request) {
        const department = await this.departmentService.findById(
            Number(request.params.id)
        );

        return {
            status: 'success',
            data: department,
        };
    }

    async update(request) {
        try {
            const department = await this.departmentService.update(
                Number(request.params.id),
                request.payload
            );

            return {
                status: 'success',
                data: department,
            };
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23505') {
                throw Boom.conflict('A department with this name already exists');
            }

            throw error;
        }
    }

    async delete(request, h) {
        await this.departmentService.delete(Number(request.params.id));

        return h.response().code(204);
    }
}

module.exports = DepartmentController;