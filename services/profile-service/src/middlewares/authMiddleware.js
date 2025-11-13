const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Token Validator Middleware
 * 
 * Per PRD Section 4: Authentication Model
 * 
 * This middleware validates JWT tokens by calling the main backend's
 * /api/auth/verify endpoint. The main backend is the ONLY source of truth
 * for authentication.
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Call main backend POST /api/auth/verify
 * 3. If valid, attach user data to req.user
 * 4. If invalid, reject request
 */

const validateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'PROFILE_AUTH_MISSING',
          message: 'Authentication token required',
        },
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Call main backend to verify token
    const mainBackendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:5000';
    
    try {
      const response = await axios.post(
        `${mainBackendUrl}/api/auth/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 second timeout
        }
      );
      
      if (response.data.valid) {
        // Attach user data to request
        req.user = {
          userId: response.data.userId,
          email: response.data.email,
          role: response.data.role,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          ...(response.data.ownerId && { ownerId: response.data.ownerId }),
        };
        
        next();
      } else {
        return res.status(401).json({
          success: false,
          error: {
            code: 'PROFILE_AUTH_INVALID',
            message: 'Invalid authentication token',
          },
        });
      }
    } catch (axiosError) {
      // Main backend unreachable or token invalid
      logger.error('Token validation failed', {
        error: axiosError.message,
        mainBackendUrl,
      });
      
      return res.status(503).json({
        success: false,
        error: {
          code: 'PROFILE_AUTH_SERVICE_UNAVAILABLE',
          message: 'Authentication service temporarily unavailable',
        },
      });
    }
  } catch (error) {
    logger.error('validateToken middleware error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_SERVER_ERROR',
        message: 'Internal server error',
      },
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * 
 * Usage: requireRole(['owner', 'admin'])
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'PROFILE_AUTH_REQUIRED',
          message: 'Authentication required',
        },
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'PROFILE_INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        },
      });
    }
    
    next();
  };
};

module.exports = {
  validateToken,
  requireRole,
};
