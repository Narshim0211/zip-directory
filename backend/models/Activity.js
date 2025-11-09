const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['review', 'announcement', 'business'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    createdBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);

