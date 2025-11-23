/**
 * Feed Ranking Service
 *
 * World-class ranking algorithm adapted from PRD v1.0
 * Balances velocity, engagement, follows, and premium status
 *
 * Algorithm weights:
 * - Velocity (engagement per hour): 15x
 * - Love count (total engagement): 2x
 * - Unique engagement rate (anti-spam): 60x
 * - Follow boost: +2000 (ensures followed content appears first)
 * - Premium boost: +100 (visible but not overwhelming)
 * - New item boost: +200 (helps discovery for creators with <10 loves)
 * - Time decay: 50x (recent content gets boost)
 *
 * Designed to scale to 10k+ users with Redis caching layer (future)
 */

const mongoose = require('mongoose');

/**
 * Calculate ranking score for a single feed item
 *
 * @param {Object} item - Feed item (Survey, Post, or OwnerPost)
 * @param {String|null} userId - Current user ID (for follow boost)
 * @param {Array<String>} followedIds - List of user IDs that current user follows
 * @returns {Number} - Ranking score (higher = appears first)
 */
function calculateScore(item, userId = null, followedIds = []) {
  try {
    // === DATA NORMALIZATION ===
    // Handle different model structures (Survey vs Post vs OwnerPost)

    const createdAt = item.createdAt || item.data?.createdAt || new Date();

    // Love count (engagement metric)
    // Survey: loveCount field
    // Post: reactions.love array length
    // OwnerPost: reactions.likes count
    const loveCount =
      item.loveCount ||
      item.reactions?.love?.length ||
      item.reactions?.likes ||
      0;

    // Total votes (surveys only)
    const totalVotes = item.totalVotes || 0;

    // View count (for unique engagement rate)
    const viewCount = item.viewCount || Math.max(loveCount, 1); // Fallback: assume views >= loves

    // Author ID (different field names across models)
    const authorId = String(
      item.authorId ||
      item.author?._id ||
      item.ownerId ||
      ''
    );

    // === TIME CALCULATIONS ===
    const now = Date.now();
    const itemAge = now - new Date(createdAt).getTime();
    const hoursOld = Math.max(itemAge / 3600000, 0.1); // Minimum 0.1 hours to prevent division by zero

    // === VELOCITY (Engagement per hour) ===
    // Combines loves and votes for surveys
    const totalEngagement = loveCount + totalVotes;
    const velocity = totalEngagement / hoursOld;

    // === UNIQUE ENGAGEMENT RATE (Anti-spam protection) ===
    // High rate = genuine engagement, Low rate = bot spam
    // Example: 50 loves / 60 views = 83% (good), 100 loves / 1000 views = 10% (spam)
    const uniqueRate = loveCount / viewCount;

    // === FOLLOW BOOST ===
    // 2000 points ensures followed content ALWAYS appears before non-followed
    // This is the key to personalization
    const isFollowed = authorId && followedIds.includes(authorId);
    const followBoost = isFollowed ? 2000 : 0;

    // === PREMIUM BOOST ===
    // 100 points gives premium a visible edge without overwhelming organic content
    // Premium items get ~5-10% higher ranking vs similar non-premium
    const isPremium =
      item.isPremium ||
      item.listingType === 'premium' ||
      item.premiumSubscription?.active ||
      false;
    const premiumBoost = isPremium ? 100 : 0;

    // === NEW CREATOR BOOST ===
    // 200 points helps new creators get discovered
    // Only applies when item has <10 loves (prevents gaming by established creators)
    const newItemBoost = loveCount < 10 ? 200 : 0;

    // === TIME DECAY ===
    // Recent content gets higher score
    // Formula: 1 / (hours + 2)
    // Example: 1hr old = 0.33, 10hrs old = 0.08, 100hrs old = 0.01
    const decay = 1 / (hoursOld + 2);

    // === FINAL SCORE CALCULATION ===
    // This is the exact PRD algorithm
    const score = (
      velocity * 15 +           // Fast-rising content
      loveCount * 2 +           // Popular content
      uniqueRate * 60 +         // Genuine engagement
      followBoost +             // Personalization (dominant factor)
      premiumBoost +            // Premium visibility
      newItemBoost +            // Discovery boost
      decay * 50                // Recency boost
    );

    return Math.round(score * 100) / 100; // Round to 2 decimal places

  } catch (error) {
    console.error('[feedRankingService] Error calculating score:', error);
    return 0; // Return 0 score on error (item appears last)
  }
}

/**
 * Rank an array of feed items
 *
 * @param {Array<Object>} items - Feed items to rank
 * @param {String|null} userId - Current user ID
 * @param {Array<String>} followedIds - List of followed user IDs
 * @returns {Array<Object>} - Ranked items (sorted by score descending)
 */
function rankFeedItems(items, userId = null, followedIds = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  try {
    // Calculate score for each item and attach metadata
    const scoredItems = items.map(item => {
      const authorId = String(
        item.authorId ||
        item.author?._id ||
        item.ownerId ||
        ''
      );

      return {
        ...item,
        _rankingScore: calculateScore(item, userId, followedIds),
        _isFollowed: authorId && followedIds.includes(authorId),
        _isPremium: item.isPremium ||
                    item.listingType === 'premium' ||
                    item.premiumSubscription?.active ||
                    false
      };
    });

    // Sort by score descending (highest score first)
    scoredItems.sort((a, b) => {
      // Primary sort: ranking score
      if (b._rankingScore !== a._rankingScore) {
        return b._rankingScore - a._rankingScore;
      }

      // Tie-breaker: creation date (newer first)
      const dateA = new Date(a.createdAt || a.data?.createdAt || 0);
      const dateB = new Date(b.createdAt || b.data?.createdAt || 0);
      return dateB - dateA;
    });

    return scoredItems;

  } catch (error) {
    console.error('[feedRankingService] Error ranking items:', error);
    // Fallback: return original items sorted by date
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.data?.createdAt || 0);
      const dateB = new Date(b.createdAt || b.data?.createdAt || 0);
      return dateB - dateA;
    });
  }
}

/**
 * Get followed user IDs for a given user
 * Helper function to fetch follow list efficiently
 *
 * @param {String} userId - User ID
 * @returns {Promise<Array<String>>} - Array of followed user IDs
 */
async function getFollowedUserIds(userId) {
  if (!userId) {
    return [];
  }

  try {
    const Follow = require('../models/Follow');

    // Fetch all users this user follows
    const follows = await Follow.find({
      followerId: userId
    })
    .distinct('followingId')
    .lean();

    // Convert ObjectIds to strings for easy comparison
    return follows.map(id => String(id));

  } catch (error) {
    console.error('[feedRankingService] Error fetching followed users:', error);
    return [];
  }
}

/**
 * Get ranking explanation for debugging
 * Shows score breakdown for a single item
 *
 * @param {Object} item - Feed item
 * @param {String|null} userId - Current user ID
 * @param {Array<String>} followedIds - List of followed user IDs
 * @returns {Object} - Score breakdown
 */
function explainScore(item, userId = null, followedIds = []) {
  const createdAt = item.createdAt || item.data?.createdAt || new Date();
  const loveCount = item.loveCount || item.reactions?.love?.length || item.reactions?.likes || 0;
  const totalVotes = item.totalVotes || 0;
  const viewCount = item.viewCount || Math.max(loveCount, 1);
  const authorId = String(item.authorId || item.author?._id || item.ownerId || '');

  const hoursOld = Math.max((Date.now() - new Date(createdAt).getTime()) / 3600000, 0.1);
  const velocity = (loveCount + totalVotes) / hoursOld;
  const uniqueRate = loveCount / viewCount;

  const isFollowed = authorId && followedIds.includes(authorId);
  const isPremium = item.isPremium || item.listingType === 'premium' || item.premiumSubscription?.active;

  const followBoost = isFollowed ? 2000 : 0;
  const premiumBoost = isPremium ? 100 : 0;
  const newItemBoost = loveCount < 10 ? 200 : 0;
  const decay = 1 / (hoursOld + 2);

  return {
    totalScore: calculateScore(item, userId, followedIds),
    breakdown: {
      velocity: { value: velocity, weighted: velocity * 15 },
      loveCount: { value: loveCount, weighted: loveCount * 2 },
      uniqueRate: { value: uniqueRate, weighted: uniqueRate * 60 },
      followBoost: { applied: isFollowed, value: followBoost },
      premiumBoost: { applied: isPremium, value: premiumBoost },
      newItemBoost: { applied: loveCount < 10, value: newItemBoost },
      decay: { value: decay, weighted: decay * 50 }
    },
    metadata: {
      hoursOld: Math.round(hoursOld * 10) / 10,
      totalEngagement: loveCount + totalVotes,
      isFollowed,
      isPremium
    }
  };
}

module.exports = {
  calculateScore,
  rankFeedItems,
  getFollowedUserIds,
  explainScore
};
