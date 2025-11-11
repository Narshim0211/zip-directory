const feedService = require('../services/feedService');
const asyncHandler = require('../utils/catchAsync');

exports.getVisitorFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const feed = await feedService.getFeedForVisitor(userId);
  res.json(feed);
});
