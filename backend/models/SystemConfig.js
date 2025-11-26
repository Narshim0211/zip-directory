/**
 * 🌐 SYSTEM CONFIG MODEL
 *
 * Universal configuration model for global platform settings.
 * Enables admin-controlled feature flags, toggles, and runtime configuration
 * without requiring code deployment.
 *
 * Use cases:
 * - Feature flags (comment paywall, promotions, experiments)
 * - Platform-wide settings (maintenance mode, rate limits)
 * - A/B test configuration
 *
 * Architecture:
 * - Single source of truth for all runtime configs
 * - Supports any data type (boolean, string, number, object, array)
 * - Tracks who changed what and when
 * - Cached by configService for performance (5-min TTL)
 *
 * Example records:
 * { key: 'commentPaywallEnabled', value: true }
 * { key: 'maintenanceMode', value: false }
 * { key: 'maxUploadSize', value: 5242880 }
 */

const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  // Unique identifier for this config (e.g., 'commentPaywallEnabled')
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },

  // The config value - can be any type
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Human-readable description of what this config does
  description: {
    type: String,
    default: ''
  },

  // Admin user who last updated this config (for audit trail)
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true  // Automatic createdAt and updatedAt
});

// Index for fast lookups by key
systemConfigSchema.index({ key: 1 });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
