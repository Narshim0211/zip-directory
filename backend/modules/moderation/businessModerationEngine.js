// backend/modules/moderation/businessModerationEngine.js

const Business = require('../../models/Business');
const MODERATION_RULES = require('./rules');

/**
 * 🛡️ BUSINESS MODERATION ENGINE (NO AI)
 *
 * Rule-based evaluation system for business listing quality control.
 * Prevents fake, duplicate, incomplete, or offensive business profiles.
 *
 * Performance: < 50ms per evaluation
 * Scalability: 1k-100k businesses
 *
 * @class BusinessModerationEngine
 */
class BusinessModerationEngine {
  /**
   * Evaluate a business payload and return moderation decision.
   *
   * @param {Object} businessData - The business object to evaluate
   * @param {String} businessData._id - Business ID (for updates, to exclude self from duplicate check)
   * @param {String} businessData.name - Business name
   * @param {String} businessData.phone - Phone number
   * @param {String} businessData.address - Street address
   * @param {String} businessData.description - Business description
   * @param {String} businessData.logoUrl - Logo image URL
   * @param {String} businessData.coverPhotoUrl - Cover photo URL
   * @param {Array} businessData.photos - Photo gallery array
   * @param {Object} businessData.location - GeoJSON location {type, coordinates}
   * @param {Object} context - Evaluation context
   * @param {String} context.ip - Client IP address (for spam detection)
   * @param {String} context.ownerId - Owner user ID (for rate limiting)
   *
   * @returns {Promise<Object>} Moderation result
   * @returns {Boolean} result.approved - Whether business auto-approves
   * @returns {String} result.status - "APPROVED" or "PENDING" or "REJECTED"
   * @returns {Array<String>} result.issues - List of detected issues
   */
  static async evaluate(businessData, context = {}) {
    const issues = [];

    // ========================================
    // RULE 1: Required Fields Check
    // ========================================
    for (const field of MODERATION_RULES.BUSINESS_REQUIRED) {
      const value = businessData[field];

      // Check if field is missing or empty
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        issues.push(`Missing required field: ${field}`);
        continue;
      }

      // If field is an array, must have at least one item
      if (Array.isArray(value) && value.length === 0) {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // ========================================
    // RULE 2: Photo Gallery Check
    // ========================================
    const photoCount = Array.isArray(businessData.photos) ? businessData.photos.length : 0;

    if (photoCount < MODERATION_RULES.MIN_PHOTOS_COUNT) {
      issues.push(
        `Gallery requires at least ${MODERATION_RULES.MIN_PHOTOS_COUNT} photos (found ${photoCount})`
      );
    }

    // ========================================
    // RULE 3: Description Length Check
    // ========================================
    if (businessData.description) {
      const descLength = businessData.description.trim().length;

      if (descLength < MODERATION_RULES.MIN_DESCRIPTION_LENGTH) {
        issues.push(
          `Description must be at least ${MODERATION_RULES.MIN_DESCRIPTION_LENGTH} characters (found ${descLength})`
        );
      }
    }

    // ========================================
    // RULE 4: Profanity Check
    // ========================================
    const textToCheck = `${businessData.name || ''} ${businessData.description || ''}`.toLowerCase();

    const foundBadWord = MODERATION_RULES.BAD_WORDS.find((word) =>
      textToCheck.includes(word)
    );

    if (foundBadWord) {
      issues.push(`Contains profanity: "${foundBadWord}"`);
    }

    // ========================================
    // RULE 5: Duplicate Detection
    // ========================================
    // Check for existing business with same phone OR same coordinates
    if (businessData.phone || businessData.location?.coordinates) {
      const duplicateQuery = {
        $or: [],
      };

      // Exclude self when updating existing business
      if (businessData._id) {
        duplicateQuery._id = { $ne: businessData._id };
      }

      // Check phone number duplicate
      if (businessData.phone) {
        duplicateQuery.$or.push({ phone: businessData.phone });
      }

      // Check location coordinates duplicate (exact match)
      if (businessData.location?.coordinates && Array.isArray(businessData.location.coordinates)) {
        duplicateQuery.$or.push({
          'location.coordinates': businessData.location.coordinates,
        });
      }

      // Only run query if we have something to check
      if (duplicateQuery.$or.length > 0) {
        const duplicate = await Business.findOne(duplicateQuery).lean();

        if (duplicate) {
          issues.push('Duplicate business detected (same phone or location)');
        }
      }
    }

    // ========================================
    // RULE 6: IP Rate Limiting (Spam Prevention)
    // ========================================
    if (context.ip) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const ipCountToday = await Business.countDocuments({
        createdAt: { $gte: startOfToday },
        'metadata.ip': context.ip,
      });

      if (ipCountToday >= MODERATION_RULES.MAX_LISTINGS_PER_IP_PER_DAY) {
        issues.push(
          `IP rate limit exceeded (max ${MODERATION_RULES.MAX_LISTINGS_PER_IP_PER_DAY} listings per day)`
        );
      }
    }

    // ========================================
    // RULE 7: Owner Rate Limiting
    // ========================================
    if (context.ownerId) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const ownerCountToday = await Business.countDocuments({
        createdAt: { $gte: startOfToday },
        owner: context.ownerId,
      });

      if (ownerCountToday >= MODERATION_RULES.MAX_LISTINGS_PER_OWNER_PER_DAY) {
        issues.push(
          `Owner rate limit exceeded (max ${MODERATION_RULES.MAX_LISTINGS_PER_OWNER_PER_DAY} listings per day)`
        );
      }
    }

    // ========================================
    // FINAL DECISION
    // ========================================
    const approved = issues.length === 0;

    return {
      approved,
      status: approved ? 'APPROVED' : 'PENDING',
      issues,
    };
  }

  /**
   * Quick validation check without database queries.
   * Used for frontend validation before submission.
   *
   * @param {Object} businessData - Business data to validate
   * @returns {Object} Validation result
   */
  static validateSync(businessData) {
    const issues = [];

    // Required fields
    for (const field of MODERATION_RULES.BUSINESS_REQUIRED) {
      if (!businessData[field] || businessData[field].trim() === '') {
        issues.push(`Missing required field: ${field}`);
      }
    }

    // Description length
    if (businessData.description && businessData.description.trim().length < MODERATION_RULES.MIN_DESCRIPTION_LENGTH) {
      issues.push(`Description too short (min ${MODERATION_RULES.MIN_DESCRIPTION_LENGTH} characters)`);
    }

    // Photos count
    const photoCount = Array.isArray(businessData.photos) ? businessData.photos.length : 0;
    if (photoCount < MODERATION_RULES.MIN_PHOTOS_COUNT) {
      issues.push(`Need at least ${MODERATION_RULES.MIN_PHOTOS_COUNT} photos`);
    }

    // Profanity check
    const textToCheck = `${businessData.name || ''} ${businessData.description || ''}`.toLowerCase();
    const foundBadWord = MODERATION_RULES.BAD_WORDS.find((word) => textToCheck.includes(word));

    if (foundBadWord) {
      issues.push('Contains inappropriate language');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

module.exports = BusinessModerationEngine;
