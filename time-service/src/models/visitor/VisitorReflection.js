/**
 * VisitorReflection Model
 * Represents daily reflections/journal entries for Visitor users
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const VisitorReflectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      default: '',
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
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
VisitorReflectionSchema.index({ userId: 1, date: -1 });
VisitorReflectionSchema.index({ userId: 1, mood: 1 });

module.exports = model('VisitorReflection', VisitorReflectionSchema);
