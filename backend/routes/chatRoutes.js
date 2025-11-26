const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const {
  sendMessage,
  replyMessage,
  getVisitorInbox,
  getOwnerInbox,
  getThreadMessages,
  markMessagesRead,
} = require('../controllers/chatController');

/**
 * 💬 SALONHUB CHAT SYSTEM V2 - 100% FREE
 *
 * Dual-Identity Support:
 * - threadType='business' → Message to business listing
 * - threadType='owner' → Message to owner personal profile
 *
 * Features:
 * - 100% free (no paywall, no blur logic)
 * - Real-time messaging (REST API, websockets can be added later)
 * - Photo support
 * - One unified inbox with tabs for owners
 * - Report system (safety)
 */

// ========================================
// MESSAGE SEND/REPLY (Unified Routes)
// ========================================

// Send message (visitor → business or owner)
router.post('/send', protect, sendMessage);

// Reply to message (owner → visitor)
router.post('/reply', protect, replyMessage);

// ========================================
// INBOX ROUTES
// ========================================

// Visitor inbox (all threads)
router.get('/inbox/visitor', protect, getVisitorInbox);

// Owner inbox with tabs (filter=all|business|owner)
router.get('/inbox/owner', protect, getOwnerInbox);

// ========================================
// THREAD ROUTES
// ========================================

// Get thread messages
router.get('/thread/:threadId', protect, getThreadMessages);

// Mark messages as read
router.put('/mark-read', protect, markMessagesRead);

module.exports = router;
