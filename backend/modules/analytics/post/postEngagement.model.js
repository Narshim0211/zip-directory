const mongoose = require('mongoose');

/**
 * PostEngagement Schema
 * Tracks owner post analytics: views, reactions
 * ONE document per post
 * Similar to survey but NO responses counter
 */
const postEngagementSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OwnerPost',
    required: true,
    unique: true, // One analytics record per post
    index: true
  },
  
  // Simple counters
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  reactions: {
    like: {
      type: Number,
      default: 0,
      min: 0
    },
    love: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Track unique users to prevent spam
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  reactedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reactionType: {
      type: String,
      enum: ['like', 'love']
    }
  }]
  
}, {
  timestamps: true,
  collection: 'postEngagements'
});

// Index for efficient lookups
postEngagementSchema.index({ postId: 1 });

// Static methods for clean operations
postEngagementSchema.statics.incrementViews = async function(postId, userId = null) {
  let engagement = await this.findOne({ postId });
  
  if (!engagement) {
    engagement = new this({
      postId,
      views: 1,
      viewedBy: userId ? [userId] : []
    });
  } else {
    // Only increment if user hasn't viewed before (prevent spam)
    if (!userId || !engagement.viewedBy.includes(userId)) {
      engagement.views += 1;
      if (userId) engagement.viewedBy.push(userId);
    }
  }
  
  await engagement.save();
  return engagement;
};

postEngagementSchema.statics.addReaction = async function(postId, userId, reactionType) {
  let engagement = await this.findOne({ postId });
  
  if (!engagement) {
    engagement = new this({
      postId,
      reactions: {
        like: reactionType === 'like' ? 1 : 0,
        love: reactionType === 'love' ? 1 : 0
      },
      reactedBy: [{ userId, reactionType }]
    });
  } else {
    // Check if user already reacted
    const existingReaction = engagement.reactedBy.find(r => r.userId.equals(userId));
    
    if (existingReaction) {
      // User changing reaction type
      if (existingReaction.reactionType !== reactionType) {
        // Decrement old reaction
        engagement.reactions[existingReaction.reactionType] -= 1;
        // Increment new reaction
        engagement.reactions[reactionType] += 1;
        // Update reaction type
        existingReaction.reactionType = reactionType;
      }
      // If same type, do nothing (user can't spam same reaction)
    } else {
      // New reaction
      engagement.reactions[reactionType] += 1;
      engagement.reactedBy.push({ userId, reactionType });
    }
  }
  
  await engagement.save();
  return engagement;
};

module.exports = mongoose.model('PostEngagement', postEngagementSchema);
