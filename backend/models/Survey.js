const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { _id: false }
);

const voteRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    optionIndex: { type: Number, required: true },
  },
  { _id: false }
);

const surveySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    options: {
      type: [optionSchema],
      validate: [(v) => Array.isArray(v) && v.length >= 2, 'Provide at least 2 options'],
    },
    category: { type: String, default: 'General' },
    totalVotes: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    voters: [voteRecordSchema],
  },
  { timestamps: true }
);

surveySchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Survey', surveySchema);
