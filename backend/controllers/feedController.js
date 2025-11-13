const feedService = require('../services/feedAggregatorService');
const withTryCatch = require('../middleWare/withTryCatch');

/**
 * GET /api/feed/global
 * Get unified global feed (public posts and surveys from all users)
 *
 * Query params:
 * - limit: number of items to return (default 20, max 50)
 * - cursor: ISO date string for pagination
 *
 * Response:
 * {
 *   items: [...],
 *   nextCursor: "2024-01-15T12:00:00.000Z" | null,
 *   errors: [...] | null,
 *   meta: { total, sources }
 * }
 */
exports.getGlobalFeed = withTryCatch(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cursor = req.query.cursor || null;
  const userId = req.user?._id || null;
  const userRole = req.user?.role || null;

  // Get feed from aggregator service
  let feedData = await feedService.getGlobalFeed({
    limit,
    cursor,
    userId,
    userRole
  });

  // Enrich with profile data (avatar, handle, slug)
  feedData.items = await feedService.enrichWithProfiles(feedData.items);

  res.json({
    success: true,
    data: feedData.items,
    nextCursor: feedData.nextCursor,
    errors: feedData.errors,
    meta: feedData.meta
  });
}, 'getGlobalFeed');

/**
 * GET /api/feed/following
 * Get feed from users that current user follows
 * (Requires authentication)
 */
exports.getFollowingFeed = withTryCatch(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // TODO: Implement following feed logic
  // This would filter feed items to only show content from users the current user follows

  res.json({
    success: true,
    data: [],
    message: 'Following feed - coming soon'
  });
}, 'getFollowingFeed');

/**
 * GET /api/feed/visitor
 * Legacy endpoint - redirects to global feed
 * (Kept for backward compatibility)
 */
exports.getVisitorFeed = withTryCatch(async (req, res) => {
  // Redirect to getGlobalFeed logic
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cursor = req.query.cursor || null;
  const userId = req.user?._id || null;
  const userRole = req.user?.role || null;

  let feedData = await feedService.getGlobalFeed({
    limit,
    cursor,
    userId,
    userRole
  });

  feedData.items = await feedService.enrichWithProfiles(feedData.items);

  res.json({
    success: true,
    data: feedData.items,
    nextCursor: feedData.nextCursor,
    errors: feedData.errors,
    meta: feedData.meta
  });
}, 'getVisitorFeed');

module.exports = exports;
