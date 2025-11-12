/**
 * OwnerReminder Model
 * Represents business reminders and notifications for Owner users
 * Extends VisitorReminder with team collaboration and business-specific fields
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OwnerReminderSchema = new Schema(
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
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'OwnerTask',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    reminderType: {
      type: String,
      enum: ['email', 'sms', 'in-app', 'push', 'slack'],
      default: 'in-app',
    },
    scheduledTime: {
      type: Date,
      required: true,
      index: true,
    },
    sendTime: {
      type: Date,
      default: null,
    },
    isSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    // Owner-specific fields
    notifyTeam: {
      type: Boolean,
      default: false,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    department: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    relatedGoalId: {
      type: Schema.Types.ObjectId,
      ref: 'OwnerGoal',
      default: null,
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
OwnerReminderSchema.index({ userId: 1, scheduledTime: 1 });
OwnerReminderSchema.index({ businessId: 1, isSent: 1 });
OwnerReminderSchema.index({ isSent: 1, status: 1 });
OwnerReminderSchema.index({ userId: 1, isActive: 1 });

module.exports = model('OwnerReminder', OwnerReminderSchema);
