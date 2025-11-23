import React, { useState } from 'react';
import { visitorSendMessage } from '../api/chat';
import { useNavigate } from 'react-router-dom';

/**
 * PreBookingMessageModal Component
 *
 * Modal for visitors to send their first free message to a business.
 * After sending, redirects to visitor inbox.
 */
const PreBookingMessageModal = ({ businessId, businessName, onClose }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await visitorSendMessage(businessId, message.trim());

      if (response.success) {
        // Success! Redirect to inbox
        navigate('/visitor/inbox');
        onClose();
      }
    } catch (err) {
      // Handle different error types
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Chat pass required');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#1a202c' }}>
            Message {businessName}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
            Your first message is free! Ask about services, availability, or pricing.
          </p>
        </div>

        {/* Message Input */}
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'm interested in your services..."
            maxLength={500}
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
            }}
          />
          <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '13px', color: '#a0aec0' }}>
            {message.length}/500
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#4a5568',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            style={{
              padding: '10px 24px',
              background: loading || !message.trim()
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'white',
              cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !message.trim() ? 'none' : '0 2px 8px rgba(102, 126, 234, 0.3)',
            }}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreBookingMessageModal;
