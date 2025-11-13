const { parseISO, format, addMinutes, isWithinInterval, startOfDay, endOfDay } = require('date-fns');
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

/**
 * Time Utilities for Booking Service
 * Handles timezone conversions and time slot calculations
 */

/**
 * Parse time string (HH:mm) and create Date object for given date
 * @param {Date} date - The date
 * @param {string} timeString - Time in HH:mm format
 * @param {string} timezone - IANA timezone
 * @returns {Date} - Date object with timezone
 */
function parseTimeOnDate(date, timeString, timezone = 'America/New_York') {
  const [hours, minutes] = timeString.split(':').map(Number);
  const zonedDate = utcToZonedTime(date, timezone);
  zonedDate.setHours(hours, minutes, 0, 0);
  return zonedTimeToUtc(zonedDate, timezone);
}

/**
 * Check if a time slot overlaps with existing bookings
 * @param {Date} startTime - Proposed start time
 * @param {Date} endTime - Proposed end time
 * @param {Array} existingBookings - Array of existing bookings
 * @returns {boolean} - True if there's an overlap
 */
function hasTimeOverlap(startTime, endTime, existingBookings) {
  return existingBookings.some((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    return (
      (startTime >= bookingStart && startTime < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (startTime <= bookingStart && endTime >= bookingEnd)
    );
  });
}

/**
 * Generate available time slots for a given date and staff
 * @param {Date} date - The date to check
 * @param {Object} staffWorkingHours - Staff working hours configuration
 * @param {number} serviceDuration - Duration in minutes
 * @param {Array} existingBookings - Existing bookings for that day
 * @param {string} timezone - IANA timezone
 * @returns {Array} - Array of available slots {start, end}
 */
function generateTimeSlots(date, staffWorkingHours, serviceDuration, existingBookings = [], timezone = 'America/New_York') {
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  const dayConfig = staffWorkingHours[dayOfWeek];

  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }

  const slots = [];
  const slotInterval = 15; // 15-minute intervals
  
  const dayStart = parseTimeOnDate(date, dayConfig.start, timezone);
  const dayEnd = parseTimeOnDate(date, dayConfig.end, timezone);

  let currentSlot = dayStart;

  while (currentSlot < dayEnd) {
    const slotEnd = addMinutes(currentSlot, serviceDuration);

    // Check if slot end is within working hours
    if (slotEnd <= dayEnd) {
      const hasOverlap = hasTimeOverlap(currentSlot, slotEnd, existingBookings);
      
      if (!hasOverlap) {
        slots.push({
          start: currentSlot,
          end: slotEnd,
          available: true,
        });
      }
    }

    currentSlot = addMinutes(currentSlot, slotInterval);
  }

  return slots;
}

/**
 * Check if a time is within working hours
 * @param {Date} time - Time to check
 * @param {Object} workingHours - Working hours config
 * @param {string} timezone - IANA timezone
 * @returns {boolean}
 */
function isWithinWorkingHours(time, workingHours, timezone = 'America/New_York') {
  const zonedTime = utcToZonedTime(time, timezone);
  const dayOfWeek = format(zonedTime, 'EEEE').toLowerCase();
  const dayConfig = workingHours[dayOfWeek];

  if (!dayConfig || !dayConfig.enabled) {
    return false;
  }

  const timeStr = format(zonedTime, 'HH:mm');
  return timeStr >= dayConfig.start && timeStr <= dayConfig.end;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} formatStr - Format string
 * @param {string} timezone - IANA timezone
 * @returns {string}
 */
function formatDate(date, formatStr = 'PPpp', timezone = 'America/New_York') {
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, formatStr);
}

module.exports = {
  parseTimeOnDate,
  hasTimeOverlap,
  generateTimeSlots,
  isWithinWorkingHours,
  formatDate,
};
