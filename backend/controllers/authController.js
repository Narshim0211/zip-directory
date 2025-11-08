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
