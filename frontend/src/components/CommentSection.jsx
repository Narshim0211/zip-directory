/**
 * CommentSection Component - V1 (Zero Paywall)
 *
 * All-in-one comment system for surveys and posts
 * - Shows list of comments with 1-level threading (parent → replies)
 * - Input box for writing comments/replies
 * - All logged-in users (Owner OR Visitor) can comment/reply/delete
 * - Guests see "Log in to comment" button
 * - Simple, clean UI matching SalonHub patterns
 *
 * Usage:
 * <CommentSection contentType="survey" contentId={surveyId} />
 * <CommentSection contentType="post" contentId={postId} />
 */

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getComments, createComment, replyToComment, deleteComment } from '../api/commentApi';
import '../styles/comments.css';

const CommentSection = ({ contentType, contentId }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, authorName }
  const [error, setError] = useState('');

  // Fetch comments on mount
  useEffect(() => {
    if (!contentId) return;
    fetchCommentsData();
  }, [contentId, contentType]);

  const fetchCommentsData = async () => {
    try {
      setLoading(true);
      const data = await getComments(contentType, contentId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user) {
      alert('Please log in to comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let newComment;

      if (replyingTo) {
        // Replying to a comment
        newComment = await replyToComment(replyingTo.commentId, contentType, contentId, newCommentText.trim());

        // Add reply to the appropriate parent comment
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === replyingTo.commentId
              ? { ...comment, replies: [...(comment.replies || []), newComment] }
              : comment
          )
        );
      } else {
        // Creating a new parent comment
        newComment = await createComment(contentType, contentId, newCommentText.trim());
        setComments([newComment, ...comments]);
      }

      setNewCommentText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);

      if (isReply && parentId) {
        // Remove reply from parent comment
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === parentId
              ? { ...comment, replies: comment.replies.filter(r => r._id !== commentId) }
              : comment
          )
        );
      } else {
        // Remove parent comment
        setComments(prevComments => prevComments.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment');
    }
  };

  const handleReplyClick = (commentId, authorName) => {
    if (!user) {
      alert('Please log in to reply');
      return;
    }
    setReplyingTo({ commentId, authorName });
    setNewCommentText('');
  };

  if (loading) {
    return <div className="comment-section loading">Loading comments...</div>;
  }

  return (
    <div className="comment-section">
      {/* Comment Input */}
      <div className="comment-input-container">
        {replyingTo && (
          <div className="replying-banner">
            Replying to <strong>{replyingTo.authorName}</strong>
            <button onClick={() => setReplyingTo(null)} className="cancel-reply-btn">
              ✕
            </button>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmit} className="comment-form">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
              maxLength={500}
              rows={3}
              disabled={submitting}
              className="comment-textarea"
            />
            <div className="comment-form-footer">
              <span className="char-count">{newCommentText.length}/500</span>
              <button
                type="submit"
                disabled={!newCommentText.trim() || submitting}
                className="submit-comment-btn"
              >
                {submitting ? 'Posting...' : replyingTo ? 'Reply' : 'Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="comment-login-prompt">
            <p>Please log in to comment</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="login-btn"
            >
              Log In
            </button>
          </div>
        )}

        {error && <div className="comment-error">{error}</div>}
      </div>

      {/* Comments List */}
      <div className="comments-list">
        <h3 className="comments-header">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>

        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              user={user}
              onReply={handleReplyClick}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

// CommentItem Component (parent comment with replies)
const CommentItem = ({ comment, user, onReply, onDelete }) => {
  const author = comment.userId || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Anonymous';
  const isAuthor = user && user._id === author._id;

  return (
    <div className="comment-item">
      {/* Parent Comment */}
      <div className="comment-content">
        <img
          src={author.avatarUrl || '/default-avatar.png'}
          alt={authorName}
          className="comment-avatar"
        />
        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-author">{authorName}</span>
            <span className="comment-role">• {author.role || 'visitor'}</span>
            <span className="comment-time">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="comment-text">{comment.text}</p>
          <div className="comment-actions">
            <button
              onClick={() => onReply(comment._id, authorName)}
              className="reply-btn"
            >
              Reply
            </button>
            {isAuthor && (
              <button
                onClick={() => onDelete(comment._id, false)}
                className="delete-btn"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              parentId={comment._id}
              user={user}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ReplyItem Component (nested reply)
const ReplyItem = ({ reply, parentId, user, onDelete }) => {
  const author = reply.userId || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Anonymous';
  const isAuthor = user && user._id === author._id;

  return (
    <div className="reply-item">
      <img
        src={author.avatarUrl || '/default-avatar.png'}
        alt={authorName}
        className="reply-avatar"
      />
      <div className="reply-body">
        <div className="reply-header">
          <span className="reply-author">{authorName}</span>
          <span className="reply-role">• {author.role || 'visitor'}</span>
          <span className="reply-time">
            {new Date(reply.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="reply-text">{reply.text}</p>
        {isAuthor && (
          <button
            onClick={() => onDelete(reply._id, true, parentId)}
            className="delete-btn small"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
