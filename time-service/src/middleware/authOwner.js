/**
 * Owner Auth Guard Middleware
 * Ensures only owner role users can access these endpoints
 */
const asyncHandler = require('./asyncHandler');

const authOwner = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Only owner users can access this resource',
    });
  }

  next();
});

module.exports = authOwner;
