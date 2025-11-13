const axios = require('axios');
const logger = require('../utils/logger');

const mainBackendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:5000';

/**
 * Authentication Middleware
 * Validates token with main backend per PRD Section 4
 */

const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // Call main backend to verify token
    const response = await axios.post(
      `${mainBackendUrl}/api/auth/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    );

    if (response.data.valid) {
      req.user = {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        ownerId: response.data.ownerId,
      };
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    logger.error('Token validation failed', {
      error: error.message,
      endpoint: req.path,
    });

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Authentication service unavailable',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Role-based access control
 * @param {Array<string>} allowedRoles - Roles allowed to access the route
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = {
  validateToken,
  requireRole,
};
