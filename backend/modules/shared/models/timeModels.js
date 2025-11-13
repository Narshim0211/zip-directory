const mongoose = require('mongoose');

/**
 * Shared time management schema
 * Used by both Visitor and Owner roles with separate collections
 */
const timeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['visitor', 'owner'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'morning'
  },
  task: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reminder: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['sms', 'email', 'both'] },
    time: { type: String }, // HH:MM format
    sent: { type: Boolean, default: false }
  },
  metadata: {
    tags: [String],
    color: String,
    attachments: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
timeSchema.index({ userId: 1, date: 1 });
timeSchema.index({ userId: 1, completed: 1 });
timeSchema.index({ 'reminder.enabled': 1, 'reminder.sent': 1 });

// Virtual for overdue status
timeSchema.virtual('isOverdue').get(function() {
  return !this.completed && new Date() > this.date;
});

/**
 * Separate models for Visitor and Owner
 * Each uses its own MongoDB collection for complete data isolation
 */

// Visitor Daily Tasks
const VisitorDaily = mongoose.model('VisitorDaily', timeSchema, 'visitor_time_daily');
const VisitorWeekly = mongoose.model('VisitorWeekly', timeSchema, 'visitor_time_weekly');
const VisitorMonthly = mongoose.model('VisitorMonthly', timeSchema, 'visitor_time_monthly');

// Owner Daily Tasks
const OwnerDaily = mongoose.model('OwnerDaily', timeSchema, 'owner_time_daily');
const OwnerWeekly = mongoose.model('OwnerWeekly', timeSchema, 'owner_time_weekly');
const OwnerMonthly = mongoose.model('OwnerMonthly', timeSchema, 'owner_time_monthly');

module.exports = {
  VisitorDaily,
  VisitorWeekly,
  VisitorMonthly,
  OwnerDaily,
  OwnerWeekly,
  OwnerMonthly
};
