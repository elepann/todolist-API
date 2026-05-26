const Joi = require('joi');

const createSchema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(1000).required()
});

const updateSchema = Joi.object({
    title: Joi.string().optional().min(5).max(255),
    description: Joi.string().optional().min(5).max(1000)
});

module.exports = { createSchema, updateSchema };