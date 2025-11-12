/**
 * OwnerTask Model
 * Represents daily, weekly, and monthly tasks for Owner users
 * Extends VisitorTask with business-specific fields
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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

// Index for efficient queries
OwnerTaskSchema.index({ userId: 1, scope: 1, createdAt: -1 });
OwnerTaskSchema.index({ userId: 1, isCompleted: 1 });
OwnerTaskSchema.index({ businessId: 1, status: 1 });
OwnerTaskSchema.index({ assignedTo: 1, status: 1 });

module.exports = model('OwnerTask', OwnerTaskSchema);
