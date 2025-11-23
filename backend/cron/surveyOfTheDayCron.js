const cron = require('node-cron');
const { refreshSurveyOfTheDay, getCacheStatus } = require('../services/surveyOfTheDayService');
const logger = require('../utils/logger');

/**
 * Survey of the Day Cron Job
 *
 * Automatically refreshes Survey of the Day daily at midnight (00:00)
 * Ensures fresh, trending content is featured every day
 *
 * Schedule: Every day at 00:00 (midnight)
 * Cron Expression: 0 0 * * * (minute hour day month weekday)
 */

// Schedule: Every day at midnight
const REFRESH_SCHEDULE = '0 0 * * *'; // 00:00 every day

// Optional: Test schedule (every 5 minutes for testing)
// const REFRESH_SCHEDULE = '*/5 * * * *'; // Uncomment for testing

let cronJob = null;

/**
 * Start Survey of the Day cron job
 */
function startSurveyOfTheDayCron() {
  if (cronJob) {
    logger.warn('[SurveyOfTheDay Cron] Job already running');
    return;
  }

  logger.info(`[SurveyOfTheDay Cron] Starting with schedule: ${REFRESH_SCHEDULE}`);

  cronJob = cron.schedule(REFRESH_SCHEDULE, async () => {
    try {
      logger.info('[SurveyOfTheDay Cron] Refreshing Survey of the Day...');

      // Get cache status before refresh
      const beforeStatus = getCacheStatus();
      logger.info('[SurveyOfTheDay Cron] Cache status before refresh:', beforeStatus);

      // Refresh Survey of the Day
      const newSurvey = await refreshSurveyOfTheDay();

      if (newSurvey) {
        logger.info('[SurveyOfTheDay Cron] ✅ Successfully refreshed Survey of the Day:', newSurvey._id);
        logger.info('[SurveyOfTheDay Cron] New survey question:', newSurvey.question);
      } else {
        logger.warn('[SurveyOfTheDay Cron] ⚠️ No eligible survey found');
      }

      // Get cache status after refresh
      const afterStatus = getCacheStatus();
      logger.info('[SurveyOfTheDay Cron] Cache status after refresh:', afterStatus);
    } catch (error) {
      logger.error('[SurveyOfTheDay Cron] ❌ Error refreshing Survey of the Day:', error);
    }
  });

  logger.info('[SurveyOfTheDay Cron] ✅ Cron job started successfully');
}

/**
 * Stop Survey of the Day cron job
 */
function stopSurveyOfTheDayCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('[SurveyOfTheDay Cron] Cron job stopped');
  }
}

/**
 * Get cron job status
 */
function getCronJobStatus() {
  return {
    isRunning: !!cronJob,
    schedule: REFRESH_SCHEDULE,
    nextExecution: cronJob ? 'Scheduled' : 'Not scheduled',
  };
}

module.exports = {
  startSurveyOfTheDayCron,
  stopSurveyOfTheDayCron,
  getCronJobStatus,
};
