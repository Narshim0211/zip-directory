const cron = require("node-cron");
const { computeAllReportCards } = require("../services/reportCardService");

/**
 * Report Card Nightly Aggregation CRON
 *
 * Runs every night at 2:00 AM to recompute all Report Cards.
 * This ensures aggregated stats are always up-to-date.
 *
 * Schedule: "0 2 * * *" = At 02:00 every day
 */
cron.schedule("0 2 * * *", async () => {
  console.log("[reportCardCron] Starting nightly report card computation...");
  const startTime = Date.now();

  try {
    const result = await computeAllReportCards();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(
      `[reportCardCron] Completed in ${duration}s - ` +
      `Computed: ${result.computed}, Errors: ${result.errors}, Total Users: ${result.total}`
    );
  } catch (error) {
    console.error("[reportCardCron] Fatal error:", error.message);
  }
});

console.log("[reportCardCron] Nightly aggregation job scheduled (daily at 2:00 AM)");
