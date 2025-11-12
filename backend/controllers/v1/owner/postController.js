const asyncHandler = require('../../../middleWare/asyncHandler');
const { createPost } = require('../../../services/postService');

/**
 * @route   POST /api/v1/owner/posts
 * @desc    Create a new post
 * @access  Private (owner)
 */
exports.create = asyncHandler(async (req, res) => {
  const { content, media, tags, visibility } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Content is required',
    });
  }

  // Get the user's business if they have one
  const businessId = req.user.businessId || req.body.businessId;

  const post = await createPost({
    authorId: req.user._id,
    businessId,
    content,
    media,
    tags,
    visibility,
  });

  res.status(201).json({
    success: true,
    post,
  });
});
