/**
 * Hair Twin Insights - Seeded Baseline Data
 * Anonymous community comparison data for motivation
 *
 * This uses realistic seeded data until real user analytics are available.
 * Data represents typical completion rates for users on similar hair goals.
 */

// Seeded average completion percentages by goal and week
// Week 1-2: Lower (users are learning), Week 3-6: Higher (habit forming), Week 7+: Slight dip (fatigue)
const BASELINE_AVERAGES = {
  // Goal: Repair Damaged Hair
  'repair-damaged': {
    1: 52, 2: 58, 3: 65, 4: 68, 5: 71, 6: 69, 7: 66, 8: 64, default: 62
  },
  // Goal: Grow Longer Hair
  'grow-longer': {
    1: 48, 2: 55, 3: 62, 4: 67, 5: 70, 6: 72, 7: 68, 8: 65, default: 60
  },
  // Goal: Reduce Frizz
  'reduce-frizz': {
    1: 55, 2: 60, 3: 68, 4: 72, 5: 74, 6: 71, 7: 68, 8: 66, default: 65
  },
  // Goal: Add Volume
  'add-volume': {
    1: 50, 2: 56, 3: 63, 4: 66, 5: 69, 6: 67, 7: 64, 8: 62, default: 61
  },
  // Goal: Define Curls
  'define-curls': {
    1: 54, 2: 61, 3: 70, 4: 75, 5: 78, 6: 76, 7: 73, 8: 70, default: 68
  },
  // Goal: Scalp Health
  'scalp-health': {
    1: 58, 2: 64, 3: 71, 4: 74, 5: 76, 6: 74, 7: 71, 8: 69, default: 67
  },
  // Goal: Color Protection
  'color-protection': {
    1: 51, 2: 57, 3: 64, 4: 68, 5: 71, 6: 69, 7: 66, 8: 63, default: 63
  },
  // Goal: General Maintenance
  'general': {
    1: 45, 2: 52, 3: 58, 4: 62, 5: 65, 6: 63, 7: 60, 8: 58, default: 55
  }
};

// Top habits tips per goal - what top performers actually do
const TOP_HABITS = {
  'repair-damaged': [
    { habit: 'Deep condition weekly', percentage: 82 },
    { habit: 'Use heat protectant before styling', percentage: 78 },
    { habit: 'Trim ends every 8 weeks', percentage: 71 },
    { habit: 'Sleep on silk pillowcase', percentage: 65 },
    { habit: 'Avoid daily heat styling', percentage: 74 }
  ],
  'grow-longer': [
    { habit: 'Scalp massage 3x weekly', percentage: 76 },
    { habit: 'Take hair vitamins daily', percentage: 69 },
    { habit: 'Protective styles at night', percentage: 72 },
    { habit: 'Trim split ends monthly', percentage: 68 },
    { habit: 'Avoid tight hairstyles', percentage: 74 }
  ],
  'reduce-frizz': [
    { habit: 'Use microfiber towel to dry', percentage: 81 },
    { habit: 'Apply leave-in conditioner', percentage: 77 },
    { habit: 'Avoid touching hair during day', percentage: 64 },
    { habit: 'Use anti-humidity products', percentage: 70 },
    { habit: 'Deep condition bi-weekly', percentage: 73 }
  ],
  'add-volume': [
    { habit: 'Wash roots thoroughly', percentage: 79 },
    { habit: 'Use volumizing products at roots', percentage: 75 },
    { habit: 'Blow dry upside down', percentage: 68 },
    { habit: 'Avoid heavy conditioners on roots', percentage: 72 },
    { habit: 'Use dry shampoo between washes', percentage: 71 }
  ],
  'define-curls': [
    { habit: 'Apply products to soaking wet hair', percentage: 85 },
    { habit: 'Scrunch out the crunch', percentage: 79 },
    { habit: 'Refresh curls with water spray', percentage: 76 },
    { habit: 'Use diffuser on low heat', percentage: 73 },
    { habit: 'Pineapple hair at night', percentage: 77 }
  ],
  'scalp-health': [
    { habit: 'Clarify scalp weekly', percentage: 74 },
    { habit: 'Massage while shampooing', percentage: 82 },
    { habit: 'Use scalp treatment oils', percentage: 69 },
    { habit: 'Avoid product buildup', percentage: 71 },
    { habit: 'Stay hydrated daily', percentage: 78 }
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

// Map goal display names to keys
const GOAL_KEY_MAP = {
  'Repair Damaged Hair': 'repair-damaged',
  'Grow Longer Hair': 'grow-longer',
  'Reduce Frizz': 'reduce-frizz',
  'Add Volume': 'add-volume',
  'Define Curls': 'define-curls',
  'Scalp Health': 'scalp-health',
  'Color Protection': 'color-protection',
  'General Maintenance': 'general',
  // Fallback mappings
  'repair': 'repair-damaged',
  'grow': 'grow-longer',
  'frizz': 'reduce-frizz',
  'volume': 'add-volume',
  'curls': 'define-curls',
  'scalp': 'scalp-health',
  'color': 'color-protection'
};

/**
 * Get the baseline key from a goal name
 */
function getGoalKey(goalName) {
  if (!goalName) return 'general';

  // Direct match
  if (GOAL_KEY_MAP[goalName]) return GOAL_KEY_MAP[goalName];

  // Lowercase match
  const lower = goalName.toLowerCase();
  if (GOAL_KEY_MAP[lower]) return GOAL_KEY_MAP[lower];

  // Partial match
  for (const [key, value] of Object.entries(GOAL_KEY_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return value;
    }
  }

  return 'general';
}

/**
 * Get average completion percentage for a goal and week
 */
function getBaselineAverage(goalKey, weekNumber) {
  const goalData = BASELINE_AVERAGES[goalKey] || BASELINE_AVERAGES['general'];
  return goalData[weekNumber] || goalData.default;
}

/**
 * Calculate percentile rank based on user's completion vs baseline
 * Uses a bell curve distribution around the average
 */
function calculatePercentile(userPercent, averagePercent) {
  if (userPercent >= 100) return 99;
  if (userPercent <= 0) return 5;

  // Calculate how far above/below average
  const diff = userPercent - averagePercent;

  // Standard deviation assumption: ~20% spread
  const stdDev = 20;
  const zScore = diff / stdDev;

  // Convert z-score to percentile (simplified normal distribution)
  // This creates a realistic distribution where being above average = higher percentile
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

  // Add some variance so it feels more real
  const variance = Math.floor(Math.random() * 5) - 2;
  percentile = Math.max(1, Math.min(99, percentile + variance));

  return percentile;
}

/**
 * Get a random tip for the goal
 */
function getRandomTip(goalKey) {
  const habits = TOP_HABITS[goalKey] || TOP_HABITS['general'];
  const randomIndex = Math.floor(Math.random() * habits.length);
  return habits[randomIndex];
}

/**
 * Get a deterministic tip based on week (same tip for same week)
 */
function getTipForWeek(goalKey, weekNumber) {
  const habits = TOP_HABITS[goalKey] || TOP_HABITS['general'];
  const index = (weekNumber - 1) % habits.length;
  return habits[index];
}

/**
 * Main function: Get Hair Twin Insights data
 *
 * @param {string} goalName - The user's selected goal
 * @param {number} weekNumber - Current week number
 * @param {number} userCompletionPercent - User's routine completion percentage (0-100)
 * @returns {Object} - Insights data for display
 */
export function getTwinInsights(goalName, weekNumber, userCompletionPercent) {
  const goalKey = getGoalKey(goalName);
  const averagePercent = getBaselineAverage(goalKey, weekNumber);
  const percentile = calculatePercentile(userCompletionPercent, averagePercent);
  const tip = getTipForWeek(goalKey, weekNumber);

  // Determine if user is above average
  const isAboveAverage = userCompletionPercent >= averagePercent;
  const isCrushing = percentile >= 75;
  const isStruggling = percentile < 30;

  // Generate motivational message based on performance
  let headline, subtext;

  if (isCrushing) {
    headline = `You're in the top ${100 - percentile}% this week!`;
    subtext = `You completed ${Math.round(userCompletionPercent)}% of your routine — that's more than most women on the same hair goal.`;
  } else if (isAboveAverage) {
    headline = `You're ahead of ${percentile}% of women!`;
    subtext = `Your ${Math.round(userCompletionPercent)}% completion is above the ${Math.round(averagePercent)}% average. Keep going!`;
  } else if (isStruggling) {
    headline = `You're building momentum!`;
    subtext = `${Math.round(userCompletionPercent)}% done this week. The average is ${Math.round(averagePercent)}% — you've got this!`;
  } else {
    headline = `You're on track!`;
    subtext = `${Math.round(userCompletionPercent)}% complete. You're close to the ${Math.round(averagePercent)}% community average.`;
  }

  return {
    percentile,
    userPercent: Math.round(userCompletionPercent),
    averagePercent: Math.round(averagePercent),
    isAboveAverage,
    isCrushing,
    headline,
    subtext,
    tip: {
      habit: tip.habit,
      percentage: tip.percentage
    },
    goalKey
  };
}

/**
 * Check if we have enough data to show insights
 * (User needs at least 1 step in their routine)
 */
export function canShowInsights(totalSteps, completedCount) {
  return totalSteps > 0;
}

export { getGoalKey, BASELINE_AVERAGES, TOP_HABITS };
