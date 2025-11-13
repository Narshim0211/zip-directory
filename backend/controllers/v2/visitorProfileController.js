const asyncWrap = require('../../middleWare/asyncHandler');
const VisitorProfile = require('../../models/VisitorProfile');
const Survey = require('../../models/Survey');

/**
 * GET /api/v2/visitor-profiles/:slug
 * Get public visitor profile by slug
 */
exports.getProfile = asyncWrap(async (req, res) => {
  const { slug } = req.params;

  const profile = await VisitorProfile.findOne({ slug }).lean();

  if (!profile) {
    return res.status(404).json({ message: 'Visitor profile not found' });
  }

  res.json(profile);
});

/**
 * PUT /api/v2/visitor-profiles/:id
 * Update visitor profile (self only)
 */
exports.updateProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, handle, bio, avatarUrl, bannerUrl, socialLinks } = req.body;

  // Verify ownership
  const profile = await VisitorProfile.findById(id);
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
  if (bannerUrl !== undefined) profile.bannerUrl = bannerUrl;
  if (socialLinks !== undefined) profile.socialLinks = socialLinks;

  await profile.save();

  res.json(profile);
});

/**
 * GET /api/v2/visitor-profiles/:slug/feed
 * Get visitor's timeline (surveys only)
 */
exports.getFeed = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;

  // Find profile
  const profile = await VisitorProfile.findOne({ slug });
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  const ownerId = profile.userId;
  const baseFilter = { visibleToVisitors: true };
  const cursorFilter = cursor ? { createdAt: { $lt: cursor } } : {};

  // Visitors only create surveys
  const surveys = await Survey.find({ ownerId, ...baseFilter, ...cursorFilter })
    .lean()
    .sort({ createdAt: -1 })
    .limit(limit);

  const items = surveys.map(s => ({ type: 'survey', data: s, createdAt: s.createdAt }));
  const nextCursor = items.length ? items[items.length - 1].createdAt : null;

  res.json({ items, nextCursor });
});

/**
 * POST /api/v2/visitor-profiles/:id/follow
 * Follow a visitor profile
 */
exports.followProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const VisitorFollow = require('../../models/VisitorFollow');

  // Check if profile exists
  const profile = await VisitorProfile.findById(id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  // Cannot follow yourself
  if (String(profile.userId) === String(req.user._id)) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  // Check if already following
  const existing = await VisitorFollow.findOne({
    followerId: req.user._id,
    visitorProfileId: id
  });

  if (existing) {
    return res.json({ following: true, message: 'Already following' });
  }

  // Create follow relationship
  await VisitorFollow.create({
    followerId: req.user._id,
    visitorProfileId: id
  });

  // Update counts
  await VisitorProfile.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });

  res.json({ following: true });
});

/**
 * DELETE /api/v2/visitor-profiles/:id/follow
 * Unfollow a visitor profile
 */
exports.unfollowProfile = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const VisitorFollow = require('../../models/VisitorFollow');

  await VisitorFollow.deleteOne({
    followerId: req.user._id,
    visitorProfileId: id
  });

  // Update counts
  await VisitorProfile.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });

  res.json({ following: false });
});

/**
 * GET /api/v2/visitor-profiles/:id/is-following
 * Check if current user is following this visitor
 */
exports.isFollowing = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const VisitorFollow = require('../../models/VisitorFollow');

  if (!req.user) {
    return res.json({ following: false });
  }

  const exists = await VisitorFollow.findOne({
    followerId: req.user._id,
    visitorProfileId: id
  });

  res.json({ following: !!exists });
});
