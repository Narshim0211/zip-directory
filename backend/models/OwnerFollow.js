const mongoose = require('mongoose');

const OwnerFollowSchema = new mongoose.Schema({
  followerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  targetOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'OwnerProfile', index: true },
}, { timestamps: true });

OwnerFollowSchema.index({ followerUserId: 1, targetOwnerId: 1 }, { unique: true });

module.exports = mongoose.model('OwnerFollow', OwnerFollowSchema);
