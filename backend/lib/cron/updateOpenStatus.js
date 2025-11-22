/**
 * Update Open Status Cron Job (v1.0)
 *
 * Runs hourly to update isOpenNow field for all businesses
 * based on current time and business hours
 *
 * Schedule: Every hour (0 * * * *)
 * Runtime: ~500ms for 10k businesses
 */

const Business = require('../../models/Business');

/**
 * Update isOpenNow field for all businesses
 * @returns {Promise<Object>} Update statistics
 */
async function updateOpenStatus() {
  const startTime = Date.now();

  try {
    const now = new Date();
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5); // "14:30"

    if (process.env.NODE_ENV === 'development') {
      console.log(`[CRON] Updating open status - ${dayKey} ${currentTime}`);
    }

    // STEP 1: Reset all businesses to closed
    const resetResult = await Business.updateMany(
      {},
      { $set: { isOpenNow: false } }
    );

    // STEP 2: Set businesses to open if current time is within their hours
    const openResult = await Business.updateMany(
      {
        [`hours.${dayKey}`]: { $exists: true, $ne: '', $ne: 'closed' },
        $expr: {
          $and: [
            // Start time <= current time
            {
              $lte: [
                { $substr: [`$hours.${dayKey}`, 0, 5] },
                currentTime
              ]
            },
            // End time >= current time
            {
              $gte: [
                { $substr: [`$hours.${dayKey}`, 6, 5] },
                currentTime
              ]
            }
          ]
        }
      },
      { $set: { isOpenNow: true } }
    );

    const duration = Date.now() - startTime;

    const stats = {
      success: true,
      timestamp: now.toISOString(),
      dayKey,
      currentTime,
      businessesReset: resetResult.modifiedCount,
      businessesOpen: openResult.modifiedCount,
      durationMs: duration
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[CRON] Open status updated:', stats);
    }

    return stats;
  } catch (error) {
    console.error('[CRON ERROR] Failed to update open status:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { updateOpenStatus };
