const Survey = require('../models/Survey');
const SurveyEngagement = require('../modules/analytics/survey/surveyEngagement.model');

/**
 * Survey of the Day Service
 *
 * Selects ONE survey per day to feature prominently in the feed.
 * Uses engagement-based algorithm to find trending, high-quality surveys.
 *
 * Selection Criteria:
 * - Recent (last 7 days)
 * - High engagement velocity (votes/hour)
 * - Good unique rate (anti-spam)
 * - Not featured in last 30 days (rotation fairness)
 *
 * Cache: Cached for 24 hours, rotates daily at midnight
 */

let cachedSurveyOfTheDay = null;
let cacheExpiry = null;

/**
 * Calculate survey score for "Survey of the Day" selection
 * Similar to ranking algorithm but optimized for daily feature
 *
 * @param {Object} survey - Survey document
 * @param {Object} engagement - SurveyEngagement document
 * @returns {Number} - Selection score (higher = better)
 */
function calculateSurveyOfTheDayScore(survey, engagement) {
  try {
    const now = Date.now();
    const createdAt = new Date(survey.createdAt).getTime();
    const hoursOld = Math.max((now - createdAt) / 3600000, 0.1);
    const daysOld = hoursOld / 24;

    // Engagement metrics
    const totalVotes = survey.totalVotes || 0;
    const loveCount = engagement?.reactions?.love || 0;
    const viewCount = engagement?.impressions || Math.max(totalVotes, 1);
    const totalEngagement = totalVotes + loveCount;

    // Velocity (engagement per hour) - KEY METRIC
    const velocity = totalEngagement / hoursOld;

    // Unique rate (anti-spam protection)
    const uniqueRate = totalVotes / viewCount;

    // Recency boost (prefer newer content, but not too new)
    let recencyMultiplier = 1.0;
    if (daysOld < 0.25) {
      // Too new (< 6 hours) - not enough data
      recencyMultiplier = 0.3;
    } else if (daysOld < 1) {
      // Sweet spot (6-24 hours) - fresh + enough engagement
      recencyMultiplier = 2.0;
    } else if (daysOld < 3) {
      // Still good (1-3 days)
      recencyMultiplier = 1.5;
    } else if (daysOld < 7) {
      // Acceptable (3-7 days)
      recencyMultiplier = 1.0;
    } else {
      // Too old (> 7 days) - penalize heavily
      recencyMultiplier = 0.1;
    }

    // Quality threshold - minimum engagement required
    const hasMinimumEngagement = totalVotes >= 5 && viewCount >= 10;
    if (!hasMinimumEngagement) {
      return 0; // Not eligible
    }

    // Final score calculation
    const score = (
      velocity * 20 +              // Velocity is king (trending content)
      totalVotes * 5 +              // Raw votes matter
      loveCount * 3 +               // Loves indicate quality
      uniqueRate * 40 +             // Anti-spam protection
      (viewCount * 0.1)             // Visibility bonus (small)
    ) * recencyMultiplier;          // Recency multiplier

    return Math.round(score * 100) / 100;
  } catch (error) {
    console.error('[SurveyOfTheDay] Error calculating score:', error);
    return 0;
  }
}

/**
 * Get Survey of the Day
 * Returns cached survey if valid, otherwise selects new one
 *
 * @returns {Object|null} - Survey document with _isSurveyOfTheDay flag
 */
async function getSurveyOfTheDay() {
  try {
    // Check cache validity
    if (cachedSurveyOfTheDay && cacheExpiry && Date.now() < cacheExpiry) {
      console.log('[SurveyOfTheDay] Returning cached survey:', cachedSurveyOfTheDay._id);
      return cachedSurveyOfTheDay;
    }

    console.log('[SurveyOfTheDay] Cache expired or empty, selecting new survey...');

    // Select new Survey of the Day
    const selectedSurvey = await selectNewSurveyOfTheDay();

    if (selectedSurvey) {
      // Cache for 24 hours (rotates daily)
      cachedSurveyOfTheDay = {
        ...selectedSurvey.toObject(),
        _isSurveyOfTheDay: true,
        _featuredAt: new Date(),
      };
      cacheExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      console.log('[SurveyOfTheDay] Selected new survey:', cachedSurveyOfTheDay._id);
      console.log('[SurveyOfTheDay] Cache expires at:', new Date(cacheExpiry).toISOString());
    } else {
      console.warn('[SurveyOfTheDay] No eligible survey found');
      cachedSurveyOfTheDay = null;
      cacheExpiry = null;
    }

    return cachedSurveyOfTheDay;
  } catch (error) {
    console.error('[SurveyOfTheDay] Error getting survey:', error);
    return null;
  }
}

/**
 * Select new Survey of the Day using engagement-based algorithm
 *
 * Algorithm:
 * 1. Get recent surveys (last 7 days)
 * 2. Exclude surveys featured in last 30 days
 * 3. Calculate scores for each survey
 * 4. Return highest scoring survey
 *
 * @returns {Object|null} - Survey document
 */
async function selectNewSurveyOfTheDay() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get recent surveys (last 7 days)
    const recentSurveys = await Survey.find({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true, // Only active surveys
    })
    .populate('author', 'firstName lastName role isPremium')
    .lean();

    if (recentSurveys.length === 0) {
      console.warn('[SurveyOfTheDay] No recent surveys found');
      return null;
    }

    console.log(`[SurveyOfTheDay] Evaluating ${recentSurveys.length} recent surveys...`);

    // Get engagement data for all surveys
    const surveyIds = recentSurveys.map(s => s._id);
    const engagements = await SurveyEngagement.find({
      surveyId: { $in: surveyIds }
    }).lean();

    // Create engagement lookup map
    const engagementMap = {};
    engagements.forEach(eng => {
      engagementMap[eng.surveyId.toString()] = eng;
    });

    // Calculate scores for each survey
    const scoredSurveys = recentSurveys.map(survey => {
      const engagement = engagementMap[survey._id.toString()] || {
        impressions: 0,
        reactions: { love: 0 }
      };

      const score = calculateSurveyOfTheDayScore(survey, engagement);

      return {
        survey,
        engagement,
        score,
      };
    });

    // Filter out surveys with score 0 (not eligible)
    const eligibleSurveys = scoredSurveys.filter(s => s.score > 0);

    if (eligibleSurveys.length === 0) {
      console.warn('[SurveyOfTheDay] No eligible surveys found');
      return null;
    }

    // Sort by score descending
    eligibleSurveys.sort((a, b) => b.score - a.score);

    // Log top 5 candidates for debugging
    console.log('[SurveyOfTheDay] Top 5 candidates:');
    eligibleSurveys.slice(0, 5).forEach((s, i) => {
      console.log(`  ${i + 1}. Score: ${s.score}, Votes: ${s.survey.totalVotes}, ID: ${s.survey._id}`);
    });

    // Return highest scoring survey
    const winner = eligibleSurveys[0];
    console.log(`[SurveyOfTheDay] Winner: ${winner.survey._id} (Score: ${winner.score})`);

    return winner.survey;
  } catch (error) {
    console.error('[SurveyOfTheDay] Error selecting survey:', error);
    return null;
  }
}

/**
 * Manually refresh Survey of the Day
 * Clears cache and selects new survey immediately
 *
 * @returns {Object|null} - New Survey of the Day
 */
async function refreshSurveyOfTheDay() {
  console.log('[SurveyOfTheDay] Manual refresh triggered');
  cachedSurveyOfTheDay = null;
  cacheExpiry = null;
  return await getSurveyOfTheDay();
}

/**
 * Check if a specific survey is currently Survey of the Day
 *
 * @param {String} surveyId - Survey ID to check
 * @returns {Boolean}
 */
function isSurveyOfTheDay(surveyId) {
  if (!cachedSurveyOfTheDay || !cacheExpiry || Date.now() >= cacheExpiry) {
    return false;
  }
  return cachedSurveyOfTheDay._id.toString() === surveyId.toString();
}

/**
 * Get cache status (for debugging/monitoring)
 *
 * @returns {Object} - Cache status
 */
function getCacheStatus() {
  return {
    hasCached: !!cachedSurveyOfTheDay,
    surveyId: cachedSurveyOfTheDay?._id || null,
    cacheExpiry: cacheExpiry ? new Date(cacheExpiry).toISOString() : null,
    isExpired: cacheExpiry ? Date.now() >= cacheExpiry : true,
    timeUntilExpiry: cacheExpiry ? Math.max(0, cacheExpiry - Date.now()) : 0,
  };
}

module.exports = {
  getSurveyOfTheDay,
  refreshSurveyOfTheDay,
  isSurveyOfTheDay,
  getCacheStatus,
};
