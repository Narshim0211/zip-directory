const mongoose = require('mongoose');

/**
 * ProfileInsight Schema
 * Tracks business profile visit analytics for salon owners
 * ONE document per owner - updates counters on each visit
 */
const profileInsightSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One analytics record per owner
    index: true
  },
  
  // Simple counters - increment on each view
  todayViews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  last7DaysViews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Track last reset for daily counter
  lastDailyReset: {
    type: Date,
    default: Date.now
  },
  
  // Track last reset for weekly counter
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  collection: 'profileInsights'
});

// Static method to increment views with auto-reset logic
profileInsightSchema.statics.incrementViews = async function(ownerId) {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  let insight = await this.findOne({ ownerId });
  
  if (!insight) {
    // Create new analytics record for this owner
    insight = new this({
      ownerId,
      todayViews: 1,
      last7DaysViews: 1,
      totalViews: 1,
      lastDailyReset: now,
      lastWeeklyReset: now
    });
  } else {
    // Reset daily counter if it's a new day
    if (insight.lastDailyReset < oneDayAgo) {
      insight.todayViews = 0;
      insight.lastDailyReset = now;
    }
    
    // Reset weekly counter if it's been 7 days
    if (insight.lastWeeklyReset < sevenDaysAgo) {
      insight.last7DaysViews = 0;
      insight.lastWeeklyReset = now;
    }
    
    // Increment all counters
    insight.todayViews += 1;
    insight.last7DaysViews += 1;
    insight.totalViews += 1;
  }
  
  await insight.save();
  return insight;
};

module.exports = mongoose.model('ProfileInsight', profileInsightSchema);
