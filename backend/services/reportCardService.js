const WeeklyReport = require("../models/WeeklyReport");
const ReportCard = require("../models/ReportCard");
const ReportCardArchive = require("../models/ReportCardArchive");

/**
 * Report Card Service
 *
 * Handles all Report Card aggregation, computation, and archival logic.
 * Aggregation is done nightly via CRON, but can be triggered on-demand.
 */

// ============================================
// HABIT LABEL MAPPING
// ============================================

const HABIT_LABELS = {
  // Length
  "scalp-massage": "Scalp Massage",
  "oil-treatment": "Oil Treatment",
  "protective-styling": "Protective Styling",
  "low-manipulation": "Low Manipulation",
  // Volume
  "root-lifting": "Root Lifting Products",
  "volumizing-shampoo": "Volumizing Shampoo",
  "blow-dry-technique": "Blow Dry Technique",
  "dry-shampoo": "Dry Shampoo",
  "light-conditioner": "Light Conditioner",
  // Repair
  "deep-conditioning": "Deep Conditioning",
  "protein-treatment": "Protein Treatment",
  "heat-free": "No Heat Styling",
  "silk-pillowcase": "Silk Pillowcase",
  "bond-repair": "Bond Repair Products",
  "gentle-detangling": "Gentle Detangling",
  // Curls
  "wet-styling": "Styling on Wet Hair",
  "diffusing": "Diffusing",
  "leave-in": "Leave-in Conditioner",
  "curl-cream": "Curl Cream/Gel",
  "refresh-spray": "Refresh Spray",
  "pineapple-sleep": "Pineapple at Night",
  // Scalp
  "clarifying": "Clarifying Wash",
  "scalp-oil": "Scalp Treatment Oil",
  "gentle-shampoo": "Gentle Shampoo",
  "exfoliating": "Scalp Exfoliation",
  "less-product": "Less Product Buildup",
  // Color
  "color-safe-products": "Color-safe Products",
  "cold-water-rinse": "Cold Water Rinse",
  "less-washing": "Less Frequent Washing",
  "uv-protection": "UV Protection",
  "gloss-treatment": "Gloss Treatment",
  // Universal
  "moisture-balance": "Moisture Balance",
  "other": "Other"
};

const HARM_LABELS = {
  "heat-styling": "Heat Styling",
  "harsh-shampoo": "Harsh Shampoo",
  "tight-styles": "Tight Styles/Tension",
  "over-manipulation": "Over-manipulation",
  "skipping-moisture": "Skipping Moisture",
  "skipping-protein": "Skipping Protein",
  "weather-humidity": "Weather/Humidity",
  "chemical-treatment": "Chemical Treatment",
  "none": "Nothing",
  "other": "Other"
};

// ============================================
// CORE AGGREGATION FUNCTIONS
// ============================================

/**
 * Compute Report Card for a single user
 * This is the main aggregation function
 */
async function computeReportCard(userId) {
  // Fetch all weekly reports with checkIn data
  const reports = await WeeklyReport.find({
    user: userId,
    "checkIn.healthRating": { $exists: true, $ne: null }
  }).sort({ week: 1 });

  if (!reports.length) {
    return null;
  }

  // Calculate basic stats
  const weeksTracked = reports.length;
  const feelings = reports.map(r => r.checkIn?.healthRating).filter(Boolean);
  const avgFeeling = feelings.length
    ? Number((feelings.reduce((a, b) => a + b, 0) / feelings.length).toFixed(1))
    : 0;

  // Calculate current streak
  const currentStreak = calculateStreak(reports);

  // Section 1: Trend Data (last 12 weeks)
  const trendData = reports.slice(-12).map(r => ({
    week: r.week,
    feeling: r.checkIn?.healthRating || 0,
    date: r.dates?.start || r.createdAt
  }));

  // Section 2: Top Habits (What Actually Works)
  const topHabits = calculateHabitEffectiveness(reports);

  // Section 3: Holy Grail Products
  const topProducts = calculateProductCorrelation(reports);

  // Section 4: Biggest Wins
  const wins = extractWins(reports);

  // Section 5: Red Flags
  const redFlags = calculateRedFlags(reports);

  // Section 6: Prescription
  const prescription = generatePrescription(topHabits, redFlags, avgFeeling);

  // Find journey start date
  const journeyStartDate = reports[0]?.dates?.start || reports[0]?.createdAt;

  // Update or create ReportCard
  const reportCard = await ReportCard.findOneAndUpdate(
    { user: userId },
    {
      weeksTracked,
      avgFeeling,
      currentStreak,
      trendData,
      topHabits,
      topProducts,
      wins,
      redFlags,
      prescription,
      journeyStartDate,
      lastComputedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return reportCard;
}

/**
 * Calculate current streak (consecutive weeks)
 */
function calculateStreak(reports) {
  if (!reports.length) return 0;

  const sortedByWeek = [...reports].sort((a, b) => b.week - a.week);
  let streak = 0;
  let expectedWeek = sortedByWeek[0].week;

  for (const report of sortedByWeek) {
    if (report.week === expectedWeek) {
      streak++;
      expectedWeek--;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate habit effectiveness scores
 * Score = (weeks with habit AND feeling >= 4) / (total weeks with habit)
 */
function calculateHabitEffectiveness(reports) {
  const habitStats = {};

  for (const report of reports) {
    const habits = report.checkIn?.whatHelped || [];
    const feeling = report.checkIn?.healthRating || 0;
    const isGoodWeek = feeling >= 4;

    for (const habit of habits) {
      if (!habit || habit === "none") continue;

      if (!habitStats[habit]) {
        habitStats[habit] = { goodWeeks: 0, totalWeeks: 0 };
      }

      habitStats[habit].totalWeeks++;
      if (isGoodWeek) {
        habitStats[habit].goodWeeks++;
      }
    }
  }

  // Convert to array and calculate scores
  const habitsArray = Object.entries(habitStats)
    .filter(([_, stats]) => stats.totalWeeks >= 2) // Need at least 2 data points
    .map(([habit, stats]) => ({
      habit,
      label: HABIT_LABELS[habit] || habit,
      goodWeeks: stats.goodWeeks,
      totalWeeks: stats.totalWeeks,
      score: Math.round((stats.goodWeeks / stats.totalWeeks) * 100)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

  return habitsArray;
}

/**
 * Calculate product effectiveness based on feeling correlation
 */
function calculateProductCorrelation(reports) {
  const productStats = {};

  for (const report of reports) {
    const product = report.highlightProduct?.name;
    const feeling = report.checkIn?.healthRating || 0;

    if (!product || !feeling) continue;

    if (!productStats[product]) {
      productStats[product] = { totalFeeling: 0, count: 0 };
    }

    productStats[product].totalFeeling += feeling;
    productStats[product].count++;
  }

  // Convert to array and calculate averages
  const productsArray = Object.entries(productStats)
    .filter(([_, stats]) => stats.count >= 2) // Need at least 2 uses
    .map(([name, stats]) => ({
      name,
      avgFeeling: Number((stats.totalFeeling / stats.count).toFixed(1)),
      timesUsed: stats.count
    }))
    .sort((a, b) => b.avgFeeling - a.avgFeeling)
    .slice(0, 5); // Top 5

  return productsArray;
}

/**
 * Extract all proud moments (wins)
 */
function extractWins(reports) {
  return reports
    .filter(r => r.checkIn?.proudMoment)
    .map(r => ({
      week: r.week,
      text: r.checkIn.proudMoment,
      photo: r.photos?.[0]?.url || null,
      date: r.dates?.start || r.createdAt
    }))
    .sort((a, b) => b.week - a.week)
    .slice(0, 20); // Keep last 20 wins
}

/**
 * Calculate red flag correlations
 * Correlation = (weeks with harm AND feeling <= 2) / (total weeks with harm)
 */
function calculateRedFlags(reports) {
  const harmStats = {};

  for (const report of reports) {
    const harms = report.checkIn?.whatHarmed || [];
    const feeling = report.checkIn?.healthRating || 0;
    const isBadWeek = feeling <= 2;

    for (const harm of harms) {
      if (!harm || harm === "none") continue;

      if (!harmStats[harm]) {
        harmStats[harm] = { badWeeks: 0, totalWeeks: 0 };
      }

      harmStats[harm].totalWeeks++;
      if (isBadWeek) {
        harmStats[harm].badWeeks++;
      }
    }
  }

  // Convert to array and calculate correlations
  const redFlagsArray = Object.entries(harmStats)
    .filter(([_, stats]) => stats.totalWeeks >= 2) // Need at least 2 data points
    .map(([issue, stats]) => ({
      issue,
      label: HARM_LABELS[issue] || issue,
      badWeeks: stats.badWeeks,
      totalWeeks: stats.totalWeeks,
      correlation: Math.round((stats.badWeeks / stats.totalWeeks) * 100)
    }))
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, 5); // Top 5

  return redFlagsArray;
}

/**
 * Generate personalized prescription based on data
 */
function generatePrescription(topHabits, redFlags, avgFeeling) {
  // Get top 3 habits to continue
  const doMore = topHabits
    .slice(0, 3)
    .map(h => h.label);

  // Get top red flag to avoid
  const avoid = redFlags[0]?.label || null;

  // Calculate projected good weeks if following prescription
  // Simple heuristic: if avg feeling is X, doing top habits should push it higher
  const targetGoodWeeks = Math.min(4, Math.round(avgFeeling >= 3 ? 3 : 2));

  return {
    doMore,
    avoid,
    targetGoodWeeks
  };
}

// ============================================
// PUBLIC API FUNCTIONS
// ============================================

/**
 * Get Report Card for a user (compute if needed)
 */
async function getReportCard(userId) {
  // Check if we have a recent computation (within 24 hours)
  let reportCard = await ReportCard.findOne({ user: userId });

  if (!reportCard) {
    // First time - compute now
    reportCard = await computeReportCard(userId);
  }

  return reportCard;
}

/**
 * Force recompute Report Card
 */
async function recomputeReportCard(userId) {
  return await computeReportCard(userId);
}

/**
 * Archive current Report Card and reset
 */
async function archiveAndReset(userId, title = "My Hair Journey") {
  // Get current report card
  const reportCard = await ReportCard.findOne({ user: userId });

  if (!reportCard || reportCard.weeksTracked === 0) {
    const err = new Error("No report card data to archive");
    err.status = 400;
    throw err;
  }

  // Get first and last photos from weekly reports
  const firstReport = await WeeklyReport.findOne({
    user: userId,
    "photos.0": { $exists: true }
  }).sort({ week: 1 });

  const lastReport = await WeeklyReport.findOne({
    user: userId,
    "photos.0": { $exists: true }
  }).sort({ week: -1 });

  // Get user's current goal
  const latestReport = await WeeklyReport.findOne({ user: userId }).sort({ week: -1 });

  // Create archive
  const archive = await ReportCardArchive.create({
    user: userId,
    title: title.trim() || "My Hair Journey",
    startDate: reportCard.journeyStartDate || new Date(),
    endDate: new Date(),
    snapshot: {
      weeksTracked: reportCard.weeksTracked,
      avgFeeling: reportCard.avgFeeling,
      currentStreak: reportCard.currentStreak,
      trendData: reportCard.trendData,
      topHabits: reportCard.topHabits,
      topProducts: reportCard.topProducts,
      wins: reportCard.wins,
      redFlags: reportCard.redFlags,
      prescription: reportCard.prescription
    },
    coverPhotos: {
      first: firstReport?.photos?.[0]?.url || null,
      last: lastReport?.photos?.[0]?.url || null
    },
    goal: latestReport?.goal || null
  });

  // Reset the Report Card (but keep the document)
  await ReportCard.findOneAndUpdate(
    { user: userId },
    {
      weeksTracked: 0,
      avgFeeling: 0,
      currentStreak: 0,
      trendData: [],
      topHabits: [],
      topProducts: [],
      wins: [],
      redFlags: [],
      prescription: { doMore: [], avoid: null, targetGoodWeeks: 0 },
      journeyStartDate: new Date(),
      lastComputedAt: new Date()
    }
  );

  // Note: We're NOT deleting WeeklyReports - they remain for historical reference
  // The Report Card will rebuild from future reports only

  return archive;
}

/**
 * Get all archives for a user
 */
async function getArchives(userId) {
  return await ReportCardArchive.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("title startDate endDate snapshot.weeksTracked snapshot.avgFeeling coverPhotos goal createdAt");
}

/**
 * Get single archive by ID
 */
async function getArchiveById(userId, archiveId) {
  const archive = await ReportCardArchive.findOne({
    _id: archiveId,
    user: userId
  });

  if (!archive) {
    const err = new Error("Archive not found");
    err.status = 404;
    throw err;
  }

  return archive;
}

/**
 * Compute Report Cards for all users (called by CRON)
 */
async function computeAllReportCards() {
  // Find all users who have at least one weekly report with checkIn
  const usersWithReports = await WeeklyReport.distinct("user", {
    "checkIn.healthRating": { $exists: true, $ne: null }
  });

  let computed = 0;
  let errors = 0;

  for (const userId of usersWithReports) {
    try {
      await computeReportCard(userId);
      computed++;
    } catch (err) {
      console.error(`Failed to compute report card for user ${userId}:`, err.message);
      errors++;
    }
  }

  return { computed, errors, total: usersWithReports.length };
}

module.exports = {
  getReportCard,
  recomputeReportCard,
  archiveAndReset,
  getArchives,
  getArchiveById,
  computeAllReportCards,
  computeReportCard,
  HABIT_LABELS,
  HARM_LABELS
};
