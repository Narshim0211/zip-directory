const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const {
  createChatPassCheckout,
  getChatPassStatus,
} = require('../controllers/subscriptionController');

// Create Chat Pass subscription checkout
router.post('/chat-pass/checkout', protect, createChatPassCheckout);

// Get Chat Pass status
router.get('/chat-pass/status', protect, getChatPassStatus);

module.exports = router;
