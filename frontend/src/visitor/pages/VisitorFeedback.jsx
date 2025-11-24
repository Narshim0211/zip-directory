import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './VisitorFeedback.css';

const VisitorFeedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    { value: 'Bug', label: '🐛 Bug / Something is broken' },
    { value: 'Feature Request', label: '💡 Suggestion / Feature Request' },
    { value: 'Account Issue', label: '👤 Account / Login issue' },
    { value: 'Other', label: '📝 Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }
    
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to submit feedback');
        navigate('/login');
        return;
      }

      const response = await api.post('/visitor/feedback', formData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          category: '',
          title: '',
          description: ''
        });
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to submit visitor feedback.');
      } else if (err.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.field] = error.message;
        });
        setValidationErrors(backendErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="visitor-feedback-container">
      <div className="feedback-header">
        <h1>Send Feedback</h1>
        <p className="feedback-subtitle">
          Help us improve your experience. We read every message and truly appreciate your input.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Thank you!</strong> Your feedback has been submitted successfully.
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={validationErrors.category ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {validationErrors.category && (
            <span className="error-message">{validationErrors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Short summary of the issue"
            className={validationErrors.title ? 'input-error' : ''}
            disabled={isSubmitting}
            maxLength={200}
          />
          <div className="input-meta">
            <span className="char-count">
              {formData.title.length}/200
            </span>
          </div>
          {validationErrors.title && (
            <span className="error-message">{validationErrors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe what happened in detail..."
            className={validationErrors.description ? 'input-error' : ''}
            disabled={isSubmitting}
            rows={8}
            maxLength={2000}
          />
          <div className="input-meta">
            <span className="char-count">
              {formData.description.length}/2000
            </span>
          </div>
          {validationErrors.description && (
            <span className="error-message">{validationErrors.description}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <span className="btn-icon">📤</span>
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>

      <div className="feedback-footer">
        <p>
          Your feedback helps us create a better experience for everyone. Thank you for taking the time to share your thoughts!
        </p>
      </div>
    </div>
  );
};

export default VisitorFeedback;
