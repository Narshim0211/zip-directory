const Follow = require('../models/Follow');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const followService = require('../services/followService');

exports.followUser = async (req, res) => {
  try {
    if (req.user.role !== 'visitor') {
      return res.status(403).json({ message: 'Only visitors can follow' });
    }
    const targetId = req.params.id;
    if (!targetId || String(targetId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Invalid target' });
    }
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const relationType = target.role === 'owner' ? 'visitor_to_owner' : 'visitor_to_visitor';
    await followService.follow(req.user._id, targetId, relationType);
    await notificationService.notifyUser({
      recipientId: targetId,
      senderId: req.user._id,
      type: 'new_follower',
      title: 'New follower',
      message: `${req.user.name || 'Someone'} started following you.`,
      contentType: 'business',
      contentId: targetId,
    });
    res.json({ ok: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Already following' });
    res.status(400).json({ message: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    await Follow.findOneAndDelete({ follower: req.user._id, following: targetId });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listFollowers = async (req, res) => {
  try {
    const targetId = req.params.id;
    const items = await Follow.find({ following: targetId }).populate('follower', 'name avatarUrl role');
    res.json(items.map((doc) => doc.follower));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listFollowing = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const items = await followService.getFollowing(userId);
    res.json(items.map((doc) => doc.following));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
