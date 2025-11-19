import React, { useState, useEffect } from 'react';
import { 
  getVisitorNewsletterStatus, 
  subscribeVisitorNewsletter, 
  unsubscribeVisitorNewsletter 
} from '../../api/newsletter';
import './VisitorNewsletterSettings.css';

const VisitorNewsletterSettings = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getVisitorNewsletterStatus();
      setSubscribed(response.data.subscribed);
    } catch (err) {
      console.error('Error fetching newsletter status:', err);
      setError('Failed to load newsletter preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccessMessage('');

      if (subscribed) {
        await unsubscribeVisitorNewsletter();
        setSubscribed(false);
        setSuccessMessage('Unsubscribed successfully');
      } else {
        await subscribeVisitorNewsletter();
        setSubscribed(true);
        setSuccessMessage('Subscribed successfully! You\'ll receive hair tips and glow-up guides.');
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating newsletter preference:', err);
      setError(err.response?.data?.message || 'Failed to update newsletter preference');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="newsletter-settings-container">
        <div className="newsletter-settings-loading">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="newsletter-settings-container">
      <h2 className="newsletter-settings-title">Email Preferences</h2>
      
      <div className="newsletter-settings-card">
        <div className="newsletter-option">
          <div className="newsletter-option-header">
            <div className="newsletter-option-info">
              <h3 className="newsletter-option-title">Hair Tips & Glow-Up Newsletter</h3>
              <p className="newsletter-option-description">
                Occasional tips, routines, and product recommendations to help you achieve your hair goals.
                1–2 emails per month.
              </p>
            </div>
            
            <label className="newsletter-toggle">
              <input
                type="checkbox"
                checked={subscribed}
                onChange={handleToggle}
                disabled={updating}
                className="newsletter-toggle-input"
              />
              <span className="newsletter-toggle-slider"></span>
            </label>
          </div>

          {successMessage && (
            <div className="newsletter-success-message">
              ✓ {successMessage}
            </div>
          )}

          {error && (
            <div className="newsletter-error-message">
              {error}
            </div>
          )}

          <div className="newsletter-option-footer">
            <p className="newsletter-footer-text">
              {subscribed 
                ? '✓ You\'re subscribed. Toggle off anytime to unsubscribe.'
                : 'Toggle on to start receiving helpful hair care content.'}
            </p>
          </div>
        </div>
      </div>

      <div className="newsletter-info-box">
        <p className="newsletter-info-text">
          <strong>Privacy Promise:</strong> We respect your inbox. No spam, ever. 
          You can unsubscribe at any time using the toggle above or the unsubscribe link in any email.
        </p>
      </div>
    </div>
  );
};

export default VisitorNewsletterSettings;
