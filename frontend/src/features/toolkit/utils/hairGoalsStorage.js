/**
 * Local Storage Helpers for Hair Goals Diary
 * Handles all localStorage operations with error handling
 */

const STORAGE_KEY_PREFIX = 'hairGoals_';

export const STORAGE_KEYS = {
  WEEKLY_ENTRIES: 'weeklyEntries',
  START_DATE: 'startDate',
  CURRENT_STREAK: 'currentStreak',
  GOAL: 'selectedGoal',
  PHOTOS: 'photos',
  PROGRESS: 'progress',
  STICKERS: 'unlockedStickers',
  STREAK: 'streak',
  LAST_UPDATE: 'lastUpdate',
};

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
