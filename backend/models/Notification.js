const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'new_follower',
  'new_comment',
  'new_review',
  'comment_report',
  'reply',
  'like',
  'new_post',
  'new_survey',
  'review_reply',
  'review_removal',
  'system_announcement',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user: { type: String, required: true }, // legacy queries still rely on this field
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    contentType: {
      type: String,
      enum: ['post', 'survey', 'review', 'business'],
      default: 'post',
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'contentType',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

notificationSchema.virtual('isRead').get(function () {
  return this.read;
});

module.exports = mongoose.model('Notification', notificationSchema);
