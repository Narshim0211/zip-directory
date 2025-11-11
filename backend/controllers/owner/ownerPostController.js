const ownerPostService = require("../../services/owner/ownerPostService");

const listPosts = async (req, res) => {
  try {
    const posts = await ownerPostService.listOwnerPosts(req.user._id, {
      limit: parseInt(req.query.limit, 10) || 20,
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const post = await ownerPostService.createPost(req.user._id, req.body || {});
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await ownerPostService.updatePost(req.user._id, req.params.postId, req.body || {});
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    await ownerPostService.deletePost(req.user._id, req.params.postId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reactToPost = async (req, res) => {
  try {
    const payload = await ownerPostService.toggleReaction({
      userId: req.user._id,
      postId: req.params.postId,
      emoji: req.body?.emoji,
    });
    res.json(payload);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  listPosts,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
};
