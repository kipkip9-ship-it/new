const Joi = require('joi');

const UserRepository = require('../modules/users/repositories/user.repository');
const UserService = require('../modules/users/services/user.service');
const UserController = require('../modules/users/controllers/user.controller');

const DepartmentRepository = require('../modules/departments/repositories/department.repository');

const {
    createUserSchema,
    updateUserSchema,
} = require('../modules/users/validators/user.validator');

const { validationFailAction } = require('../utils/validation');

const userRepository = new UserRepository();
const departmentRepository = new DepartmentRepository();

const userService = new UserService(
    userRepository,
    departmentRepository
);

const userController = new UserController(userService);

const idParamsSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

module.exports = [{
        method: 'POST',
        path: '/api/users',
        options: {
            validate: {
                payload: createUserSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) => userController.create(request, h),
    },
    {
        method: 'GET',
        path: '/api/users',
        handler: () => userController.findAll(),
    },
    {
        method: 'GET',
        path: '/api/users/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) => userController.findById(request),
    },
    {
        method: 'PUT',
        path: '/api/users/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                payload: updateUserSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) => userController.update(request),
    },
    {
        method: 'DELETE',
        path: '/api/users/{id}',
        options: {
            validate: {
                params: idParamsSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) => userController.delete(request, h),
    },
];