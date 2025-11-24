/**
 * 📧 INVITE SERVICE
 *
 * Handles all business logic for the invite/referral system
 * - Send invitations via email
 * - Track invitation funnel (sent → clicked → signed_up)
 * - Anti-spam protection
 * - Analytics and reporting
 */

const Invite = require('../models/Invite');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Send an invitation
 * @param {Object} params
 * @param {String} params.userId - ID of user sending invite
 * @param {String} params.recipientEmail - Email to send invite to
 * @param {String} params.message - Optional personal message
 * @returns {Object} { success, inviteId, error }
 */
const sendInvite = async ({ userId, recipientEmail, message }) => {
  try {
    // 1. Get sender details
    const sender = await User.findById(userId).select('name firstName lastName role email');
    if (!sender) {
      return { success: false, error: 'Sender not found' };
    }

    const senderName = sender.firstName && sender.lastName
      ? `${sender.firstName} ${sender.lastName}`
      : sender.name;

    // 2. Validate recipient email
    const email = recipientEmail.toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    // 3. Check if recipient already has an account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'This person already has a SalonHub account!' };
    }

    // 4. Check if already invited recently (24 hours)
    const wasRecentlyInvited = await Invite.wasRecentlyInvited(userId, email);
    if (wasRecentlyInvited) {
      return { success: false, error: 'You already invited this person recently. Give them time to join!' };
    }

    // 5. Create invite record
    const invite = await Invite.create({
      sentBy: userId,
      senderName,
      senderRole: sender.role,
      recipientEmail: email,
      message: message || `${senderName} invited you to join SalonHub!`,
      status: 'sent'
    });

    // 6. Send invitation email
    const emailSent = await emailService.sendInviteEmail({
      recipientEmail: email,
      senderName,
      senderRole: sender.role,
      message: message || '',
      inviteId: invite._id.toString()
    });

    if (!emailSent.success) {
      // Mark invite as failed but don't delete (for analytics)
      return { success: false, error: 'Failed to send email. Please try again.' };
    }

    return {
      success: true,
      inviteId: invite._id.toString(),
      message: 'Invite sent successfully!'
    };

  } catch (error) {
    console.error('❌ Send invite error:', error);
    return { success: false, error: 'An error occurred while sending the invite' };
  }
};

/**
 * Track invite click (when recipient clicks the referral link)
 * @param {String} inviteId - ID of the invite
 * @returns {Object} { success, referrerId }
 */
const trackInviteClick = async (inviteId) => {
  try {
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    await invite.markAsClicked();

    return {
      success: true,
      referrerId: invite.sentBy.toString(),
      senderName: invite.senderName
    };
  } catch (error) {
    console.error('❌ Track invite click error:', error);
    return { success: false, error: 'Failed to track click' };
  }
};

/**
 * Complete invite (when recipient signs up)
 * @param {String} recipientEmail - Email of new user
 * @param {String} newUserId - ID of newly created user
 * @returns {Object} { success, referrerId }
 */
const completeInvite = async (recipientEmail, newUserId) => {
  try {
    const invite = await Invite.findByRecipient(recipientEmail);
    if (!invite) {
      // No invite found - direct signup
      return { success: true, referrerId: null };
    }

    await invite.markAsSignedUp(newUserId);

    // Update user's referral fields
    await User.findByIdAndUpdate(newUserId, {
      referredBy: invite.sentBy,
      referralSource: 'invite_link',
      referredAt: new Date()
    });

    return {
      success: true,
      referrerId: invite.sentBy.toString(),
      senderName: invite.senderName
    };
  } catch (error) {
    console.error('❌ Complete invite error:', error);
    return { success: false, error: 'Failed to complete invite' };
  }
};

/**
 * Get user's invite statistics
 * @param {String} userId
 * @returns {Object} { sent, clicked, signedUp, conversionRate }
 */
const getUserInviteStats = async (userId) => {
  try {
    const stats = await Invite.getUserInviteStats(userId);

    const conversionRate = stats.sent > 0
      ? Math.round((stats.signedUp / stats.sent) * 100)
      : 0;

    return {
      success: true,
      stats: {
        ...stats,
        conversionRate: `${conversionRate}%`
      }
    };
  } catch (error) {
    console.error('❌ Get invite stats error:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
};

/**
 * Get user's invite history (recent invites)
 * @param {String} userId
 * @param {Number} limit
 * @returns {Array} List of invites
 */
const getUserInviteHistory = async (userId, limit = 10) => {
  try {
    const invites = await Invite.find({ sentBy: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('recipientEmail status createdAt clickedAt signedUpAt message')
      .lean();

    return {
      success: true,
      invites
    };
  } catch (error) {
    console.error('❌ Get invite history error:', error);
    return { success: false, error: 'Failed to fetch history' };
  }
};

/**
 * Get platform-wide invite analytics (admin only)
 * @returns {Object} Aggregated stats
 */
const getPlatformInviteStats = async () => {
  try {
    const totalInvites = await Invite.countDocuments();
    const totalClicked = await Invite.countDocuments({ status: { $in: ['clicked', 'signed_up'] } });
    const totalSignedUp = await Invite.countDocuments({ status: 'signed_up' });

    const clickRate = totalInvites > 0
      ? Math.round((totalClicked / totalInvites) * 100)
      : 0;

    const conversionRate = totalInvites > 0
      ? Math.round((totalSignedUp / totalInvites) * 100)
      : 0;

    return {
      success: true,
      stats: {
        totalInvites,
        totalClicked,
        totalSignedUp,
        clickRate: `${clickRate}%`,
        conversionRate: `${conversionRate}%`
      }
    };
  } catch (error) {
    console.error('❌ Get platform stats error:', error);
    return { success: false, error: 'Failed to fetch platform stats' };
  }
};

module.exports = {
  sendInvite,
  trackInviteClick,
  completeInvite,
  getUserInviteStats,
  getUserInviteHistory,
  getPlatformInviteStats
};
