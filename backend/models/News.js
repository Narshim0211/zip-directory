const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    body: { type: String, default: '' },
    category: { type: String, default: 'General' },
    imageUrl: { type: String, default: '' },
    author: { type: String, default: 'SalonHub' },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

newsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('News', newsSchema);

