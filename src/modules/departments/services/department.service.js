const Boom = require('@hapi/boom');
class DepartmentService {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    async create(data) {
        return this.departmentRepository.create(data);
    }

    async findAll() {
        return this.departmentRepository.findAll();
    }

    async findById(id) {
        const department = await this.departmentRepository.findById(id);

        if (!department) {
            throw Boom.notFound('Department not found');
        }

        return department;
    }

    async update(id, data) {
        try {
            const department = await this.departmentRepository.update(id, data);

            if (!department) {
                throw Boom.notFound('Department not found');
            }

            return department;
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

    async delete(id) {
        try {
            const deleted = await this.departmentRepository.delete(id);

            if (!deleted) {
                throw Boom.notFound('Department not found');
            }

            return true;
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23001' || error.code === '23503') {
                throw Boom.conflict(
                    'Cannot delete this department because users are assigned to it'
                );
            }

            throw error;
        }
    }
}

module.exports = DepartmentService;