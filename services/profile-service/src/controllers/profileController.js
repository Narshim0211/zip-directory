const profileService = require('../services/profileService');

/**
 * Profile Controller
 * Per PRD Section 14: Sample API Contracts
 * 
 * Controllers handle NO business logic - only request/response
 */

/**
 * Create or update profile
 * PATCH /api/profiles
 */
const upsertProfile = async (req, res, next) => {
  try {
    const { bio, avatarUrl, coverPhotoUrl, businessName, businessCategory, specialties, socialLinks } = req.body;
    
    const profile = await profileService.upsertProfile(req.user.userId, {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      bio,
      avatarUrl,
      coverPhotoUrl,
      socialLinks,
      role: req.user.role,
      businessName,
      businessCategory,
      specialties,
    });
    
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get own profile
 * GET /api/profiles/me
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.userId);
    
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public profile by userId
 * GET /api/profiles/:userId
 */
const getProfileById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const profile = await profileService.getPublicProfile(userId);
    
    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow a user
 * POST /api/profiles/:userId/follow
 */
const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const result = await profileService.followUser(req.user.userId, userId);
    
    res.status(200).json({
      success: true,
      message: 'User followed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow a user
 * DELETE /api/profiles/:userId/follow
 */
const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const result = await profileService.unfollowUser(req.user.userId, userId);
    
    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get followers
 * GET /api/profiles/:userId/followers
 */
const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await profileService.getFollowers(userId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get following
 * GET /api/profiles/:userId/following
 */
const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await profileService.getFollowing(userId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create timeline post
 * POST /api/profiles/timeline
 */
const createTimelinePost = async (req, res, next) => {
  try {
    const { type, content, media, surveyQuestion, surveyOptions } = req.body;
    
    const post = await profileService.createTimelinePost(req.user.userId, {
      type,
      content,
      media,
      surveyQuestion,
      surveyOptions,
    });
    
    res.status(201).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get timeline
 * GET /api/profiles/:userId/timeline
 */
const getTimeline = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const result = await profileService.getTimeline(userId, parseInt(page), parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update owner business info
 * PATCH /api/profiles/business
 */
const updateBusinessInfo = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PROFILE_OWNER_ONLY',
          message: 'Only owners can update business information',
        },
      });
    }
    
    const businessInfo = await profileService.updateOwnerBusinessInfo(req.user.userId, req.body);
    
    res.status(200).json({
      success: true,
      data: { businessInfo },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get owner business info
 * GET /api/profiles/:ownerId/business
 */
const getBusinessInfo = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    
    const businessInfo = await profileService.getOwnerBusinessInfo(ownerId);
    
    res.status(200).json({
      success: true,
      data: { businessInfo },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertProfile,
  getMyProfile,
  getProfileById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  createTimelinePost,
  getTimeline,
  updateBusinessInfo,
  getBusinessInfo,
};
