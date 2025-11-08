const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

async function register({ name, email, password, role }) {
  if (!name || !email || !password) {
    const err = new Error('name, email and password are required');
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('User already exists');
    err.status = 400;
    throw err;
  }

  const user = new User({ name, email, password, role });
  await user.save();
  const token = signToken({ id: user._id, role: user.role });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites,
    token,
  };
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('email and password are required');
    err.status = 400;
    throw err;
  }
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }
  const ok = await user.matchPassword(password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 400;
    throw err;
  }
  const token = signToken({ id: user._id, role: user.role });
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites,
    token,
  };
}

async function getMe(id) {
  return User.findById(id).select('-password');
}

module.exports = { register, login, getMe };
 
// Below: optional stub to support UI for password reset requests
async function forgotPassword(email) {
  // In the future: generate a token, store it, email the user.
  // For now: return without revealing whether the email exists.
  if (!email || typeof email !== 'string') return;
  try {
    // Touch DB optionally to avoid timing attacks consistency
    await User.findOne({ email }).select('_id');
  } catch (_) {}
}

module.exports.forgotPassword = forgotPassword;
