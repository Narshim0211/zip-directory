const feedService = require('../services/feedService');
const asyncHandler = require('../utils/catchAsync');

exports.getVisitorFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit, cursor } = req.query;
  const feed = await feedService.getFeedForVisitor(userId, { limit, cursor });
  res.json({ items: feed, hasMore: feed.length >= (Number(limit) || 20) });
});
