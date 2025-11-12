const mongoose = require('mongoose');

const OwnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  displayName: { type: String, trim: true, default: '' },
  handle: { type: String, unique: true },
  slug: { type: String, unique: true },
  avatarUrl: { type: String, default: '' },
  headerImageUrl: { type: String, default: '' },
  bio: { type: String, maxlength: 1000, default: '' },
  featuredBusinesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
  pinnedPostIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  socialLinks: {
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  verified: { type: Boolean, default: false },
  counts: {
    posts: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    surveys: { type: Number, default: 0 },
  },
  needsCompletion: { type: Boolean, default: false },
}, { timestamps: true });

OwnerProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// ensure displayName fallback
OwnerProfileSchema.pre('save', function (next) {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

module.exports = mongoose.model('OwnerProfile', OwnerProfileSchema);
