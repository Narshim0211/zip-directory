/**
 * VisitorTask Model
 * Represents daily, weekly, and monthly tasks for Visitor users
 *
 * CRITICAL: taskDate is stored as UTC midnight for consistent querying
 * timeOfDay stores the user's local time preference as HH:mm string
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Reminder sub-schema (nested object for better organization)
const ReminderSchema = new Schema({
  enabled: { type: Boolean, default: false },
  channels: [{ type: String, enum: ['sms', 'email'] }],
  sendAt: Date, // When to send the reminder (can be different from taskDate)
  phone: String,
  email: String,
  sentAt: Date // Track when reminder was actually sent
}, { _id: false });

const VisitorTaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    notes: { // Changed from 'description' to match PRD
      type: String,
      default: '',
      maxlength: 1000,
    },
    // CRITICAL: This is the canonical date (UTC midnight) for filtering
    taskDate: {
      type: Date,
      required: true,
      index: true, // Essential for daily/weekly/monthly queries
    },
    session: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'], // lowercase to match PRD
      required: true,
    },
    timeOfDay: {
      type: String, // "09:30" format - user's local time preference
      default: null,
    },
    durationMin: {
      type: Number,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    scopeTag: { // Changed from 'scope' to match PRD exactly
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    completed: { // Changed from 'isCompleted' to match PRD
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      default: 'general',
    },
    tags: [String],
    // Nested reminder object (replaces flat fields)
    reminder: ReminderSchema,
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Index on userId + taskDate for fast daily/weekly/monthly queries
VisitorTaskSchema.index({ userId: 1, taskDate: 1 });
VisitorTaskSchema.index({ userId: 1, taskDate: 1, session: 1 });
VisitorTaskSchema.index({ userId: 1, completed: 1 });
VisitorTaskSchema.index({ 'reminder.enabled': 1, 'reminder.sendAt': 1, 'reminder.sentAt': 1 }); // For cron job

module.exports = model('VisitorTask', VisitorTaskSchema);
