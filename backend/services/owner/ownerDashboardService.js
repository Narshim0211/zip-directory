const analyticsService = require("../analyticsService");

const getDashboardStats = async (ownerId) => {
  const overview = await analyticsService.getOverview(ownerId);
  const weeklyTrend = await analyticsService.getEngagementTrend(ownerId, 7);
  return {
    views: overview.profileViews,
    weekly: weeklyTrend,
    avgRating: overview.avgRating,
    reviewsCount: overview.reviewsCount,
    likes: overview.likes,
    comments: overview.comments,
    followers: overview.followers,
    businesses: overview.businessCount,
  };
};

module.exports = { getDashboardStats };
