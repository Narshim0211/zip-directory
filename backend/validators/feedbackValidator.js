const Joi = require('joi');

// Visitor feedback validation schema
const visitorFeedbackSchema = Joi.object({
  category: Joi.string()
    .valid('Bug', 'Feature Request', 'Account Issue', 'Other')
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': 'Invalid category selected'
    }),
  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .min(10)
    .max(2000)
    .trim()
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 2000 characters'
    })
});

// Owner feedback validation schema (includes urgency)
const ownerFeedbackSchema = Joi.object({
  category: Joi.string()
    .valid('Bug', 'Feature Request', 'Booking Issue', 'Payment Issue', 'Profile Issue', 'Other')
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': 'Invalid category selected'
    }),
  urgency: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH')
    .default('MEDIUM')
    .messages({
      'any.only': 'Urgency must be LOW, MEDIUM, or HIGH'
    }),
  title: Joi.string()
    .min(3)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .min(10)
    .max(2000)
    .trim()
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 2000 characters'
    })
});

// Admin update validation schema
const adminUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('OPEN', 'IN_REVIEW', 'RESOLVED')
    .messages({
      'any.only': 'Status must be OPEN, IN_REVIEW, or RESOLVED'
    }),
  internalNotes: Joi.string()
    .max(5000)
    .allow('')
    .messages({
      'string.max': 'Internal notes cannot exceed 5000 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field (status or internalNotes) must be provided'
});

// Middleware to validate visitor feedback
const validateFeedback = (req, res, next) => {
  const { error, value } = visitorFeedbackSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.validatedData = value;
  next();
};

// Middleware to validate owner feedback
const validateOwnerFeedback = (req, res, next) => {
  const { error, value } = ownerFeedbackSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.validatedData = value;
  next();
};

// Middleware to validate admin updates
const validateAdminUpdate = (req, res, next) => {
  const { error, value } = adminUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.validatedData = value;
  next();
};

module.exports = {
  validateFeedback,
  validateOwnerFeedback,
  validateAdminUpdate
};
