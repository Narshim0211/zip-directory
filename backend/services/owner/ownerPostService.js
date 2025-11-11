const Post = require("../../models/Post");
const Business = require("../../models/Business");
const Reaction = require("../../models/Reaction");

const listOwnerPosts = async (ownerId, { limit = 20 } = {}) => {
  return Post.find({ author: ownerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "name avatarUrl")
    .lean();
};

const createPost = async (ownerId, payload = {}) => {
  const business = await Business.findOne({ owner: ownerId });
  const doc = new Post({
    author: ownerId,
    business: business ? business._id : undefined,
    content: (payload.content || "").trim(),
    media: Array.isArray(payload.media) ? payload.media : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    visibility: payload.visibility || "public",
    isPromoted: payload.isPromoted === true,
  });

  return doc.save();
};

const updatePost = async (ownerId, postId, payload = {}) => {
  const update = {
    content: payload.content?.trim(),
    media: payload.media,
    tags: payload.tags,
    visibility: payload.visibility,
    isPromoted: payload.isPromoted,
  };
  Object.keys(update).forEach((key) => {
    if (update[key] === undefined) delete update[key];
  });

  const post = await Post.findOneAndUpdate({ _id: postId, author: ownerId }, update, {
    new: true,
  });
  if (!post) throw new Error("Post not found or unauthorized");
  return post;
};

const deletePost = async (ownerId, postId) => {
  const deleted = await Post.findOneAndDelete({ _id: postId, author: ownerId });
  if (!deleted) throw new Error("Post not found or unauthorized");
  return deleted;
};

const toggleReaction = async ({ userId, postId, emoji }) => {
  if (!emoji || !emoji.trim()) throw new Error("Emoji is required");
  const existing = await Reaction.findOne({
    user: userId,
    targetType: "post",
    target: postId,
    emoji,
  });
  if (existing) {
    await existing.deleteOne();
    await Post.findByIdAndUpdate(postId, {
      $inc: { "engagement.likes": -1 },
      $pull: { emojiReactions: { user: userId, emoji } },
    });
    return { removed: true };
  }
  const reaction = await Reaction.create({ user: userId, targetType: "post", target: postId, emoji });
  await Post.findByIdAndUpdate(postId, {
    $inc: { "engagement.likes": 1 },
    $push: { emojiReactions: { user: userId, emoji } },
  });
  return { removed: false, reaction };
};

module.exports = {
  listOwnerPosts,
  createPost,
  updatePost,
  deletePost,
  toggleReaction,
};
