// backend/controllers/promotionController.js

const Business = require('../models/Business');
const AuditLog = require('../models/AuditLog');

/**
 * 🎁 PROMOTION CONTROLLER
 *
 * HTTP handlers for business promotions (Phase 4 - V1 Lean Edition)
 *
 * Owner endpoints to create/manage their business promotion.
 *
 * V1 Scope:
 * - One active promotion per business
 * - Title (max 50 chars)
 * - Description (max 120 chars)
 * - Expiry date (max 90 days)
 */

/**
 * Create or update promotion for business
 *
 * @route POST /api/owner/promotion
 * @access Private (business owners only)
 * @body {
 *   businessId: string,
 *   title: string (max 50 chars),
 *   description: string (max 120 chars),
 *   expiryDays: number (3, 7, 14, or custom),
 *   customExpiresAt: date (optional, max 90 days from now)
 * }
 */
const createPromotion = async (req, res, next) => {
  try {
    const { businessId, title, description, expiryDays, customExpiresAt } = req.body;

    // Validation
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Promotion title is required'
      });
    }

    if (title.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 50 characters or less'
      });
    }

    if (description && description.length > 120) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 120 characters or less'
      });
    }

    // Get business
    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check ownership (owner field can be string or ObjectId)
    const ownerId = business.owner?.toString() || business.owner;
    const userId = req.user._id.toString();

    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this business'
      });
    }

    // Calculate expiry date
    let expiresAt;

    if (customExpiresAt) {
      expiresAt = new Date(customExpiresAt);

      // Validate custom date
      if (isNaN(expiresAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry date'
        });
      }

      // Check if date is in the future
      if (expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future'
        });
      }

      // Check if date is within 90 days
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);

      if (expiresAt > maxDate) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date cannot be more than 90 days from now'
        });
      }
    } else if (expiryDays) {
      // Validate expiry days
      const validDays = [3, 7, 14, 30, 60, 90];
      if (!validDays.includes(parseInt(expiryDays))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid expiry days. Choose 3, 7, 14, 30, 60, or 90 days'
        });
      }

      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either expiryDays or customExpiresAt is required'
      });
    }

    // Update promotion
    business.promotion = {
      title: title.trim(),
      description: description?.trim() || '',
      expiresAt,
      isActive: true,
      createdAt: new Date(),
      createdBy: req.user._id
    };

    await business.save();

    // Create audit log
    await AuditLog.create({
      action: 'create_promotion',
      performedBy: req.user._id,
      targetModel: 'Business',
      targetId: business._id,
      changes: {
        promotion: {
          title: business.promotion.title,
          expiresAt: business.promotion.expiresAt
        }
      },
      reason: 'Owner created/updated business promotion',
      metadata: {
        businessId: business._id,
        expiresAt: business.promotion.expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      promotion: {
        title: business.promotion.title,
        description: business.promotion.description,
        expiresAt: business.promotion.expiresAt,
        isActive: business.promotion.isActive,
        createdAt: business.promotion.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active promotion for my business
 *
 * @route GET /api/owner/promotion/:businessId
 * @access Private (business owners only)
 */
const getMyPromotion = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check ownership
    const ownerId = business.owner?.toString() || business.owner;
    const userId = req.user._id.toString();

    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this business'
      });
    }

    // Check if promotion exists and is active
    if (!business.promotion || !business.promotion.isActive) {
      return res.json({
        success: true,
        hasPromotion: false,
        promotion: null
      });
    }

    res.json({
      success: true,
      hasPromotion: true,
      promotion: {
        title: business.promotion.title,
        description: business.promotion.description,
        expiresAt: business.promotion.expiresAt,
        isActive: business.promotion.isActive,
        createdAt: business.promotion.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate (delete) promotion
 *
 * @route DELETE /api/owner/promotion/:businessId
 * @access Private (business owners only)
 */
const deactivatePromotion = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check ownership
    const ownerId = business.owner?.toString() || business.owner;
    const userId = req.user._id.toString();

    if (ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage this business'
      });
    }

    // Check if promotion exists
    if (!business.promotion || !business.promotion.isActive) {
      return res.status(404).json({
        success: false,
        message: 'No active promotion found'
      });
    }

    // Deactivate promotion
    business.promotion.isActive = false;
    await business.save();

    // Create audit log
    await AuditLog.create({
      action: 'deactivate_promotion',
      performedBy: req.user._id,
      targetModel: 'Business',
      targetId: business._id,
      changes: {
        promotion: {
          isActive: false
        }
      },
      reason: 'Owner manually deactivated promotion',
      metadata: {
        businessId: business._id,
        promotionTitle: business.promotion.title
      }
    });

    res.json({
      success: true,
      message: 'Promotion deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPromotion,
  getMyPromotion,
  deactivatePromotion
};
