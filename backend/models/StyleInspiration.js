const mongoose = require('mongoose');

const styleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    note: { type: String, default: '' },
    tags: [String],
  },
  { timestamps: true }
);

styleSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('StyleInspiration', styleSchema);

