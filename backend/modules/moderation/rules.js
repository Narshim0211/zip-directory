// backend/modules/moderation/rules.js

/**
 * 🛡️ BUSINESS MODERATION RULES (NO AI)
 *
 * Simple rule-based moderation engine for SalonHub directory quality control.
 * Prevents fake, incomplete, duplicate, or low-quality business listings.
 *
 * Designed for scalability: 1k-100k businesses, < 50ms per evaluation.
 */

const MODERATION_RULES = {
  // ========================================
  // 📋 REQUIRED FIELDS FOR PUBLIC LISTING
  // ========================================
  // Businesses missing these fields will be marked PENDING

  BUSINESS_REQUIRED: [
    "name",
    "phone",
    "address",
    "city",
    "category",
    "description",
    "logoUrl",
    "coverPhotoUrl",
  ],

  // ========================================
  // 🖼️ QUALITY THRESHOLDS
  // ========================================

  MIN_DESCRIPTION_LENGTH: 30,
  MIN_PHOTOS_COUNT: 2, // At least 2 photos in photos array

  // ========================================
  // 🚫 PROFANITY & OFFENSIVE CONTENT
  // ========================================
  // Simple word list - expandable over time
  // Checks business name + description only

  BAD_WORDS: [
    "fuck",
    "shit",
    "bitch",
    "cunt",
    "nigger",
    "faggot",
    "retard",
    "asshole",
    "dick",
    "pussy",
    "whore",
    "slut",
    "bastard",
  ],

  // ========================================
  // 🛑 SPAM & ABUSE PREVENTION
  // ========================================

  MAX_LISTINGS_PER_IP_PER_DAY: 3,
  MAX_LISTINGS_PER_PHONE: 1, // One business per phone number
  MAX_LISTINGS_PER_OWNER_PER_DAY: 3,

  // ========================================
  // ✅ AUTO-APPROVAL CRITERIA
  // ========================================
  // If ALL these are met, business auto-approves

  AUTO_APPROVE_CRITERIA: {
    hasAllRequiredFields: true,
    hasMinPhotos: true,
    hasMinDescriptionLength: true,
    noProfanity: true,
    notDuplicate: true,
    notSpam: true,
  },
};

module.exports = MODERATION_RULES;
