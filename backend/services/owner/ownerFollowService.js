const OwnerProfile = require('../../models/OwnerProfile');
const OwnerFollow = require('../../models/OwnerFollow');

async function followOwner({ followerId, ownerProfileId }) {
  const profile = await OwnerProfile.findById(ownerProfileId);
  if (!profile) throw new Error('Owner profile not found');

  try {
    await OwnerFollow.create({ followerUserId: followerId, targetOwnerId: ownerProfileId });
    // increment counter (best-effort)
    profile.followersCount = (profile.followersCount || 0) + 1;
    await profile.save();
  } catch (err) {
    if (err.code === 11000) return; // already following
    throw err;
  }
}

async function unfollowOwner({ followerId, ownerProfileId }) {
  await OwnerFollow.findOneAndDelete({ followerUserId: followerId, targetOwnerId: ownerProfileId });
  try {
    await OwnerProfile.findByIdAndUpdate(ownerProfileId, { $inc: { followersCount: -1 } });
  } catch (e) {
    // ignore
  }
}

module.exports = { followOwner, unfollowOwner };
