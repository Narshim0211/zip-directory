/**
 * Hair Diary Storage - Simple localStorage wrapper
 * Handles all data persistence for the Hair Glow-Up Diary
 */

const STORAGE_PREFIX = 'hairDiary_';

const KEYS = {
  GOAL: 'goal',
  GOAL_NOTE: 'goalNote',
  ROUTINE: 'routine',
  PHOTOS: 'photos',
  CHECKLIST: 'checklist',
  START_DATE: 'startDate',
  JOURNEY_STARTED: 'journeyStarted',
};

/**
 * Get item from localStorage
 */
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`[HairDiary] Error reading ${key}:`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[HairDiary] Error saving ${key}:`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return true;
  } catch (error) {
    console.error(`[HairDiary] Error removing ${key}:`, error);
    return false;
  }
};

// Goal Management
export const getGoal = () => getItem(KEYS.GOAL);
export const setGoal = (goal) => setItem(KEYS.GOAL, goal);

export const getGoalNote = () => getItem(KEYS.GOAL_NOTE);
export const setGoalNote = (note) => setItem(KEYS.GOAL_NOTE, note);

// Routine Management
export const getRoutine = () => getItem(KEYS.ROUTINE) || [];
export const setRoutine = (routine) => setItem(KEYS.ROUTINE, routine);

// Photo Management
export const getPhotos = () => getItem(KEYS.PHOTOS) || [];
export const setPhotos = (photos) => setItem(KEYS.PHOTOS, photos);

export const addPhoto = (photoData) => {
  const photos = getPhotos();
  photos.push({
    ...photoData,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  });
  setPhotos(photos);
  return photos;
};

// Checklist Management (completed steps for current week)
export const getChecklist = () => getItem(KEYS.CHECKLIST) || {};
export const setChecklist = (checklist) => setItem(KEYS.CHECKLIST, checklist);

export const toggleChecklistItem = (stepId) => {
  const checklist = getChecklist();
  const weekKey = getCurrentWeekKey();

  if (!checklist[weekKey]) {
    checklist[weekKey] = [];
  }

  const index = checklist[weekKey].indexOf(stepId);
  if (index > -1) {
    checklist[weekKey].splice(index, 1);
  } else {
    checklist[weekKey].push(stepId);
  }

  setChecklist(checklist);
  return checklist;
};

export const isStepCompleted = (stepId) => {
  const checklist = getChecklist();
  const weekKey = getCurrentWeekKey();
  return checklist[weekKey]?.includes(stepId) || false;
};

// Journey Start Date
export const getStartDate = () => getItem(KEYS.START_DATE);
export const setStartDate = (date) => setItem(KEYS.START_DATE, date);

export const isJourneyStarted = () => getItem(KEYS.JOURNEY_STARTED) === true;
export const startJourney = () => {
  setItem(KEYS.JOURNEY_STARTED, true);
  if (!getStartDate()) {
    setStartDate(new Date().toISOString());
  }
};

// Week Calculations
export const getCurrentWeekNumber = () => {
  const startDate = getStartDate();
  if (!startDate) return 1;

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7) || 1;
};

export const getCurrentWeekKey = () => {
  return `week_${getCurrentWeekNumber()}`;
};

// Streak Calculation
export const getStreak = () => {
  const checklist = getChecklist();
  const routine = getRoutine();

  if (routine.length === 0) return 0;

  let streak = 0;
  const currentWeek = getCurrentWeekNumber();

  // Count consecutive weeks with at least one completed step
  for (let week = currentWeek; week >= 1; week--) {
    const weekKey = `week_${week}`;
    if (checklist[weekKey] && checklist[weekKey].length > 0) {
      streak++;
    } else if (week !== currentWeek) {
      // Don't break streak for current week (still in progress)
      break;
    }
  }

  return streak;
};

// Get photo for specific week
export const getPhotoForWeek = (weekNumber) => {
  const photos = getPhotos();
  return photos.find((p) => p.week === weekNumber);
};

// Clear all data (for restart)
export const clearAllData = () => {
  Object.values(KEYS).forEach((key) => {
    removeItem(key);
  });
};

// Daily Motivational Quotes
const QUOTES = [
  "Every strand tells your story. Keep writing it beautifully.",
  "Your hair journey is a marathon, not a sprint. You're doing amazing.",
  "Small steps today lead to big transformations tomorrow.",
  "Consistency is the secret ingredient to every glow-up.",
  "Trust the process. Your hair is listening to your love.",
  "You're not just growing hair, you're growing confidence.",
  "Day by day, strand by strand, you're becoming her.",
  "The best project you'll ever work on is you.",
  "Your dedication today is your transformation tomorrow.",
  "Keep going. Your future self will thank you.",
];

export const getDailyQuote = () => {
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return QUOTES[dayOfYear % QUOTES.length];
};

export default {
  getGoal,
  setGoal,
  getGoalNote,
  setGoalNote,
  getRoutine,
  setRoutine,
  getPhotos,
  setPhotos,
  addPhoto,
  getChecklist,
  setChecklist,
  toggleChecklistItem,
  isStepCompleted,
  getStartDate,
  setStartDate,
  isJourneyStarted,
  startJourney,
  getCurrentWeekNumber,
  getStreak,
  getPhotoForWeek,
  clearAllData,
  getDailyQuote,
};
