const User = require('../models/User');
const { verifyAccessToken, extractToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Per Part 14.2.2: Authentication + Authorization layers
 * Per Part 14.1: Zero Trust - every request authenticated
 */

/**
 * Require Authentication - Validates JWT
 */
const requireAuth = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_MISSING_TOKEN',
          message: 'Authentication required. Please provide a valid token.',
        },
      });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_TOKEN',
          message: 'Invalid or expired token. Please log in again.',
        },
      });
    }
    
    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'User no longer exists.',
        },
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated.',
        },
      });
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_ACCOUNT_LOCKED',
          message: 'Account locked due to multiple failed login attempts. Try again later.',
        },
      });
    }
    
    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_PASSWORD_CHANGED',
          message: 'Password recently changed. Please log in again.',
        },
      });
    }
    
    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    logger.error('requireAuth middleware error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_SERVER_ERROR',
        message: 'Authentication service error.',
      },
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Per Part 14.2.2: checkRole enforcement
 * 
 * Usage:
 * router.get('/admin-only', requireAuth, checkRole(['admin']), controller)
 * router.post('/booking', requireAuth, checkRole(['owner', 'staff']), controller)
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication required.',
        },
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user._id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
    }
    
    next();
  };
};

/**
 * Convenience middlewares for specific roles
 */
const requireOwner = checkRole(['owner']);
const requireStaff = checkRole(['staff', 'owner']); // Staff can access, owner can too
const requireCustomer = checkRole(['customer']);
const requireAdmin = checkRole(['admin']);

module.exports = {
  requireAuth,
  checkRole,
  requireOwner,
  requireStaff,
  requireCustomer,
  requireAdmin,
};
