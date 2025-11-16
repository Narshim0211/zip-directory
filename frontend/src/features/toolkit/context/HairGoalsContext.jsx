import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadHairGoals, saveHairGoals, saveField, loadField } from '../utils/hairGoalsStorage';
import { getStreak } from '../utils/hairGoalsReportGenerator';

export const HairGoalsContext = createContext();

export function useHairGoals() {
  const context = useContext(HairGoalsContext);
  if (!context) {
    throw new Error('useHairGoals must be used within HairGoalsProvider');
  }
  return context;
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
   */
  const getCurrentWeekNumber = () => {
    if (!startDate) return 1;
    
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return diffWeeks || 1;
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

  const value = {
    // State
    weeklyEntries,
    currentStreak,
    startDate,
    isLoading,
    
    // Getters
    getCurrentWeekNumber,
    getCurrentWeekEntry,
    getLatestEntry,
    getEntryByWeek,
    isEntryComplete,
    
    // Setters
    addOrUpdateWeeklyEntry,
    deleteEntry,
    resetAllData,
  };

  return (
    <HairGoalsContext.Provider value={value}>
      {children}
    </HairGoalsContext.Provider>
  );
}
