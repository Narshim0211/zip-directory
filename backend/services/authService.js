const jwt = require('jsonwebtoken');
const User = require('../models/User');
// services are required lazily to avoid circular deps
let ownerProfileService;
let visitorProfileService;

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const NAME_REGEX = /^[A-Za-z\-\' ]{2,50}$/;

async function register({ firstName, lastName, email, password, role }) {
  if (!firstName || !lastName || !email || !password) {
    const err = new Error('firstName, lastName, email and password are required');
    err.status = 400;
    throw err;
  }
  if (!NAME_REGEX.test(firstName) || !NAME_REGEX.test(lastName)) {
    const err = new Error('firstName and lastName must be 2-50 characters and only letters, spaces, hyphens, apostrophes allowed');
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('User already exists');
    err.status = 400;
    throw err;
  }

  const name = `${firstName} ${lastName}`.trim();
  const user = new User({ name, firstName, lastName, email, password, role });
  await user.save();
  // create corresponding profile right away for owner/visitor
  try {
    if (user.role === 'owner') {
      ownerProfileService = ownerProfileService || require('../services/owner/ownerProfileService');
      await ownerProfileService.ensureProfileForUser(user);
    } else if (user.role === 'visitor') {
      visitorProfileService = visitorProfileService || require('../services/visitor/visitorProfileService');
      await visitorProfileService.ensureProfileForUser(user);
    }
  } catch (e) {
    // Log but don't block registration for non-critical profile creation issues
    console.error('profile create warning', e.message || e);
  }

  const token = signToken({ id: user._id, role: user.role });

  return {
    _id: user._id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites,
    token,
    profileIncomplete: false,
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
  // ensure profile exists for legacy users and indicate incomplete status
  let profileIncomplete = false;
  try {
    if (user.role === 'owner') {
      ownerProfileService = ownerProfileService || require('../services/owner/ownerProfileService');
      const p = await ownerProfileService.ensureProfileForUser(user);
      profileIncomplete = !!(p && p.needsCompletion);
    } else if (user.role === 'visitor') {
      visitorProfileService = visitorProfileService || require('../services/visitor/visitorProfileService');
      const p = await visitorProfileService.ensureProfileForUser(user);
      profileIncomplete = !!(p && p.needsCompletion);
    }
  } catch (e) {
    console.error('ensureProfile error', e.message || e);
  }

  const token = signToken({ id: user._id, role: user.role });
  return {
    _id: user._id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    favorites: user.favorites,
    token,
    profileIncomplete,
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
