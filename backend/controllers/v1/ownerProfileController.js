const asyncWrap = require('../../middleWare/asyncHandler');
const ownerProfileService = require('../../services/owner/ownerProfileService');
const OwnerProfile = require('../../models/OwnerProfile');

exports.getMe = asyncWrap(async (req, res) => {
  // Auto-create profile if it doesn't exist
  const p = await ownerProfileService.ensureProfileForUser(req.user);
  const populated = await OwnerProfile.findById(p._id).populate('featuredBusinesses');
  res.json(populated || p);
});

exports.updateMe = asyncWrap(async (req, res) => {
  const { firstName, lastName, bio, handle, avatarUrl } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ message: 'First and last name required' });
  const p = await ownerProfileService.updateProfile(req.user._id, { firstName, lastName, bio, handle, avatarUrl });
  res.json(p);
});

exports.updateFeatured = asyncWrap(async (req, res) => {
  const { businessIds } = req.body;
  if (!Array.isArray(businessIds)) return res.status(400).json({ message: 'businessIds must be array' });
  const p = await ownerProfileService.updateFeatured(req.user._id, businessIds);
  res.json(p);
});

exports.getPublic = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const p = await ownerProfileService.getBySlug(slug);
  if (!p) return res.status(404).json({ message: 'Profile not found' });
  res.json(p);
});

exports.getTimeline = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
  const tab = req.query.tab || 'all'; // 'all', 'posts', or 'surveys'

  const OwnerProfile = require('../../models/OwnerProfile');
  const Post = require('../../models/Post');
  const Survey = require('../../models/Survey');

  const ownerProfile = await OwnerProfile.findOne({ slug });
  if (!ownerProfile) return res.status(404).json({ message: 'Profile not found' });
  const ownerId = ownerProfile.userId;

  const baseFilter = { visibleToVisitors: true };
  const cursorFilter = cursor ? { createdAt: { $lt: cursor } } : {};

  let posts = [];
  let surveys = [];

  // Fetch based on tab filter
  if (tab === 'posts') {
    posts = await Post.find({ author: ownerId, ...baseFilter, ...cursorFilter }).lean().sort({ createdAt: -1 }).limit(limit);
  } else if (tab === 'surveys') {
    surveys = await Survey.find({ ownerId, ...baseFilter, ...cursorFilter }).lean().sort({ createdAt: -1 }).limit(limit);
  } else {
    // tab === 'all' or any other value defaults to both
    [posts, surveys] = await Promise.all([
      Post.find({ author: ownerId, ...baseFilter, ...cursorFilter }).lean().sort({ createdAt: -1 }).limit(limit),
      Survey.find({ ownerId, ...baseFilter, ...cursorFilter }).lean().sort({ createdAt: -1 }).limit(limit),
    ]);
  }

  const merged = [
    ...posts.map(p => ({ type: 'post', data: p })),
    ...surveys.map(s => ({ type: 'survey', data: s })),
  ].sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

  // slice to requested limit
  const items = merged.slice(0, limit);
  const nextCursor = items.length ? items[items.length - 1].data.createdAt : null;
  res.json({ items, nextCursor });
});

exports.uploadImage = asyncWrap(async (req, res) => {
  const { type, base64, originalName } = req.body;
  if (!type || (type !== 'avatar' && type !== 'header')) return res.status(400).json({ message: 'type must be avatar or header' });
  if (!base64) return res.status(400).json({ message: 'base64 payload required' });

  const galleryService = require('../../services/galleryService');
  const ownerProfile = await OwnerProfile.findOne({ userId: req.user._id });
  if (!ownerProfile) return res.status(404).json({ message: 'Profile not found' });

  const upload = await galleryService.uploadBase64({ base64, originalName: originalName || `${type}.png`, folder: req.user._id.toString() });
  const url = upload.url;
  if (type === 'avatar') ownerProfile.avatarUrl = url;
  else ownerProfile.headerImageUrl = url;
  await ownerProfile.save();
  res.json({ url });
});

exports.follow = asyncWrap(async (req, res) => {
  const ownerProfileId = req.params.id;
  if (!ownerProfileId) return res.status(400).json({ message: 'Owner id required' });
  const followerId = req.user._id;
  const followService = require('../../services/owner/ownerFollowService');
  await followService.followOwner({ followerId, ownerProfileId });
  res.json({ following: true });
});

exports.unfollow = asyncWrap(async (req, res) => {
  const ownerProfileId = req.params.id;
  if (!ownerProfileId) return res.status(400).json({ message: 'Owner id required' });
  const followerId = req.user._id;
  const followService = require('../../services/owner/ownerFollowService');
  await followService.unfollowOwner({ followerId, ownerProfileId });
  res.json({ following: false });
});

exports.isFollowing = asyncWrap(async (req, res) => {
  const ownerProfileId = req.params.id;
  if (!ownerProfileId) return res.status(400).json({ message: 'Owner id required' });
  if (!req.user) return res.json({ following: false });
  const OwnerFollow = require('../../models/OwnerFollow');
  const exists = await OwnerFollow.findOne({ followerUserId: req.user._id, targetOwnerId: ownerProfileId });
  res.json({ following: !!exists });
});
