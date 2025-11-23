import React, { useEffect, useState, useCallback } from 'react';
import CommentCard from './CommentCard';
import '../styles/commentsSheet.css';

/**
 * CommentsSheet Component
 *
 * Full-screen slide-up sheet for viewing and writing comments
 * - Shows all comments for a survey/post
 * - Paywall for free users (blur + upgrade CTA)
 * - One-level threading (parent → reply)
 * - Love reactions on comments
 *
 * UX Flow:
 * 1. Free user opens sheet → sees comments but reply box is locked
 * 2. Clicks reply → paywall modal appears
 * 3. Upgrades → can now reply
 *
 * Premium owner: Gold orbit on their comments
 * Chat Pass visitor: Can reply freely
 */
const CommentsSheet = ({ isOpen, onClose, contentType, contentId, contentTitle, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // For threading
  const [error, setError] = useState('');

  // Check if user can comment (will create utility next)
  const userCanComment = currentUser && (
    (currentUser.role === 'owner' && currentUser.isPremium) ||
    (currentUser.role === 'visitor' && currentUser.hasChatPass)
  );

  const fetchComments = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/comments?contentType=${contentType}&contentId=${contentId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    if (isOpen && contentId) {
      fetchComments();
    }
  }, [isOpen, contentId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    if (!currentUser) {
      setError('Please log in to comment');
      return;
    }

    if (!userCanComment) {
      // Show paywall (will be handled by parent component)
      setError(currentUser.role === 'owner'
        ? 'Upgrade to Premium to reply to comments'
        : 'Unlock chat for $9.99/mo to comment'
      );
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentType,
          contentId,
          text: newComment.trim(),
          parentId: replyTo?._id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresUpgrade || errorData.requiresPayment) {
          // Show paywall
          setError(errorData.message);
          return;
        }
        throw new Error(errorData.message || 'Failed to post comment');
      }

      const newCommentData = await response.json();
      setComments([newCommentData, ...comments]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    // Focus input (optional enhancement)
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments(comments.map(c =>
      c._id === updatedComment._id ? updatedComment : c
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="comments-sheet-overlay" onClick={onClose}>
      <div className="comments-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="comments-sheet__header">
          <h2 className="comments-sheet__title">
            Comments ({comments.length})
          </h2>
          <button className="comments-sheet__close" onClick={onClose} aria-label="Close comments">
            ×
          </button>
        </div>

        {/* Content Title */}
        {contentTitle && (
          <div className="comments-sheet__content-title">
            <p>{contentTitle}</p>
          </div>
        )}

        {/* Comments List */}
        <div className="comments-sheet__list">
          {loading ? (
            <div className="comments-sheet__loading">
              <div className="loading-spinner"></div>
              <p>Loading comments...</p>
            </div>
          ) : error && comments.length === 0 ? (
            <div className="comments-sheet__error">
              <p>{error}</p>
              <button onClick={fetchComments} className="retry-btn">Retry</button>
            </div>
          ) : comments.length === 0 ? (
            <div className="comments-sheet__empty">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onUpdate={handleCommentUpdate}
                currentUser={currentUser}
              />
            ))
          )}
        </div>

        {/* Reply Input */}
        <div className="comments-sheet__footer">
          {replyTo && (
            <div className="comments-sheet__reply-banner">
              <p>Replying to <strong>{replyTo.author?.firstName || 'User'}</strong></p>
              <button onClick={handleCancelReply} className="cancel-reply-btn">Cancel</button>
            </div>
          )}

          {userCanComment ? (
            <form className="comments-sheet__form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                disabled={submitting}
                className="comments-sheet__input"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="comments-sheet__submit"
              >
                {submitting ? '⋯' : '→'}
              </button>
            </form>
          ) : (
            <div className="comments-sheet__paywall">
              <p className="comments-sheet__paywall-message">
                {!currentUser ? (
                  'Log in to comment'
                ) : currentUser.role === 'owner' ? (
                  'Upgrade to Premium to reply to comments'
                ) : (
                  'Unlock chat for $9.99/mo to join the conversation'
                )}
              </p>
              <button className="comments-sheet__upgrade-btn">
                {!currentUser ? (
                  'Log In'
                ) : currentUser.role === 'owner' ? (
                  'Upgrade to Premium – $49/mo'
                ) : (
                  'Unlock Chat – $9.99/mo'
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="comments-sheet__error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsSheet;
