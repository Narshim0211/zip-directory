const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const Business = require('../models/Business');
const User = require('../models/User');
const { canVisitorSend, canOwnerReply, canVisitorReadReply, shouldShowFomoBanner } = require('../services/chatEntitlementsService');
const logger = require('../utils/logger');

/**
 * VISITOR: Send a message to a business
 * POST /api/v1/visitor/messages/send
 */
const visitorSendMessage = async (req, res) => {
  try {
    const visitorId = req.user.id;
    const { businessId, text, photoUrl } = req.body;

    if (!businessId || !text) {
      return res.status(400).json({ success: false, message: 'Business ID and message text required' });
    }

    // Find or create thread
    let thread = await MessageThread.findOne({ businessId, visitorId });

    // Check entitlement
    const entitlement = await canVisitorSend(visitorId, thread?._id);
    if (!entitlement.allowed) {
      return res.status(403).json({
        success: false,
        message: entitlement.reason,
        requiresPayment: entitlement.requiresPayment,
      });
    }

    // If no thread exists, create one
    if (!thread) {
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }

      thread = await MessageThread.create({
        businessId,
        visitorId,
        ownerId: business.owner,
        status: 'OPEN',
        lastMessageAt: new Date(),
      });

      logger.info('New message thread created', { threadId: thread._id, visitorId, businessId });
    }

    // Create message
    const message = await Message.create({
      threadId: thread._id,
      senderId: visitorId,
      senderRole: 'visitor',
      text,
      photoUrl: photoUrl || '',
      isBlurred: false,
    });

    // Update thread timestamp
    thread.lastMessageAt = new Date();
    await thread.save();

    logger.info('Visitor message sent', { messageId: message._id, threadId: thread._id });

    res.json({
      success: true,
      message: 'Message sent',
      threadId: thread._id,
      messageId: message._id,
    });
  } catch (error) {
    logger.error('Visitor send message failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/**
 * OWNER: Reply to a visitor message
 * POST /api/v1/owner/messages/reply
 */
const ownerReplyMessage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { threadId, text, photoUrl } = req.body;

    if (!threadId || !text) {
      return res.status(400).json({ success: false, message: 'Thread ID and message text required' });
    }

    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Verify owner owns this thread
    if (thread.ownerId.toString() !== ownerId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if business is premium
    const entitlement = await canOwnerReply(thread.businessId);
    if (!entitlement.allowed) {
      return res.status(403).json({
        success: false,
        message: entitlement.reason,
        requiresUpgrade: entitlement.requiresUpgrade,
      });
    }

    // Check if visitor has chat pass to determine if message should be blurred
    const visitor = await User.findById(thread.visitorId);
    const hasActiveChatPass = visitor.hasChatPass && visitor.chatPassExpiresAt && visitor.chatPassExpiresAt > new Date();
    const inGracePeriod = visitor.chatPassGraceEndsAt && visitor.chatPassGraceEndsAt > new Date();

    const shouldBlur = !hasActiveChatPass && !inGracePeriod;

    // Create owner's reply
    const message = await Message.create({
      threadId: thread._id,
      senderId: ownerId,
      senderRole: 'owner',
      text,
      photoUrl: photoUrl || '',
      isBlurred: shouldBlur,
    });

    // Update thread
    thread.lastMessageAt = new Date();
    thread.hasOwnerReplied = true;
    if (shouldBlur) {
      thread.visitorHasSeenOwnerReply = false; // Reset for FOMO email trigger
    }
    await thread.save();

    logger.info('Owner reply sent', {
      messageId: message._id,
      threadId: thread._id,
      isBlurred: shouldBlur,
    });

    res.json({
      success: true,
      message: 'Reply sent',
      messageId: message._id,
      isBlurred: shouldBlur,
    });
  } catch (error) {
    logger.error('Owner reply failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

/**
 * VISITOR: Get inbox (list of threads)
 * GET /api/v1/visitor/messages/inbox
 */
const visitorGetInbox = async (req, res) => {
  try {
    const visitorId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const threads = await MessageThread.find({ visitorId })
      .populate('businessId', 'name logoUrl city')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MessageThread.countDocuments({ visitorId });

    // Get unread counts and FOMO banners for each thread
    const threadsWithMeta = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await Message.countDocuments({
          threadId: thread._id,
          senderRole: 'owner',
          isRead: false,
          isDeleted: false,
        });

        const fomo = await shouldShowFomoBanner(visitorId, 'visitor', thread._id);

        return {
          _id: thread._id,
          business: thread.businessId,
          lastMessageAt: thread.lastMessageAt,
          status: thread.status,
          unreadCount,
          hasBlurredReplies: fomo.show,
        };
      })
    );

    res.json({
      success: true,
      threads: threadsWithMeta,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Visitor get inbox failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get inbox' });
  }
};

/**
 * OWNER: Get inbox (list of threads)
 * GET /api/v1/owner/messages/inbox
 */
const ownerGetInbox = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const threads = await MessageThread.find({ ownerId })
      .populate('visitorId', 'name avatarUrl')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MessageThread.countDocuments({ ownerId });

    // Get unread counts for each thread
    const threadsWithMeta = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await Message.countDocuments({
          threadId: thread._id,
          senderRole: 'visitor',
          isRead: false,
          isDeleted: false,
        });

        return {
          _id: thread._id,
          visitor: thread.visitorId,
          lastMessageAt: thread.lastMessageAt,
          status: thread.status,
          unreadCount,
        };
      })
    );

    res.json({
      success: true,
      threads: threadsWithMeta,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Owner get inbox failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get inbox' });
  }
};

/**
 * Get thread messages
 * GET /api/v1/messages/thread/:threadId
 */
const getThreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Verify user is part of this thread
    if (thread.visitorId.toString() !== userId && thread.ownerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ threadId, isDeleted: false })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments({ threadId, isDeleted: false });

    // Filter blurred messages for visitor
    const userRole = thread.visitorId.toString() === userId ? 'visitor' : 'owner';
    const processedMessages = messages.map((msg) => {
      if (msg.isBlurred && userRole === 'visitor') {
        return {
          _id: msg._id,
          threadId: msg.threadId,
          senderRole: msg.senderRole,
          text: '[Message locked - Unlock with Chat Pass]',
          isBlurred: true,
          createdAt: msg.createdAt,
        };
      }
      return msg;
    });

    res.json({
      success: true,
      messages: processedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get thread messages failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};

/**
 * Mark messages as read
 * PUT /api/v1/messages/mark-read
 */
const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.body;

    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Verify user is part of this thread
    if (thread.visitorId.toString() !== userId && thread.ownerId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Mark all messages from the other party as read
    const userRole = thread.visitorId.toString() === userId ? 'visitor' : 'owner';
    const otherRole = userRole === 'visitor' ? 'owner' : 'visitor';

    await Message.updateMany(
      { threadId, senderRole: otherRole, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    logger.error('Mark messages read failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
};

module.exports = {
  visitorSendMessage,
  ownerReplyMessage,
  visitorGetInbox,
  ownerGetInbox,
  getThreadMessages,
  markMessagesRead,
};
