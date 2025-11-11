const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    url: { type: String, required: true, trim: true, unique: true },
    imageUrl: { type: String, default: '' },
    source: { type: String, default: 'SalonHub' },
    publishedAt: { type: Date, required: true },
    category: { type: String, default: 'beauty' },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

newsSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
