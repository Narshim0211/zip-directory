/**
 * Cron Job Scheduler (v1.0)
 *
 * Manages all scheduled background jobs
 * Uses node-cron for scheduling
 */

const cron = require('node-cron');
const { updateOpenStatus } = require('./updateOpenStatus');

/**
 * Initialize all cron jobs
 */
function initializeCronJobs() {
  console.log('[CRON] Initializing scheduled jobs...');

  // Update "Open Now" status every hour
  // Schedule: "0 * * * *" = Every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running updateOpenStatus job...');
    try {
      const stats = await updateOpenStatus();
      if (!stats.success) {
        console.error('[CRON] updateOpenStatus failed:', stats.error);
      }
    } catch (error) {
      console.error('[CRON] updateOpenStatus crashed:', error);
    }
  });

  console.log('[CRON] ✅ Scheduled: updateOpenStatus (every hour)');

  // Optional: Run immediately on startup (for development)
  if (process.env.RUN_CRON_ON_STARTUP === 'true') {
    console.log('[CRON] Running updateOpenStatus on startup...');
    updateOpenStatus().catch(err => {
      console.error('[CRON] Startup updateOpenStatus failed:', err);
    });
  }

  console.log('[CRON] All jobs initialized successfully');
}

module.exports = { initializeCronJobs };
