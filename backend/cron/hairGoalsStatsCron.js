const cron = require("node-cron");
const { cleanupOldStats } = require("../services/communityStatsService");

/**
 * Hair Goals Stats Cleanup Cron
 *
 * Runs monthly (1st of every month at 3:00 AM) to clean up
 * anonymous community stats older than 6 months.
 *
 * Schedule: "0 3 1 * *" = At 03:00 on day 1 of every month
 */
cron.schedule("0 3 1 * *", async () => {
  console.log("[hairGoalsStatsCron] Starting monthly cleanup of old community stats...");
  try {
    const deletedCount = await cleanupOldStats();
    console.log(`[hairGoalsStatsCron] Cleaned up ${deletedCount} old stats records.`);
  } catch (error) {
    console.error("[hairGoalsStatsCron] Cleanup error:", error.message);
  }
});

console.log("[hairGoalsStatsCron] Monthly cleanup job scheduled (1st of each month at 3:00 AM)");
