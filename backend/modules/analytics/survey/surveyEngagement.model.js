const mongoose = require('mongoose');

/**
 * SurveyEngagement Schema
 * Tracks survey-level analytics: views, reactions, responses
 * ONE document per survey
 */
const surveyEngagementSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
    unique: true, // One analytics record per survey
    index: true
  },
  
  // Simple counters
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  responses: {
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
  
  // Track unique users to prevent spam (optional)
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  respondedBy: [{
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
  collection: 'surveyEngagements'
});

// Static methods for clean operations
surveyEngagementSchema.statics.incrementViews = async function(surveyId, userId = null) {
  let engagement = await this.findOne({ surveyId });
  
  if (!engagement) {
    engagement = new this({
      surveyId,
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

surveyEngagementSchema.statics.incrementResponses = async function(surveyId, userId) {
  let engagement = await this.findOne({ surveyId });
  
  if (!engagement) {
    engagement = new this({
      surveyId,
      responses: 1,
      respondedBy: [userId]
    });
  } else {
    // Only increment if user hasn't responded before
    if (!engagement.respondedBy.includes(userId)) {
      engagement.responses += 1;
      engagement.respondedBy.push(userId);
    }
  }
  
  await engagement.save();
  return engagement;
};

surveyEngagementSchema.statics.addReaction = async function(surveyId, userId, reactionType) {
  let engagement = await this.findOne({ surveyId });
  
  if (!engagement) {
    engagement = new this({
      surveyId,
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

module.exports = mongoose.model('SurveyEngagement', surveyEngagementSchema);
