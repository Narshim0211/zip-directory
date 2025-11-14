const { AppError } = require('./errorHandler');
const { env } = require('../config/env');

const verifyInternalAuth = (req, res, next) => {
  const providedKey = req.headers['x-internal-api-key'];
  if (!providedKey || providedKey !== env.internalApiKey) {
    throw new AppError('AI_INTERNAL_AUTH_FAILED', 'Unauthorized caller', 403);
  }

  const userId = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const planType = req.headers['x-plan-type'] || 'basic';

  if (!userId) {
    throw new AppError('AI_USER_CONTEXT_MISSING', 'userId header required', 400);
  }

  if (role && role !== 'visitor') {
    throw new AppError('AI_ROLE_NOT_ALLOWED', 'Only visitors can access Style Advisor', 403);
  }

  req.userContext = {
    userId,
    planType: planType.toLowerCase(),
  };
  next();
};

module.exports = { verifyInternalAuth };
