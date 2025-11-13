const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Authentication Service - Business Logic
 * Per Part 16.3: Services contain ALL business logic
 * Per Part 14.2: Role-based access control
 */

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { email, password, firstName, lastName, role = 'customer', ownerId } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('AUTH_EMAIL_EXISTS', 'Email already registered', 400);
    }
    
    // Validate role-specific requirements
    if (role === 'staff' && !ownerId) {
      throw new AppError('AUTH_STAFF_REQUIRES_OWNER', 'Staff registration requires ownerId', 400);
    }
    
    // Prevent unauthorized admin registration
    if (role === 'admin') {
      throw new AppError('AUTH_ADMIN_REGISTRATION_FORBIDDEN', 'Cannot register as admin', 403);
    }
    
    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      ...(role === 'staff' && { ownerId }),
    });
    
    await user.save();
    
    logger.info('User registered', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
  
  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    
    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new AppError(
        'AUTH_ACCOUNT_LOCKED',
        'Account locked due to multiple failed attempts. Try again later.',
        403
      );
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new AppError('AUTH_ACCOUNT_INACTIVE', 'Account is inactive', 403);
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
    
    // Reset failed attempts on successful login
    await user.resetFailedAttempts();
    
    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
  
  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('AUTH_INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('AUTH_INVALID_REFRESH_TOKEN', 'Invalid refresh token', 401);
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new AppError('AUTH_ACCOUNT_INACTIVE', 'Account is inactive', 403);
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);
    
    logger.info('Access token refreshed', { userId: user._id });
    
    return {
      accessToken: newAccessToken,
    };
  }
  
  /**
   * Logout user
   */
  async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
      
      logger.info('User logged out', { userId });
    }
    
    return { success: true };
  }
  
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      throw new AppError('AUTH_USER_NOT_FOUND', 'User not found', 404);
    }
    
    return user;
  }
  
  /**
   * Update password
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('AUTH_USER_NOT_FOUND', 'User not found', 404);
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('AUTH_INVALID_PASSWORD', 'Current password is incorrect', 401);
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    logger.info('Password updated', { userId });
    
    return { success: true };
  }
}

module.exports = new AuthService();
