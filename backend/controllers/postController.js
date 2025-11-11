const Post = require('../models/Post');
const Comment = require('../models/Comment');
const notificationService = require('../services/notificationService');

exports.listPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'name avatarUrl role')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, media, postType } = req.body || {};
    const post = new Post({
      author: req.user._id,
      content: (content || '').trim(),
      media: Array.isArray(media) ? media : [],
      postType: postType || 'text',
    });
    await post.save();
    await post.populate('author', 'name avatarUrl role');
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ message: 'Comment text required' });
    const comment = new Comment({
      postId,
      author: req.user._id,
      parentId: parentId || null,
      content: content.trim(),
    });
    await comment.save();
    await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    await notificationService.notifyUser({
      recipientId: req.user._id, // placeholder, can be post owner later
      senderId: req.user._id,
      type: 'comment',
      title: 'New comment',
      message: 'Someone commented on a post',
    });
    await comment.populate('author', 'name');
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
