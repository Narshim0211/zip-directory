const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true },
    body: { type: String, default: '' },
    summary: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

articleSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);

