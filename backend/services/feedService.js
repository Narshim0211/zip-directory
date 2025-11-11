const Post = require('../models/Post');
const Survey = require('../models/Survey');
const Follow = require('../models/Follow');

const mapPost = (doc) => ({
  ...doc.toObject(),
  type: 'post',
});

const mapSurvey = (doc) => ({
  ...doc.toObject(),
  type: 'survey',
});

exports.getFeedForVisitor = async (userId) => {
  try {
    const followedOwners = await Follow.find({ follower: userId, relationType: 'visitor_to_owner' }).distinct('following');
    const followedVisitors = await Follow.find({ follower: userId, relationType: 'visitor_to_visitor' }).distinct('following');

    const ownerPosts = await Post.find({ author: { $in: followedOwners } })
      .populate('author', 'name avatarUrl role')
      .sort({ createdAt: -1 });

    const followedSurveys = await Survey.find({ author: { $in: followedVisitors }, isActive: true })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 });

    const globalSurveys = await Survey.find({ author: { $nin: followedVisitors }, isActive: true })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 });

    const feed = [
      ...ownerPosts.map(mapPost),
      ...followedSurveys.map(mapSurvey),
      ...globalSurveys.map(mapSurvey),
    ];

    return feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Feed aggregation error:', error);
    return [];
  }
};
