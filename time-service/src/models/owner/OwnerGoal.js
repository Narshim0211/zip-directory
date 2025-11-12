/**
 * OwnerGoal Model
 * Represents business goals for Owner users
 * Extends VisitorGoal with team and business-specific fields
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OwnerGoalSchema = new Schema(
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
    // Owner-specific fields
    teamGoal: {
      type: Boolean,
      default: false,
    },
    assignedTeamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    department: {
      type: String,
      default: null,
    },
    kpiMetric: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'private',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
OwnerGoalSchema.index({ userId: 1, scope: 1, status: 1 });
OwnerGoalSchema.index({ businessId: 1, teamGoal: 1 });
OwnerGoalSchema.index({ userId: 1, startDate: 1 });

module.exports = model('OwnerGoal', OwnerGoalSchema);
