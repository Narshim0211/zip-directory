/**
 * Local Storage Helpers for Hair Goals Diary
 * Handles all localStorage operations with error handling
 *
 * Security Framework:
 * - Input sanitization (XSS prevention)
 * - Data validation before save
 * - userId pattern for future backend migration
 * - Max length limits on text fields
 */

const STORAGE_KEY_PREFIX = 'hairGoals_';

// Security: Max length limits for text fields
const MAX_LENGTHS = {
  name: 100,
  tagline: 200,
  note: 500,
  goalNote: 500,
  progressNote: 1000,
};

export const STORAGE_KEYS = {
  WEEKLY_ENTRIES: 'weeklyEntries',
  START_DATE: 'startDate',
  CURRENT_STREAK: 'currentStreak',
  GOAL: 'selectedGoal',
  ROUTINE_STEPS: 'routineSteps',
  PRODUCTS: 'products',
  PHOTOS: 'photos',
  JOURNEY_HISTORY: 'journeyHistory',
  PROGRESS: 'progress',
  STICKERS: 'unlockedStickers',
  STREAK: 'streak',
  LAST_UPDATE: 'lastUpdate',
  WEEKLY_CHECKLIST: 'weeklyChecklist',
};

// ============================================
// SECURITY: Sanitization & Validation Helpers
// ============================================

/**
 * Sanitize text input to prevent XSS attacks
 * @param {string} input - Raw text input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized text
 */
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  // Remove HTML tags, trim whitespace, limit length
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate journey object structure before saving
 * @param {Object} journey - Journey object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateJourney(journey) {
  const errors = [];

  if (!journey || typeof journey !== 'object') {
    return { valid: false, errors: ['Journey must be an object'] };
  }

  // Required fields
  if (!journey.id || typeof journey.id !== 'string') {
    errors.push('Journey must have a valid id');
  }

  if (!journey.startDate) {
    errors.push('Journey must have a startDate');
  }

  // Validate date formats
  if (journey.startDate && isNaN(Date.parse(journey.startDate))) {
    errors.push('Invalid startDate format');
  }

  if (journey.endDate && isNaN(Date.parse(journey.endDate))) {
    errors.push('Invalid endDate format');
  }

  // Validate arrays
  if (journey.weeklyEntries && !Array.isArray(journey.weeklyEntries)) {
    errors.push('weeklyEntries must be an array');
  }

  if (journey.photos && !Array.isArray(journey.photos)) {
    errors.push('photos must be an array');
  }

  if (journey.products && !Array.isArray(journey.products)) {
    errors.push('products must be an array');
  }

  if (journey.routineSteps && !Array.isArray(journey.routineSteps)) {
    errors.push('routineSteps must be an array');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize journey object - clean all text fields
 * @param {Object} journey - Raw journey object
 * @returns {Object} - Sanitized journey
 */
export function sanitizeJourney(journey) {
  if (!journey || typeof journey !== 'object') return journey;

  return {
    ...journey,
    name: journey.name ? sanitizeText(journey.name, MAX_LENGTHS.name) : undefined,
    tagline: journey.tagline ? sanitizeText(journey.tagline, MAX_LENGTHS.tagline) : undefined,
    goal: journey.goal ? {
      ...journey.goal,
      goalType: journey.goal.goalType ? sanitizeText(journey.goal.goalType, 100) : undefined,
      goalNote: journey.goal.goalNote ? sanitizeText(journey.goal.goalNote, MAX_LENGTHS.goalNote) : undefined,
    } : undefined,
    weeklyEntries: journey.weeklyEntries?.map(entry => ({
      ...entry,
      progressNote: entry.progressNote ? sanitizeText(entry.progressNote, MAX_LENGTHS.progressNote) : undefined,
    })),
  };
}

/**
 * Generate default journey name from goal and dates
 * @param {Object} goal - Goal object with goalType
 * @param {string} startDate - Journey start date
 * @param {string} endDate - Journey end date
 * @returns {string} - Generated name
 */
export function generateJourneyName(goal, startDate, endDate) {
  const goalName = goal?.goalType || goal?.title || 'Hair';

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${goalName} Journey (${startMonth} – ${endMonth})`;
  }

  return `${goalName} Journey`;
}

/**
 * Load hair goals data from localStorage
 * @param {string} userId - User ID (optional, for future multi-user support)
 * @returns {Object} - Hair goals data
 */
export function loadHairGoals(userId = 'default') {
  try {
    const data = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const fullKey = `${STORAGE_KEY_PREFIX}${userId}_${storageKey}`;
      const value = localStorage.getItem(fullKey);
      
      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value; // Not JSON, store as-is
        }
      }
    });
    
    return data;
  } catch (error) {
    console.error('Failed to load hair goals from localStorage:', error);
    return {};
  }
}

/**
 * Save hair goals data to localStorage
 * @param {string} userId - User ID
 * @param {Object} data - Data to save
 */
export function saveHairGoals(userId = 'default', data) {
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (STORAGE_KEYS[key]) {
        const fullKey = `${STORAGE_KEY_PREFIX}${userId}_${STORAGE_KEYS[key]}`;
        localStorage.setItem(fullKey, JSON.stringify(value));
      }
    });
  } catch (error) {
    console.error('Failed to save hair goals to localStorage:', error);
    throw error; // Let caller handle
  }
}

/**
 * Save a single field to localStorage
 * @param {string} key - Field key (from STORAGE_KEYS)
 * @param {*} value - Value to save
 * @param {string} userId - User ID
 */
export function saveField(key, value, userId = 'default') {
  try {
    if (STORAGE_KEYS[key]) {
      const fullKey = `${STORAGE_KEY_PREFIX}${userId}_${STORAGE_KEYS[key]}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Failed to save field ${key}:`, error);
  }
}

/**
 * Load a single field from localStorage
 * @param {string} key - Field key (from STORAGE_KEYS)
 * @param {string} userId - User ID
 * @returns {*} - Field value or null
 */
export function loadField(key, userId = 'default') {
  try {
    if (STORAGE_KEYS[key]) {
      const fullKey = `${STORAGE_KEY_PREFIX}${userId}_${STORAGE_KEYS[key]}`;
      const value = localStorage.getItem(fullKey);
      
      if (value !== null) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Failed to load field ${key}:`, error);
    return null;
  }
}

/**
 * Clear all hair goals data (for reset)
 * @param {string} userId - User ID
 */
export function clearHairGoals(userId = 'default') {
  try {
    Object.values(STORAGE_KEYS).forEach(storageKey => {
      const fullKey = `${STORAGE_KEY_PREFIX}${userId}_${storageKey}`;
      localStorage.removeItem(fullKey);
    });
  } catch (error) {
    console.error('Failed to clear hair goals:', error);
  }
}

/**
 * Check if hair goals data exists
 * @param {string} userId - User ID
 * @returns {boolean}
 */
export function hasHairGoalsData(userId = 'default') {
  try {
    const weeklyEntries = loadField('WEEKLY_ENTRIES', userId);
    return weeklyEntries && weeklyEntries.length > 0;
  } catch {
    return false;
  }
}

/**
 * Helpers for journey history + shared datasets
 */
export function loadRoutineSteps(userId = 'default') {
  return loadField('ROUTINE_STEPS', userId) || [];
}

export function saveRoutineSteps(steps, userId = 'default') {
  saveField('ROUTINE_STEPS', steps, userId);
}

export function loadProducts(userId = 'default') {
  return loadField('PRODUCTS', userId) || [];
}

export function saveProducts(products, userId = 'default') {
  saveField('PRODUCTS', products, userId);
}

export function loadPhotos(userId = 'default') {
  return loadField('PHOTOS', userId) || [];
}

export function savePhotos(photos, userId = 'default') {
  saveField('PHOTOS', photos, userId);
}

export function loadJourneyHistory(userId = 'default') {
  const history = loadField('JOURNEY_HISTORY', userId);
  return Array.isArray(history) ? history : [];
}

export function saveJourneyHistory(history, userId = 'default') {
  saveField('JOURNEY_HISTORY', history, userId);
}

/**
 * Append a new journey to history with validation and sanitization
 * @param {Object} entry - Journey entry to save
 * @param {string} userId - User ID
 * @returns {{ success: boolean, history: Array, errors: string[] }}
 */
export function appendJourneyHistoryEntry(entry, userId = 'default') {
  // Validate before saving
  const validation = validateJourney(entry);
  if (!validation.valid) {
    console.error('Invalid journey entry:', validation.errors);
    return { success: false, history: [], errors: validation.errors };
  }

  // Sanitize all text fields
  const sanitizedEntry = sanitizeJourney(entry);

  const history = loadJourneyHistory(userId);
  history.unshift(sanitizedEntry);
  saveJourneyHistory(history, userId);
  return { success: true, history, errors: [] };
}

/**
 * Update a journey's name and/or tagline
 * @param {string} journeyId - Journey ID to update
 * @param {Object} updates - { name?: string, tagline?: string }
 * @param {string} userId - User ID
 * @returns {{ success: boolean, journey: Object | null }}
 */
export function updateJourneyDetails(journeyId, updates, userId = 'default') {
  if (!journeyId || typeof journeyId !== 'string') {
    return { success: false, journey: null };
  }

  const history = loadJourneyHistory(userId);
  const index = history.findIndex(j => j.id === journeyId);

  if (index === -1) {
    return { success: false, journey: null };
  }

  // Sanitize updates
  if (updates.name !== undefined) {
    history[index].name = sanitizeText(updates.name, 100);
  }
  if (updates.tagline !== undefined) {
    history[index].tagline = sanitizeText(updates.tagline, 200);
  }

  saveJourneyHistory(history, userId);
  return { success: true, journey: history[index] };
}

/**
 * Get a single journey by ID
 * @param {string} journeyId - Journey ID
 * @param {string} userId - User ID
 * @returns {Object | null}
 */
export function getJourneyById(journeyId, userId = 'default') {
  if (!journeyId || typeof journeyId !== 'string') return null;
  const history = loadJourneyHistory(userId);
  return history.find(j => j.id === journeyId) || null;
}

/**
 * Weekly Checklist Helpers - Real-time task tracking per week
 * Structure: { [weekNumber]: { [stepId]: boolean } }
 */
export function loadWeeklyChecklist(userId = 'default') {
  const checklist = loadField('WEEKLY_CHECKLIST', userId);
  return checklist || {};
}

export function saveWeeklyChecklist(checklist, userId = 'default') {
  saveField('WEEKLY_CHECKLIST', checklist, userId);
}

export function getChecklistForWeek(weekNumber, userId = 'default') {
  const allChecklists = loadWeeklyChecklist(userId);
  return allChecklists[weekNumber] || {};
}

export function updateChecklistItem(weekNumber, stepId, isChecked, userId = 'default') {
  const allChecklists = loadWeeklyChecklist(userId);
  if (!allChecklists[weekNumber]) {
    allChecklists[weekNumber] = {};
  }
  allChecklists[weekNumber][stepId] = isChecked;
  saveWeeklyChecklist(allChecklists, userId);
  return allChecklists[weekNumber];
}
