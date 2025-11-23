// backend/controllers/reportController.js

const ReportService = require('../services/reportService');
const Report = require('../models/Report');

/**
 * 🚨 PUBLIC REPORT CONTROLLER
 *
 * Handles public-facing report endpoints:
 * - Submit report
 * - View my reports
 * - Check report status
 */

/**
 * Submit a report
 * POST /api/reports
 */
exports.submitReport = async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      reason,
      description,
      evidence
    } = req.body;

    // Validate required fields
    if (!entityType || !entityId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: entityType, entityId, reason'
      });
    }

    // Validate entity type
    const validTypes = ['Business', 'Review', 'Post', 'User'];
    if (!validTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Submit report via service
    const result = await ReportService.submitReport({
      reporterId: req.user._id,
      entityType,
      entityId,
      reason,
      description,
      evidence
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: result.autoFlagged
        ? 'Report submitted. Content has been automatically flagged for review.'
        : 'Report submitted successfully. Our team will review it shortly.',
      report: {
        id: result.report._id,
        status: result.report.status,
        submittedAt: result.report.submittedAt
      },
      autoFlagged: result.autoFlagged,
      similarReportsCount: result.similarReportsCount
    });

  } catch (error) {
    console.error('❌ Submit report error:', error);

    // Handle duplicate report error
    if (error.message.includes('already reported')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle entity not found error
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

/**
 * Get my reports (reports submitted by current user)
 * GET /api/reports/my-reports
 */
exports.getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { reporter: req.user._id };

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate('reportedEntityId', 'name title') // Get entity name/title
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      reports: reports.map(r => ({
        id: r._id,
        entityType: r.reportedEntityType,
        entityId: r.reportedEntityId?._id,
        entityName: r.reportedEntityId?.name || r.reportedEntityId?.title || 'Deleted',
        reason: r.reason,
        description: r.description,
        status: r.status,
        resolution: r.resolution,
        submittedAt: r.submittedAt,
        resolvedAt: r.resolvedAt,
        autoFlagged: r.autoFlagged
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

/**
 * Get report status
 * GET /api/reports/:reportId/status
 */
exports.getReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Only allow reporter to view their own report
    if (report.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own reports'
      });
    }

    res.json({
      success: true,
      report: {
        id: report._id,
        status: report.status,
        resolution: report.resolution,
        submittedAt: report.submittedAt,
        resolvedAt: report.resolvedAt,
        autoFlagged: report.autoFlagged,
        similarReportsCount: report.similarReportsCount
      }
    });

  } catch (error) {
    console.error('❌ Get report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report status',
      error: error.message
    });
  }
};

/**
 * Get report statistics for current user
 * GET /api/reports/my-stats
 */
exports.getMyReportStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Report.aggregate([
      { $match: { reporter: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      dismissed: 0
    };

    stats.forEach(stat => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
      }
    });

    formattedStats.total = Object.values(formattedStats)
      .filter((val, key) => key !== 'total')
      .reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      stats: formattedStats
    });

  } catch (error) {
    console.error('❌ Get my report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report statistics',
      error: error.message
    });
  }
};
