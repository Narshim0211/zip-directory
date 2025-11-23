const cron = require("node-cron");
const Business = require("../models/Business");

/**
 * 🎁 PROMOTION EXPIRY CRON JOB
 *
 * Auto-deactivates expired promotions daily at 00:00 (midnight)
 *
 * Schedule: "0 0 * * *" = Every day at 00:00
 * - Minute: 0
 * - Hour: 0
 * - Day of month: *
 * - Month: *
 * - Day of week: *
 *
 * Phase 4 - V1 Lean Edition
 */

cron.schedule("0 0 * * *", async () => {
  console.log("🎁 [promotionCron] Checking for expired promotions...");
  try {
    const now = new Date();

    const result = await Business.updateMany(
      {
        "promotion.expiresAt": { $lt: now },
        "promotion.isActive": true
      },
      {
        $set: {
          "promotion.isActive": false
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🎁 promotionCron: Deactivated ${result.modifiedCount} expired promotion(s)`);
    } else {
      console.log("🎁 promotionCron: No expired promotions found");
    }
  } catch (error) {
    console.error("🛑 promotionCron error:", error.message);
  }
});

console.log("🎁 Promotion expiry cron job scheduled (daily at 00:00)");
