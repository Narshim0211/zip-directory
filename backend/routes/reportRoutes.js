// backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');
const rateLimit = require('../middleWare/rateLimit');

/**
 * 🚨 PUBLIC REPORT ROUTES
 *
 * All routes require authentication (protect middleware)
 *
 * Routes:
 * - POST /api/reports - Submit a new report
 * - GET /api/reports/my-reports - Get my submitted reports
 * - GET /api/reports/my-stats - Get my report statistics
 * - GET /api/reports/:reportId/status - Get report status
 */

/**
 * @route POST /api/reports
 * @desc Submit a new report
 * @access Private (authenticated users only)
 * @body { entityType, entityId, reason, description, evidence }
 */
router.post(
  '/',
  protect,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 reports per hour
  reportController.submitReport
);

/**
 * @route GET /api/reports/my-reports
 * @desc Get all reports submitted by current user
 * @access Private (authenticated users only)
 * @query { page, limit, status }
 */
router.get('/my-reports', protect, reportController.getMyReports);

/**
 * @route GET /api/reports/my-stats
 * @desc Get report statistics for current user
 * @access Private (authenticated users only)
 */
router.get('/my-stats', protect, reportController.getMyReportStats);

/**
 * @route GET /api/reports/:reportId/status
 * @desc Get status of a specific report
 * @access Private (authenticated users only)
 */
router.get('/:reportId/status', protect, reportController.getReportStatus);

module.exports = router;
