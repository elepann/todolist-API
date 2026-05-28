const Joi = require('joi');

const createSchema = Joi.object({
    task_title: Joi.string().min(5).max(255).required(),
    task_description: Joi.string().min(5).max(1000).required()
});

const updateSchema = Joi.object({
    task_title: Joi.string().optional().min(5).max(255),
    task_description: Joi.string().optional().min(5).max(1000)
});

module.exports = { createSchema, updateSchema };