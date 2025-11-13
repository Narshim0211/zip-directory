const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const VisitorProfile = require('../models/VisitorProfile');

/**
 * Profile Resolver Service
 *
 * Resolves user profiles by handle/slug regardless of role
 * Returns unified profile data for Owner and Visitor profiles
 */

/**
 * Resolve a profile by handle (unified lookup across roles)
 * @param {string} handle - Handle or slug to search for
 * @returns {Promise<Object>} Profile data with role detection
 */
async function resolveProfileByHandle(handle) {
  if (!handle) {
    throw new Error('Handle is required');
  }

  // Normalize handle (lowercase, remove @ if present)
  const normalizedHandle = handle.toLowerCase().replace(/^@/, '');

  // Try to find user by handle or slug
  const user = await User.findOne({
    $or: [
      { handle: normalizedHandle },
      { slug: normalizedHandle }
    ]
  }).select('_id firstName lastName email role handle slug avatarUrl createdAt');

  if (!user) {
    return null;
  }

  // Get role-specific profile data
  let roleProfile = null;

  if (user.role === 'owner') {
    roleProfile = await OwnerProfile.findOne({ userId: user._id })
      .populate('featuredBusinesses', 'businessName slug location')
      .select('bio website socialMedia featuredBusinesses');
  } else if (user.role === 'visitor') {
    roleProfile = await VisitorProfile.findOne({ userId: user._id })
      .select('bio location interests');
  }

  // Build unified profile response
  const profile = {
    userId: user._id,
    role: user.role,
    handle: user.handle || user.slug,
    slug: user.slug || user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.handle,
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}`,
    createdAt: user.createdAt,

    // Role-specific data
    bio: roleProfile?.bio || null,
    website: roleProfile?.website || null,
    socialMedia: roleProfile?.socialMedia || null,
    location: roleProfile?.location || null,
    interests: roleProfile?.interests || null,
    featuredBusinesses: roleProfile?.featuredBusinesses || null
  };

  return profile;
}

/**
 * Get basic profile info by user ID
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} Basic profile data
 */
async function getProfileById(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const user = await User.findById(userId)
    .select('_id firstName lastName email role handle slug avatarUrl createdAt');

  if (!user) {
    return null;
  }

  return {
    userId: user._id,
    role: user.role,
    handle: user.handle || user.slug,
    slug: user.slug || user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.handle,
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}`,
    createdAt: user.createdAt
  };
}

/**
 * Get profile link for a user based on their role
 * @param {Object} user - User object with role and handle/slug
 * @returns {string} Profile link path
 */
function getProfileLink(user) {
  if (!user || !user.role) return null;

  const handle = user.slug || user.handle;
  if (!handle) return null;

  return user.role === 'owner' ? `/o/${handle}` : `/v/${handle}`;
}

/**
 * Check if a handle is available
 * @param {string} handle - Handle to check
 * @param {ObjectId} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if available
 */
async function isHandleAvailable(handle, excludeUserId = null) {
  if (!handle) return false;

  const normalizedHandle = handle.toLowerCase().replace(/^@/, '');

  const query = {
    $or: [
      { handle: normalizedHandle },
      { slug: normalizedHandle }
    ]
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existing = await User.findOne(query);
  return !existing;
}

module.exports = {
  resolveProfileByHandle,
  getProfileById,
  getProfileLink,
  isHandleAvailable
};
