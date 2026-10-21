const Boom = require('@hapi/boom');


class TaskService {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    async sort(options) {
        return this.taskRepository.sort(options);
    }

    async search(filters) {
        return this.taskRepository.search(filters);
    }

    async findPaginated(page = 1, limit = 10) {
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (!Number.isInteger(parsedPage) ||
            parsedPage < 1 ||
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1 ||
            parsedLimit > 100
        ) {
            throw Boom.badRequest(
                'Page must be a positive integer and limit must be between 1 and 100'
            );
        }

        return this.taskRepository.findPaginated(
            parsedPage,
            parsedLimit
        );
    }

    async findFiltered(filters) {
        return this.taskRepository.findFiltered(filters);
    }
    async create(data) {
        const user = await this.userRepository.findById(
            Number(data.assigned_to)
        );

        if (!user) {
            throw Boom.badRequest('Assigned user does not exist');
        }

        return this.taskRepository.create(data);
    }


    async findAll(filters = {}) {
        return this.taskRepository.findAll(filters);
    }

    async findById(id) {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw Boom.notFound('Task not found');
        }

        return task;
    }


    async update(id, data) {
        // Confirm that the task exists
        const existingTask = await this.taskRepository.findById(id);

        if (!existingTask) {
            throw Boom.notFound('Task not found');
        }

        // Validate the assigned user only when assigned_to is provided
        if (data.assigned_to !== undefined) {
            const user = await this.userRepository.findById(
                Number(data.assigned_to)
            );

            if (!user) {
                throw Boom.badRequest('Assigned user does not exist');
            }
        }

        const task = await this.taskRepository.update(id, data);

        return task;
    }

    async delete(id) {
        const deleted = await this.taskRepository.delete(id);

        if (!deleted) {
            throw Boom.notFound('Task not found');
        }

        return true;
    }
}

module.exports = TaskService;