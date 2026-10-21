const Boom = require('@hapi/boom');
class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }


    async sort(request) {
        const Boom = require('@hapi/boom');

        const Joi = require('joi');

        const schema = Joi.object({
            sortBy: Joi.string().valid(
                'id',
                'title',
                'priority',
                'status',
                'due_date',
                'created_at'
            ).default('id'),

            order: Joi.string().valid('asc', 'desc')
                .insensitive()
                .default('asc'),
        });

        const { error, value } = schema.validate(request.query);

        if (error) {
            throw Boom.badRequest(error.message);
        }

        const tasks = await this.taskService.sort(value);

        return {
            status: 'success',
            data: tasks,
            count: tasks.length,
        };
    }

    async search(request) {
        const { title, status, priority } = request.query;

        const Joi = require('joi');
        const schema = Joi.object({
            title: Joi.string().trim().max(200),
            status: Joi.string().valid(
                'pending',
                'in_progress',
                'completed'
            ),
            priority: Joi.string().valid(
                'low',
                'medium',
                'high'
            ),
        });

        const { error, value } = schema.validate({ title, status, priority }, { convert: true });

        if (error) {
            const Boom = require('@hapi/boom');
            throw Boom.badRequest(error.message);
        }

        const tasks = await this.taskService.search(value);

        return {
            status: 'success',
            data: tasks,
            count: tasks.length,
        };
    }

    async findPaginated(request) {
        const page = request.query.page === undefined ?
            1 :
            Number(request.query.page);

        const limit = request.query.limit === undefined ?
            10 :
            Number(request.query.limit);

        if (!Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            throw Boom.badRequest(
                'page must be a positive integer and limit must be between 1 and 100'
            );
        }

        const result = await this.taskService.findPaginated(page, limit);

        return {
            status: 'success',
            ...result,
        };
    }
    async findFiltered(request) {
        const { status, priority, assigned_to } = request.query;

        const validStatuses = ['pending', 'in_progress', 'completed'];
        const validPriorities = ['low', 'medium', 'high'];

        if (status && !validStatuses.includes(status)) {
            throw Boom.badRequest('Invalid task status');
        }

        if (priority && !validPriorities.includes(priority)) {
            throw Boom.badRequest('Invalid task priority');
        }

        let assignedTo;

        if (assigned_to !== undefined) {
            assignedTo = Number(assigned_to);

            if (!Number.isSafeInteger(assignedTo) || assignedTo < 1) {
                throw Boom.badRequest('assigned_to must be a positive integer');
            }
        }

        const tasks = await this.taskService.findFiltered({
            status,
            priority,
            assigned_to: assignedTo,
        });

        return {
            status: 'success',
            data: tasks,
        };
    }
    async create(request, h) {
        const task = await this.taskService.create(request.payload);

        return h.response({
            status: 'success',
            data: task,
        }).code(201);
    }


    async findAll(request, h) {
        const filters = {
            status: request.query.status,
            priority: request.query.priority,
            assigned_to: request.query.assigned_to,
            due_date: request.query.due_date,
        };

        const tasks = await this.taskService.findAll(filters);

        return h.response({
            status: 'success',
            data: tasks,
        }).code(200);
    }

    async findById(request) {
        const task = await this.taskService.findById(
            Number(request.params.id)
        );

        return {
            status: 'success',
            data: task,
        };
    }

    async update(request) {
        const task = await this.taskService.update(
            Number(request.params.id),
            request.payload
        );

        return {
            status: 'success',
            data: task,
        };
    }

    async delete(request, h) {
        await this.taskService.delete(Number(request.params.id));

        return h.response().code(204);
    }
}

module.exports = TaskController;