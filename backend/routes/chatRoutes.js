const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const {
  visitorSendMessage,
  ownerReplyMessage,
  visitorGetInbox,
  ownerGetInbox,
  getThreadMessages,
  markMessagesRead,
} = require('../controllers/chatController');

// ========================================
// VISITOR ROUTES
// ========================================

// Send message to business
router.post('/visitor/send', protect, visitorSendMessage);

// Get visitor inbox
router.get('/visitor/inbox', protect, visitorGetInbox);

// ========================================
// OWNER ROUTES
// ========================================

// Reply to visitor
router.post('/owner/reply', protect, ownerReplyMessage);

// Get owner inbox
router.get('/owner/inbox', protect, ownerGetInbox);

// ========================================
// SHARED ROUTES (Both visitor and owner)
// ========================================

// Get thread messages
router.get('/thread/:threadId', protect, getThreadMessages);

// Mark messages as read
router.put('/mark-read', protect, markMessagesRead);

module.exports = router;
