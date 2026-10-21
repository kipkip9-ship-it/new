const {
    createDepartmentSchema,
    updateDepartmentSchema,
} = require('../modules/departments/validator/department.validators');

const Joi = require('joi');
const { validationFailAction } = require('../utils/validation');

const DepartmentRepository = require('../modules/departments/repositories/department.repository');
const DepartmentService = require('../modules/departments/services/department.service');
const DepartmentController = require('../modules/departments/controllers/department.controller');

const departmentRepository = new DepartmentRepository();
const departmentService = new DepartmentService(departmentRepository);
const departmentController = new DepartmentController(departmentService);

const departmentIdSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

module.exports = [{
        method: 'POST',
        path: '/api/departments',
        options: {
            validate: {
                payload: createDepartmentSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) => departmentController.create(request, h),
    },
    {
        method: 'GET',
        path: '/api/departments',
        handler: () => departmentController.findAll(),
    },
    {
        method: 'GET',
        path: '/api/departments/{id}',
        options: {
            validate: {
                params: departmentIdSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) => departmentController.findById(request),
    },
    {
        method: 'PUT',
        path: '/api/departments/{id}',
        options: {
            validate: {
                params: departmentIdSchema,
                payload: updateDepartmentSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request) => departmentController.update(request),
    },
    {
        method: 'DELETE',
        path: '/api/departments/{id}',
        options: {
            validate: {
                params: departmentIdSchema,
                failAction: validationFailAction,
            },
        },
        handler: (request, h) => departmentController.delete(request, h),
    },
];