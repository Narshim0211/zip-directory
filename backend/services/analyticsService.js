const Business = require('../models/Business');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const ProfileVisit = require('../models/ProfileVisit');
const Post = require('../models/Post');
const Reaction = require('../models/Reaction');

const formatDateKey = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const buildDateRange = (days) => {
  const range = [];
  const now = new Date();
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    range.push(day.toISOString().slice(0, 10));
  }
  return range;
};

const ensureBusinesses = async (ownerId) => {
  const businesses = await Business.find({ owner: String(ownerId) });
  const businessIds = businesses.map((b) => b._id);
  return { businesses, businessIds };
};

const recordProfileVisit = async (businessId, visitorId = null) => {
  if (!businessId) throw new Error('businessId is required to record a visit');
  return ProfileVisit.create({ businessId, visitorId });
};

const getOverview = async (ownerId) => {
  const { businessIds } = await ensureBusinesses(ownerId);
  if (!businessIds.length) {
    return {
      profileViews: 0,
      weeklyViews: 0,
      reviewsCount: 0,
      avgRating: 0,
      likes: 0,
      comments: 0,
      followers: 0,
    };
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const [profileViews, weeklyViews, commentsCount, followerCount, reviewsAgg, likesAgg] =
    await Promise.all([
      ProfileVisit.countDocuments({ businessId: { $in: businessIds } }),
      ProfileVisit.countDocuments({
        businessId: { $in: businessIds },
        visitedAt: { $gte: weekStart },
      }),
      Comment.countDocuments({
        contentType: 'business',
        contentId: { $in: businessIds },
        isDeleted: false,
      }),
      ProfileVisit.aggregate([
        { $match: { businessId: { $in: businessIds }, visitorId: { $ne: null } } },
        { $group: { _id: '$visitorId' } },
        { $count: 'count' },
      ]),
      Review.aggregate([
        { $match: { business: { $in: businessIds }, status: 'visible' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avg: { $avg: '$rating' },
          },
        },
      ]),
      Comment.aggregate([
        {
          $match: {
            contentType: 'business',
            contentId: { $in: businessIds },
          },
        },
        {
          $project: {
            likesSize: { $size: { $ifNull: ['$likes', []] } },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$likesSize' },
          },
        },
      ]),
    ]);

  return {
    businessCount: businessIds.length,
    profileViews,
    weeklyViews,
    reviewsCount: (reviewsAgg && reviewsAgg[0] && reviewsAgg[0].count) || 0,
    avgRating: (reviewsAgg && reviewsAgg[0] && Number(reviewsAgg[0].avg || 0)) || 0,
    likes: (likesAgg && likesAgg[0] && likesAgg[0].total) || 0,
    comments: commentsCount,
    followers: (followerCount && followerCount[0] && followerCount[0].count) || 0,
  };
};

const getEngagementTrend = async (ownerId, days = 7) => {
  const { businessIds } = await ensureBusinesses(ownerId);
  if (!businessIds.length) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const [visits, comments, likes, reviews] = await Promise.all([
    ProfileVisit.aggregate([
      {
        $match: {
          businessId: { $in: businessIds },
          visitedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitedAt' },
            month: { $month: '$visitedAt' },
            day: { $dayOfMonth: '$visitedAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Comment.aggregate([
      {
        $match: {
          contentType: 'business',
          contentId: { $in: businessIds },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Comment.aggregate([
      {
        $match: {
          contentType: 'business',
          contentId: { $in: businessIds },
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          likesSize: { $size: { $ifNull: ['$likes', []] } },
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: '$likesSize' },
        },
      },
    ]),
    Review.aggregate([
      {
        $match: {
          business: { $in: businessIds },
          createdAt: { $gte: startDate },
          status: 'visible',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const visitsMap = new Map(visits.map((doc) => [formatDateKey(doc._id), doc.count]));
  const commentsMap = new Map(comments.map((doc) => [formatDateKey(doc._id), doc.count]));
  const likesMap = new Map(likes.map((doc) => [formatDateKey(doc._id), doc.count]));
  const reviewsMap = new Map(reviews.map((doc) => [formatDateKey(doc._id), doc.count]));
  const range = buildDateRange(days);

  return range.map((date) => ({
    date,
    views: visitsMap.get(date) || 0,
    comments: commentsMap.get(date) || 0,
    likes: likesMap.get(date) || 0,
    reviews: reviewsMap.get(date) || 0,
  }));
};

const getPostMetrics = async (ownerId, limit = 5) => {
  const { businessIds } = await ensureBusinesses(ownerId);
  if (!businessIds.length) return [];

  const posts = await Review.find({ business: { $in: businessIds }, status: 'visible' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('business', 'name')
    .populate('user', 'name');

  return posts.map((review) => ({
    id: review._id,
    business: review.business ? { id: review.business._id, name: review.business.name } : null,
    author: review.user ? { id: review.user._id, name: review.user.name } : null,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
    link: review.business ? `/business/${review.business._id}` : null,
  }));
};

const getFollowersTrend = async (ownerId, days = 7) => {
  const { businessIds } = await ensureBusinesses(ownerId);
  if (!businessIds.length) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const trend = await ProfileVisit.aggregate([
    {
      $match: {
        businessId: { $in: businessIds },
        visitorId: { $ne: null },
        visitedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$visitedAt' },
          month: { $month: '$visitedAt' },
          day: { $dayOfMonth: '$visitedAt' },
        },
        visitors: { $addToSet: '$visitorId' },
      },
    },
    {
      $project: {
        count: { $size: '$visitors' },
      },
    },
  ]);

  const map = new Map(trend.map((doc) => [formatDateKey(doc._id), doc.count]));
  const range = buildDateRange(days);

  return range.map((date) => ({
    date,
    uniqueFollowers: map.get(date) || 0,
  }));
};

const getGeoBreakdown = async (ownerId, limit = 5) => {
  const { businessIds } = await ensureBusinesses(ownerId);
  if (!businessIds.length) return [];

  const breakdown = await ProfileVisit.aggregate([
    { $match: { businessId: { $in: businessIds } } },
    {
      $lookup: {
        from: 'businesses',
        localField: 'businessId',
        foreignField: '_id',
        as: 'business',
      },
    },
    { $unwind: '$business' },
    {
      $group: {
        _id: '$business.city',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return breakdown.map((item) => ({
    city: item._id || 'Unknown',
    visits: item.count,
  }));
};

const getOwnerPostInsights = async (ownerId, limit = 5) => {
  const posts = await Post.find({ author: ownerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return posts.map((post) => {
    const reactionCounts = (post.emojiReactions || []).reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {});

    return {
      id: post._id,
      createdAt: post.createdAt,
      content: post.content,
      media: post.media,
      tags: post.tags || [],
      reactions: {
        total: (post.emojiReactions || []).length,
        breakdown: reactionCounts,
      },
      engagement: {
        likes: post.engagement?.likes || 0,
        comments: post.comments?.length || 0,
        shares: post.engagement?.shares || 0,
      },
    };
  });
};

const getOwnerReactionSummary = async (ownerId) => {
  const posts = await Post.find({ author: ownerId }).select('_id');
  const postIds = posts.map((p) => p._id);
  if (!postIds.length) return [];

  const agg = await Reaction.aggregate([
    {
      $match: {
        targetType: 'post',
        target: { $in: postIds },
      },
    },
    {
      $group: {
        _id: '$emoji',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return agg.map((item) => ({
    emoji: item._id,
    count: item.count,
  }));
};

module.exports = {
  recordProfileVisit,
  getOverview,
  getEngagementTrend,
  getPostMetrics,
  getFollowersTrend,
  getGeoBreakdown,
  getOwnerPostInsights,
  getOwnerReactionSummary,
};
