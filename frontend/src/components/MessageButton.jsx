import React, { useState } from 'react';
import PreBookingMessageModal from './PreBookingMessageModal';

/**
 * MessageButton Component
 *
 * Shows on business public profiles. Opens pre-booking message modal.
 * Only shows for premium businesses (they can reply).
 *
 * Props:
 * - businessId: ID of the business
 * - businessName: Name of the business
 * - isPremium: Whether the business is premium (only premium can reply)
 * - compact: If true, shows compact version for sticky ribbon (optional)
 */
const MessageButton = ({ businessId, businessName, isPremium, compact = false }) => {
  const [showModal, setShowModal] = useState(false);

  // Don't show button if business is not premium (they can't reply anyway)
  if (!isPremium) {
    return null;
  }

  // Compact version for sticky ribbon
  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minWidth: '120px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          <span>Message</span>
        </button>

        {showModal && (
          <PreBookingMessageModal
            businessId={businessId}
            businessName={businessName}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Regular version for hero section
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
        }}
      >
        <span style={{ fontSize: '18px' }}>💬</span>
        <span>Send Message</span>
      </button>

      {showModal && (
        <PreBookingMessageModal
          businessId={businessId}
          businessName={businessName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default MessageButton;
