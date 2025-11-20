const logger = require('../../../utils/logger');

/**
 * @route   POST /api/v1/owner/posts
 * @desc    Create a new post
 * @access  Private (owner)
 */
exports.create = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    // Create a temporary post object
    // TODO: Save to database when Post model is ready
    const post = {
      _id: Date.now().toString(),
      content: content.trim(),
      author: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: 'owner',
        avatarUrl: req.user.avatarUrl
      },
      identity: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.info(`Post created by owner ${req.user._id}`);

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    logger.error(`Create post error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};
