const HairGoalsStat = require('../models/HairGoalsStat');

/**
 * Community Stats Service
 *
 * Hybrid approach:
 * - If < MINIMUM_SAMPLE_SIZE users for a goal+week: Use seeded baseline data
 * - If >= MINIMUM_SAMPLE_SIZE users: Use real aggregated data
 *
 * User never knows which data source is being used - both look the same.
 */

const MINIMUM_SAMPLE_SIZE = 10; // Need at least 10 data points for meaningful stats

// ============================================
// SEEDED BASELINE DATA (Realistic Estimates)
// ============================================

const SEEDED_AVERAGES = {
  'length': { 1: 48, 2: 55, 3: 62, 4: 67, 5: 70, 6: 72, 7: 68, 8: 65, default: 60 },
  'grow-longer': { 1: 48, 2: 55, 3: 62, 4: 67, 5: 70, 6: 72, 7: 68, 8: 65, default: 60 },
  'volume': { 1: 50, 2: 56, 3: 63, 4: 66, 5: 69, 6: 67, 7: 64, 8: 62, default: 61 },
  'add-volume': { 1: 50, 2: 56, 3: 63, 4: 66, 5: 69, 6: 67, 7: 64, 8: 62, default: 61 },
  'repair': { 1: 52, 2: 58, 3: 65, 4: 68, 5: 71, 6: 69, 7: 66, 8: 64, default: 62 },
  'repair-damaged': { 1: 52, 2: 58, 3: 65, 4: 68, 5: 71, 6: 69, 7: 66, 8: 64, default: 62 },
  'curls': { 1: 54, 2: 61, 3: 70, 4: 75, 5: 78, 6: 76, 7: 73, 8: 70, default: 68 },
  'define-curls': { 1: 54, 2: 61, 3: 70, 4: 75, 5: 78, 6: 76, 7: 73, 8: 70, default: 68 },
  'scalp': { 1: 58, 2: 64, 3: 71, 4: 74, 5: 76, 6: 74, 7: 71, 8: 69, default: 67 },
  'scalp-health': { 1: 58, 2: 64, 3: 71, 4: 74, 5: 76, 6: 74, 7: 71, 8: 69, default: 67 },
  'color': { 1: 51, 2: 57, 3: 64, 4: 68, 5: 71, 6: 69, 7: 66, 8: 63, default: 63 },
  'color-protection': { 1: 51, 2: 57, 3: 64, 4: 68, 5: 71, 6: 69, 7: 66, 8: 63, default: 63 },
  'general': { 1: 45, 2: 52, 3: 58, 4: 62, 5: 65, 6: 63, 7: 60, 8: 58, default: 55 }
};

const SEEDED_TOP_HABITS = {
  'length': [
    { habit: 'Scalp massage 3x weekly', percentage: 76 },
    { habit: 'Protective styles at night', percentage: 72 },
    { habit: 'Trim split ends monthly', percentage: 68 },
    { habit: 'Avoid tight hairstyles', percentage: 74 },
    { habit: 'Take hair vitamins daily', percentage: 69 }
  ],
  'grow-longer': [
    { habit: 'Scalp massage 3x weekly', percentage: 76 },
    { habit: 'Protective styles at night', percentage: 72 },
    { habit: 'Trim split ends monthly', percentage: 68 },
    { habit: 'Avoid tight hairstyles', percentage: 74 },
    { habit: 'Take hair vitamins daily', percentage: 69 }
  ],
  'volume': [
    { habit: 'Wash roots thoroughly', percentage: 79 },
    { habit: 'Use volumizing products at roots', percentage: 75 },
    { habit: 'Blow dry upside down', percentage: 68 },
    { habit: 'Avoid heavy conditioners on roots', percentage: 72 },
    { habit: 'Use dry shampoo between washes', percentage: 71 }
  ],
  'add-volume': [
    { habit: 'Wash roots thoroughly', percentage: 79 },
    { habit: 'Use volumizing products at roots', percentage: 75 },
    { habit: 'Blow dry upside down', percentage: 68 },
    { habit: 'Avoid heavy conditioners on roots', percentage: 72 },
    { habit: 'Use dry shampoo between washes', percentage: 71 }
  ],
  'repair': [
    { habit: 'Deep condition weekly', percentage: 82 },
    { habit: 'Use heat protectant before styling', percentage: 78 },
    { habit: 'Trim ends every 8 weeks', percentage: 71 },
    { habit: 'Sleep on silk pillowcase', percentage: 65 },
    { habit: 'Avoid daily heat styling', percentage: 74 }
  ],
  'repair-damaged': [
    { habit: 'Deep condition weekly', percentage: 82 },
    { habit: 'Use heat protectant before styling', percentage: 78 },
    { habit: 'Trim ends every 8 weeks', percentage: 71 },
    { habit: 'Sleep on silk pillowcase', percentage: 65 },
    { habit: 'Avoid daily heat styling', percentage: 74 }
  ],
  'curls': [
    { habit: 'Apply products to soaking wet hair', percentage: 85 },
    { habit: 'Scrunch out the crunch', percentage: 79 },
    { habit: 'Refresh curls with water spray', percentage: 76 },
    { habit: 'Use diffuser on low heat', percentage: 73 },
    { habit: 'Pineapple hair at night', percentage: 77 }
  ],
  'define-curls': [
    { habit: 'Apply products to soaking wet hair', percentage: 85 },
    { habit: 'Scrunch out the crunch', percentage: 79 },
    { habit: 'Refresh curls with water spray', percentage: 76 },
    { habit: 'Use diffuser on low heat', percentage: 73 },
    { habit: 'Pineapple hair at night', percentage: 77 }
  ],
  'scalp': [
    { habit: 'Clarify scalp weekly', percentage: 74 },
    { habit: 'Massage while shampooing', percentage: 82 },
    { habit: 'Use scalp treatment oils', percentage: 69 },
    { habit: 'Avoid product buildup', percentage: 71 },
    { habit: 'Stay hydrated daily', percentage: 78 }
  ],
  'scalp-health': [
    { habit: 'Clarify scalp weekly', percentage: 74 },
    { habit: 'Massage while shampooing', percentage: 82 },
    { habit: 'Use scalp treatment oils', percentage: 69 },
    { habit: 'Avoid product buildup', percentage: 71 },
    { habit: 'Stay hydrated daily', percentage: 78 }
  ],
  'color': [
    { habit: 'Use color-safe shampoo only', percentage: 84 },
    { habit: 'Wash with cool water', percentage: 72 },
    { habit: 'Limit washes to 2-3x weekly', percentage: 76 },
    { habit: 'Use UV protection spray', percentage: 65 },
    { habit: 'Deep condition weekly', percentage: 79 }
  ],
  'color-protection': [
    { habit: 'Use color-safe shampoo only', percentage: 84 },
    { habit: 'Wash with cool water', percentage: 72 },
    { habit: 'Limit washes to 2-3x weekly', percentage: 76 },
    { habit: 'Use UV protection spray', percentage: 65 },
    { habit: 'Deep condition weekly', percentage: 79 }
  ],
  'general': [
    { habit: 'Brush gently from ends up', percentage: 77 },
    { habit: 'Wash 2-3 times per week', percentage: 73 },
    { habit: 'Use conditioner every wash', percentage: 81 },
    { habit: 'Trim every 6-8 weeks', percentage: 68 },
    { habit: 'Protect hair while sleeping', percentage: 70 }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeGoal(goal) {
  if (!goal) return 'general';
  const lower = goal.toLowerCase().replace(/\s+/g, '-');

  const mapping = {
    'grow length': 'length',
    'grow-length': 'length',
    'grow longer hair': 'grow-longer',
    'add volume': 'volume',
    'repair damage': 'repair',
    'repair damaged hair': 'repair-damaged',
    'define curls': 'curls',
    'scalp health': 'scalp',
    'maintain color': 'color'
  };

  return mapping[lower] || lower;
}

function getSeededAverage(goal, weekNumber) {
  const normalizedGoal = normalizeGoal(goal);
  const goalData = SEEDED_AVERAGES[normalizedGoal] || SEEDED_AVERAGES['general'];
  return goalData[weekNumber] || goalData.default;
}

function getSeededTip(goal, weekNumber) {
  const normalizedGoal = normalizeGoal(goal);
  const habits = SEEDED_TOP_HABITS[normalizedGoal] || SEEDED_TOP_HABITS['general'];
  const index = (weekNumber - 1) % habits.length;
  return habits[index];
}

function calculatePercentileFromAverage(userCompletion, avgCompletion) {
  // Estimate percentile based on how far from average
  const diff = userCompletion - avgCompletion;
  const stdDev = 20; // Assumed standard deviation
  const zScore = diff / stdDev;

  let percentile;
  if (zScore >= 2) percentile = 98;
  else if (zScore >= 1.5) percentile = 93;
  else if (zScore >= 1) percentile = 84;
  else if (zScore >= 0.5) percentile = 69;
  else if (zScore >= 0) percentile = 50;
  else if (zScore >= -0.5) percentile = 31;
  else if (zScore >= -1) percentile = 16;
  else if (zScore >= -1.5) percentile = 7;
  else percentile = 2;

  return Math.max(1, Math.min(99, percentile));
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Record anonymous stat when user saves weekly progress
 * Called from weeklyReportService after saving report
 */
async function recordAnonymousStat(data) {
  const {
    goal,
    weekNumber,
    completionPercent,
    totalSteps,
    completedSteps,
    stepTypes = [],
    hairFeeling = null
  } = data;

  if (!goal || !weekNumber || totalSteps < 1) {
    return null; // Invalid data, skip
  }

  const now = new Date();
  const submissionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    const stat = new HairGoalsStat({
      goal: normalizeGoal(goal),
      weekNumber: Math.min(weekNumber, 52),
      completionPercent: Math.round(completionPercent),
      totalSteps,
      completedSteps,
      stepTypes: stepTypes.slice(0, 10), // Limit to 10 step types
      hairFeeling,
      submissionMonth
    });

    await stat.save();
    return stat;
  } catch (err) {
    console.error('Failed to record anonymous stat:', err.message);
    return null;
  }
}

/**
 * Get community insights for a goal + week
 * Returns hybrid data (real if enough samples, seeded otherwise)
 */
async function getCommunityInsights(goal, weekNumber, userCompletion) {
  const normalizedGoal = normalizeGoal(goal);

  try {
    // Try to get real data
    const realStats = await HairGoalsStat.getAggregatedStats(normalizedGoal, weekNumber);

    if (realStats && realStats.count >= MINIMUM_SAMPLE_SIZE) {
      // Use real data
      const percentileData = await HairGoalsStat.calculatePercentile(
        normalizedGoal,
        weekNumber,
        userCompletion
      );

      // Get real top habits if we have enough data
      const topSteps = await HairGoalsStat.getTopStepTypes(normalizedGoal, 3);

      return {
        source: 'real', // For internal tracking only, not exposed to user
        sampleSize: realStats.count,
        averageCompletion: Math.round(realStats.avgCompletion),
        percentile: percentileData?.percentile || calculatePercentileFromAverage(userCompletion, realStats.avgCompletion),
        userCompletion: Math.round(userCompletion),
        tip: getSeededTip(normalizedGoal, weekNumber), // Still use curated tips
        topStepTypes: topSteps.length > 0 ? topSteps : null
      };
    }
  } catch (err) {
    console.error('Error fetching real stats:', err.message);
  }

  // Fall back to seeded data
  const seededAverage = getSeededAverage(normalizedGoal, weekNumber);
  const seededTip = getSeededTip(normalizedGoal, weekNumber);

  return {
    source: 'seeded', // For internal tracking only
    sampleSize: 0,
    averageCompletion: seededAverage,
    percentile: calculatePercentileFromAverage(userCompletion, seededAverage),
    userCompletion: Math.round(userCompletion),
    tip: seededTip,
    topStepTypes: null
  };
}

/**
 * Generate user-facing insights message
 */
function generateInsightsMessage(insights) {
  const { percentile, userCompletion, averageCompletion, tip } = insights;

  const isAboveAverage = userCompletion >= averageCompletion;
  const isCrushing = percentile >= 75;
  const isStruggling = percentile < 30;

  let headline, subtext;

  if (isCrushing) {
    headline = `You're in the top ${100 - percentile}% this week!`;
    subtext = `You completed ${userCompletion}% of your routine — that's more than most women on the same hair goal.`;
  } else if (isAboveAverage) {
    headline = `You're ahead of ${percentile}% of women!`;
    subtext = `Your ${userCompletion}% completion is above the ${averageCompletion}% average. Keep going!`;
  } else if (isStruggling) {
    headline = `You're building momentum!`;
    subtext = `${userCompletion}% done this week. The average is ${averageCompletion}% — you've got this!`;
  } else {
    headline = `You're on track!`;
    subtext = `${userCompletion}% complete. You're close to the ${averageCompletion}% community average.`;
  }

  return {
    headline,
    subtext,
    percentile,
    userCompletion,
    averageCompletion,
    isAboveAverage,
    isCrushing,
    tip: {
      habit: tip.habit,
      percentage: tip.percentage
    }
  };
}

/**
 * Cleanup old stats (call monthly via cron)
 * Keeps only last 6 months of data
 */
async function cleanupOldStats() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const cutoffMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  try {
    const result = await HairGoalsStat.deleteMany({
      submissionMonth: { $lt: cutoffMonth }
    });
    console.log(`Cleaned up ${result.deletedCount} old hair goals stats`);
    return result.deletedCount;
  } catch (err) {
    console.error('Failed to cleanup old stats:', err.message);
    return 0;
  }
}

module.exports = {
  recordAnonymousStat,
  getCommunityInsights,
  generateInsightsMessage,
  cleanupOldStats,
  normalizeGoal,
  MINIMUM_SAMPLE_SIZE
};
