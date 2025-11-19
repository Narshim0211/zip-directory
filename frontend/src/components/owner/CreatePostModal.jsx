import React, { useState } from 'react';
import v1Client from '../../api/v1';
import './CreatePostModal.css';

/**
 * CreatePostModal Component
 * Modal for owners to create posts
 */
const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Post text is required');
      return;
    }

    if (text.length > 5000) {
      setError('Post text must be less than 5000 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const postData = {
        text: text.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mediaUrl.trim() ? 'image' : undefined,
        visibility: 'public',
      };

      await v1Client.owner.posts.create(postData);
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Post</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="post-text" className="form-label">
              What's on your mind? <span className="required">*</span>
            </label>
            <textarea
              id="post-text"
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts, tips, or updates with the community..."
              rows={6}
              maxLength={5000}
              disabled={submitting}
            />
            <div className="character-count">
              {text.length} / 5000 characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="post-media" className="form-label">
              Image URL (optional)
            </label>
            <input
              type="url"
              id="post-media"
              className="form-input"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={submitting}
            />
            <p className="form-hint">Enter a URL to an image you'd like to include</p>
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || !text.trim()}
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
