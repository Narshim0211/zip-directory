const logger = require('../utils/logger');

/**
 * 🛡️ SIMPLE MODERATION SERVICE (NO AI)
 *
 * Basic keyword-based content moderation for reviews.
 * Auto-approves most reviews, flags only obvious spam/abuse.
 *
 * Future: Can add AI moderation later if needed.
 *
 * @param {string} text - The review message to moderate
 * @returns {Promise<{flagged: boolean, reason: string|null}>}
 */
exports.moderateText = async (text) => {
  try {
    // Check for obvious spam patterns
    if (exports.isSpam(text)) {
      logger.info('Review flagged as spam by keyword detection');
      return { flagged: true, reason: 'Contains spam keywords' };
    }

    // Check for excessive profanity or abusive language
    if (exports.isAbusive(text)) {
      logger.info('Review flagged as potentially abusive');
      return { flagged: true, reason: 'Contains potentially abusive language' };
    }

    // Auto-approve everything else
    return { flagged: false, reason: null };

  } catch (error) {
    logger.error(`Moderation service error: ${error.message}`);
    // Fail open: don't block reviews on error
    return { flagged: false, reason: null };
  }
};

/**
 * 🔍 SPAM DETECTION (Keyword-based)
 *
 * Checks for common spam patterns in review text.
 *
 * @param {string} text - The review message to check
 * @returns {boolean} - True if spam detected
 */
exports.isSpam = (text) => {
  const spamKeywords = [
    'click here',
    'free money',
    'viagra',
    'casino',
    'lottery',
    'winner',
    'congratulations you won',
    'act now',
    'limited time',
    'call now',
    'buy now',
    'discount code',
    'promo code',
  ];

  const lowerText = text.toLowerCase();

  // Check for URLs (most spam contains links)
  if (lowerText.includes('www.') || lowerText.includes('http')) {
    return true;
  }

  // Check for spam keywords
  return spamKeywords.some(keyword => lowerText.includes(keyword));
};

/**
 * 🚫 ABUSIVE LANGUAGE DETECTION
 *
 * Checks for common profanity or abusive language.
 * Note: This is very basic - can be enhanced with more comprehensive word list.
 *
 * @param {string} text - The review message to check
 * @returns {boolean} - True if abusive language detected
 */
exports.isAbusive = (text) => {
  const abusiveWords = [
    'fuck',
    'shit',
    'bitch',
    'asshole',
    'damn',
    'cunt',
    'bastard',
  ];

  const lowerText = text.toLowerCase();

  // Check if text contains multiple abusive words (single use might be acceptable in context)
  const count = abusiveWords.reduce((total, word) => {
    return total + (lowerText.includes(word) ? 1 : 0);
  }, 0);

  return count >= 2; // Flag only if 2+ abusive words used
};
