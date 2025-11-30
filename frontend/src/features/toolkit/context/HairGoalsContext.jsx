import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadHairGoals, saveField } from '../utils/hairGoalsStorage';
import { getStreak } from '../utils/hairGoalsReportGenerator';

export const HairGoalsContext = createContext();

export function useHairGoals() {
  const context = useContext(HairGoalsContext);
  if (!context) {
    throw new Error('useHairGoals must be used within HairGoalsProvider');
  }
  return context;
}

/**
 * Helper: Format date as "Mar 15"
 */
function formatShortDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Helper: Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper: Get days remaining until end date
 */
function getDaysRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function HairGoalsProvider({ children, userId = 'default' }) {
  const [weeklyEntries, setWeeklyEntries] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    try {
      const data = loadHairGoals(userId);

      if (data.WEEKLY_ENTRIES) {
        setWeeklyEntries(data.WEEKLY_ENTRIES);
        setCurrentStreak(getStreak(data.WEEKLY_ENTRIES));
      }

      if (data.START_DATE) {
        setStartDate(data.START_DATE);
      }

    } catch (error) {
      console.error('Failed to load hair goals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save to storage whenever entries change
  useEffect(() => {
    if (!isLoading && weeklyEntries.length > 0) {
      try {
        saveField('WEEKLY_ENTRIES', weeklyEntries, userId);
        
        // Update streak
        const streak = getStreak(weeklyEntries);
        setCurrentStreak(streak);
        saveField('CURRENT_STREAK', streak, userId);
        
        // Set start date if not set
        if (!startDate) {
          const sorted = [...weeklyEntries].sort((a, b) => a.weekNumber - b.weekNumber);
          if (sorted.length > 0) {
            const firstDate = sorted[0].date || new Date().toISOString();
            setStartDate(firstDate);
            saveField('START_DATE', firstDate, userId);
          }
        }
      } catch (error) {
        console.error('Failed to save hair goals:', error);
      }
    }
  }, [weeklyEntries, userId, isLoading, startDate]);

  /**
   * Get current week number based on start date
   * Week = 7 days from journey start, personal to each user
   */
  const getCurrentWeekNumber = () => {
    if (!startDate) return 1;

    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return Math.max(1, weekNumber);
  };

  /**
   * Get detailed info about a specific week (start date, end date, days remaining)
   * @param {number} weekNumber - The week number (1-based)
   * @returns {Object} - Week info with startDate, endDate, formatted strings, daysRemaining
   */
  const getWeekInfo = (weekNumber = null) => {
    const targetWeek = weekNumber || getCurrentWeekNumber();
    const journeyStart = startDate ? new Date(startDate) : new Date();

    // Calculate this week's start date (journey start + (weekNumber - 1) * 7 days)
    const weekStartDate = addDays(journeyStart, (targetWeek - 1) * 7);
    const weekEndDate = addDays(weekStartDate, 6);

    // Calculate progress through the week (0-100)
    const now = new Date();
    const dayOfWeek = Math.floor((now - weekStartDate) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.max(0, ((dayOfWeek + 1) / 7) * 100));

    return {
      weekNumber: targetWeek,
      startDate: weekStartDate,
      endDate: weekEndDate,
      startFormatted: formatShortDate(weekStartDate),
      endFormatted: formatShortDate(weekEndDate),
      daysRemaining: getDaysRemaining(weekEndDate),
      progressPercent: Math.round(progressPercent),
      isCurrentWeek: targetWeek === getCurrentWeekNumber(),
      isPastWeek: targetWeek < getCurrentWeekNumber(),
      isFutureWeek: targetWeek > getCurrentWeekNumber()
    };
  };

  /**
   * Get entry for specific week
   */
  const getEntryByWeek = (weekNumber) => {
    return weeklyEntries.find(e => e.weekNumber === weekNumber);
  };

  /**
   * Get current week's entry
   */
  const getCurrentWeekEntry = () => {
    const currentWeek = getCurrentWeekNumber();
    return getEntryByWeek(currentWeek);
  };

  /**
   * Get latest entry (highest week number)
   */
  const getLatestEntry = () => {
    if (weeklyEntries.length === 0) return null;
    return weeklyEntries.sort((a, b) => b.weekNumber - a.weekNumber)[0];
  };

  /**
   * Add or update weekly entry
   */
  const addOrUpdateWeeklyEntry = (entryPartial) => {
    try {
      const weekNumber = entryPartial.weekNumber || getCurrentWeekNumber();
      const date = entryPartial.date || new Date().toISOString();
      
      setWeeklyEntries(prevEntries => {
        const existingIndex = prevEntries.findIndex(e => e.weekNumber === weekNumber);
        
        if (existingIndex >= 0) {
          // Update existing entry
          const updated = [...prevEntries];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...entryPartial,
            weekNumber,
            date,
          };
          return updated;
        } else {
          // Add new entry
          return [...prevEntries, {
            id: `week-${weekNumber}`,
            weekNumber,
            date,
            ...entryPartial,
          }];
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add/update weekly entry:', error);
      return false;
    }
  };

  /**
   * Delete entry (for testing/reset)
   */
  const deleteEntry = (weekNumber) => {
    setWeeklyEntries(prevEntries => 
      prevEntries.filter(e => e.weekNumber !== weekNumber)
    );
  };

  /**
   * Reset all data
   */
  const resetAllData = () => {
    try {
      setWeeklyEntries([]);
      setCurrentStreak(0);
      setStartDate(null);
      
      // Clear storage
      saveField('WEEKLY_ENTRIES', [], userId);
      saveField('CURRENT_STREAK', 0, userId);
      saveField('START_DATE', null, userId);
      
      return true;
    } catch (error) {
      console.error('Failed to reset data:', error);
      return false;
    }
  };

  /**
   * Check if entry is complete (has both data and photo)
   */
  const isEntryComplete = (weekNumber) => {
    const entry = getEntryByWeek(weekNumber);
    if (!entry) return false;
    
    return !!(
      entry.goal &&
      entry.hairFeeling &&
      entry.photoUri
    );
  };

  /**
   * Initialize journey with a start date (called when user starts their journey)
   */
  const initializeJourney = (customStartDate = null) => {
    const journeyStartDate = customStartDate || new Date().toISOString();
    setStartDate(journeyStartDate);
    saveField('START_DATE', journeyStartDate, userId);
    return journeyStartDate;
  };

  const value = {
    // State
    weeklyEntries,
    currentStreak,
    startDate,
    isLoading,

    // Getters
    getCurrentWeekNumber,
    getWeekInfo,
    getCurrentWeekEntry,
    getLatestEntry,
    getEntryByWeek,
    isEntryComplete,

    // Setters
    addOrUpdateWeeklyEntry,
    deleteEntry,
    resetAllData,
    initializeJourney,
  };

  return (
    <HairGoalsContext.Provider value={value}>
      {children}
    </HairGoalsContext.Provider>
  );
}
