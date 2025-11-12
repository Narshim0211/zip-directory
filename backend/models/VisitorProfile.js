const mongoose = require('mongoose');

const VisitorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  handle: { type: String, unique: true, index: true },
  slug: { type: String, unique: true, index: true },
  avatarUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  bio: { type: String, maxlength: 280, default: '' },
  socialLinks: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  needsCompletion: { type: Boolean, default: false },
}, { timestamps: true });

VisitorProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

module.exports = mongoose.model('VisitorProfile', VisitorProfileSchema);
