/**
 * Request Validation Middleware
 *
 * Uses Joi for comprehensive input validation
 * Prevents invalid data from reaching the database
 */

const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validate request against Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true  // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed', { errors, userId: req.user?.id });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace body with validated & sanitized data
    req.body = value;
    next();
  };
};

/**
 * Validation Schemas
 */

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title must not exceed 200 characters'
    }),

  notes: Joi.string()
    .trim()
    .max(1000)
    .allow('', null)
    .messages({
      'string.max': 'Notes must not exceed 1000 characters'
    }),

  taskDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Task date must be a valid date',
      'any.required': 'Task date is required'
    }),

  session: Joi.string()
    .valid('morning', 'afternoon', 'evening')
    .required()
    .messages({
      'any.only': 'Session must be morning, afternoon, or evening',
      'any.required': 'Session is required'
    }),

  timeOfDay: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Time of day must be in HH:MM format'
    }),

  durationMin: Joi.number()
    .integer()
    .min(0)
    .max(1440)
    .allow(null)
    .messages({
      'number.min': 'Duration must be at least 0 minutes',
      'number.max': 'Duration must not exceed 1440 minutes (24 hours)'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium'),

  scopeTag: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .default('daily'),

  completed: Joi.boolean()
    .default(false),

  reminder: Joi.object({
    enabled: Joi.boolean().default(false),
    channels: Joi.array()
      .items(Joi.string().valid('sms', 'email'))
      .default([]),
    sendAt: Joi.date().iso().allow(null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null)
  }).default({})
});

// Update task schema (all fields optional except ID validation)
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200),

  notes: Joi.string()
    .trim()
    .max(1000)
    .allow('', null),

  taskDate: Joi.date().iso(),

  session: Joi.string()
    .valid('morning', 'afternoon', 'evening'),

  timeOfDay: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .allow('', null),

  durationMin: Joi.number()
    .integer()
    .min(0)
    .max(1440)
    .allow(null),

  priority: Joi.string()
    .valid('low', 'medium', 'high'),

  scopeTag: Joi.string()
    .valid('daily', 'weekly', 'monthly'),

  completed: Joi.boolean(),

  reminder: Joi.object({
    enabled: Joi.boolean(),
    channels: Joi.array().items(Joi.string().valid('sms', 'email')),
    sendAt: Joi.date().iso().allow(null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null)
  })
}).min(1); // At least one field must be provided

module.exports = {
  validate,
  schemas: {
    createTask: taskSchema,
    updateTask: updateTaskSchema
  }
};
