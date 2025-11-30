/**
 * Seed Report Card Data Script
 *
 * Creates sample WeeklyReport data with checkIn entries to populate
 * the Report Card feature for testing/demo purposes.
 *
 * Usage:
 *   node backend/scripts/seedReportCardData.js <userId>
 *
 * Or call via API:
 *   POST /api/hair-goals/report-card/seed (requires auth)
 */

const mongoose = require("mongoose");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WeeklyReport = require("../models/WeeklyReport");
const { computeReportCard } = require("../services/reportCardService");

// Sample data for realistic entries
const SAMPLE_HABITS = [
  ["deep-conditioning", "protective-styling"],
  ["scalp-massage", "oil-treatment"],
  ["protein-treatment", "silk-pillowcase"],
  ["moisture-balance", "gentle-detangling"],
  ["low-manipulation", "leave-in"],
  ["deep-conditioning", "bond-repair"],
  ["scalp-massage", "protective-styling"],
  ["oil-treatment", "gentle-detangling"],
  ["protein-treatment", "moisture-balance"],
  ["deep-conditioning", "low-manipulation"],
  ["silk-pillowcase", "leave-in"],
  ["protective-styling", "scalp-massage"]
];

const SAMPLE_HARMS = [
  ["heat-styling"],
  ["none"],
  ["tight-styles"],
  ["none"],
  ["over-manipulation"],
  ["none"],
  ["weather-humidity"],
  ["none"],
  ["skipping-moisture"],
  ["none"],
  ["none"],
  ["heat-styling"]
];

const SAMPLE_PROUD_MOMENTS = [
  "Finally saw new growth at my edges!",
  "Got so many compliments on my wash day",
  "No breakage this whole week!",
  "My curls popped like never before",
  "Passed the 6 month no-heat mark",
  "My hair feels so soft and moisturized",
  "Reached my first length goal!",
  "Scalp felt amazing after massage routine",
  "Twist-out lasted 5 days!",
  "Less shedding than ever before",
  "My hair is finally holding moisture",
  "Protective style looked professional!"
];

const SAMPLE_PRODUCTS = [
  { id: "prod-1", name: "Olaplex No. 3", uses: 2 },
  { id: "prod-2", name: "Shea Moisture Mask", uses: 3 },
  { id: "prod-3", name: "Mielle Rosemary Oil", uses: 4 },
  { id: "prod-4", name: "Aussie 3 Minute Miracle", uses: 2 },
  { id: "prod-5", name: "Cantu Leave-In", uses: 3 },
  { id: "prod-6", name: "African Pride Moisture", uses: 2 },
  { id: "prod-7", name: "Olaplex No. 3", uses: 3 },
  { id: "prod-8", name: "Mielle Rosemary Oil", uses: 2 },
  { id: "prod-9", name: "Shea Moisture Mask", uses: 4 },
  { id: "prod-10", name: "Olaplex No. 3", uses: 2 },
  { id: "prod-11", name: "Cantu Leave-In", uses: 3 },
  { id: "prod-12", name: "Mielle Rosemary Oil", uses: 3 }
];

// Health ratings that show improvement over time (1-5)
const SAMPLE_FEELINGS = [2, 3, 3, 4, 3, 4, 4, 5, 4, 5, 4, 5];

const GOAL_PROGRESS_OPTIONS = ["none", "little", "noticeable"];

/**
 * Generate seed data for a user
 * @param {string} userId - The MongoDB ObjectId of the user
 * @param {number} weeks - Number of weeks of data to generate (default: 12)
 */
async function seedReportCardData(userId, weeks = 12) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const reports = [];

  console.log(`Generating ${weeks} weeks of sample data for user ${userId}...`);

  for (let i = 0; i < weeks; i++) {
    // Calculate dates (going backwards from now)
    const weekNumber = weeks - i;
    const weeksAgo = weeks - 1 - i;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (weeksAgo * 7) - 6);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Sample data for this week
    const healthRating = SAMPLE_FEELINGS[i % SAMPLE_FEELINGS.length];
    const habits = SAMPLE_HABITS[i % SAMPLE_HABITS.length];
    const harms = SAMPLE_HARMS[i % SAMPLE_HARMS.length];
    const proudMoment = SAMPLE_PROUD_MOMENTS[i % SAMPLE_PROUD_MOMENTS.length];
    const product = SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length];
    const goalProgress = GOAL_PROGRESS_OPTIONS[Math.min(2, Math.floor(healthRating / 2))];

    const report = {
      user: userObjectId,
      week: weekNumber,
      dates: {
        start: startDate,
        end: endDate
      },
      feeling: healthRating >= 4 ? "Great" : healthRating >= 3 ? "Good" : "Okay",
      emoji: healthRating >= 4 ? "😊" : healthRating >= 3 ? "🙂" : "😐",
      note: `Week ${weekNumber} check-in`,
      goal: "length", // Example goal
      highlightProduct: product,
      checkIn: {
        healthRating,
        goalProgress,
        whatHelped: habits,
        whatHarmed: harms,
        proudMoment
      }
    };

    reports.push(report);
  }

  // Delete existing reports for this user (optional - for clean testing)
  await WeeklyReport.deleteMany({ user: userObjectId });
  console.log("Cleared existing weekly reports");

  // Insert new reports
  await WeeklyReport.insertMany(reports);
  console.log(`Inserted ${reports.length} weekly reports`);

  // Compute the Report Card
  console.log("Computing Report Card...");
  const reportCard = await computeReportCard(userId);

  if (reportCard) {
    console.log("\n✅ Report Card Generated Successfully!");
    console.log("─".repeat(50));
    console.log(`📊 Weeks Tracked: ${reportCard.weeksTracked}`);
    console.log(`⭐ Average Feeling: ${reportCard.avgFeeling}/5`);
    console.log(`🔥 Current Streak: ${reportCard.currentStreak} weeks`);
    console.log(`📈 Trend Data Points: ${reportCard.trendData?.length || 0}`);
    console.log(`✅ Top Habits: ${reportCard.topHabits?.length || 0}`);
    console.log(`🧴 Products: ${reportCard.topProducts?.length || 0}`);
    console.log(`🏆 Wins: ${reportCard.wins?.length || 0}`);
    console.log(`🚩 Red Flags: ${reportCard.redFlags?.length || 0}`);
    console.log("─".repeat(50));
  }

  return reportCard;
}

/**
 * Run as standalone script
 */
async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: node seedReportCardData.js <userId>");
    console.error("Example: node seedReportCardData.js 64a1b2c3d4e5f6g7h8i9j0k1");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in environment");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected!\n");

    // Generate seed data
    await seedReportCardData(userId, 12);

    console.log("\n🎉 Seed data created successfully!");
    console.log("Refresh the Report Card page to see the data.");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Export for use as module
module.exports = { seedReportCardData };

// Run if called directly
if (require.main === module) {
  main();
}
