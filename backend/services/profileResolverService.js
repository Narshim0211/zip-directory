const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const VisitorProfile = require('../models/VisitorProfile');
const followService = require('./followService');

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

  // Get follow counts from the new Follow model
  const followCounts = await followService.getCounts(user._id);

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
    featuredBusinesses: roleProfile?.featuredBusinesses || null,

    // Standardized stats object
    stats: {
      followers: followCounts.followersCount || 0,
      following: followCounts.followingCount || 0,
      surveys: 0, // TODO: Add survey count
      posts: 0    // TODO: Add post count
    }
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

  // Try to find role-specific profile data
  let roleProfile = null;
  let profileType = 'basic'; // Track profile type for frontend

  if (user.role === 'owner') {
    roleProfile = await OwnerProfile.findOne({ userId: user._id })
      .select('bio website socialMedia location');
    if (roleProfile) profileType = 'owner';
  } else if (user.role === 'visitor') {
    roleProfile = await VisitorProfile.findOne({ userId: user._id })
      .select('bio location interests');
    if (roleProfile) profileType = 'visitor';
  }

  // Get follow counts from the new Follow model
  const followCounts = await followService.getCounts(user._id);

  // Return profile with available data (fallback to basic User data)
  return {
    userId: user._id,
    role: user.role,
    handle: user.handle || user.slug,
    slug: user.slug || user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email, // Include email for fallback profiles
    displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.handle,
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}`,
    createdAt: user.createdAt,

    // Role-specific data (may be null for old accounts)
    bio: roleProfile?.bio || null,
    website: roleProfile?.website || null,
    socialMedia: roleProfile?.socialMedia || null,
    location: roleProfile?.location || null,
    interests: roleProfile?.interests || null,

    // Standardized stats object
    stats: {
      followers: followCounts.followersCount || 0,
      following: followCounts.followingCount || 0,
      surveys: 0, // TODO: Add survey count
      posts: 0    // TODO: Add post count
    },

    // Metadata for frontend
    profileType, // 'owner', 'visitor', or 'basic' (fallback)
    isFallbackProfile: !roleProfile // True if using basic User data only
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
