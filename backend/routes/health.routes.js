/**
 * Health Check Routes
 *
 * Endpoints for system monitoring and observability
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * @route   GET /api/health
 * @desc    Basic health check (lightweight)
 * @access  Public
 */
router.get('/', healthController.basicHealth);

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with service status
 * @access  Public
 */
router.get('/detailed', healthController.detailedHealth);

/**
 * @route   GET /api/health/metrics/verification
 * @desc    Verification system metrics and tier distribution
 * @access  Public (can be protected with auth if needed)
 */
router.get('/metrics/verification', healthController.verificationMetrics);

/**
 * @route   GET /api/health/metrics/performance
 * @desc    System performance metrics
 * @access  Public (can be protected with auth if needed)
 */
router.get('/metrics/performance', healthController.performanceMetrics);

module.exports = router;
