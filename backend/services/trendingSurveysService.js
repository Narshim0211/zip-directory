const Survey = require('../models/Survey');

/**
 * Trending Surveys Service
 * Provides trending survey data for Owner Home Page panels
 *
 * Features:
 * - Survey of the Day (highest love velocity in 24h)
 * - Trending Today (top 5 by love velocity)
 * - Trending This Week (top 5 by engagement score)
 * - 10-minute in-memory cache for performance
 */

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

class TrendingSurveysService {
  /**
   * Get Survey of the Day
   * Returns the survey with highest love velocity in the last 24 hours
   *
   * Love velocity = loveCount / hoursOld
   * This favors recent surveys with high engagement
   */
  async getSurveyOfTheDay() {
    const cacheKey = 'survey-of-day';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const surveys = await Survey.find({
      createdAt: { $gte: oneDayAgo },
      isActive: true,
      loveCount: { $gt: 0 } // Only surveys with at least 1 love
    })
    .populate('author', 'name avatarUrl isPremium email')
    .lean();

    if (surveys.length === 0) {
      // Fallback: get most loved survey from this week if no surveys today
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const fallbackSurvey = await Survey.findOne({
        createdAt: { $gte: oneWeekAgo },
        isActive: true,
        loveCount: { $gt: 0 }
      })
      .populate('author', 'name avatarUrl isPremium email')
      .sort({ loveCount: -1 })
      .lean();

      if (!fallbackSurvey) return null;

      cache.set(cacheKey, { data: fallbackSurvey, timestamp: Date.now() });
      return fallbackSurvey;
    }

    // Calculate love velocity for each survey
    surveys.forEach(s => {
      const hoursOld = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60);
      s.loveVelocity = hoursOld > 0 ? s.loveCount / hoursOld : s.loveCount;
    });

    // Sort by love velocity and get top survey
    const topSurvey = surveys.sort((a, b) => b.loveVelocity - a.loveVelocity)[0];

    cache.set(cacheKey, { data: topSurvey, timestamp: Date.now() });
    return topSurvey;
  }

  /**
   * Get Trending Today
   * Returns top 5 surveys from last 24 hours sorted by love count
   *
   * @param {number} limit - Number of surveys to return (default: 5)
   */
  async getTrendingToday(limit = 5) {
    const cacheKey = `trending-today-${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let surveys = await Survey.find({
      createdAt: { $gte: oneDayAgo },
      isActive: true
    })
    .populate('author', 'name avatarUrl isPremium email')
    .sort({ loveCount: -1, createdAt: -1 })
    .limit(limit)
    .lean();

    // If less than limit found today, fill with recent surveys from this week
    if (surveys.length < limit) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const additionalSurveys = await Survey.find({
        createdAt: { $gte: oneWeekAgo, $lt: oneDayAgo },
        isActive: true
      })
      .populate('author', 'name avatarUrl isPremium email')
      .sort({ loveCount: -1, createdAt: -1 })
      .limit(limit - surveys.length)
      .lean();

      surveys = [...surveys, ...additionalSurveys];
    }

    cache.set(cacheKey, { data: surveys, timestamp: Date.now() });
    return surveys;
  }

  /**
   * Get Trending This Week
   * Returns top 5 surveys from last 7 days sorted by engagement score
   *
   * Engagement score = loveCount * (voters.length || 1)
   * This favors surveys with both high loves and high participation
   *
   * @param {number} limit - Number of surveys to return (default: 5)
   */
  async getTrendingThisWeek(limit = 5) {
    const cacheKey = `trending-week-${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const surveys = await Survey.find({
      createdAt: { $gte: oneWeekAgo },
      isActive: true
    })
    .populate('author', 'name avatarUrl isPremium email')
    .lean();

    if (surveys.length === 0) {
      cache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }

    // Calculate engagement score for each survey
    surveys.forEach(s => {
      const uniqueVoters = s.voters?.length || 1;
      const loveCount = s.loveCount || 0;
      const totalVotes = s.totalVotes || 0;

      // Engagement score: loves * unique voters + total votes boost
      s.engagementScore = (loveCount * uniqueVoters) + (totalVotes * 0.5);
    });

    // Sort by engagement score and get top surveys
    const topSurveys = surveys
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);

    cache.set(cacheKey, { data: topSurveys, timestamp: Date.now() });
    return topSurveys;
  }

  /**
   * Clear cache manually (useful for testing or admin actions)
   */
  clearCache() {
    cache.clear();
    return { success: true, message: 'Cache cleared' };
  }

  /**
   * Get cache stats (for monitoring)
   */
  getCacheStats() {
    const stats = {
      size: cache.size,
      keys: Array.from(cache.keys()),
      timestamps: {}
    };

    cache.forEach((value, key) => {
      const age = Date.now() - value.timestamp;
      stats.timestamps[key] = {
        age: Math.floor(age / 1000), // seconds
        ttlRemaining: Math.floor((CACHE_TTL - age) / 1000) // seconds
      };
    });

    return stats;
  }
}

module.exports = new TrendingSurveysService();
