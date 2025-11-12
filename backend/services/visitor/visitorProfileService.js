const VisitorProfile = require('../../models/VisitorProfile');
const slugify = require('../../utils/slugify');

async function ensureProfileForUser(user) {
  if (!user) throw new Error('User required');
  let profile = await VisitorProfile.findOne({ userId: user._id });
  if (profile) return profile;

  const firstName = user.firstName || user.name || 'Visitor';
  const lastName = user.lastName || '';
  let handle = slugify(`${firstName} ${lastName}`) || `visitor-${user._id.toString().slice(-4)}`;
  let slug = handle;

  let i = 0;
  while (await VisitorProfile.findOne({ $or: [{ handle }, { slug }] })) {
    i += 1;
    handle = `${handle}-${i}`.slice(0, 30);
    slug = handle;
  }

  profile = new VisitorProfile({
    userId: user._id,
    firstName: firstName || 'Visitor',
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
  return VisitorProfile.findOne({ slug })
    .select('userId firstName lastName avatarUrl bio handle slug followersCount followingCount');
}

async function updateProfile(userId, { firstName, lastName, bio, handle, avatarUrl }) {
  if (!firstName || !lastName) throw new Error('First and last name are required');
  const profile = await VisitorProfile.findOne({ userId });
  if (!profile) throw new Error('Profile not found');

  if (handle && handle !== profile.handle) {
    const existing = await VisitorProfile.findOne({ handle });
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

module.exports = { ensureProfileForUser, getBySlug, updateProfile };
