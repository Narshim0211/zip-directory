/**
 * VisitorReminder Model
 * Represents reminders for Visitor users (email, SMS, in-app)
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const VisitorReminderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'VisitorTask',
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
      default: '',
      maxlength: 1000,
    },
    reminderType: {
      type: String,
      enum: ['email', 'sms', 'in-app'],
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    sendTime: {
      type: Date,
      default: null,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    recipient: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VisitorReminderSchema.index({ userId: 1, scheduledTime: 1 });
VisitorReminderSchema.index({ isSent: 1, status: 1 });
VisitorReminderSchema.index({ userId: 1, isActive: 1 });

module.exports = model('VisitorReminder', VisitorReminderSchema);
