const Post = require('../models/Post');

/**
 * Create a new post
 */
const createPost = async ({ authorId, businessId, content, media, tags, visibility }) => {
  const post = new Post({
    author: authorId,
    business: businessId,
    content,
    media: media || [],
    tags: tags || [],
    visibility: visibility || 'public',
    visibleToVisitors: true,
  });

  await post.save();
  return post;
};

/**
 * List posts visible to visitors
 */
const listPosts = async ({ limit = 30 }) => {
  return Post.find({ visibleToVisitors: true })
    .populate('author', 'name email')
    .populate('business', 'name city category')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Get a single post by ID
 */
const getPostById = async (postId) => {
  return Post.findById(postId)
    .populate('author', 'name email')
    .populate('business', 'name city category');
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
};
