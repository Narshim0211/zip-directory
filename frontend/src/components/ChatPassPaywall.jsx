import React, { useState } from 'react';
import { createChatPassCheckout } from '../api/chat';

/**
 * ChatPassPaywall Component
 *
 * Modal that shows pricing and redirects to Stripe checkout.
 * Triggered when visitor tries to read locked reply or send 2nd message.
 */
const ChatPassPaywall = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await createChatPassCheckout();

      if (response.success && response.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1a202c', margin: '0 0 8px 0' }}>
            Stylist Access Pass
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
            Unlock unlimited messaging with all premium salons
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Price */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: '#E91E63', marginBottom: '4px' }}>
              $9.99
              <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>/mo</span>
            </div>
            <div style={{ fontSize: '14px', color: '#a0aec0' }}>Cancel anytime</div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  Unlimited Messaging
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Chat with any premium salon without limits
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  Instant Replies
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Get responses from stylists in real-time
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  Photo Sharing
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Send inspiration photos for consultations
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ fontSize: '20px' }}>✅</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                  30-Day Grace Period
                </div>
                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Keep access for 30 days after canceling
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#4a5568',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUnlock}
              disabled={loading}
              style={{
                flex: 2,
                padding: '14px',
                background: loading
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(233, 30, 99, 0.3)',
              }}
            >
              {loading ? 'Processing...' : 'Unlock Now'}
            </button>
          </div>

          {/* Fine Print */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#a0aec0' }}>
            Secure payment via Stripe • Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPassPaywall;
