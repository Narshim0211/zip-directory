const Post = require('../models/Post');
const Survey = require('../models/Survey');
const Follow = require('../models/Follow');
const OwnerProfile = require('../models/OwnerProfile');
const VisitorProfile = require('../models/VisitorProfile');

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
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Fetch global surveys
    const globalSurveys = await Survey.find({
      author: { $nin: [...followedVisitors, ...followedOwners] },
      isActive: true,
      visibility: 'public',
      ...cursorFilter
    })
      .populate('author', 'name avatarUrl')
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

    return sorted;
  } catch (error) {
    console.error('Feed aggregation error:', error);
    return [];
  }
};

/**
 * Build unified feed for v1 API (all posts and surveys, sorted by date)
 */
exports.buildFeed = async ({ limit = 30 }) => {
  try {
    const [posts, surveys] = await Promise.all([
      Post.find({ visibleToVisitors: true })
        .populate('author', 'name email avatarUrl role')
        .populate('business', 'name city category businessType')
        .sort({ createdAt: -1 })
        .limit(limit),
      Survey.find({ visibleToVisitors: true, isActive: true })
        .populate('author', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .limit(limit),
    ]);

    let items = [
      ...posts.map(mapPost),
      ...surveys.map(mapSurvey),
    ];

    // attach identity objects
    items = await attachIdentities(items);

    // Sort by createdAt descending
    items.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

    return items.slice(0, limit);
  } catch (error) {
    console.error('Build feed error:', error);
    return [];
  }
};

  // export helper for other controllers to attach identities
  module.exports.attachIdentities = attachIdentities;
