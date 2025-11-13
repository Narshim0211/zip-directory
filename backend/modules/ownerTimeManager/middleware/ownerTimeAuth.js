/**
 * Owner Time Manager Authentication Middleware
 * Ensures only authenticated owners can access time management features
 * Complete isolation from visitor routes
 */

const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../../shared/utils/errorHandler');

/**
 * Verify owner authentication
 */
const verifyOwnerAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is an owner
    if (decoded.role !== 'owner') {
      throw new AuthorizationError('Access denied. Owner access only.');
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional: Rate limiting for owner time endpoints
 */
const rateLimitOwner = (req, res, next) => {
  // TODO: Implement rate limiting logic
  // Example: max 100 requests per hour per owner
  next();
};

module.exports = {
  verifyOwnerAuth,
  rateLimitOwner
};
