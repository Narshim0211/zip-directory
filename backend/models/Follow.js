const mongoose = require('mongoose');

/**
 * Follow Model - Role-aware follow relationships
 * Supports Owner→Owner, Visitor→Owner, Visitor→Visitor
 * Owner CANNOT follow Visitor (enforced at service layer)
 */
const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    followerRole: {
      type: String,
      enum: ['owner', 'visitor'],
      required: true,
      index: true
    },
    followingRole: {
      type: String,
      enum: ['owner', 'visitor'],
      required: true,
      index: true
    },
    // Legacy fields (kept for backwards compatibility)
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relationType: {
      type: String,
      enum: ['visitor_to_visitor', 'visitor_to_owner', 'owner_to_owner'],
    },
    // Denormalized profile references for efficient querying
    followerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'followerProfileModel'
    },
    followerProfileModel: {
      type: String,
      enum: ['OwnerProfile', 'VisitorProfile']
    },
    followingProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'followingProfileModel'
    },
    followingProfileModel: {
      type: String,
      enum: ['OwnerProfile', 'VisitorProfile']
    },
    // Metadata
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ followerId: 1, followingId: 1 });
followSchema.index({ followerId: 1, followerRole: 1 });
followSchema.index({ followingId: 1, followingRole: 1 });
followSchema.index({ followerId: 1, followingRole: 1 });

// Pre-save hook to sync legacy fields with new fields
followSchema.pre('save', function(next) {
  // Sync new fields to legacy fields
  if (this.followerId && !this.follower) {
    this.follower = this.followerId;
  }
  if (this.followingId && !this.following) {
    this.following = this.followingId;
  }
  // Sync legacy fields to new fields
  if (this.follower && !this.followerId) {
    this.followerId = this.follower;
  }
  if (this.following && !this.followingId) {
    this.followingId = this.following;
  }
  next();
});

// Static method to check if follower can follow following
followSchema.statics.canFollow = function(followerRole, followingRole) {
  // Owner CANNOT follow Visitor
  if (followerRole === 'owner' && followingRole === 'visitor') {
    return false;
  }
  // All other combinations are allowed
  return true;
};

// Static method to get followers count
followSchema.statics.getFollowersCount = async function(userId, role) {
  return this.countDocuments({
    $or: [
      { followingId: userId, followingRole: role },
      { following: userId } // legacy support
    ]
  });
};

// Static method to get following count
followSchema.statics.getFollowingCount = async function(userId, role) {
  return this.countDocuments({
    $or: [
      { followerId: userId, followerRole: role },
      { follower: userId } // legacy support
    ]
  });
};

// Static method to check if user A follows user B
followSchema.statics.isFollowing = async function(followerUserId, followingUserId) {
  const exists = await this.findOne({
    $or: [
      { followerId: followerUserId, followingId: followingUserId },
      { follower: followerUserId, following: followingUserId } // legacy support
    ]
  });
  return !!exists;
};

module.exports = mongoose.model('Follow', followSchema);
