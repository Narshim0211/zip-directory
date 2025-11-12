/**
 * Visitor Auth Guard Middleware
 * Ensures only visitor role users can access these endpoints
 */
const asyncHandler = require('./asyncHandler');

const authVisitor = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'visitor') {
    return res.status(403).json({
      success: false,
      message: 'Only visitor users can access this resource',
    });
  }

  next();
});

module.exports = authVisitor;
