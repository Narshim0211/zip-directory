import React, { useState } from 'react';
import './BookingURLPreview.css';

/**
 * BookingURLPreview Component
 *
 * Shows the business's unique booking URL
 * Indicates payment status (online payments enabled/disabled)
 * Provides quick copy and preview actions
 *
 * Usage:
 *   <BookingURLPreview
 *     businessId="123..."
 *     businessSlug="beauty-salon-nyc"
 *     stripeConnected={true}
 *   />
 */
const BookingURLPreview = ({ businessId, businessSlug, stripeConnected }) => {
  const [copied, setCopied] = useState(false);

  // Generate booking URL from business slug
  const bookingURL = businessSlug
    ? `${window.location.origin}/book/${businessSlug}`
    : `${window.location.origin}/book/${businessId}`;

  const handleCopyURL = () => {
    navigator.clipboard.writeText(bookingURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenBooking = () => {
    window.open(bookingURL, '_blank');
  };

  return (
    <div className="booking-url-preview">
      <div className="booking-url-preview__header">
        <h2>Your Booking Page</h2>
        <div className={`booking-url-preview__payment-status ${stripeConnected ? 'enabled' : 'disabled'}`}>
          {stripeConnected ? (
            <span>💳 Online Payments Enabled</span>
          ) : (
            <span>💵 Pay In-Store Only</span>
          )}
        </div>
      </div>

      <div className="booking-url-preview__content">
        <div className="booking-url-preview__url-display">
          <div className="booking-url-preview__url-box">
            <code className="booking-url-preview__url">{bookingURL}</code>
          </div>

          <div className="booking-url-preview__actions">
            <button
              className="booking-url-preview__copy-btn"
              onClick={handleCopyURL}
            >
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>

            <button
              className="booking-url-preview__open-btn"
              onClick={handleOpenBooking}
            >
              🔗 Open Booking Page
            </button>
          </div>
        </div>

        {!stripeConnected && (
          <div className="booking-url-preview__notice">
            <p>
              <strong>⚠️ Online payments are disabled.</strong> Connect Stripe below to let customers pay online when booking.
            </p>
          </div>
        )}

        {stripeConnected && (
          <div className="booking-url-preview__success">
            <p>
              <strong>✅ Customers can book and pay online!</strong> Share your booking link to start accepting appointments.
            </p>
          </div>
        )}

        <div className="booking-url-preview__tips">
          <h3>Share Your Booking Link</h3>
          <ul>
            <li>Add it to your social media bio (Instagram, Facebook, TikTok)</li>
            <li>Include it in your email signature</li>
            <li>Share it with existing customers via text or email</li>
            <li>Add it to your website or Google Business Profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingURLPreview;
