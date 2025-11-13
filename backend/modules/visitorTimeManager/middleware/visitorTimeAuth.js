/**
 * Visitor Time Manager Authentication Middleware
 * Ensures only authenticated visitors can access time management features
 * Complete isolation from owner routes
 */

const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../../shared/utils/errorHandler');

/**
 * Verify visitor authentication
 */
const verifyVisitorAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is a visitor
    if (decoded.role !== 'visitor') {
      throw new AuthorizationError('Access denied. Visitor access only.');
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
 * Optional: Rate limiting for visitor time endpoints
 */
const rateLimitVisitor = (req, res, next) => {
  // TODO: Implement rate limiting logic
  // Example: max 100 requests per hour per visitor
  next();
};

module.exports = {
  verifyVisitorAuth,
  rateLimitVisitor
};
