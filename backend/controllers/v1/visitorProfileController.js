const asyncWrap = require('../../middleWare/asyncHandler');
const visitorService = require('../../services/visitor/visitorProfileService');
const VisitorProfile = require('../../models/VisitorProfile');

exports.getMe = asyncWrap(async (req, res) => {
  const p = await VisitorProfile.findOne({ userId: req.user._id });
  if (!p) return res.status(404).json({ message: 'Profile not found' });
  res.json(p);
});

exports.updateMe = asyncWrap(async (req, res) => {
  const { firstName, lastName, bio, handle, avatarUrl, bannerUrl, socialLinks } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ message: 'First and last name required' });
  const p = await visitorService.updateProfile(req.user._id, { firstName, lastName, bio, handle, avatarUrl, bannerUrl, socialLinks });
  res.json(p);
});

exports.getPublic = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const p = await visitorService.getBySlug(slug);
  if (!p) return res.status(404).json({ message: 'Profile not found' });
  res.json(p);
});

exports.getTimeline = asyncWrap(async (req, res) => {
  const { slug } = req.params;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
  const tab = req.query.tab || 'all'; // 'all', 'posts', or 'surveys'

  const VisitorProfile = require('../../models/VisitorProfile');
  const Survey = require('../../models/Survey');

  const visitorProfile = await VisitorProfile.findOne({ slug });
  if (!visitorProfile) return res.status(404).json({ message: 'Profile not found' });
  const ownerId = visitorProfile.userId;

  const baseFilter = { visibleToVisitors: true };
  const cursorFilter = cursor ? { createdAt: { $lt: cursor } } : {};

  let surveys = [];

  // Currently visitors only create surveys, but support tab filtering for consistency
  if (tab === 'surveys' || tab === 'all') {
    surveys = await Survey.find({ ownerId, ...baseFilter, ...cursorFilter }).lean().sort({ createdAt: -1 }).limit(limit);
  }
  // tab === 'posts' would return empty array

  const items = surveys.map(s => ({ type: 'survey', data: s }));
  const nextCursor = items.length ? items[items.length - 1].data.createdAt : null;
  res.json({ items, nextCursor });
});

exports.follow = asyncWrap(async (req, res) => {
  const targetId = req.params.id;
  if (!targetId) return res.status(400).json({ message: 'Target id required' });
  const followerId = req.user._id;
  const followService = require('../../services/visitor/visitorFollowService');
  await followService.followTarget({ followerId, targetType: 'visitor', targetId });
  res.json({ following: true });
});

exports.unfollow = asyncWrap(async (req, res) => {
  const targetId = req.params.id;
  if (!targetId) return res.status(400).json({ message: 'Target id required' });
  const followerId = req.user._id;
  const followService = require('../../services/visitor/visitorFollowService');
  await followService.unfollowTarget({ followerId, targetType: 'visitor', targetId });
  res.json({ following: false });
});

exports.isFollowing = asyncWrap(async (req, res) => {
  const visitorProfileId = req.params.id;
  if (!visitorProfileId) return res.status(400).json({ message: 'Visitor id required' });
  if (!req.user) return res.json({ following: false });
  const VisitorFollow = require('../../models/VisitorFollow');
  const exists = await VisitorFollow.findOne({ followerId: req.user._id, visitorProfileId });
  res.json({ following: !!exists });
});
