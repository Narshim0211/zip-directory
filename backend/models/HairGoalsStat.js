const mongoose = require('mongoose');

/**
 * HairGoalsStat - Anonymous Community Statistics
 *
 * This model stores ONLY aggregated, anonymous data for community insights.
 * NO personal identifiers are stored - just goal, week, and completion metrics.
 *
 * Privacy Design:
 * - No userId stored (completely anonymous)
 * - No timestamps that could identify users
 * - Only statistical data needed for aggregation
 * - One record per goal+week combination per submission
 */
const hairGoalsStatSchema = new mongoose.Schema({
  // Goal identifier (e.g., 'grow-longer', 'repair-damaged')
  goal: {
    type: String,
    required: true,
    index: true,
    enum: [
      'length', 'volume', 'repair', 'curls', 'scalp', 'color',
      'grow-longer', 'add-volume', 'repair-damaged', 'define-curls',
      'scalp-health', 'color-protection', 'general'
    ]
  },

  // Week number in journey (1, 2, 3, etc.)
  weekNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 52, // Cap at 1 year
    index: true
  },

  // Completion percentage (0-100)
  completionPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // Total routine steps the user had
  totalSteps: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },

  // Completed steps count
  completedSteps: {
    type: Number,
    required: true,
    min: 0
  },

  // Step types included (anonymous - just the type, not product names)
  // e.g., ['wash', 'deep-condition', 'oil-treatment']
  stepTypes: [{
    type: String,
    enum: [
      'Wash', 'Deep Condition', 'Oil Treatment', 'Scalp Massage',
      'Protein Treatment', 'Leave-in', 'Style', 'Trim', 'Other'
    ]
  }],

  // Hair feeling after the week (anonymous sentiment)
  hairFeeling: {
    type: String,
    enum: ['terrible', 'bad', 'okay', 'good', 'great', 'amazing', null],
    default: null
  },

  // Submission month (for data cleanup - delete after 6 months)
  submissionMonth: {
    type: String, // Format: '2025-11'
    required: true,
    index: true
  }
}, {
  // No timestamps to prevent user identification
  timestamps: false,

  // Optimize for aggregation queries
  collection: 'hairgoalsstats'
});

// Compound index for efficient aggregation queries
hairGoalsStatSchema.index({ goal: 1, weekNumber: 1 });
hairGoalsStatSchema.index({ submissionMonth: 1 }); // For cleanup

/**
 * Static method: Get aggregated stats for a goal + week
 */
hairGoalsStatSchema.statics.getAggregatedStats = async function(goal, weekNumber) {
  const stats = await this.aggregate([
    {
      $match: {
        goal: goal,
        weekNumber: weekNumber
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgCompletion: { $avg: '$completionPercent' },
        minCompletion: { $min: '$completionPercent' },
        maxCompletion: { $max: '$completionPercent' },
        avgSteps: { $avg: '$totalSteps' },
        // Count by feeling
        greatCount: {
          $sum: { $cond: [{ $in: ['$hairFeeling', ['great', 'amazing']] }, 1, 0] }
        },
        goodCount: {
          $sum: { $cond: [{ $eq: ['$hairFeeling', 'good'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || null;
};

/**
 * Static method: Get most common step types for a goal
 */
hairGoalsStatSchema.statics.getTopStepTypes = async function(goal, limit = 5) {
  const stats = await this.aggregate([
    { $match: { goal: goal } },
    { $unwind: '$stepTypes' },
    {
      $group: {
        _id: '$stepTypes',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);

  return stats.map(s => ({
    stepType: s._id,
    count: s.count
  }));
};

/**
 * Static method: Calculate percentile for a given completion
 */
hairGoalsStatSchema.statics.calculatePercentile = async function(goal, weekNumber, userCompletion) {
  const stats = await this.aggregate([
    {
      $match: {
        goal: goal,
        weekNumber: weekNumber
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        belowUser: {
          $sum: { $cond: [{ $lt: ['$completionPercent', userCompletion] }, 1, 0] }
        }
      }
    }
  ]);

  if (!stats[0] || stats[0].total === 0) {
    return null;
  }

  const percentile = Math.round((stats[0].belowUser / stats[0].total) * 100);
  return {
    percentile,
    totalUsers: stats[0].total
  };
};

module.exports = mongoose.model('HairGoalsStat', hairGoalsStatSchema);
