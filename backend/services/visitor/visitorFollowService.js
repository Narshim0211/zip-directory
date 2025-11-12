const VisitorFollow = require('../../models/VisitorFollow');
const VisitorProfile = require('../../models/VisitorProfile');
const OwnerProfile = require('../../models/OwnerProfile');

async function followTarget({ followerId, targetType, targetId }) {
  if (!['visitor', 'owner'].includes(targetType)) throw new Error('Invalid targetType');

  // verify target exists (best-effort)
  if (targetType === 'visitor') {
    const t = await VisitorProfile.findById(targetId);
    if (!t) throw new Error('Visitor target not found');
  } else {
    const t = await OwnerProfile.findById(targetId);
    if (!t) throw new Error('Owner target not found');
  }

  try {
    await VisitorFollow.create({ followerUserId: followerId, targetType, targetId });
    // increment counter on profile (best-effort)
    if (targetType === 'visitor') {
      await VisitorProfile.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
    } else {
      await OwnerProfile.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
    }
  } catch (err) {
    if (err.code === 11000) return; // already following
    throw err;
  }
}

async function unfollowTarget({ followerId, targetType, targetId }) {
  await VisitorFollow.findOneAndDelete({ followerUserId: followerId, targetType, targetId });
  try {
    if (targetType === 'visitor') {
      await VisitorProfile.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
    } else {
      await OwnerProfile.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
    }
  } catch (e) {
    // ignore
  }
}

module.exports = { followTarget, unfollowTarget };
