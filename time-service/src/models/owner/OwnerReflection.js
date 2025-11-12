/**
 * OwnerReflection Model
 * Represents business reflections, reviews, and insights for Owner users
 * Extends VisitorReflection with team and business performance tracking
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const OwnerReflectionSchema = new Schema(
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
      default: 'neutral',
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    goalsAchieved: {
      type: Number,
      default: 0,
    },
    keyHighlights: [String],
    areasForImprovement: [String],
    gratitudeItems: [String],
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Owner-specific fields
    businessPerformance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    teamMood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
      default: 'neutral',
    },
    revenueNotes: {
      type: String,
      maxlength: 1000,
    },
    customerFeedback: [String],
    staffInsights: [String],
    operationalChallenges: [String],
    successMetrics: {
      customersServed: Number,
      appointmentsCompleted: Number,
      revenueGenerated: Number,
      reviewsReceived: Number,
    },
    department: {
      type: String,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'private',
    },
    isWeeklyReview: {
      type: Boolean,
      default: false,
    },
    isMonthlyReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
OwnerReflectionSchema.index({ userId: 1, date: 1 });
OwnerReflectionSchema.index({ businessId: 1, isWeeklyReview: 1 });
OwnerReflectionSchema.index({ userId: 1, mood: 1 });
OwnerReflectionSchema.index({ userId: 1, isMonthlyReview: 1 });

module.exports = model('OwnerReflection', OwnerReflectionSchema);
