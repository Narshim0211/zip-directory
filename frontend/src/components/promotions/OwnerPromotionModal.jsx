import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './OwnerPromotionModal.css';

/**
 * OwnerPromotionModal - Allow business owners to create/update promotions
 *
 * Features:
 * - Simple 3-field form (title, description, expiry)
 * - Character counters
 * - Preset expiry buttons (3, 7, 14 days) + custom date
 * - Mobile responsive
 * - Matches existing SalonHub design language
 *
 * Usage:
 * <OwnerPromotionModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   businessId={myBusinessId}
 *   existingPromotion={currentPromotion} // optional
 *   onSuccess={(promotion) => console.log('Created:', promotion)}
 * />
 */
const OwnerPromotionModal = ({
  isOpen,
  onClose,
  businessId,
  existingPromotion = null,
  onSuccess
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing promotion data when modal opens
  useEffect(() => {
    if (isOpen && existingPromotion) {
      setTitle(existingPromotion.title || '');
      setDescription(existingPromotion.description || '');

      // Calculate days until expiry if existing promotion
      if (existingPromotion.expiresAt) {
        const daysUntilExpiry = Math.ceil(
          (new Date(existingPromotion.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
        );

        // If it matches a preset, use that
        if ([3, 7, 14].includes(daysUntilExpiry)) {
          setExpiryDays(daysUntilExpiry);
          setCustomDate('');
        } else {
          // Otherwise use custom date
          setCustomDate(new Date(existingPromotion.expiresAt).toISOString().split('T')[0]);
          setExpiryDays(null);
        }
      }
    } else if (isOpen) {
      // Reset form when opening for new promotion
      setTitle('');
      setDescription('');
      setExpiryDays(7);
      setCustomDate('');
      setError('');
    }
  }, [isOpen, existingPromotion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare request data
      const requestData = {
        businessId,
        title: title.trim(),
        description: description.trim(),
      };

      // Add expiry (either preset days or custom date)
      if (customDate) {
        requestData.customExpiresAt = new Date(customDate).toISOString();
      } else {
        requestData.expiryDays = expiryDays;
      }

      // Call API
      const response = await api.post('/owner/promotion', requestData);

      if (response.data.success) {
        // Success! Call parent callback
        if (onSuccess) {
          onSuccess(response.data.promotion);
        }

        // Close modal
        onClose();

        // Show success message (you can replace with toast notification)
        alert('✅ Promotion created successfully!');
      } else {
        setError(response.data.message || 'Failed to create promotion');
      }
    } catch (err) {
      console.error('Error creating promotion:', err);
      setError(
        err.response?.data?.message ||
        'Failed to create promotion. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExpiryButtonClick = (days) => {
    setExpiryDays(days);
    setCustomDate(''); // Clear custom date when clicking preset
  };

  const handleCustomDateChange = (e) => {
    setCustomDate(e.target.value);
    setExpiryDays(null); // Clear preset when setting custom date
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="promo-modal-header">
          <h2 className="promo-modal-title">
            {existingPromotion ? 'Update Special Offer' : 'Create Special Offer'} 🎉
          </h2>
          <button
            className="promo-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="promo-modal-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="promo-modal-form">
          {/* Title Field */}
          <div className="promo-form-group">
            <label htmlFor="promo-title" className="promo-form-label">
              <span>What's the offer?</span>
              <span className="char-count">{title.length}/50</span>
            </label>
            <input
              id="promo-title"
              type="text"
              className="promo-form-input"
              placeholder="e.g., 20% off first visit"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              maxLength={50}
              required
            />
            <p className="promo-form-hint">
              Keep it short and catchy! This appears in search results.
            </p>
          </div>

          {/* Description Field */}
          <div className="promo-form-group">
            <label htmlFor="promo-description" className="promo-form-label">
              <span>Offer details (optional)</span>
              <span className="char-count">{description.length}/120</span>
            </label>
            <textarea
              id="promo-description"
              className="promo-form-textarea"
              placeholder="e.g., New clients only. Book by Sunday!"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 120))}
              maxLength={120}
              rows={3}
            />
            <p className="promo-form-hint">
              Add terms or conditions. This shows on your profile page.
            </p>
          </div>

          {/* Expiry Field */}
          <div className="promo-form-group">
            <label className="promo-form-label">
              <span>When does it end?</span>
            </label>

            <div className="promo-expiry-buttons">
              {[3, 7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`promo-expiry-btn ${expiryDays === days && !customDate ? 'active' : ''}`}
                  onClick={() => handleExpiryButtonClick(days)}
                >
                  {days} days
                </button>
              ))}
            </div>

            <div className="promo-custom-date">
              <label htmlFor="promo-custom-date" className="promo-form-label-small">
                Or choose custom date:
              </label>
              <input
                id="promo-custom-date"
                type="date"
                className="promo-form-input"
                value={customDate}
                onChange={handleCustomDateChange}
                min={new Date().toISOString().split('T')[0]} // Can't pick past dates
                max={
                  new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                } // Max 90 days from now
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="promo-submit-btn"
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                {existingPromotion ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {existingPromotion ? 'Update Offer' : 'Create Offer'}
              </>
            )}
          </button>

          <button
            type="button"
            className="promo-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </form>

        <div className="promo-modal-footer">
          <p className="promo-footer-note">
            💡 Tip: Promotions automatically expire on the date you choose.
            You can create a new one anytime!
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerPromotionModal;
