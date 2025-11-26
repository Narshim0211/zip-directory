/**
 * Comment API Client - V1 (Zero Paywall)
 * All logged-in users can comment/reply/delete
 * Guests can read only
 *
 * Follows SalonHub API pattern:
 * - Uses existing axios instance (auto-attaches JWT token)
 * - Returns { data } from api calls
 * - No React Query - plain async/await for useState/useEffect
 */

import api from './axios';

/**
 * Get all comments for a specific content (survey or post)
 * @param {string} contentType - 'survey' or 'post'
 * @param {string} contentId - ID of the content
 * @returns {Promise} Array of comments with nested replies
 */
export const getComments = async (contentType, contentId) => {
  const { data } = await api.get('/comments', {
    params: { contentType, contentId }
  });
  return data;
};

/**
 * Create a new comment
 * @param {string} contentType - 'survey' or 'post'
 * @param {string} contentId - ID of the content
 * @param {string} text - Comment text (max 500 chars)
 * @returns {Promise} Created comment object
 */
export const createComment = async (contentType, contentId, text) => {
  const { data } = await api.post('/comments', {
    contentType,
    contentId,
    text
  });
  return data;
};

/**
 * Reply to a comment
 * @param {string} parentId - ID of the comment being replied to
 * @param {string} contentType - 'survey' or 'post'
 * @param {string} contentId - ID of the content
 * @param {string} text - Reply text (max 500 chars)
 * @returns {Promise} Created reply object
 */
export const replyToComment = async (parentId, contentType, contentId, text) => {
  const { data } = await api.post(`/comments/${parentId}/reply`, {
    contentType,
    contentId,
    text
  });
  return data;
};

/**
 * Delete a comment (user can only delete their own comments)
 * @param {string} commentId - ID of the comment to delete
 * @returns {Promise} Success response
 */
export const deleteComment = async (commentId) => {
  await api.delete(`/comments/${commentId}`);
  return { success: true };
};
