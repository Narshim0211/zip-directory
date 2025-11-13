const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model - Authentication Service
 * 
 * Roles:
 * - admin: Platform administrator
 * - owner: Salon/business owner
 * - staff: Employee/stylist
 * - customer: End user/visitor
 * 
 * Per Part 14.2: Zero data mixing - role enforcement at DB level
 */

const userSchema = new mongoose.Schema(
  {
    // Core Identity
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    
    // Role-Based Access Control (RBAC)
    role: {
      type: String,
      enum: ['admin', 'owner', 'staff', 'customer'],
      required: true,
      default: 'customer',
      index: true,
    },
    
    // Basic Profile Info (minimal - full profiles in Profile Service)
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    
    // Staff-specific (if role=staff)
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return this.role === 'staff';
      },
    },
    
    // Security
    lastLogin: Date,
    passwordChangedAt: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: Date,
    
    // Refresh Token (for JWT rotation)
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ ownerId: 1 }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  this.passwordChangedAt = Date.now() - 1000; // Ensure token issued after password change
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after JWT issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Increment failed login attempts
userSchema.methods.incrementFailedAttempts = async function () {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts (15 minutes)
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  }
  
  await this.save();
};

// Reset failed attempts on successful login
userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = undefined;
  this.lastLogin = Date.now();
  await this.save();
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.failedLoginAttempts;
  delete obj.accountLockedUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
