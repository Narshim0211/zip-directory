/**
 * Chat API Client - SalonHub V2
 * 100% FREE - NO PAYWALL
 *
 * Supports universal messaging:
 * - threadType='business' → Message to business listing
 * - threadType='owner' → Message to owner personal profile
 * - threadType='visitor' → Message to visitor personal profile
 */

import api from './axios';

/**
 * Send message to business, owner, or visitor
 * @param {string} threadType - 'business', 'owner', or 'visitor'
 * @param {string} targetId - businessId, ownerId, or visitorId
 * @param {string} text - Message text
 * @param {string} photoUrl - Optional photo URL
 */
export const sendMessage = async (threadType, targetId, text, photoUrl = '') => {
  const payload = { threadType, text, photoUrl };

  if (threadType === 'business') {
    payload.businessId = targetId;
  } else if (threadType === 'owner') {
    payload.ownerId = targetId;
  } else if (threadType === 'visitor') {
    payload.visitorId = targetId;
  } else {
    throw new Error('Invalid threadType. Must be "business", "owner", or "visitor"');
  }

  // DEBUG: Log what we're sending
  console.log('📤 [chatApi] sendMessage called with:', {
    threadType,
    targetId,
    text,
    photoUrl
  });
  console.log('📦 [chatApi] Final payload:', payload);

  const { data } = await api.post('/v1/messages/send', payload);
  console.log('✅ [chatApi] Response received:', data);
  return data;
};

/**
 * Owner reply to visitor message
 * @param {string} threadId - Thread ID
 * @param {string} text - Reply text
 * @param {string} photoUrl - Optional photo URL
 */
export const replyMessage = async (threadId, text, photoUrl = '') => {
  const { data } = await api.post('/v1/messages/reply', { threadId, text, photoUrl });
  return data;
};

/**
 * Get visitor inbox (all threads)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const getVisitorInbox = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/v1/messages/inbox/visitor?page=${page}&limit=${limit}`);
  return data;
};

/**
 * Get owner inbox with tab filtering
 * @param {string} filter - 'all' | 'business' | 'owner'
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export const getOwnerInbox = async (filter = 'all', page = 1, limit = 20) => {
  const { data } = await api.get(`/v1/messages/inbox/owner?filter=${filter}&page=${page}&limit=${limit}`);
  return data;
};

/**
 * Get thread messages
 * @param {string} threadId - Thread ID
 * @param {number} page - Page number
 * @param {number} limit - Messages per page
 */
export const getThreadMessages = async (threadId, page = 1, limit = 50) => {
  const { data } = await api.get(`/v1/messages/thread/${threadId}?page=${page}&limit=${limit}`);
  return data;
};

/**
 * Mark thread messages as read
 * @param {string} threadId - Thread ID
 */
export const markMessagesRead = async (threadId) => {
  const { data } = await api.put('/v1/messages/mark-read', { threadId });
  return data;
};
