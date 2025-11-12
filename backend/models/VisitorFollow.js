const mongoose = require('mongoose');

const VisitorFollowSchema = new mongoose.Schema({
  followerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  targetType: { type: String, enum: ['visitor', 'owner'], required: true, index: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
}, { timestamps: true });

VisitorFollowSchema.index({ followerUserId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('VisitorFollow', VisitorFollowSchema);
