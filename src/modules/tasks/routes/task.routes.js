const TaskRepository = require('../repositories/task.repository');
const TaskService = require('../services/task.service');
const TaskController = require('../controllers/task.controller');
const UserRepository = require('../../users/repositories/user.repository');

const {
    createTaskSchema,
    updateTaskSchema,
    taskFiltersSchema,
} = require('../validators/task.validator');

const Joi = require('joi');

const { validationFailAction } = require('../../../utils/validation');

const taskRepository = new TaskRepository();
const userRepository = new UserRepository();

const taskService = new TaskService(
    taskRepository,
    userRepository
);

const taskController = new TaskController(taskService);

const idParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

const taskRoutes = [
    // CREATE task
    {
        method: 'POST',
        path: '/api/tasks',
        options: {
            validate: {
                payload: createTaskSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) =>
            taskController.create(request, h),
    },

    // GET all tasks

    // GET all tasks with query validation
    {
        method: 'GET',
        path: '/api/tasks',
        options: {
            validate: {
                query: taskFiltersSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) =>
            taskController.findAll(request, h),
    },

    // FILTER tasks
    {
        method: 'GET',
        path: '/api/tasks/filter',
        handler: (request) =>
            taskController.findFiltered(request),
    },

    // PAGINATE tasks
    {
        method: 'GET',
        path: '/api/tasks/paginated',
        handler: (request) =>
            taskController.findPaginated(request),
    },

    // SEARCH tasks
    {
        method: 'GET',
        path: '/api/tasks/search',
        handler: (request) =>
            taskController.search(request),
    },

    // SORT tasks
    {
        method: 'GET',
        path: '/api/tasks/sort',
        handler: (request) =>
            taskController.sort(request),
    },

    // GET task by ID
    {
        method: 'GET',
        path: '/api/tasks/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) =>
            taskController.findById(request),
    },

    // UPDATE task
    {
        method: 'PUT',
        path: '/api/tasks/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                payload: updateTaskSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) =>
            taskController.update(request),
    },

    // DELETE task
    {
        method: 'DELETE',
        path: '/api/tasks/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) =>
            taskController.delete(request, h),
    },
];

module.exports = taskRoutes;