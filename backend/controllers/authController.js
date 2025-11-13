const catchAsync = require('../utils/catchAsync');
const authService = require('../services/authService');

exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body || {});
  res.status(201).json(result);
});

exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body || {});
  res.json(result);
});

exports.me = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const email = (req.body && req.body.email) || '';
  await authService.forgotPassword(email);
  // Intentionally generic to prevent user enumeration
  res.json({ message: 'If the email exists, we sent a reset link' });
});

/**
 * Verify JWT Token (for Booking/Payment Microservices)
 * 
 * This endpoint allows Booking and Payment microservices to validate
 * JWT tokens without having their own authentication systems.
 * 
 * Microservices call: POST /api/auth/verify
 * With: Authorization: Bearer <token>
 * 
 * Returns: { valid: true, userId, role, ownerId, etc. }
 */
exports.verifyToken = catchAsync(async (req, res) => {
  // Token already validated by protect middleware
  // req.user is populated by authMiddleware
  
  if (!req.user) {
    return res.status(401).json({
      valid: false,
      error: 'Invalid or expired token',
    });
  }
  
  // Return user data for microservice to use
  res.json({
    valid: true,
    userId: req.user._id,
    email: req.user.email,
    role: req.user.role,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    // Include ownerId for staff users
    ...(req.user.ownerId && { ownerId: req.user.ownerId }),
  });
});
