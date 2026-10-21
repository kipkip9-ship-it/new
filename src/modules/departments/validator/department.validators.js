const Joi = require('joi');

const createDepartmentSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().allow('').max(1000).optional(),
});

const updateDepartmentSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().allow('').max(1000).optional(),
}).min(1);

module.exports = {
    createDepartmentSchema,
    updateDepartmentSchema,
};