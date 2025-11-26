/**
 * 🔐 CHAT ENTITLEMENTS SERVICE
 *
 * Single source of truth for all chat permissions.
 * Used by controllers to enforce the 4 Golden Rules.
 */

const User = require('../models/User');
const Business = require('../models/Business');
const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const { isCommentPaywallEnabled } = require('./configService');

/**
 * Check if visitor can send a message
 * Rule: First message free OR has active chat pass OR within grace period
 */
const canVisitorSend = async (visitorId, threadId) => {
  const visitor = await User.findById(visitorId);
  if (!visitor) return { allowed: false, reason: 'User not found' };

  // Check if visitor has active chat pass
  if (visitor.hasChatPass && visitor.chatPassExpiresAt && visitor.chatPassExpiresAt > new Date()) {
    return { allowed: true, reason: 'Active chat pass' };
  }

  // Check grace period (30 days after cancellation)
  if (visitor.chatPassGraceEndsAt && visitor.chatPassGraceEndsAt > new Date()) {
    return { allowed: true, reason: 'Grace period active' };
  }

  // Check if this is first message (no threadId = first message)
  if (!threadId) {
    return { allowed: true, reason: 'First free message' };
  }

  // Check message count in existing thread
  const thread = await MessageThread.findById(threadId);
  if (!thread) return { allowed: false, reason: 'Thread not found' };

  const visitorMessages = await Message.countDocuments({
    threadId,
    senderId: visitorId,
    senderRole: 'visitor',
    isDeleted: false,
  });

  if (visitorMessages === 0) {
    return { allowed: true, reason: 'First free message' };
  }

  return { allowed: false, reason: 'Chat pass required', requiresPayment: true };
};

/**
 * Check if owner can reply
 * Rule: Business must have active premium subscription
 */
const canOwnerReply = async (businessId) => {
  const business = await Business.findById(businessId);
  if (!business) return { allowed: false, reason: 'Business not found' };

  const isPremium = business.listingType === 'premium' && business.premiumSubscription?.active === true;

  if (!isPremium) {
    return { allowed: false, reason: 'Premium subscription required', requiresUpgrade: true };
  }

  return { allowed: true, reason: 'Premium active' };
};

/**
 * Check if visitor can read owner's reply
 * Rule: Has chat pass OR within grace period OR first exchange
 */
const canVisitorReadReply = async (visitorId, messageId) => {
  const visitor = await User.findById(visitorId);
  if (!visitor) return { allowed: false, reason: 'User not found' };

  const message = await Message.findById(messageId);
  if (!message) return { allowed: false, reason: 'Message not found' };

  // Message not blurred = always readable
  if (!message.isBlurred) {
    return { allowed: true, reason: 'Message not locked' };
  }

  // Check if visitor has active chat pass
  if (visitor.hasChatPass && visitor.chatPassExpiresAt && visitor.chatPassExpiresAt > new Date()) {
    return { allowed: true, reason: 'Active chat pass' };
  }

  // Check grace period
  if (visitor.chatPassGraceEndsAt && visitor.chatPassGraceEndsAt > new Date()) {
    return { allowed: true, reason: 'Grace period active' };
  }

  return { allowed: false, reason: 'Chat pass required to read reply', requiresPayment: true };
};

/**
 * Determine if FOMO banner should show
 */
const shouldShowFomoBanner = async (userId, role, threadId = null) => {
  if (role === 'owner') {
    // Check if owner's business is premium
    const business = await Business.findOne({ owner: userId });
    if (!business) return { show: false };

    const isPremium = business.listingType === 'premium' && business.premiumSubscription?.active === true;
    if (isPremium) return { show: false };

    // Has unread messages?
    const threads = await MessageThread.find({ ownerId: userId }).select('_id');
    const threadIds = threads.map(t => t._id);

    const unreadCount = await Message.countDocuments({
      threadId: { $in: threadIds },
      senderRole: 'visitor',
      isRead: false,
      isDeleted: false,
    });

    return {
      show: unreadCount > 0,
      message: `${unreadCount} client message${unreadCount !== 1 ? 's' : ''} waiting. Upgrade to reply!`,
      unreadCount
    };
  }

  if (role === 'visitor') {
    const visitor = await User.findById(userId);
    if (!visitor) return { show: false };

    // Has active chat pass?
    if (visitor.hasChatPass && visitor.chatPassExpiresAt && visitor.chatPassExpiresAt > new Date()) {
      return { show: false };
    }

    // Has blurred messages?
    if (threadId) {
      const blurredCount = await Message.countDocuments({
        threadId,
        isBlurred: true,
        senderRole: 'owner',
        isDeleted: false,
      });

      if (blurredCount > 0) {
        return { show: true, message: 'Owner replied! Unlock to read.', blurredCount };
      }
    }

    return { show: false };
  }

  return { show: false };
};

/**
 * Check if user can write comments on surveys
 * Rule: Premium owners OR Chat Pass subscribers only
 * Used by comments system to enforce paywall
 *
 * GLOBAL OVERRIDE: If admin disables paywall via toggle, everyone can comment freely
 */
const canComment = async (userId, role) => {
  if (!userId || !role) return { allowed: false, reason: 'User not authenticated' };

  // 🌐 GLOBAL ADMIN OVERRIDE - Check if paywall is disabled
  const paywallEnabled = await isCommentPaywallEnabled();
  if (!paywallEnabled) {
    return { allowed: true, reason: 'Paywall disabled by admin' };
  }

  if (role === 'owner') {
    // Check if owner's business is Premium
    const business = await Business.findOne({ owner: userId });
    if (!business) return { allowed: false, reason: 'Business not found' };

    const isPremium = business.listingType === 'premium' && business.premiumSubscription?.active === true;

    if (!isPremium) {
      return {
        allowed: false,
        reason: 'Premium subscription required',
        requiresUpgrade: true,
        upgradePrice: '$49/mo',
        upgradeBenefits: ['Reply to comments', 'Gold orbit badge', 'Top placement', 'Analytics dashboard']
      };
    }

    return { allowed: true, reason: 'Premium active' };
  }

  if (role === 'visitor') {
    const visitor = await User.findById(userId);
    if (!visitor) return { allowed: false, reason: 'User not found' };

    // Check if visitor has active chat pass
    if (visitor.hasChatPass && visitor.chatPassExpiresAt && visitor.chatPassExpiresAt > new Date()) {
      return { allowed: true, reason: 'Active chat pass' };
    }

    // Check grace period (30 days after cancellation)
    if (visitor.chatPassGraceEndsAt && visitor.chatPassGraceEndsAt > new Date()) {
      return { allowed: true, reason: 'Grace period active' };
    }

    return {
      allowed: false,
      reason: 'Chat pass required',
      requiresPayment: true,
      upgradePrice: '$9.99/mo',
      upgradeBenefits: ['Comment on surveys', 'Reply to owners', 'Read all replies', 'Unlimited chat']
    };
  }

  return { allowed: false, reason: 'Unknown role' };
};

module.exports = {
  canVisitorSend,
  canOwnerReply,
  canVisitorReadReply,
  shouldShowFomoBanner,
  canComment, // NEW: Comment permissions
};
