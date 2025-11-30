const reportCardService = require("../services/reportCardService");
const { seedReportCardData } = require("../scripts/seedReportCardData");

/**
 * Report Card Controller
 *
 * Handles HTTP requests for Report Card features.
 * All endpoints require authentication.
 */

// ============================================
// GET REPORT CARD
// ============================================

/**
 * Get current user's Report Card
 * GET /api/hair-goals/report-card
 */
const getReportCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const reportCard = await reportCardService.getReportCard(userId);

    if (!reportCard) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No report card data yet. Complete your first weekly check-in to start tracking!"
      });
    }

    res.status(200).json({
      success: true,
      data: reportCard
    });
  } catch (error) {
    console.error("[reportCardController] getReportCard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch report card",
      error: error.message
    });
  }
};

// ============================================
// RECOMPUTE REPORT CARD
// ============================================

/**
 * Force recompute Report Card (on-demand refresh)
 * POST /api/hair-goals/report-card/recompute
 */
const recomputeReportCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const reportCard = await reportCardService.recomputeReportCard(userId);

    if (!reportCard) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No weekly reports with check-in data found"
      });
    }

    res.status(200).json({
      success: true,
      data: reportCard,
      message: "Report card recomputed successfully"
    });
  } catch (error) {
    console.error("[reportCardController] recomputeReportCard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to recompute report card",
      error: error.message
    });
  }
};

// ============================================
// ARCHIVE & RESET
// ============================================

/**
 * Archive current Report Card and start fresh
 * POST /api/hair-goals/report-card/archive
 * Body: { title?: string }
 */
const archiveAndReset = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title } = req.body;

    const archive = await reportCardService.archiveAndReset(userId, title);

    res.status(201).json({
      success: true,
      data: archive,
      message: "Report card archived successfully. Your new journey begins now!"
    });
  } catch (error) {
    console.error("[reportCardController] archiveAndReset error:", error);

    // Handle specific errors
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to archive report card",
      error: error.message
    });
  }
};

// ============================================
// GET ARCHIVES
// ============================================

/**
 * Get all archives for current user
 * GET /api/hair-goals/report-card/archives
 */
const getArchives = async (req, res) => {
  try {
    const userId = req.user._id;
    const archives = await reportCardService.getArchives(userId);

    res.status(200).json({
      success: true,
      data: archives,
      count: archives.length
    });
  } catch (error) {
    console.error("[reportCardController] getArchives error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch archives",
      error: error.message
    });
  }
};

/**
 * Get single archive by ID
 * GET /api/hair-goals/report-card/archives/:archiveId
 */
const getArchiveById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { archiveId } = req.params;

    const archive = await reportCardService.getArchiveById(userId, archiveId);

    res.status(200).json({
      success: true,
      data: archive
    });
  } catch (error) {
    console.error("[reportCardController] getArchiveById error:", error);

    // Handle specific errors
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch archive",
      error: error.message
    });
  }
};

// ============================================
// LABEL MAPPINGS (for frontend)
// ============================================

/**
 * Get habit and harm label mappings
 * GET /api/hair-goals/report-card/labels
 */
const getLabels = async (req, res) => {
  try {
    const { HABIT_LABELS, HARM_LABELS } = reportCardService;

    res.status(200).json({
      success: true,
      data: {
        habits: HABIT_LABELS,
        harms: HARM_LABELS
      }
    });
  } catch (error) {
    console.error("[reportCardController] getLabels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch labels",
      error: error.message
    });
  }
};

// ============================================
// SEED DATA (for testing/demo)
// ============================================

/**
 * Seed sample Report Card data for testing
 * POST /api/hair-goals/report-card/seed
 * Body: { weeks?: number } - Number of weeks to generate (default: 12)
 *
 * ⚠️ WARNING: This will clear existing weekly reports!
 * Only use in development/testing.
 */
const seedData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { weeks = 12 } = req.body;

    // Limit weeks to prevent abuse
    const safeWeeks = Math.min(Math.max(1, weeks), 24);

    console.log(`[reportCardController] Seeding ${safeWeeks} weeks of data for user ${userId}`);

    const reportCard = await seedReportCardData(userId.toString(), safeWeeks);

    if (!reportCard) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate report card from seed data"
      });
    }

    res.status(201).json({
      success: true,
      data: reportCard,
      message: `Successfully seeded ${safeWeeks} weeks of sample data!`
    });
  } catch (error) {
    console.error("[reportCardController] seedData error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed report card data",
      error: error.message
    });
  }
};

module.exports = {
  getReportCard,
  recomputeReportCard,
  archiveAndReset,
  getArchives,
  getArchiveById,
  getLabels,
  seedData
};
