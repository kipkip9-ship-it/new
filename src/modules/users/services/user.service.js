const Boom = require('@hapi/boom');
class UserService {
    constructor(userRepository, departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    async create(data) {
        const department = await this.departmentRepository.findById(
            data.department_id
        );

        if (!department) {
            throw Boom.badRequest('Department does not exist');
        }

        return this.userRepository.create(data);
    }

    async findAll() {
        return this.userRepository.findAll();
    }

    async findById(id) {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw Boom.notFound('User not found');
        }

        return user;
    }

    async update(id, data) {
        if (data.department_id !== undefined) {
            const department = await this.departmentRepository.findById(
                data.department_id
            );

            if (!department) {
                throw Boom.badRequest('Department does not exist');
            }
        }

        const user = await this.userRepository.update(id, data);

        if (!user) {
            throw Boom.notFound('User not found');
        }

        return user;
    }





    async delete(id) {
        try {
            const deleted = await this.userRepository.delete(id);

            if (!deleted) {
                throw Boom.notFound('User not found');
            }

            return true;
        } catch (error) {
            if (error.isBoom) {
                throw error;
            }

            if (error.code === '23001' || error.code === '23503') {
                throw Boom.conflict(
                    'Cannot delete this user because tasks are assigned to them'
                );
            }

            throw error;
        }
    }
}

module.exports = UserService;