const Post = require('../models/Post');
const OwnerPost = require('../models/OwnerPost');
const Survey = require('../models/Survey');
const OwnerProfile = require('../models/OwnerProfile');
const VisitorProfile = require('../models/VisitorProfile');
const User = require('../models/User');
const Reaction = require('../models/Reaction');
const feedRankingService = require('./feedRankingService');
const { getSurveyOfTheDay } = require('./surveyOfTheDayService');

/**
 * Feed Aggregator Service - Unified Global Feed
 *
 * Combines content from multiple sources with complete error isolation
 * using Promise.allSettled() to prevent cascade failures.
 *
 * Key Features:
 * - Aggregates posts and surveys from both Owners and Visitors
 * - Adds role metadata ("owner" or "visitor") to each item
 * - Error isolation: one source failure doesn't break entire feed
 * - Cursor-based pagination for performance
 * - Profile data enrichment (avatar, handle, name)
 */

/**
 * Get unified global feed (public content from all users)
 * @param {Object} options - { limit, cursor, userId, userRole }
 * @returns {Object} - { items, nextCursor, errors }
 */
async function getGlobalFeed({ limit = 20, cursor = null, userId = null, userRole = null } = {}) {
  const dateCursor = cursor ? new Date(cursor) : new Date();

  // Fetch all content types in parallel with error isolation
  const results = await Promise.allSettled([
    // Visitor posts (from Post model where author has role=visitor)
    fetchVisitorPosts(dateCursor, limit),

    // Owner posts (from OwnerPost model)
    fetchOwnerPosts(dateCursor, limit),

    // Surveys (check author role to determine if owner or visitor)
    fetchSurveys(dateCursor, limit)
  ]);

  // Extract results and track errors
  const errors = [];
  const [visitorPostsResult, ownerPostsResult, surveysResult] = results;

  let visitorPosts = [];
  let ownerPosts = [];
  let surveys = [];

  if (visitorPostsResult.status === 'fulfilled') {
    visitorPosts = visitorPostsResult.value;
  } else {
    console.error('[FeedAggregator] Visitor posts fetch failed:', visitorPostsResult.reason);
    errors.push({ source: 'visitorPosts', error: visitorPostsResult.reason.message });
  }

  if (ownerPostsResult.status === 'fulfilled') {
    ownerPosts = ownerPostsResult.value;
  } else {
    console.error('[FeedAggregator] Owner posts fetch failed:', ownerPostsResult.reason);
    errors.push({ source: 'ownerPosts', error: ownerPostsResult.reason.message });
  }

  if (surveysResult.status === 'fulfilled') {
    surveys = surveysResult.value;
  } else {
    console.error('[FeedAggregator] Surveys fetch failed:', surveysResult.reason);
    errors.push({ source: 'surveys', error: surveysResult.reason.message });
  }

  // Combine and normalize all items
  const allItems = [
    ...visitorPosts.map(p => normalizePost(p, 'visitor', 'post')),
    ...ownerPosts.map(p => normalizePost(p, 'owner', 'post')),
    ...surveys.map(s => normalizeSurvey(s))
  ];

  // Get user's following list for ranking algorithm
  let followedIds = [];
  if (userId) {
    try {
      followedIds = await feedRankingService.getFollowedUserIds(userId);
    } catch (error) {
      console.error('[FeedAggregator] Failed to fetch following list:', error);
      // Continue with empty follow list - ranking will still work
    }
  }

  // Rank items using world-class algorithm (velocity + follow boost + premium boost)
  const rankedItems = feedRankingService.rankFeedItems(allItems, userId, followedIds);

  // 🌟 PHASE 4: Inject Survey of the Day at the top (only on first page, cursor = null)
  let finalItems = rankedItems;
  if (!cursor) {
    try {
      const surveyOfTheDay = await getSurveyOfTheDay();
      if (surveyOfTheDay) {
        // Check if Survey of the Day is already in the feed
        const alreadyInFeed = rankedItems.some(
          item => item._id.toString() === surveyOfTheDay._id.toString()
        );

        if (alreadyInFeed) {
          // Remove it from its current position
          finalItems = rankedItems.filter(
            item => item._id.toString() !== surveyOfTheDay._id.toString()
          );
        }

        // Normalize and inject at position 0
        const normalizedSurvey = normalizeSurvey(surveyOfTheDay);
        finalItems = [normalizedSurvey, ...finalItems];

        console.log('[FeedAggregator] Injected Survey of the Day at top:', surveyOfTheDay._id);
      }
    } catch (error) {
      console.error('[FeedAggregator] Failed to inject Survey of the Day:', error);
      // Continue without Survey of the Day - non-blocking
    }
  }

  // Apply limit and get next cursor
  const items = finalItems.slice(0, limit);
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt.toISOString() : null;

  return {
    items,
    nextCursor,
    errors: errors.length > 0 ? errors : null,
    meta: {
      total: items.length,
      sources: {
        visitorPosts: visitorPosts.length,
        ownerPosts: ownerPosts.length,
        surveys: surveys.length
      }
    }
  };
}

/**
 * Fetch visitor posts
 */
async function fetchVisitorPosts(dateCursor, limit) {
  return Post.find({
    visibility: 'public',
    visibleToVisitors: true,
    createdAt: { $lt: dateCursor }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'firstName lastName role')
    .lean();
}

/**
 * Fetch owner posts
 */
async function fetchOwnerPosts(dateCursor, limit) {
  return OwnerPost.find({
    visibility: 'public',
    createdAt: { $lt: dateCursor }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('ownerId', 'firstName lastName role')
    .lean();
}

/**
 * Fetch surveys
 */
async function fetchSurveys(dateCursor, limit) {
  return Survey.find({
    visibility: 'public',
    visibleToVisitors: true,
    createdAt: { $lt: dateCursor },
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'firstName lastName role')
    .lean();
}

/**
 * Normalize post item for unified feed
 */
function normalizePost(post, authorRole, type = 'post') {
  const author = post.author || post.ownerId;
  return {
    _id: post._id,
    type, // 'post'
    authorRole, // 'owner' or 'visitor'
    author: {
      _id: author?._id,
      firstName: author?.firstName || 'Unknown',
      lastName: author?.lastName || '',
      role: authorRole,
      // Will be enriched with profile data (avatar, handle) in controller
    },
    content: post.content || post.text || '',
    media: post.media || (post.mediaUrl ? [post.mediaUrl] : []),
    mediaType: post.mediaType || null,
    reactions: post.reactions || post.engagement || {},
    commentsCount: post.comments?.length || post.commentsCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

/**
 * Normalize survey item for unified feed
 */
function normalizeSurvey(survey) {
  const author = survey.author;
  const authorRole = author?.role === 'owner' ? 'owner' : 'visitor';

  return {
    _id: survey._id,
    type: 'survey',
    surveyType: survey.surveyType || 'poll', // 'poll' or 'love-only'
    authorRole,
    author: {
      _id: author?._id,
      firstName: author?.firstName || 'Unknown',
      lastName: author?.lastName || '',
      role: authorRole,
    },
    question: survey.question,
    options: survey.options,
    category: survey.category,
    totalVotes: survey.totalVotes || 0,
    expiresAt: survey.expiresAt,

    // Love-only survey fields
    imageUrl: survey.imageUrl || '',
    loveCount: survey.loveCount || 0,
    lastLoveAt: survey.lastLoveAt,
    authorNote: survey.authorNote || '',
    viewCount: survey.viewCount || 0,

    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt
  };
}

/**
 * Enrich feed items with reactions (like/love counts)
 * Fetches reaction counts for all items in parallel
 */
async function enrichWithReactions(items, userId = null) {
  // Fetch reaction counts for all items in parallel
  const reactionPromises = items.map(async (item) => {
    const contentType = item.type === 'survey' ? 'survey' : 'post';
    const contentId = item._id.toString();

    try {
      const counts = await Reaction.getReactionCounts(contentId, contentType);
      const userReaction = userId
        ? await Reaction.getUserReaction(userId, contentId, contentType)
        : null;

      return {
        contentId,
        reactions: counts,
        userReaction
      };
    } catch (error) {
      console.error(`[FeedAggregator] Failed to fetch reactions for ${contentId}:`, error.message);
      return {
        contentId,
        reactions: { like: 0, love: 0, total: 0 },
        userReaction: null
      };
    }
  });

  const reactionResults = await Promise.all(reactionPromises);

  // Build reaction lookup map
  const reactionMap = new Map();
  reactionResults.forEach(r => {
    reactionMap.set(r.contentId, { reactions: r.reactions, userReaction: r.userReaction });
  });

  // Enrich items with reaction data
  return items.map(item => {
    const reactionData = reactionMap.get(item._id.toString());
    if (reactionData) {
      item.reactions = reactionData.reactions;
      item.userReaction = reactionData.userReaction;
    }
    return item;
  });
}

/**
 * Enrich feed items with profile data (avatar, handle, slug)
 * Fetches profiles in parallel with error isolation
 */
async function enrichWithProfiles(items) {
  // Group items by author role to batch fetch profiles
  const ownerAuthorIds = [];
  const visitorAuthorIds = [];

  items.forEach(item => {
    if (item.authorRole === 'owner' && item.author._id) {
      ownerAuthorIds.push(item.author._id);
    } else if (item.authorRole === 'visitor' && item.author._id) {
      visitorAuthorIds.push(item.author._id);
    }
  });

  // Fetch profiles in parallel with error isolation
  const [ownerProfilesResult, visitorProfilesResult] = await Promise.allSettled([
    OwnerProfile.find({ userId: { $in: ownerAuthorIds } }).lean(),
    VisitorProfile.find({ userId: { $in: visitorAuthorIds } }).lean()
  ]);

  // Build profile lookup maps
  const ownerProfileMap = new Map();
  const visitorProfileMap = new Map();

  if (ownerProfilesResult.status === 'fulfilled') {
    ownerProfilesResult.value.forEach(p => {
      ownerProfileMap.set(p.userId.toString(), p);
    });
  }

  if (visitorProfilesResult.status === 'fulfilled') {
    visitorProfilesResult.value.forEach(p => {
      visitorProfileMap.set(p.userId.toString(), p);
    });
  }

  // Enrich items with profile data
  return items.map(item => {
    const profileMap = item.authorRole === 'owner' ? ownerProfileMap : visitorProfileMap;
    const profile = profileMap.get(item.author._id?.toString());

    if (profile) {
      item.author.avatarUrl = profile.avatarUrl || profile.avatar || '';
      item.author.handle = profile.handle || profile.slug || '';
      item.author.slug = profile.slug || profile.handle || '';
      item.author.displayName = profile.displayName || `${item.author.firstName} ${item.author.lastName}`.trim();
    }

    return item;
  });
}

/**
 * Enrich feed items with comment counts
 * Batched query for performance - no N+1 problem
 * @param {Array} items - Feed items (surveys/posts)
 * @returns {Array} Items with commentCount field
 */
async function enrichWithComments(items) {
  if (!items || items.length === 0) return items;

  const Comment = require('../models/Comment');

  // Batch fetch comment counts for all items
  const commentCountPromises = items.map(async (item) => {
    const contentType = item.type === 'survey' ? 'survey' : 'post';
    const contentId = item._id.toString();

    const count = await Comment.countDocuments({
      postId: contentId, // postId field is used for both posts and surveys
      contentType,
      isDeleted: false,
      isHidden: false,
    });

    return { contentId, commentCount: count };
  });

  const commentResults = await Promise.all(commentCountPromises);
  const commentMap = new Map();
  commentResults.forEach(r => {
    commentMap.set(r.contentId, r.commentCount);
  });

  // Add commentCount to each item
  return items.map(item => {
    item.commentCount = commentMap.get(item._id.toString()) || 0;
    return item;
  });
}

module.exports = {
  getGlobalFeed,
  enrichWithProfiles,
  enrichWithReactions,
  enrichWithComments // NEW: Comment count enrichment
};
