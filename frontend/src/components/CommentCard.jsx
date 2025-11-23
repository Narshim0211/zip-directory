import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { toggleReaction } from '../api/engagementApi';
import '../styles/commentCard.css';

/**
 * CommentCard Component
 *
 * Individual comment with:
 * - Author info (name, avatar, role badge)
 * - Gold orbit for premium owners
 * - Love reaction button
 * - Reply button (triggers threading)
 * - Report button (3-dot menu)
 *
 * Props:
 * - comment: Comment object from API
 * - onReply: Callback when user clicks Reply
 * - onUpdate: Callback when comment is updated (e.g., love count changes)
 * - currentUser: Current logged-in user
 */
const CommentCard = ({ comment, onReply, onUpdate, currentUser }) => {
  const [loveCount, setLoveCount] = useState(comment.likes?.length || 0);
  const [userLoved, setUserLoved] = useState(
    comment.likes?.includes(currentUser?._id) || false
  );
  const [showMenu, setShowMenu] = useState(false);
  const [submittingLove, setSubmittingLove] = useState(false);

  const handleLove = async () => {
    if (submittingLove || !currentUser) return;

    setSubmittingLove(true);
    try {
      const response = await toggleReaction('comment', comment._id, 'love');
      const data = response?.data || response;

      if (data) {
        const newLoveCount = data.reactions?.love || 0;
        const newUserLoved = data.userReaction === 'love';

        setUserLoved(newUserLoved);
        setLoveCount(newLoveCount);

        // Notify parent component of update
        if (onUpdate) {
          onUpdate({ ...comment, likes: Array(newLoveCount).fill(null) });
        }
      }
    } catch (error) {
      console.error('Error toggling love:', error);
    } finally {
      setSubmittingLove(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this comment?');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${comment._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('Comment reported. Thank you for helping keep our community safe.');
        setShowMenu(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to report comment. Please try again.');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert('Failed to report comment. Please try again.');
    }
  };

  const isPremiumOwner = comment.authorType === 'owner' && comment.isPremiumAuthor;

  // Format timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`comment-card ${isPremiumOwner ? 'comment-card--premium' : ''}`}>
      {/* Gold Orbit for Premium Owners */}
      {isPremiumOwner && <div className="comment-card__orbit" />}

      <div className="comment-card__content">
        {/* Avatar */}
        <div className="comment-card__avatar">
          {comment.author?.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt={comment.author.firstName || 'User'} />
          ) : (
            <div className="comment-card__avatar-placeholder">
              {(comment.author?.firstName || comment.author?.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="comment-card__main">
          {/* Header */}
          <div className="comment-card__header">
            <div className="comment-card__author">
              <strong>{comment.author?.firstName || comment.author?.name || 'User'}</strong>
              <span className={`comment-card__badge comment-card__badge--${comment.authorType || 'visitor'}`}>
                {comment.authorType === 'owner' ? 'Owner' : 'Visitor'}
              </span>
              <span className="comment-card__timestamp">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <button
              className="comment-card__menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Comment options"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Menu Dropdown */}
          {showMenu && (
            <>
              <div className="comment-card__menu-overlay" onClick={() => setShowMenu(false)} />
              <div className="comment-card__menu">
                <button onClick={handleReport}>Report Comment</button>
              </div>
            </>
          )}

          {/* Comment Text */}
          <p className="comment-card__text">{comment.content}</p>

          {/* Actions */}
          <div className="comment-card__actions">
            <button
              className={`comment-card__action ${userLoved ? 'comment-card__action--loved' : ''}`}
              onClick={handleLove}
              disabled={submittingLove || !currentUser}
              title={currentUser ? 'Love this comment' : 'Log in to love comments'}
            >
              {userLoved ? '❤️' : '🤍'} {loveCount}
            </button>

            {onReply && !comment.parentId && (
              <button
                className="comment-card__action"
                onClick={() => onReply(comment)}
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies (One Level Only) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-card__replies">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              onReply={null} // No further nesting
              onUpdate={onUpdate}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
