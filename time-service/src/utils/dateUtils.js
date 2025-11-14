/**
 * Date Utilities for Time Manager
 * CRITICAL: All functions handle UTC midnight conversions for consistent querying
 *
 * Key Concept:
 * - taskDate is ALWAYS stored as UTC midnight (e.g., "2025-01-15T00:00:00.000Z")
 * - timeOfDay stores user's local time preference (e.g., "09:30")
 * - This ensures queries work consistently regardless of user timezone
 */

/**
 * Converts any date string to UTC midnight
 * @param {string} localIsoString - Date in ISO format (e.g., "2025-01-15" or "2025-01-15T14:30:00")
 * @returns {Date} - Date object set to UTC midnight
 *
 * Example:
 * toUtcMidnight("2025-01-15") → Date("2025-01-15T00:00:00.000Z")
 * toUtcMidnight("2025-01-15T14:30:00") → Date("2025-01-15T00:00:00.000Z")
 */
function toUtcMidnight(localIsoString) {
  if (!localIsoString) {
    throw new Error('toUtcMidnight: localIsoString is required');
  }

  // Extract just the date part (YYYY-MM-DD)
  const datePart = localIsoString.split('T')[0];

  // Create date at UTC midnight
  return new Date(`${datePart}T00:00:00.000Z`);
}

/**
 * Get start and end dates for a week (Monday to Sunday)
 * @param {string} weekStartIso - ISO date string for Monday (e.g., "2025-01-13")
 * @returns {{ start: Date, end: Date }} - Start (Monday 00:00 UTC) and end (Sunday 23:59:59.999 UTC)
 *
 * Example:
 * getWeekRange("2025-01-13") → {
 *   start: Date("2025-01-13T00:00:00.000Z"),
 *   end: Date("2025-01-19T23:59:59.999Z")
 * }
 */
function getWeekRange(weekStartIso) {
  if (!weekStartIso) {
    throw new Error('getWeekRange: weekStartIso is required');
  }

  const start = toUtcMidnight(weekStartIso);

  // End is 6 days later at 23:59:59.999
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get start and end dates for a month
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year (e.g., 2025)
 * @returns {{ start: Date, end: Date }} - Start (1st at 00:00 UTC) and end (last day at 23:59:59.999 UTC)
 *
 * Example:
 * getMonthRange(1, 2025) → {
 *   start: Date("2025-01-01T00:00:00.000Z"),
 *   end: Date("2025-01-31T23:59:59.999Z")
 * }
 */
function getMonthRange(month, year) {
  if (!month || !year) {
    throw new Error('getMonthRange: month and year are required');
  }

  if (month < 1 || month > 12) {
    throw new Error('getMonthRange: month must be between 1 and 12');
  }

  // Start: First day of month at UTC midnight
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  // End: Last day of month at 23:59:59.999 UTC
  // Create date for first day of NEXT month, then subtract 1ms
  const nextMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(nextMonth.getTime() - 1);

  return { start, end };
}

/**
 * Get today's date as UTC midnight
 * @returns {Date} - Today at UTC midnight
 *
 * Example:
 * getTodayUtc() → Date("2025-01-15T00:00:00.000Z")
 */
function getTodayUtc() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
}

/**
 * Format a Date object to YYYY-MM-DD string
 * @param {Date} date - Date object
 * @returns {string} - Date in YYYY-MM-DD format
 *
 * Example:
 * formatDateOnly(new Date("2025-01-15T14:30:00.000Z")) → "2025-01-15"
 */
function formatDateOnly(date) {
  if (!(date instanceof Date)) {
    throw new Error('formatDateOnly: date must be a Date object');
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Validate if a string is a valid time in HH:mm format
 * @param {string} timeStr - Time string (e.g., "09:30", "14:00")
 * @returns {boolean} - True if valid
 *
 * Example:
 * isValidTimeOfDay("09:30") → true
 * isValidTimeOfDay("25:00") → false
 * isValidTimeOfDay("9:30") → false (must be zero-padded)
 */
function isValidTimeOfDay(timeStr) {
  if (typeof timeStr !== 'string') return false;

  const pattern = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return pattern.test(timeStr);
}

/**
 * Get start of week (Monday) for any given date
 * @param {string|Date} date - Date string or Date object
 * @returns {Date} - Monday of that week at UTC midnight
 *
 * Example:
 * getWeekStart("2025-01-15") → Date("2025-01-13T00:00:00.000Z") (Monday)
 */
function getWeekStart(date) {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday as first day

  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
  return monday;
}

module.exports = {
  toUtcMidnight,
  getWeekRange,
  getMonthRange,
  getTodayUtc,
  formatDateOnly,
  isValidTimeOfDay,
  getWeekStart,
};
