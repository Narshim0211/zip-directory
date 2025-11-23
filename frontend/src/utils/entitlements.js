/**
 * Frontend Entitlements Utility
 *
 * Centralized permission checks for comment features
 * Mirrors backend chatEntitlementsService logic
 *
 * Usage:
 * import { canComment, getUpgradeMessage } from '../utils/entitlements';
 *
 * const permission = canComment(currentUser);
 * if (!permission.allowed) {
 *   alert(permission.message);
 * }
 */

/**
 * Check if user can comment/reply
 * @param {Object} user - Current user object
 * @returns {Object} { allowed: boolean, reason: string, upgradeInfo: object }
 */
export const canComment = (user) => {
  if (!user) {
    return {
      allowed: false,
      reason: 'authentication_required',
      message: 'Log in to join the conversation',
      upgradeInfo: null
    };
  }

  // Premium Owners ($49/mo) - Can comment
  if (user.role === 'owner') {
    const isPremium = user.isPremium === true || user.listingType === 'premium';

    if (!isPremium) {
      return {
        allowed: false,
        reason: 'premium_required',
        message: 'Upgrade to Premium to reply to comments',
        upgradeInfo: {
          price: '$49/mo',
          benefits: [
            'Reply to comments',
            'Gold orbit badge',
            'Top placement in search',
            'Advanced analytics dashboard'
          ],
          ctaText: 'Upgrade to Premium',
          ctaLink: '/owner/subscription'
        }
      };
    }

    return {
      allowed: true,
      reason: 'premium_active',
      message: 'You can comment',
      upgradeInfo: null
    };
  }

  // Chat Pass Visitors ($9.99/mo) - Can comment
  if (user.role === 'visitor') {
    const hasChatPass = user.hasChatPass === true;
    const chatPassActive = user.chatPassExpiresAt && new Date(user.chatPassExpiresAt) > new Date();

    if (!hasChatPass || !chatPassActive) {
      return {
        allowed: false,
        reason: 'chat_pass_required',
        message: 'Unlock chat for $9.99/mo to join the conversation',
        upgradeInfo: {
          price: '$9.99/mo',
          benefits: [
            'Comment on surveys',
            'Reply to business owners',
            'Read all replies',
            'Unlimited messaging'
          ],
          ctaText: 'Unlock Chat Pass',
          ctaLink: '/visitor/chat-pass'
        }
      };
    }

    return {
      allowed: true,
      reason: 'chat_pass_active',
      message: 'You can comment',
      upgradeInfo: null
    };
  }

  // Admin - Can comment (always)
  if (user.role === 'admin') {
    return {
      allowed: true,
      reason: 'admin_access',
      message: 'You can comment',
      upgradeInfo: null
    };
  }

  // Unknown role
  return {
    allowed: false,
    reason: 'unknown_role',
    message: 'Unable to verify permissions',
    upgradeInfo: null
  };
};

/**
 * Get upgrade message for paywall
 * @param {Object} user - Current user object
 * @returns {string} Upgrade message
 */
export const getUpgradeMessage = (user) => {
  const permission = canComment(user);
  return permission.message;
};

/**
 * Get upgrade CTA text
 * @param {Object} user - Current user object
 * @returns {string} CTA button text
 */
export const getUpgradeCTA = (user) => {
  const permission = canComment(user);
  return permission.upgradeInfo?.ctaText || 'Upgrade Now';
};

/**
 * Get upgrade link
 * @param {Object} user - Current user object
 * @returns {string} Upgrade page URL
 */
export const getUpgradeLink = (user) => {
  const permission = canComment(user);
  return permission.upgradeInfo?.ctaLink || '/';
};

/**
 * Check if user has premium features (gold orbit)
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const isPremiumUser = (user) => {
  if (!user) return false;

  if (user.role === 'owner') {
    return user.isPremium === true || user.listingType === 'premium';
  }

  return false;
};

/**
 * Check if user can send messages
 * @param {Object} user - Current user object
 * @returns {Object} { allowed: boolean, reason: string }
 */
export const canSendMessage = (user) => {
  if (!user) {
    return { allowed: false, reason: 'Not authenticated' };
  }

  if (user.role === 'owner') {
    const isPremium = user.isPremium === true || user.listingType === 'premium';
    if (!isPremium) {
      return { allowed: false, reason: 'Premium subscription required' };
    }
    return { allowed: true, reason: 'Premium active' };
  }

  if (user.role === 'visitor') {
    const hasChatPass = user.hasChatPass === true;
    const chatPassActive = user.chatPassExpiresAt && new Date(user.chatPassExpiresAt) > new Date();

    if (!hasChatPass || !chatPassActive) {
      return { allowed: false, reason: 'Chat pass required' };
    }
    return { allowed: true, reason: 'Chat pass active' };
  }

  if (user.role === 'admin') {
    return { allowed: true, reason: 'Admin access' };
  }

  return { allowed: false, reason: 'Unknown role' };
};

/**
 * Format upgrade benefits as list
 * @param {Object} user - Current user object
 * @returns {Array} List of benefit strings
 */
export const getUpgradeBenefits = (user) => {
  const permission = canComment(user);
  return permission.upgradeInfo?.benefits || [];
};

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  return user.firstName || user.name || 'User';
};

/**
 * Check if comment author is premium (for gold orbit)
 * @param {Object} comment - Comment object
 * @returns {boolean}
 */
export const isCommentAuthorPremium = (comment) => {
  if (!comment) return false;
  return comment.authorType === 'owner' && comment.isPremiumAuthor === true;
};
