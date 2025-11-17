/**
 * Hair Goals Report Generator
 * Auto-generates insights and recommendations from weekly entries
 */

/**
 * Get hair word based on feeling score
 * @param {number} hairFeeling - 1-5 scale
 * @returns {string} - Hair descriptor
 */
export function getHairWord(hairFeeling) {
  const words = {
    1: 'Dry',
    2: 'Okay',
    3: 'Soft',
    4: 'Healthy',
    5: 'Amazing',
  };
  return words[hairFeeling] || 'Okay';
}

/**
 * Get emoji for feeling score
 * @param {number} hairFeeling - 1-5 scale
 * @returns {string} - Emoji
 */
export function getFeelingEmoji(hairFeeling) {
  const emojis = {
    1: '😔',
    2: '🙂',
    3: '😊',
    4: '😍',
    5: '🤩',
  };
  return emojis[hairFeeling] || '🙂';
}

/**
 * Get trend from last 4 entries
 * @param {Array} weeklyEntries - All entries
 * @returns {Array} - Array of {emoji, week, feeling}
 */
export function getTrend(weeklyEntries) {
  if (!weeklyEntries || weeklyEntries.length === 0) return [];
  
  // Sort by week number descending
  const sorted = [...weeklyEntries]
    .filter(e => e.hairFeeling)
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .slice(0, 4)
    .reverse(); // Oldest first for display
  
  return sorted.map(entry => ({
    emoji: getFeelingEmoji(entry.hairFeeling),
    week: entry.weekNumber,
    feeling: entry.hairFeeling,
  }));
}

/**
 * Get consistency score based on routine actions
 * @param {Object} entry - Weekly entry
 * @returns {number} - 0-3 score
 */
export function getConsistency(entry) {
  if (!entry) return 0;
  const count = entry.completedSteps?.length || 0;
  
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

/**
 * Get weekly wins based on feeling + routine
 * @param {Object} entry - Weekly entry
 * @returns {Array} - Array of win strings
 */
export function getWeeklyWins(entry) {
  if (!entry) return [];
  
  const wins = [];
  
  if (entry.hairFeeling >= 4) {
    wins.push('Hair feeling great');
  }
  if (entry.hairFeeling === 5) {
    wins.push('Best hair week yet');
  }
  
  const routineCount = entry.completedSteps?.length || 0;
  if (routineCount >= 4) {
    wins.push('Routine on point');
  } else if (routineCount >= 2) {
    wins.push('Solid consistency');
  } else if (routineCount >= 1) {
    wins.push('Momentum started');
  }
  
  if (entry.highlightProductName) {
    wins.push(`Loved ${entry.highlightProductName}`);
  }
  
  if (entry.progressNote && entry.progressNote.length > 20) {
    wins.push('Documented the journey');
  }
  
  if (entry.streak >= 4) {
    wins.push('4+ week streak');
  }
  
  return wins.slice(0, 3);
}

/**
 * Get next week focus based on goal and current state
 * @param {Object} entry - Weekly entry
 * @returns {string} - Focus recommendation
 */
export function getNextWeekFocus(entry) {
  if (!entry) return "Start your first weekly check-in";
  
  const { goal, hairFeeling, completedSteps } = entry;
  const routineCount = completedSteps?.length || 0;
  
  if (hairFeeling <= 2) {
    return "Hydrate deeply and add a nourishing mask this week";
  }
  
  if (routineCount === 0) {
    return "Complete at least 2 routine steps";
  }
  if (routineCount === 1) {
    return "Layer in one more action for better results";
  }
  
  if (goal) {
    const lowerGoal = goal.toLowerCase();
    
    if (lowerGoal.includes("frizz")) {
      return "Prioritize anti-frizz serums and silk pillowcases";
    }
    if (lowerGoal.includes("grow")) {
      return "Double down on scalp massage + oiling";
    }
    if (lowerGoal.includes("damage") || lowerGoal.includes("heat")) {
      return "Avoid heat styling and add bonding masks";
    }
    if (lowerGoal.includes("shine")) {
      return "Use glossing products + finishing oil";
    }
  }
  
  if (hairFeeling >= 4) {
    return "Keep repeating what worked this week!";
  }
  
  return "Keep experimenting with one new care step";
}

/**
 * Get past notes from previous weeks
 * @param {Array} weeklyEntries - All entries
 * @param {number} currentWeek - Current week number
 * @returns {Array} - Array of {week, note}
 */
export function getPastNotes(weeklyEntries, currentWeek) {
  if (!weeklyEntries || weeklyEntries.length === 0) return [];
  
  return weeklyEntries
    .filter(e => e.weekNumber < currentWeek && e.progressNote)
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .slice(0, 3)
    .map(e => ({
      week: e.weekNumber,
      note: e.progressNote,
    }));
}

/**
 * Calculate current streak
 * @param {Array} weeklyEntries - All entries
 * @returns {number} - Streak count
 */
export function getStreak(weeklyEntries) {
  if (!weeklyEntries || weeklyEntries.length === 0) return 0;
  
  // Sort by week number descending
  const sorted = [...weeklyEntries].sort((a, b) => b.weekNumber - a.weekNumber);
  
  let streak = 0;
  let expectedWeek = sorted[0].weekNumber;
  
  for (const entry of sorted) {
    if (entry.weekNumber === expectedWeek) {
      streak++;
      expectedWeek--;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Get full weekly report data
 * @param {Object} entry - Weekly entry
 * @param {Array} allEntries - All entries for trend/notes
 * @returns {Object} - Complete report data
 */
export function generateWeeklyReport(entry, allEntries = []) {
  if (!entry) return null;
  
  return {
    weekNumber: entry.weekNumber,
    date: entry.date,
    photoUri: entry.photoUri,
    goal: entry.goal,
    goalWhy: entry.goalWhy,
    completedSteps: entry.completedSteps || [],
    hairFeeling: entry.hairFeeling,
    hairWord: getHairWord(entry.hairFeeling),
    feelingEmoji: getFeelingEmoji(entry.hairFeeling),
    note: entry.progressNote,
    streak: entry.streak || getStreak(allEntries),
    trend: getTrend(allEntries),
    consistency: getConsistency(entry),
    wins: getWeeklyWins(entry),
    nextWeekFocus: getNextWeekFocus(entry),
    pastNotes: getPastNotes(allEntries, entry.weekNumber),
  };
}

/**
 * Get summary for main page widget
 * @param {Array} weeklyEntries - All entries
 * @returns {Object|null} - Summary data or null
 */
export function getLatestSummary(weeklyEntries) {
  if (!weeklyEntries || weeklyEntries.length === 0) return null;
  
  const latest = weeklyEntries
    .sort((a, b) => b.weekNumber - a.weekNumber)[0];
  
  return {
    weekNumber: latest.weekNumber,
    feelingEmoji: getFeelingEmoji(latest.hairFeeling),
    hairWord: getHairWord(latest.hairFeeling),
    streak: latest.streak || getStreak(weeklyEntries),
    routineCount: latest.completedSteps?.length || 0,
    hasPhoto: !!latest.photoUri,
  };
}
