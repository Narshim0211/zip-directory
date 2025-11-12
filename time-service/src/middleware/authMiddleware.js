/**
 * Auth Middleware
 * Validates JWT tokens from Auth Service
 */
const asyncHandler = require('./asyncHandler');

/**
 * Verify JWT token and attach user info to request
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In production, validate with Auth Service JWKS
    // For now, decode and verify basic structure
    const decoded = require('jsonwebtoken').decode(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Extract user info from token
    req.user = {
      id: decoded.userId || decoded.sub,
      role: decoded.role,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    // Check token expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token validation error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token validation failed',
    });
  }
});

module.exports = authMiddleware;
