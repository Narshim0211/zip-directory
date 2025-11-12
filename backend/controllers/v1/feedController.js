const asyncHandler = require('../../middleWare/asyncHandler');
const { buildFeed } = require('../../services/feedService');

/**
 * @route   GET /api/v1/feed
 * @desc    Get unified feed (posts + surveys)
 * @access  Public
 */
exports.getFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const items = await buildFeed({ limit });

  res.json({
    success: true,
    items,
    hasMore: items.length === limit,
  });
});
