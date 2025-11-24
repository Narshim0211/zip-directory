import React, { useState } from 'react';
import api from '../api/axios';
import '../styles/InviteModal.css';

/**
 * InviteModal - World-class invite friends experience
 *
 * Features:
 * - Single input (auto-detects email)
 * - Optional personal message
 * - Beautiful success animation
 * - Error handling with micro-copy
 * - Zero friction UX
 */
const InviteModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error on type
  };

  const handleSendInvite = async () => {
    // Validate email
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Please enter an email address');
      return;
    }

    if (!emailTrimmed.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/invite', {
        recipientEmail: emailTrimmed,
        message: message.trim() || undefined
      });

      setSuccess(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  // Success Screen
  if (success) {
    return (
      <div className="invite-modal-overlay" onClick={handleClose}>
        <div
          className="invite-modal invite-modal-success"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="invite-success-icon">🎉</div>
          <h2 className="invite-success-title">Invite Sent!</h2>
          <p className="invite-success-text">
            Your friend will receive your invite shortly.
          </p>
          <button
            className="invite-btn invite-btn-primary"
            onClick={handleClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Main Invite Form
  return (
    <div className="invite-modal-overlay" onClick={handleClose}>
      <div
        className="invite-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-modal-header">
          <h2 className="invite-modal-title">Invite Friends to SalonHub</h2>
          <p className="invite-modal-subtitle">
            They'll love discovering top salons & stylists!
          </p>
        </div>

        <div className="invite-modal-body">
          <div className="invite-form-group">
            <label htmlFor="invite-email" className="invite-label">
              Friend's email
            </label>
            <input
              id="invite-email"
              type="text"
              className={`invite-input ${error ? 'invite-input-error' : ''}`}
              placeholder="jessica@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              autoFocus
            />
            {error && <p className="invite-error-text">{error}</p>}
          </div>

          <div className="invite-form-group">
            <label htmlFor="invite-message" className="invite-label">
              Your message (optional)
            </label>
            <textarea
              id="invite-message"
              className="invite-textarea"
              placeholder="Add a personal note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              maxLength={500}
              rows={3}
            />
            <p className="invite-char-count">
              {message.length}/500
            </p>
          </div>
        </div>

        <div className="invite-modal-footer">
          <button
            className="invite-btn invite-btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="invite-btn invite-btn-primary"
            onClick={handleSendInvite}
            disabled={loading}
          >
            {loading ? (
              <span className="invite-btn-loading">
                <span className="invite-spinner"></span>
                Sending...
              </span>
            ) : (
              'Send Invite'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
