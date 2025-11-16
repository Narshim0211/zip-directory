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
  if (!entry || !entry.routineTags) return 0;
  
  const count = entry.routineTags.length;
  
  if (count >= 4) return 3; // Excellent
  if (count >= 2) return 2; // Good
  if (count >= 1) return 1; // Fair
  return 0; // None
}

/**
 * Get weekly wins based on feeling + routine
 * @param {Object} entry - Weekly entry
 * @returns {Array} - Array of win strings
 */
export function getWeeklyWins(entry) {
  if (!entry) return [];
  
  const wins = [];
  
  // Feeling-based wins
  if (entry.hairFeeling >= 4) {
    wins.push('Hair feeling great');
  }
  if (entry.hairFeeling === 5) {
    wins.push('Best hair week yet');
  }
  
  // Routine-based wins
  const routineCount = entry.routineTags?.length || 0;
  if (routineCount >= 3) {
    wins.push('Strong routine consistency');
  }
  if (routineCount >= 1) {
    wins.push('Active hair care');
  }
  
  // Specific routine wins
  if (entry.routineTags?.includes('No Heat')) {
    wins.push('Heat-free week');
  }
  if (entry.routineTags?.includes('Deep Conditioning')) {
    wins.push('Deep conditioning done');
  }
  if (entry.routineTags?.includes('Oil Massage')) {
    wins.push('Scalp massage completed');
  }
  
  // Streak wins
  if (entry.streak >= 4) {
    wins.push('4+ week streak');
  }
  if (entry.streak >= 8) {
    wins.push('2-month consistency');
  }
  
  // Reflection wins
  if (entry.reflection && entry.reflection.length > 10) {
    wins.push('Documented progress');
  }
  
  // Return top 3 wins
  return wins.slice(0, 3);
}

/**
 * Get next week focus based on goal and current state
 * @param {Object} entry - Weekly entry
 * @returns {string} - Focus recommendation
 */
export function getNextWeekFocus(entry) {
  if (!entry) return "Start your first weekly check-in";
  
  const { goal, hairFeeling, routineTags } = entry;
  const routineCount = routineTags?.length || 0;
  
  // Based on feeling
  if (hairFeeling <= 2) {
    return "Try a deep conditioning treatment this week";
  }
  
  // Based on routine consistency
  if (routineCount === 0) {
    return "Pick 1-2 actions from your routine list";
  }
  if (routineCount === 1) {
    return "Add one more routine action for better results";
  }
  
  // Goal-based recommendations
  if (goal) {
    const lowerGoal = goal.toLowerCase();
    
    if (lowerGoal.includes("frizz")) {
      return "Focus on silk pillowcase and oil treatments";
    }
    if (lowerGoal.includes("grow")) {
      return "Scalp massage + protective styling this week";
    }
    if (lowerGoal.includes("heat") || lowerGoal.includes("damage")) {
      return "Keep avoiding heat + add hair mask";
    }
    if (lowerGoal.includes("shine") || lowerGoal.includes("dull")) {
      return "Oil treatment + hydrating products";
    }
    if (lowerGoal.includes("dry") || lowerGoal.includes("moisture")) {
      return "Deep conditioning + leave-in treatment";
    }
  }
  
  // Default
  if (hairFeeling >= 4) {
    return "Keep doing what you are doing!";
  }
  
  return "Try one new hair care action this week";
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
    .filter(e => e.weekNumber < currentWeek && e.reflection)
    .sort((a, b) => b.weekNumber - a.weekNumber)
    .slice(0, 3)
    .map(e => ({
      week: e.weekNumber,
      note: e.reflection,
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
    routineTags: entry.routineTags || [],
    routineNote: entry.routineNote,
    hairFeeling: entry.hairFeeling,
    hairWord: getHairWord(entry.hairFeeling),
    feelingEmoji: getFeelingEmoji(entry.hairFeeling),
    reflection: entry.reflection,
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
    routineCount: latest.routineTags?.length || 0,
    hasPhoto: !!latest.photoUri,
  };
}
