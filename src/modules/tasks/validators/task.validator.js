const Joi = require('joi');

// Validate task creation
const createTaskSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().allow('', null).optional(),
    assigned_to: Joi.number().integer().positive().required(),

    status: Joi.string()
        .valid('pending', 'in_progress', 'completed')
        .default('pending'),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium'),

    due_date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null)
        .optional(),
});

// Validate task updates
const updateTaskSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().allow('', null).optional(),
    assigned_to: Joi.number().integer().positive().optional(),

    status: Joi.string()
        .valid('pending', 'in_progress', 'completed')
        .optional(),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional(),

    due_date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow(null)
        .optional(),
}).min(1);

// Validate task filtering
const taskFiltersSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'in_progress', 'completed')
        .optional(),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional(),

    assigned_to: Joi.number()
        .integer()
        .positive()
        .optional(),

    due_date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
}).unknown(false);

module.exports = {
    createTaskSchema,
    updateTaskSchema,
    taskFiltersSchema,
};