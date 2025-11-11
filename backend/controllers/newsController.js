const newsService = require('../services/newsService');
const catchAsync = require('../utils/catchAsync');

exports.getTrending = catchAsync(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 12);
  const news = await newsService.getTrendingNews(limit);
  res.json(news);
});
