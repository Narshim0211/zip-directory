const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // stable key (e.g., nanoid or index)
    label: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for legacy compatibility
    question: { type: String, required: true },
    options: {
      type: [optionSchema],
      validate: [(v) => Array.isArray(v) && v.length >= 2, 'Provide at least 2 options'],
    },
    category: {
      type: String,
      enum: ['Hair', 'Skin', 'Nails', 'Makeup', 'Spa', 'General'],
      default: 'General',
    },
    totalVotes: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // simplified - just user IDs
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public',
    },
    visibleToVisitors: { type: Boolean, default: true }, // for feed filtering
  },
  { timestamps: true }
);

surveySchema.index({ author: 1, createdAt: -1 });
surveySchema.index({ createdAt: -1 });
surveySchema.index({ visibility: 1 });
surveySchema.index({ visibleToVisitors: 1 });

module.exports = mongoose.model('Survey', surveySchema);
