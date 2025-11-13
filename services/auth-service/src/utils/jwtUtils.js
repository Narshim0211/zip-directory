const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 * Per Part 14.6: Secure JWT with role claims
 * Per Part 15.2.1: Stateless backend for horizontal scaling
 */

/**
 * Generate Access Token (short-lived: 15 minutes)
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
      type: 'access',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }
  );
};

/**
 * Generate Refresh Token (long-lived: 7 days)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  extractToken,
};
