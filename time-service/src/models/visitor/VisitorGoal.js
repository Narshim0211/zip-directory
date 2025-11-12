/**
 * VisitorGoal Model
 * Represents daily, weekly, and monthly goals for Visitor users
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const VisitorGoalSchema = new Schema(
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
    targetValue: {
      type: Number,
      required: true,
      default: 1,
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'count',
    },
    category: {
      type: String,
      default: 'general',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'failed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: [String],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VisitorGoalSchema.index({ userId: 1, scope: 1, status: 1 });
VisitorGoalSchema.index({ userId: 1, startDate: 1 });

module.exports = model('VisitorGoal', VisitorGoalSchema);
