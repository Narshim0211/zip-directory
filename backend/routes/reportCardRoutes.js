const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const reportCardController = require("../controllers/reportCardController");

/**
 * Report Card Routes
 *
 * Base path: /api/hair-goals/report-card
 * All routes require authentication
 */

// ============================================
// REPORT CARD ROUTES
// ============================================

// Get current user's report card
// GET /api/hair-goals/report-card
router.get("/", protect, reportCardController.getReportCard);

// Force recompute report card
// POST /api/hair-goals/report-card/recompute
router.post("/recompute", protect, reportCardController.recomputeReportCard);

// Get label mappings (habits/harms)
// GET /api/hair-goals/report-card/labels
router.get("/labels", protect, reportCardController.getLabels);

// ============================================
// SEED DATA (for testing/demo)
// ============================================

// Seed sample data for testing the Report Card UI
// POST /api/hair-goals/report-card/seed
// Body: { weeks?: number }
router.post("/seed", protect, reportCardController.seedData);

// ============================================
// ARCHIVE ROUTES
// ============================================

// Get all archives for user
// GET /api/hair-goals/report-card/archives
router.get("/archives", protect, reportCardController.getArchives);

// Archive current report card and start fresh
// POST /api/hair-goals/report-card/archives
router.post("/archives", protect, reportCardController.archiveAndReset);

// Get single archive by ID
// GET /api/hair-goals/report-card/archives/:archiveId
router.get("/archives/:archiveId", protect, reportCardController.getArchiveById);

module.exports = router;
