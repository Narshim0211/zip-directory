const feedService = require("../../services/feedService");
const analyticsService = require("../../services/analyticsService");

const getOwnerFeed = async (req, res) => {
  try {
    const feed = await feedService.getUnifiedFeed({
      ownerId: req.user._id,
      limit: parseInt(req.query.limit, 10) || 30,
    });
    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerInsights = async (req, res) => {
  try {
    const insights = await analyticsService.getOwnerPostInsights(req.user._id);
    const reactionSummary = await analyticsService.getOwnerReactionSummary(req.user._id);
    res.json({ insights, reactionSummary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOwnerFeed,
  getOwnerInsights,
};
