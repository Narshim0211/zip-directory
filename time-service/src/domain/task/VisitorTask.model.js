/**
 * Visitor Task Model
 *
 * Production-ready model with:
 * - Compound indexes for query performance
 * - Data validation
 * - Embedded reminder schema
 * - UTC date handling
 * - Optimized for horizontal scaling
 */

const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  channels: [{
    type: String,
    enum: ['sms', 'email'],
    default: []
  }],
  sendAt: {
    type: Date,
    index: true // Index for reminder worker queries
  },
  phone: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    sparse: true
  },
  sentAt: Date,
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  error: String
}, { _id: false });

const VisitorTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true, // Index for user queries
    ref: 'User'
  },

  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  taskDate: {
    type: Date,
    required: true,
    index: true // Index for date range queries
  },

  session: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening'],
    index: true // Index for session queries
  },

  timeOfDay: {
    type: String, // Format: "HH:MM"
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: 'timeOfDay must be in HH:MM format'
    }
  },

  durationMin: {
    type: Number,
    min: 0,
    max: 1440 // 24 hours max
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  scopeTag: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    index: true // Index for scope queries
  },

  completed: {
    type: Boolean,
    default: false,
    index: true // Index for filtering completed/incomplete
  },

  completedAt: Date,

  reminder: ReminderSchema

}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'visitor_time_tasks'
});

// Compound Indexes for Performance at Scale
// These indexes are critical for handling millions of users

// Primary query pattern: Get user's tasks for a specific date
VisitorTaskSchema.index({ userId: 1, taskDate: 1 });

// Query pattern: Get user's tasks for a date and session
VisitorTaskSchema.index({ userId: 1, taskDate: 1, session: 1 });

// Query pattern: Get user's tasks by scope (daily/weekly/monthly)
VisitorTaskSchema.index({ userId: 1, scopeTag: 1, taskDate: 1 });

// Query pattern: Get incomplete tasks for a user
VisitorTaskSchema.index({ userId: 1, completed: 1, taskDate: 1 });

// Query pattern: Worker finding pending reminders to send
VisitorTaskSchema.index({
  'reminder.enabled': 1,
  'reminder.status': 1,
  'reminder.sendAt': 1
}, {
  sparse: true,
  partialFilterExpression: { 'reminder.enabled': true }
});

// Methods

/**
 * Mark task as completed
 */
VisitorTaskSchema.methods.markComplete = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

/**
 * Mark task as incomplete
 */
VisitorTaskSchema.methods.markIncomplete = function() {
  this.completed = false;
  this.completedAt = null;
  return this.save();
};

/**
 * Check if reminder should be sent
 */
VisitorTaskSchema.methods.shouldSendReminder = function() {
  if (!this.reminder || !this.reminder.enabled) {
    return false;
  }

  if (this.reminder.status !== 'pending') {
    return false;
  }

  if (!this.reminder.sendAt) {
    return false;
  }

  // Check if sendAt time has passed
  return new Date() >= this.reminder.sendAt;
};

// Statics

/**
 * Find tasks for a specific date range
 * @param {ObjectId} userId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Query}
 */
VisitorTaskSchema.statics.findByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    taskDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ taskDate: 1, session: 1 });
};

/**
 * Find tasks for a specific day
 * @param {ObjectId} userId
 * @param {Date} date (UTC midnight)
 * @returns {Query}
 */
VisitorTaskSchema.statics.findByDay = function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return this.findByDateRange(userId, startOfDay, endOfDay);
};

/**
 * Find pending reminders that need to be sent
 * @param {number} limit
 * @returns {Query}
 */
VisitorTaskSchema.statics.findPendingReminders = function(limit = 100) {
  return this.find({
    'reminder.enabled': true,
    'reminder.status': 'pending',
    'reminder.sendAt': { $lte: new Date() }
  }).limit(limit);
};

module.exports = mongoose.model('VisitorTask', VisitorTaskSchema);
