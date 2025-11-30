const MessageThread = require('../models/MessageThread');
const Message = require('../models/Message');
const Business = require('../models/Business');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * UNIVERSAL: Send a message (100% FREE - NO PAYWALL)
 * POST /api/v1/messages/send
 *
 * Supports universal messaging:
 * - threadType='business' → Message to business listing
 * - threadType='owner' → Message to owner personal profile
 * - threadType='visitor' → Message to visitor personal profile
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const { threadType, businessId, ownerId, visitorId: targetVisitorId, text, photoUrl } = req.body;

    // DEBUG: Log incoming request
    logger.info('sendMessage request received', {
      senderId,
      senderRole,
      body: req.body
    });

    // Validation
    if (!threadType || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'threadType and text are required' });
    }

    if (!['business', 'owner', 'visitor'].includes(threadType)) {
      return res.status(400).json({ success: false, message: 'threadType must be "business", "owner", or "visitor"' });
    }

    // Find or create thread
    let thread;
    let targetOwnerId;
    let visitorId = senderRole === 'visitor' ? senderId : null;

    if (threadType === 'business') {
      // Business thread
      if (!businessId) {
        return res.status(400).json({ success: false, message: 'businessId required for business threads' });
      }

      thread = await MessageThread.findOne({ businessId, visitorId: senderId, threadType: 'business' });

      if (!thread) {
        const business = await Business.findById(businessId);
        if (!business) {
          return res.status(404).json({ success: false, message: 'Business not found' });
        }

        targetOwnerId = business.owner;

        thread = await MessageThread.create({
          threadType: 'business',
          businessId,
          visitorId: senderId,
          ownerId: targetOwnerId,
          status: 'OPEN',
          lastMessageAt: new Date(),
        });

        logger.info('New business thread created', { threadId: thread._id, senderId, businessId });
      }
    } else if (threadType === 'owner') {
      // Owner personal thread
      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'ownerId required for owner threads' });
      }

      // Find existing thread (could be from either direction)
      thread = await MessageThread.findOne({
        $or: [
          { ownerId, visitorId: senderId, threadType: 'owner' },
          { ownerId: senderId, visitorId: ownerId, threadType: 'owner' } // Reverse for owner-to-owner
        ]
      });

      if (!thread) {
        const owner = await User.findById(ownerId);
        if (!owner) {
          return res.status(404).json({ success: false, message: 'Target user not found' });
        }

        // Determine who is visitor and who is owner for the thread
        visitorId = senderRole === 'visitor' ? senderId : ownerId;
        targetOwnerId = senderRole === 'visitor' ? ownerId : senderId;

        thread = await MessageThread.create({
          threadType: 'owner',
          // Note: Do NOT set businessId at all (not even null) for owner threads
          // This allows the sparse unique index to skip these documents
          visitorId,
          ownerId: targetOwnerId,
          status: 'OPEN',
          lastMessageAt: new Date(),
        });

        logger.info('New owner thread created', { threadId: thread._id, senderId, ownerId });
      }
    } else if (threadType === 'visitor') {
      // Visitor personal thread (visitor-to-visitor or owner-to-visitor)
      if (!targetVisitorId) {
        return res.status(400).json({ success: false, message: 'visitorId required for visitor threads' });
      }

      // Find existing thread (bidirectional)
      thread = await MessageThread.findOne({
        $or: [
          { visitorId: senderId, targetUserId: targetVisitorId, threadType: 'visitor' },
          { visitorId: targetVisitorId, targetUserId: senderId, threadType: 'visitor' }
        ]
      });

      if (!thread) {
        const targetUser = await User.findById(targetVisitorId);
        if (!targetUser) {
          return res.status(404).json({ success: false, message: 'Target user not found' });
        }

        thread = await MessageThread.create({
          threadType: 'visitor',
          // Note: Do NOT set businessId at all (not even null) for visitor threads
          // This allows the sparse unique index to skip these documents
          visitorId: senderId,
          ownerId: senderId, // Set to sender for indexing purposes
          targetUserId: targetVisitorId,
          status: 'OPEN',
          lastMessageAt: new Date(),
        });

        logger.info('New visitor thread created', { threadId: thread._id, senderId, targetVisitorId });
      }
    }

    // Create message (100% free, no blur logic)
    const message = await Message.create({
      threadId: thread._id,
      senderId,
      senderRole,
      text: text.trim(),
      photoUrl: photoUrl || '',
    });

    // Update thread
    thread.lastMessageAt = new Date();
    // Safe null checks for unread flags
    if (thread.ownerId) {
      thread.unreadByOwner = senderId.toString() !== thread.ownerId.toString();
    }
    if (thread.visitorId) {
      thread.unreadByVisitor = senderId.toString() !== thread.visitorId.toString();
    }
    await thread.save();

    logger.info('Message sent', { messageId: message._id, threadId: thread._id, threadType });

    res.json({
      success: true,
      message: 'Message sent',
      threadId: thread._id,
      messageId: message._id,
    });
  } catch (error) {
    logger.error('Send message failed', {
      error: error.message,
      stack: error.stack,
      senderId,
      threadType,
      businessId,
      ownerId,
      visitorId: targetVisitorId
    });
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

/**
 * OWNER: Reply to a visitor message (100% FREE - NO PAYWALL)
 * POST /api/v1/messages/reply
 */
const replyMessage = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { threadId, text, photoUrl } = req.body;

    if (!threadId || !text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'threadId and text are required' });
    }

    const thread = await MessageThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Verify owner owns this thread
    if (thread.ownerId.toString() !== ownerId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Create owner's reply (100% free, no blur logic)
    const message = await Message.create({
      threadId: thread._id,
      senderId: ownerId,
      senderRole: 'owner',
      text: text.trim(),
      photoUrl: photoUrl || '',
    });

    // Update thread
    thread.lastMessageAt = new Date();
    thread.unreadByOwner = false;
    thread.unreadByVisitor = true;
    await thread.save();

    logger.info('Owner reply sent', { messageId: message._id, threadId: thread._id });

    res.json({
      success: true,
      message: 'Reply sent',
      messageId: message._id,
    });
  } catch (error) {
    logger.error('Owner reply failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

/**
 * VISITOR: Get inbox (list of threads)
 * GET /api/v1/messages/inbox/visitor
 */
const getVisitorInbox = async (req, res) => {
  try {
    const visitorId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const threads = await MessageThread.find({ visitorId })
      .populate('businessId', 'name businessName logoUrl city location')
      .populate('ownerId', 'name firstName lastName avatarUrl handle')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MessageThread.countDocuments({ visitorId });

    // Get unread counts for each thread (no FOMO, 100% free)
    const threadsWithMeta = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await Message.countDocuments({
          threadId: thread._id,
          senderRole: 'owner',
          isRead: false,
          isDeleted: false,
        });

        return {
          _id: thread._id,
          threadType: thread.threadType,
          business: thread.businessId,
          owner: thread.ownerId,
          // Include raw IDs for sending messages
          businessId: thread.businessId?._id || thread.businessId,
          ownerId: thread.ownerId?._id || thread.ownerId,
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
    logger.error('Visitor get inbox failed', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get inbox' });
  }
};

/**
 * OWNER: Get inbox with dual-identity tabs (100% FREE)
 * GET /api/v1/messages/inbox/owner?filter=all|business|owner
 *
 * Supports filtering by threadType for tabbed UI:
 * - all: All threads
 * - business: Business listing threads
 * - owner: Owner personal profile threads
 */
const getOwnerInbox = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { page = 1, limit = 20, filter = 'all' } = req.query;

    // Build query based on filter
    const query = { ownerId };
    if (filter === 'business') {
      query.threadType = 'business';
    } else if (filter === 'owner') {
      query.threadType = 'owner';
    }

    const threads = await MessageThread.find(query)
      .populate('visitorId', 'name firstName lastName avatarUrl handle')
      .populate('businessId', 'name businessName logoUrl')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MessageThread.countDocuments(query);

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
          threadType: thread.threadType,
          visitor: thread.visitorId,
          business: thread.businessId,
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
 * Get thread messages (100% FREE - NO BLUR LOGIC)
 * GET /api/v1/messages/thread/:threadId
 */
const getThreadMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const thread = await MessageThread.findById(threadId)
      .populate('visitorId', 'name firstName lastName avatarUrl handle')
      .populate('ownerId', 'name firstName lastName avatarUrl handle')
      .populate('businessId', 'name businessName logoUrl city location');
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Verify user is part of this thread (use _id for populated objects)
    const threadVisitorId = thread.visitorId?._id?.toString() || thread.visitorId?.toString();
    const threadOwnerId = thread.ownerId?._id?.toString() || thread.ownerId?.toString();
    if (threadVisitorId !== userId && threadOwnerId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ threadId, isDeleted: false })
      .populate('senderId', 'name firstName lastName avatarUrl role')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments({ threadId, isDeleted: false });

    res.json({
      success: true,
      messages,
      thread: {
        _id: thread._id,
        threadType: thread.threadType,
        status: thread.status,
        // Include populated user/business info for header display
        visitor: thread.visitorId,
        owner: thread.ownerId,
        business: thread.businessId,
        // Include raw IDs needed for sending messages in this thread
        businessId: thread.businessId?._id || thread.businessId,
        ownerId: thread.ownerId?._id || thread.ownerId,
        visitorId: thread.visitorId?._id || thread.visitorId,
        targetUserId: thread.targetUserId,
      },
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
  sendMessage,
  replyMessage,
  getVisitorInbox,
  getOwnerInbox,
  getThreadMessages,
  markMessagesRead,
};
