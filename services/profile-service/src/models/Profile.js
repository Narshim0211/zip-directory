const mongoose = require('mongoose');

/**
 * Profile Model
 * Per PRD Section 6: Database Structure
 * 
 * Unified profile for all roles: owner, visitor, staff, admin
 */

const profileSchema = new mongoose.Schema(
  {
    // Links to user in main backend auth system
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    role: {
      type: String,
      enum: ['owner', 'visitor', 'staff', 'admin'],
      required: true,
      index: true,
    },
    
    // Basic Info
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
    
    // Profile Content
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    
    avatarUrl: {
      type: String,
      default: '',
    },
    
    coverPhotoUrl: {
      type: String,
      default: '',
    },
    
    // Social Stats (denormalized for performance)
    followersCount: {
      type: Number,
      default: 0,
    },
    
    followingCount: {
      type: Number,
      default: 0,
    },
    
    postsCount: {
      type: Number,
      default: 0,
    },
    
    // Privacy Settings
    isPublic: {
      type: Boolean,
      default: true,
    },
    
    // Social Links
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      website: String,
    },
    
    // Owner-specific fields
    businessName: {
      type: String,
      trim: true,
    },
    
    businessCategory: {
      type: String,
      enum: ['salon', 'spa', 'nail', 'barbershop', 'freelance', ''],
      default: '',
    },
    
    // Staff-specific fields
    ownerId: {
      type: String,
      index: true,
    },
    
    specialties: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
profileSchema.index({ role: 1, createdAt: -1 });
profileSchema.index({ userId: 1, role: 1 });

module.exports = mongoose.model('Profile', profileSchema);
