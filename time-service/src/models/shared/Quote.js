/**
 * Quote Model
 * Shared quotes for both Visitor and Owner users
 * Used for daily inspiration and motivation
 */
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const QuoteSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ['motivation', 'productivity', 'health', 'success', 'leadership', 'creativity', 'wellbeing', 'general'],
      default: 'general',
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
QuoteSchema.index({ category: 1, featured: 1 });
QuoteSchema.index({ isActive: 1, featured: 1 });
QuoteSchema.index({ category: 1, rating: -1 });

module.exports = model('Quote', QuoteSchema);
