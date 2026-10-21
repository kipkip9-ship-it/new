const Joi = require('joi');

const createUserSchema = Joi.object({
    first_name: Joi.string().trim().min(2).max(100).required(),
    last_name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().max(255).required(),
    phone: Joi.string().max(30).allow('', null).optional(),
    department_id: Joi.number().integer().positive().required(),
    role: Joi.string().valid('admin', 'manager', 'staff').default('staff'),
    status: Joi.string().valid('active', 'inactive').default('active'),
});

const updateUserSchema = Joi.object({
    first_name: Joi.string().trim().min(2).max(100),
    last_name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().email().max(255),
    phone: Joi.string().max(30).allow('', null),
    department_id: Joi.number().integer().positive(),
    role: Joi.string().valid('admin', 'manager', 'staff'),
    status: Joi.string().valid('active', 'inactive'),
}).min(1);

module.exports = {
    createUserSchema,
    updateUserSchema,
};