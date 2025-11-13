const asyncWrap = require('../../middleWare/asyncHandler');
const OwnerProfile = require('../../models/OwnerProfile');
const Post = require('../../models/Post');
const Survey = require('../../models/Survey');
const ownerProfileService = require('../../services/owner/ownerProfileService');

/**
 * GET /api/v2/owner-profiles/me
 * Get current owner's profile (auto-create if missing)
 */
exports.getMyProfile = asyncWrap(async (req, res) => {
  const profile = await ownerProfileService.ensureProfileForUser(req.user);
  res.json(profile);
});

/**
 * POST /api/v2/owner-profiles/init
 * Explicitly initialize profile (onboarding)
 */
exports.initProfile = asyncWrap(async (req, res) => {
  const existing = await OwnerProfile.findOne({ userId: req.user._id });
  if (existing) {
    return res.status(400).json({ message: 'Profile already exists' });
  }

  const profile = await ownerProfileService.ensureProfileForUser(req.user);
  res.status(201).json(profile);
});

/**
 * GET /api/v2/owner-profiles/:slug
 * Get public owner profile by slug
 */
exports.getProfile = asyncWrap(async (req, res) => {
  const { slug } = req.params;

  const profile = await OwnerProfile.findOne({ slug })
    .populate('featuredBusinesses', 'name address city')
    .lean();

  if (!profile) {
    return res.status(404).json({ message: 'Owner profile not found' });
  }

  res.json(profile);
});

/**
 * PUT /api/v2/owner-profiles/:id
 * Update owner profile (self only)
 */
exports.updateProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, handle, bio, avatarUrl } = req.body;

  // Verify ownership
  const profile = await OwnerProfile.findById(id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  if (String(profile.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized to edit this profile' });
  }

  // Validate required fields
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'First name and last name are required' });
  }

  // Update fields
  profile.firstName = firstName;
  profile.lastName = lastName;
  if (handle) profile.handle = handle;
  if (bio !== undefined) profile.bio = bio;
  if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

  await profile.save();

  res.json(profile);
});

/**
 * GET /api/v2/owner-profiles/:slug/feed
 * Get owner's timeline (posts + surveys)
 */
exports.getFeed = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
  const tab = req.query.tab || 'all'; // 'all', 'posts', 'surveys'

  // Find profile
  const profile = await OwnerProfile.findOne({ slug });
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  const ownerId = profile.userId;
  const baseFilter = { visibleToVisitors: true };
  const cursorFilter = cursor ? { createdAt: { $lt: cursor } } : {};

  let posts = [];
  let surveys = [];

  // Fetch based on tab
  if (tab === 'posts') {
    posts = await Post.find({ author: ownerId, ...baseFilter, ...cursorFilter })
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit);
  } else if (tab === 'surveys') {
    surveys = await Survey.find({ ownerId, ...baseFilter, ...cursorFilter })
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit);
  } else {
    // Get both
    [posts, surveys] = await Promise.all([
      Post.find({ author: ownerId, ...baseFilter, ...cursorFilter })
        .lean()
        .sort({ createdAt: -1 })
        .limit(limit),
      Survey.find({ ownerId, ...baseFilter, ...cursorFilter })
        .lean()
        .sort({ createdAt: -1 })
        .limit(limit)
    ]);
  }

  // Merge and sort
  const merged = [
    ...posts.map(p => ({ type: 'post', data: p, createdAt: p.createdAt })),
    ...surveys.map(s => ({ type: 'survey', data: s, createdAt: s.createdAt }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const items = merged.slice(0, limit);
  const nextCursor = items.length ? items[items.length - 1].createdAt : null;

  res.json({ items, nextCursor });
});

/**
 * POST /api/v2/owner-profiles/:id/follow
 * Follow an owner profile
 */
exports.followProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const OwnerFollow = require('../../models/OwnerFollow');

  // Check if profile exists
  const profile = await OwnerProfile.findById(id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  // Cannot follow yourself
  if (String(profile.userId) === String(req.user._id)) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  // Check if already following
  const existing = await OwnerFollow.findOne({
    followerUserId: req.user._id,
    targetOwnerId: id
  });

  if (existing) {
    return res.json({ following: true, message: 'Already following' });
  }

  // Create follow relationship
  await OwnerFollow.create({
    followerUserId: req.user._id,
    targetOwnerId: id
  });

  // Update counts
  await OwnerProfile.findByIdAndUpdate(id, { $inc: { 'counts.followers': 1 } });

  res.json({ following: true });
});

/**
 * DELETE /api/v2/owner-profiles/:id/follow
 * Unfollow an owner profile
 */
exports.unfollowProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const OwnerFollow = require('../../models/OwnerFollow');

  await OwnerFollow.deleteOne({
    followerUserId: req.user._id,
    targetOwnerId: id
  });

  // Update counts
  await OwnerProfile.findByIdAndUpdate(id, { $inc: { 'counts.followers': -1 } });

  res.json({ following: false });
});

/**
 * GET /api/v2/owner-profiles/:id/is-following
 * Check if current user is following this owner
 */
exports.isFollowing = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const OwnerFollow = require('../../models/OwnerFollow');

  if (!req.user) {
    return res.json({ following: false });
  }

  const exists = await OwnerFollow.findOne({
    followerUserId: req.user._id,
    targetOwnerId: id
  });

  res.json({ following: !!exists });
});
