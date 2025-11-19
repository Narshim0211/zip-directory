import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OwnerFeedback.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OwnerFeedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    urgency: 'MEDIUM',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    { value: 'Booking Issue', label: '📅 Booking / Calendar' },
    { value: 'Payment Issue', label: '💳 Payments / Billing' },
    { value: 'Profile Issue', label: '🏪 Profile / Listing' },
    { value: 'Feature Request', label: '💡 Feature Request' },
    { value: 'Bug', label: '🐛 Bug / Technical Issue' },
    { value: 'Other', label: '📝 Other' }
  ];

  const urgencyLevels = [
    { value: 'LOW', label: 'Low', color: '#10b981', description: 'Can wait' },
    { value: 'MEDIUM', label: 'Medium', color: '#f59e0b', description: 'Normal priority' },
    { value: 'HIGH', label: 'High', color: '#ef4444', description: 'Urgent' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      const response = await axios.post(
        `${API_BASE}/owner/feedback`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          category: '',
          urgency: 'MEDIUM',
          title: '',
          description: ''
        });
        
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
        setError('You do not have permission to submit owner feedback.');
      } else if (err.response?.data?.errors) {
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
    <div className="owner-feedback-container">
      <div className="feedback-header">
        <h1>Support & Feedback</h1>
        <p className="feedback-subtitle">
          Report issues with bookings, payments, or your business tools. We prioritize owner support to keep your business running smoothly.
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Thank you!</strong> Your feedback has been submitted. We'll get back to you as soon as possible.
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
        <div className="form-row">
          <div className="form-group form-group-flex">
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

          <div className="form-group form-group-flex">
            <label htmlFor="urgency">
              Priority Level <span className="required">*</span>
            </label>
            <div className="urgency-selector">
              {urgencyLevels.map(level => (
                <label
                  key={level.value}
                  className={`urgency-option ${formData.urgency === level.value ? 'urgency-option-active' : ''}`}
                  style={{
                    '--urgency-color': level.color
                  }}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <div className="urgency-content">
                    <span className="urgency-label">{level.label}</span>
                    <span className="urgency-description">{level.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
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
            placeholder="Brief summary of the issue"
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
            placeholder="Please provide detailed information about the issue..."
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
        <div className="support-info">
          <h3>💼 Business Owner Priority Support</h3>
          <p>
            As a business owner, your feedback receives priority attention. We understand the importance of keeping your operations running smoothly. Our team typically responds to high-priority issues within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerFeedback;
