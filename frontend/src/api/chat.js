import api from './axios';

/**
 * Chat & Messaging API Service
 * Handles all chat-related API calls
 */

// ========================================
// VISITOR ENDPOINTS
// ========================================

/**
 * Send a message to a business (first message free)
 */
export const visitorSendMessage = async (businessId, text, photoUrl = '') => {
  const response = await api.post('/v1/messages/visitor/send', {
    businessId,
    text,
    photoUrl,
  });
  return response.data;
};

/**
 * Get visitor's inbox (list of conversations)
 */
export const getVisitorInbox = async (page = 1, limit = 20) => {
  const response = await api.get('/v1/messages/visitor/inbox', {
    params: { page, limit },
  });
  return response.data;
};

// ========================================
// OWNER ENDPOINTS
// ========================================

/**
 * Reply to a visitor's message (premium only)
 */
export const ownerReplyMessage = async (threadId, text, photoUrl = '') => {
  const response = await api.post('/v1/messages/owner/reply', {
    threadId,
    text,
    photoUrl,
  });
  return response.data;
};

/**
 * Get owner's inbox (list of client conversations)
 */
export const getOwnerInbox = async (page = 1, limit = 20) => {
  const response = await api.get('/v1/messages/owner/inbox', {
    params: { page, limit },
  });
  return response.data;
};

// ========================================
// SHARED ENDPOINTS
// ========================================

/**
 * Get all messages in a thread
 */
export const getThreadMessages = async (threadId, page = 1, limit = 50) => {
  const response = await api.get(`/v1/messages/thread/${threadId}`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Mark messages as read
 */
export const markMessagesRead = async (threadId) => {
  const response = await api.put('/v1/messages/mark-read', {
    threadId,
  });
  return response.data;
};

// ========================================
// SUBSCRIPTION ENDPOINTS
// ========================================

/**
 * Get chat pass status
 */
export const getChatPassStatus = async () => {
  const response = await api.get('/v1/subscriptions/chat-pass/status');
  return response.data;
};

/**
 * Create chat pass checkout session
 */
export const createChatPassCheckout = async () => {
  const response = await api.post('/v1/subscriptions/chat-pass/checkout');
  return response.data;
};

export default {
  visitorSendMessage,
  getVisitorInbox,
  ownerReplyMessage,
  getOwnerInbox,
  getThreadMessages,
  markMessagesRead,
  getChatPassStatus,
  createChatPassCheckout,
};
