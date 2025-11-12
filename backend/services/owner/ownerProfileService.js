const OwnerProfile = require('../../models/OwnerProfile');
const Business = require('../../models/Business');
const User = require('../../models/User');
const slugify = require('../../utils/slugify');

async function ensureProfileForUser(user) {
  if (!user) throw new Error('User required');
  let profile = await OwnerProfile.findOne({ userId: user._id });
  if (profile) return profile;

  const firstName = user.firstName || user.name || 'Owner';
  const lastName = user.lastName || '';
  const base = `${firstName} ${lastName}`.trim() || `owner-${user._id.toString().slice(-4)}`;
  let handle = slugify(base).slice(0, 30);
  let slug = handle;

  // ensure uniqueness with suffix
  let i = 0;
  while (await OwnerProfile.findOne({ $or: [{ handle }, { slug }] })) {
    i += 1;
    handle = `${handle}-${i}`.slice(0, 30);
    slug = handle;
  }

  profile = new OwnerProfile({
    userId: user._id,
    firstName: firstName || 'Owner',
    lastName: lastName || '',
    handle,
    slug,
    needsCompletion: !(user.firstName && user.lastName),
  });
  await profile.save();
  return profile;
}

async function getBySlug(slug) {
  if (!slug) return null;
  return OwnerProfile.findOne({ slug })
    .select('userId firstName lastName avatarUrl bio handle slug followersCount followingCount featuredBusinesses')
    .populate('featuredBusinesses', 'name city category slug');
}

async function updateProfile(userId, { firstName, lastName, bio, handle, avatarUrl }) {
  if (!firstName || !lastName) throw new Error('First and last name are required');
  const profile = await OwnerProfile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // handle uniqueness
  if (handle && handle !== profile.handle) {
    const existing = await OwnerProfile.findOne({ handle });
    if (existing) throw new Error('Handle already in use');
    profile.handle = handle;
    profile.slug = slugify(handle);
  }

  profile.firstName = firstName;
  profile.lastName = lastName;
  profile.bio = bio || '';
  if (avatarUrl) profile.avatarUrl = avatarUrl;
  profile.needsCompletion = false;
  await profile.save();
  return profile;
}

async function updateFeatured(userId, businessIds = []) {
  const profile = await OwnerProfile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  // verify ownership
  const ok = await Business.countDocuments({ _id: { $in: businessIds }, ownerId: userId });
  if (ok !== businessIds.length) throw new Error('One or more businesses are invalid or not owned by user');

  profile.featuredBusinesses = businessIds;
  await profile.save();
  return profile;
}

module.exports = {
  ensureProfileForUser,
  getBySlug,
  updateProfile,
  updateFeatured,
};
