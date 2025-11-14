/**
 * OwnerTask Model
 * Represents daily, weekly, and monthly tasks for Owner users
 * Extends base task structure with business-specific fields
 *
 * CRITICAL: taskDate is stored as UTC midnight for consistent querying
 * timeOfDay stores the user's local time preference as HH:mm string
 */
const mongoose = require('mongoose');
const { Schema, model} = mongoose;

// Reminder sub-schema (same as VisitorTask for consistency)
const ReminderSchema = new Schema({
  enabled: { type: Boolean, default: false },
  channels: [{ type: String, enum: ['sms', 'email'] }],
  sendAt: Date,
  phone: String,
  email: String,
  sentAt: Date
}, { _id: false });

const OwnerTaskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
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
      index: true,
    },
    session: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'], // lowercase to match PRD
      required: true,
    },
    timeOfDay: {
      type: String, // "09:30" format
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
    scopeTag: { // Changed from 'scope' to match PRD
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
    // Nested reminder object
    reminder: ReminderSchema,
    // Owner-specific fields
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: null,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    isTeamTask: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'pending-review', 'completed', 'blocked'],
      default: 'todo',
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Index on userId + taskDate for fast daily/weekly/monthly queries
OwnerTaskSchema.index({ userId: 1, taskDate: 1 });
OwnerTaskSchema.index({ userId: 1, taskDate: 1, session: 1 });
OwnerTaskSchema.index({ userId: 1, completed: 1 });
OwnerTaskSchema.index({ businessId: 1, status: 1 });
OwnerTaskSchema.index({ assignedTo: 1, status: 1 });
OwnerTaskSchema.index({ 'reminder.enabled': 1, 'reminder.sendAt': 1, 'reminder.sentAt': 1 }); // For cron job

module.exports = model('OwnerTask', OwnerTaskSchema);
