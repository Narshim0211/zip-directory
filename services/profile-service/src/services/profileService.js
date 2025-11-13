const Profile = require('../models/Profile');
const Follower = require('../models/Follower');
const TimelinePost = require('../models/TimelinePost');
const OwnerBusinessInfo = require('../models/OwnerBusinessInfo');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Profile Service - Business Logic
 * Per PRD Section 5: Profile Microservice Responsibilities
 */

class ProfileService {
  /**
   * Create or update profile
   */
  async upsertProfile(userId, profileData) {
    const { firstName, lastName, bio, avatarUrl, coverPhotoUrl, socialLinks, role, businessName, businessCategory, ownerId, specialties } = profileData;
    
    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl && { avatarUrl }),
        ...(coverPhotoUrl && { coverPhotoUrl }),
        ...(socialLinks && { socialLinks }),
        ...(businessName && { businessName }),
        ...(businessCategory && { businessCategory }),
        ...(ownerId && { ownerId }),
        ...(specialties && { specialties }),
      });
      
      await profile.save();
      logger.info('Profile updated', { userId });
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        role,
        firstName,
        lastName,
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        coverPhotoUrl: coverPhotoUrl || '',
        ...(socialLinks && { socialLinks }),
        ...(businessName && { businessName }),
        ...(businessCategory && { businessCategory }),
        ...(ownerId && { ownerId }),
        ...(specialties && { specialties }),
      });
      
      await profile.save();
      logger.info('Profile created', { userId });
    }
    
    return profile;
  }
  
  /**
   * Get profile by userId
   */
  async getProfile(userId) {
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      throw new AppError('PROFILE_NOT_FOUND', 'Profile not found', 404);
    }
    
    return profile;
  }
  
  /**
   * Get public profile (for viewing other users)
   */
  async getPublicProfile(userId) {
    const profile = await Profile.findOne({ userId, isPublic: true });
    
    if (!profile) {
      throw new AppError('PROFILE_NOT_FOUND', 'Profile not found or private', 404);
    }
    
    return profile;
  }
  
  /**
   * Follow a user
   */
  async followUser(followerId, userId) {
    // Check if already following
    const existing = await Follower.findOne({ followerId, userId });
    
    if (existing) {
      throw new AppError('PROFILE_ALREADY_FOLLOWING', 'Already following this user', 400);
    }
    
    // Create follow relationship
    const follower = new Follower({
      userId,
      followerId,
    });
    
    await follower.save();
    
    // Update follower counts
    await Profile.findOneAndUpdate({ userId }, { $inc: { followersCount: 1 } });
    await Profile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: 1 } });
    
    logger.info('User followed', { followerId, userId });
    
    return { success: true };
  }
  
  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, userId) {
    const result = await Follower.deleteOne({ followerId, userId });
    
    if (result.deletedCount === 0) {
      throw new AppError('PROFILE_NOT_FOLLOWING', 'Not following this user', 400);
    }
    
    // Update follower counts
    await Profile.findOneAndUpdate({ userId }, { $inc: { followersCount: -1 } });
    await Profile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: -1 } });
    
    logger.info('User unfollowed', { followerId, userId });
    
    return { success: true };
  }
  
  /**
   * Get followers list
   */
  async getFollowers(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const followers = await Follower.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const followerIds = followers.map(f => f.followerId);
    
    // Get follower profiles
    const profiles = await Profile.find({ userId: { $in: followerIds } })
      .select('userId firstName lastName avatarUrl role');
    
    return {
      followers: profiles,
      page,
      hasMore: followers.length === limit,
    };
  }
  
  /**
   * Get following list
   */
  async getFollowing(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const following = await Follower.find({ followerId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const userIds = following.map(f => f.userId);
    
    // Get following profiles
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select('userId firstName lastName avatarUrl role');
    
    return {
      following: profiles,
      page,
      hasMore: following.length === limit,
    };
  }
  
  /**
   * Create timeline post
   */
  async createTimelinePost(userId, postData) {
    const { type, content, media, surveyQuestion, surveyOptions } = postData;
    
    const post = new TimelinePost({
      userId,
      type,
      content,
      media: media || [],
      ...(type === 'survey' && { surveyQuestion, surveyOptions }),
    });
    
    await post.save();
    
    // Update post count
    await Profile.findOneAndUpdate({ userId }, { $inc: { postsCount: 1 } });
    
    logger.info('Timeline post created', { userId, type });
    
    return post;
  }
  
  /**
   * Get timeline posts
   */
  async getTimeline(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const posts = await TimelinePost.find({ userId, isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      posts,
      page,
      hasMore: posts.length === limit,
    };
  }
  
  /**
   * Update owner business info
   */
  async updateOwnerBusinessInfo(ownerId, businessData) {
    let businessInfo = await OwnerBusinessInfo.findOne({ ownerId });
    
    if (businessInfo) {
      Object.assign(businessInfo, businessData);
      await businessInfo.save();
    } else {
      businessInfo = new OwnerBusinessInfo({
        ownerId,
        ...businessData,
      });
      await businessInfo.save();
    }
    
    logger.info('Owner business info updated', { ownerId });
    
    return businessInfo;
  }
  
  /**
   * Get owner business info
   */
  async getOwnerBusinessInfo(ownerId) {
    const businessInfo = await OwnerBusinessInfo.findOne({ ownerId });
    
    if (!businessInfo) {
      throw new AppError('PROFILE_BUSINESS_NOT_FOUND', 'Business information not found', 404);
    }
    
    return businessInfo;
  }
}

module.exports = new ProfileService();
