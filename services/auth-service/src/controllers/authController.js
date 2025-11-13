const authService = require('../services/authService');
const { AppError } = require('../middlewares/errorMiddleware');

/**
 * Authentication Controller
 * Per Part 16.3: Controllers contain NO business logic
 * Only: parse request → pass to service → return response
 */

/**
 * Register new user
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, ownerId } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError(
        'AUTH_MISSING_FIELDS',
        'Email, password, firstName, and lastName are required',
        400
      );
    }
    
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      ownerId,
    });
    
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('AUTH_MISSING_CREDENTIALS', 'Email and password are required', 400);
    }
    
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('AUTH_MISSING_REFRESH_TOKEN', 'Refresh token is required', 400);
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /auth/logout
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.userId);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId);
    
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update password
 * PUT /auth/password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError(
        'AUTH_MISSING_PASSWORDS',
        'Current and new passwords are required',
        400
      );
    }
    
    if (newPassword.length < 6) {
      throw new AppError('AUTH_PASSWORD_TOO_SHORT', 'Password must be at least 6 characters', 400);
    }
    
    await authService.updatePassword(req.userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updatePassword,
};
