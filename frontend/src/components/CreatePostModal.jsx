import React, { useState } from 'react';
import '../styles/createSurveyModal.css'; // Reuse same modal styles

const CreatePostModal = ({ isOpen, onClose, onSubmit, role }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!content.trim() && !image) {
      setError('Please add some content or an image');
      return;
    }

    setLoading(true);
    try {
      // Create FormData if image is present
      const postData = {
        content: content.trim()
      };

      if (image) {
        // If image exists, send as FormData
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('image', image);
        await onSubmit(formData);
      } else {
        // Otherwise send as JSON
        await onSubmit(postData);
      }

      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setImage(null);
      setImagePreview(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Post</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content">What's on your mind?</label>
            <textarea
              id="content"
              className="form-input"
              placeholder="Share an update, tip, or achievement..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={6}
              disabled={loading}
            />
            <span className="char-count">{content.length}/1000</span>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
              <button
                type="button"
                className="btn-remove-image"
                onClick={handleRemoveImage}
                disabled={loading}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="image">Add Image (optional)</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading || imagePreview}
              style={{ padding: '8px' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Max file size: 5MB</small>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
