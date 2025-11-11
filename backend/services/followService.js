const Follow = require('../models/Follow');

const follow = async (followerId, targetId, relationType) => {
  const exists = await Follow.findOne({ follower: followerId, following: targetId });
  if (exists) return { message: 'Already following' };
  return Follow.create({ follower: followerId, following: targetId, relationType });
};

const unfollow = async (followerId, targetId) => {
  await Follow.findOneAndDelete({ follower: followerId, following: targetId });
};

const getFollowing = async (followerId) => {
  return Follow.find({ follower: followerId }).populate('following', 'name avatarUrl role');
};

module.exports = {
  follow,
  unfollow,
  getFollowing,
};
