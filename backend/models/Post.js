const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
    content: { type: String, default: '' },
    media: [{ type: String }],
    postType: {
      type: String,
      enum: ['text', 'image', 'video', 'survey'],
      default: 'text',
    },
    tags: [{ type: String }],
    visibility: {
      type: String,
      enum: ['public', 'followers'],
      default: 'public',
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    emojiReactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      clap: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ visibility: 1 });
postSchema.index({ isPromoted: -1 });

module.exports = mongoose.model('Post', postSchema);
