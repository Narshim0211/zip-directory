/**
 * Health Check Controller
 *
 * Provides system health endpoints for monitoring and observability
 * - /api/health - Basic health check
 * - /api/health/detailed - Detailed system status
 * - /api/health/metrics - Performance and verification metrics
 */

const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/emailService');
const Business = require('../models/Business');
const logger = require('../utils/logger');

/**
 * Basic Health Check
 * Returns 200 if server is running
 */
exports.basicHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

/**
 * Detailed Health Check
 * Tests all critical services and dependencies
 */
exports.detailedHealth = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  try {
    // Database Health
    const dbState = mongoose.connection.readyState;
    health.services.database = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState],
      name: mongoose.connection.name
    };

    // Stripe API Health
    try {
      await stripe.balance.retrieve();
      health.services.stripe = {
        status: 'healthy',
        message: 'Stripe API accessible'
      };
    } catch (err) {
      health.services.stripe = {
        status: 'unhealthy',
        error: err.message
      };
      health.status = 'degraded';
    }

    // Email Service Health
    health.services.email = {
      status: emailService ? 'healthy' : 'unhealthy',
      configured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS
    };

    // Memory Health
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'healthy' : 'warning',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      percentage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`
    };

    // Overall Status
    const unhealthyServices = Object.values(health.services).filter(
      s => s.status === 'unhealthy'
    );
    if (unhealthyServices.length > 0) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Verification System Metrics
 * Returns statistics about verification tiers and usage
 */
exports.verificationMetrics = async (req, res) => {
  try {
    // Tier distribution
    const tierCounts = await Business.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const tierDistribution = {
      unverified: 0,
      basic: 0,
      fully_verified: 0
    };

    tierCounts.forEach(tier => {
      if (tier._id) {
        tierDistribution[tier._id] = tier.count;
      }
    });

    const totalBusinesses = Object.values(tierDistribution).reduce((a, b) => a + b, 0);

    // Stripe Connect adoption
    const stripeConnectedCount = await Business.countDocuments({
      'verificationSteps.stripeConnected': true
    });

    // Email/Phone verification rates
    const emailVerifiedCount = await Business.countDocuments({
      'verificationSteps.emailVerified': true
    });

    const phoneVerifiedCount = await Business.countDocuments({
      'verificationSteps.phoneVerified': true
    });

    // Average profile completion
    const avgCompletion = await Business.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$verificationSteps.profileCompleted' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      metrics: {
        totalBusinesses,
        tierDistribution,
        tierPercentages: {
          unverified: totalBusinesses > 0 ? Math.round((tierDistribution.unverified / totalBusinesses) * 100) : 0,
          basic: totalBusinesses > 0 ? Math.round((tierDistribution.basic / totalBusinesses) * 100) : 0,
          fully_verified: totalBusinesses > 0 ? Math.round((tierDistribution.fully_verified / totalBusinesses) * 100) : 0
        },
        verificationRates: {
          emailVerified: totalBusinesses > 0 ? Math.round((emailVerifiedCount / totalBusinesses) * 100) : 0,
          phoneVerified: totalBusinesses > 0 ? Math.round((phoneVerifiedCount / totalBusinesses) * 100) : 0,
          stripeConnected: totalBusinesses > 0 ? Math.round((stripeConnectedCount / totalBusinesses) * 100) : 0
        },
        averageProfileCompletion: avgCompletion[0]?.avgCompletion
          ? Math.round(avgCompletion[0].avgCompletion)
          : 0
      }
    });

  } catch (error) {
    logger.error('Metrics fetch failed:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Performance Metrics
 * Returns system performance statistics
 */
exports.performanceMetrics = (req, res) => {
  const cpuUsage = process.cpuUsage();
  const memUsage = process.memoryUsage();

  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    performance: {
      uptime: {
        seconds: Math.floor(process.uptime()),
        formatted: formatUptime(process.uptime())
      },
      cpu: {
        user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
        system: `${(cpuUsage.system / 1000000).toFixed(2)}s`
      },
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        heapPercentage: `${Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)}%`
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
};

/**
 * Helper: Format uptime into human-readable string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
