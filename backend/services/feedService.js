const Post = require('../models/Post');
const Survey = require('../models/Survey');
const Follow = require('../models/Follow');
const OwnerPost = require('../models/OwnerPost');
const OwnerProfile = require('../models/OwnerProfile');
const VisitorProfile = require('../models/VisitorProfile');
const cache = require('../utils/simpleCache');

const mapPost = (doc) => ({
  type: 'post',
  data: doc.toObject ? doc.toObject() : doc,
});

const mapSurvey = (doc) => ({
  type: 'survey',
  data: doc.toObject ? doc.toObject() : doc,
});

async function attachIdentities(items) {
  // items: [{type, data}] where data.author is ObjectId or populated user
  const authorIds = new Set();
  for (const it of items) {
    const a = it.data.author || it.data.ownerId || null;
    if (!a) continue;
    const id = a._id ? String(a._id) : String(a);
    authorIds.add(id);
  }
  if (authorIds.size === 0) return items;

  const ids = Array.from(authorIds);
  const owners = await OwnerProfile.find({ userId: { $in: ids } }).lean();
  const visitors = await VisitorProfile.find({ userId: { $in: ids } }).lean();

  const ownerByUser = {};
  for (const o of owners) ownerByUser[String(o.userId)] = o;
  const visitorByUser = {};
  for (const v of visitors) visitorByUser[String(v.userId)] = v;

  // attach identity to each item
  for (const it of items) {
    const a = it.data.author || it.data.ownerId || null;
    const id = a ? (a._id ? String(a._id) : String(a)) : null;
    let identity = null;
    if (id && ownerByUser[id]) {
      const o = ownerByUser[id];
      identity = {
        role: 'owner',
        fullName: o.firstName && o.lastName ? `${o.firstName} ${o.lastName}`.trim() : (o.fullName || ''),
        handle: o.handle ? `@${o.handle}` : undefined,
        slug: o.slug || `u-${String(o.userId).slice(-6)}`,
        avatarUrl: o.avatarUrl,
        profileId: o._id,
      };
    } else if (id && visitorByUser[id]) {
      const v = visitorByUser[id];
      identity = {
        role: 'visitor',
        fullName: v.firstName && v.lastName ? `${v.firstName} ${v.lastName}`.trim() : (v.fullName || ''),
        handle: v.handle ? `@${v.handle}` : undefined,
        slug: v.slug || `u-${String(v.userId).slice(-6)}`,
        avatarUrl: v.avatarUrl,
  profileId: v._id,
      };
    } else if (it.data.author && it.data.author.name) {
      // fallback to populated User
      const roleFromUser = it.data.author.role || 'visitor';
      identity = {
        role: roleFromUser,
        fullName: it.data.author.name || '',
        handle: it.data.author.handle ? `@${it.data.author.handle}` : undefined,
        slug: `u-${String(it.data.author._id).slice(-6)}`,
        avatarUrl: it.data.author.avatarUrl || '',
      };
    } else {
      identity = { role: 'visitor', fullName: '', avatarUrl: '' };
    }
    it.identity = identity;
  }

  return items;
}

exports.getFeedForVisitor = async (userId, options = {}) => {
  try {
    const limit = Math.min(Number(options.limit) || 20, 50);
    const cursor = options.cursor; // createdAt timestamp for pagination

    // Cache initial feed for 2 minutes (no cursor = first page)
    if (!cursor) {
      const cacheKey = `feed:visitor:${userId}:${limit}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }

    const followedOwners = await Follow.find({ follower: userId, relationType: 'visitor_to_owner' }).distinct('following');
    const followedVisitors = await Follow.find({ follower: userId, relationType: 'visitor_to_visitor' }).distinct('following');

    // Build cursor filter for pagination
    const cursorFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    // Fetch owner posts (public visibility)
    const ownerPosts = await Post.find({
      author: { $in: followedOwners },
      visibility: 'public',
      ...cursorFilter
    })
      .populate('author', 'name avatarUrl role')
      .populate('business', 'name city businessType')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fetch public posts from all owners (not just followed)
    const allPublicPosts = await Post.find({
      visibility: 'public',
      ...cursorFilter
    })
      .populate('author', 'name avatarUrl role')
      .populate('business', 'name city businessType')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fetch followed surveys
    const followedSurveys = await Survey.find({
      author: { $in: [...followedVisitors, ...followedOwners] },
      isActive: true,
      visibility: 'public',
      ...cursorFilter
    })
      .populate('author', 'name avatarUrl role email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fetch global surveys
    const globalSurveys = await Survey.find({
      author: { $nin: [...followedVisitors, ...followedOwners] },
      isActive: true,
      visibility: 'public',
      ...cursorFilter
    })
      .populate('author', 'name avatarUrl role email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Merge and prioritize followed content
    const followedPosts = ownerPosts.filter(p => followedOwners.includes(p.author._id.toString()));
    const otherPosts = allPublicPosts.filter(p => !followedOwners.includes(p.author._id.toString()));

    let feed = [
      ...followedPosts.map(mapPost),
      ...followedSurveys.map(mapSurvey),
      ...otherPosts.map(mapPost),
      ...globalSurveys.map(mapSurvey),
    ];

    // attach identity objects (owner/visitor) for rendering
    feed = await attachIdentities(feed);

    // Sort by createdAt (data.createdAt) and limit
    const sorted = feed
      .sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt))
      .slice(0, limit);

    // Cache initial feed for 2 minutes
    if (!cursor) {
      const cacheKey = `feed:visitor:${userId}:${limit}`;
      cache.set(cacheKey, sorted, 120); // 2 minutes TTL
    }

    return sorted;
  } catch (error) {
    console.error('Feed aggregation error:', error);
    return [];
  }
};

/**
 * Build unified feed for v1 API with smart ranking
 * Prioritizes content from followed users
 */
exports.buildFeed = async ({ limit = 30, userId = null, userRole = null }) => {
  try {
    let followedUserIds = [];

    // Get list of users that current user follows
    if (userId) {
      if (userRole === 'visitor') {
        const VisitorFollow = require('../models/VisitorFollow');
        const follows = await VisitorFollow.find({ followerUserId: userId }).lean();
        followedUserIds = follows.map(f => String(f.targetId));
      } else if (userRole === 'owner') {
        const OwnerFollow = require('../models/OwnerFollow');
        const follows = await OwnerFollow.find({ followerUserId: userId }).lean();
        followedUserIds = follows.map(f => String(f.targetOwnerId));
      }
    }

    // Fetch all posts and surveys
    const [posts, surveys] = await Promise.all([
      Post.find({ visibleToVisitors: true })
        .populate('author', 'name email avatarUrl role')
        .populate('business', 'name city category businessType')
        .sort({ createdAt: -1 })
        .limit(limit * 2), // Fetch more to ensure enough content after filtering
      Survey.find({ visibleToVisitors: true, isActive: true })
        .populate('author', 'name email avatarUrl role')
        .sort({ createdAt: -1 })
        .limit(limit * 2),
    ]);

    let items = [
      ...posts.map(mapPost),
      ...surveys.map(mapSurvey),
    ];

    // Attach identity objects
    items = await attachIdentities(items);

    // Separate followed vs non-followed content
    const followedItems = [];
    const otherItems = [];

    for (const item of items) {
      const authorId = String(item.data.author?._id || item.data.author);
      if (followedUserIds.includes(authorId)) {
        followedItems.push(item);
      } else {
        otherItems.push(item);
      }
    }

    // Sort each group by date
    followedItems.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));
    otherItems.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

    // Prioritize followed content first, then others
    const rankedFeed = [...followedItems, ...otherItems];

    return rankedFeed.slice(0, limit);
  } catch (error) {
    console.error('Build feed error:', error);
    return [];
  }
};

/**
 * Build owner-specific feed with role-aware filtering
 * Owners see:
 * 1. Posts from followed owners (prioritized)
 * 2. Surveys from followed owners/visitors (prioritized)
 * 3. Global owner posts
 * 4. Global surveys
 */
exports.buildOwnerFeed = async ({ limit = 30, userId }) => {
  try {
    // Get owners that this owner follows (owners can only follow other owners)
    const followedOwnerIds = await Follow.find({ 
      followerId: userId,
      followerRole: 'owner',
      followingRole: 'owner'
    }).distinct('followingId');

    const followedOwnerIdsStr = followedOwnerIds.map(id => String(id));

    // Fetch owner posts (both followed and global)
    const [followedOwnerPosts, globalOwnerPosts] = await Promise.all([
      OwnerPost.find({ 
        ownerId: { $in: followedOwnerIds },
        visibility: 'public'
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      
      OwnerPost.find({ 
        ownerId: { $nin: followedOwnerIds },
        visibility: 'public'
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    // Fetch all surveys (visitors + owners)
    const allSurveys = await Survey.find({
      isActive: true,
      visibility: 'public'
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();

    // Separate followed vs non-followed surveys
    const followedSurveys = [];
    const globalSurveys = [];

    for (const survey of allSurveys) {
      const authorId = String(survey.author);
      if (followedOwnerIdsStr.includes(authorId)) {
        followedSurveys.push(survey);
      } else {
        globalSurveys.push(survey);
      }
    }

    // Map to feed item format
    const followedPostItems = followedOwnerPosts.map(p => ({
      type: 'post',
      data: { ...p, author: p.ownerId }
    }));

    const globalPostItems = globalOwnerPosts.map(p => ({
      type: 'post',
      data: { ...p, author: p.ownerId }
    }));

    const followedSurveyItems = followedSurveys.map(s => ({
      type: 'survey',
      data: s
    }));

    const globalSurveyItems = globalSurveys.map(s => ({
      type: 'survey',
      data: s
    }));

    // Combine: Followed content first, then global
    let feedItems = [
      ...followedPostItems,
      ...followedSurveyItems,
      ...globalPostItems,
      ...globalSurveyItems,
    ];

    // Attach identity objects
    feedItems = await attachIdentities(feedItems);

    // Sort by date within each priority group, then combine
    const followed = feedItems.slice(0, followedPostItems.length + followedSurveyItems.length)
      .sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));
    
    const global = feedItems.slice(followedPostItems.length + followedSurveyItems.length)
      .sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

    const rankedFeed = [...followed, ...global];

    return rankedFeed.slice(0, limit);
  } catch (error) {
    console.error('Build owner feed error:', error);
    return [];
  }
};

// export helper for other controllers to attach identities
module.exports.attachIdentities = attachIdentities;
