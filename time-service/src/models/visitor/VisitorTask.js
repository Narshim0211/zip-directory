/**
 * VisitorTask Model
 * Represents daily, weekly, and monthly tasks for Visitor users
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    scope: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    session: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      default: 'Morning',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
    reminderType: {
      type: String,
      enum: ['email', 'sms', 'in-app', 'none'],
      default: 'in-app',
    },
    reminderTime: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'general',
    },
    tags: [String],
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VisitorTaskSchema.index({ userId: 1, scope: 1, createdAt: -1 });
VisitorTaskSchema.index({ userId: 1, isCompleted: 1 });
VisitorTaskSchema.index({ userId: 1, session: 1 });

module.exports = model('VisitorTask', VisitorTaskSchema);
