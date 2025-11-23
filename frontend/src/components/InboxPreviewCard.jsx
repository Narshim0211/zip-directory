import React, { useState, useEffect } from 'react';
import { getOwnerInbox } from '../api/chat';

/**
 * InboxPreviewCard Component
 *
 * Shows message count and upgrade CTA for free owners
 * Links to full inbox for premium owners
 */
const InboxPreviewCard = ({ businessId, listingType }) => {
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadMessageCount();
    }
  }, [businessId]);

  const loadMessageCount = async () => {
    try {
      const response = await getOwnerInbox();
      if (response.success) {
        setMessageCount(response.threads?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load message count:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFree = listingType === 'free';
  const isPremium = listingType === 'premium';

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
          💬 Client Messages
        </h3>
        {!loading && (
          <span style={{
            backgroundColor: messageCount > 0 ? '#E91E63' : '#e2e8f0',
            color: messageCount > 0 ? 'white' : '#718096',
            fontSize: '14px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '12px',
          }}>
            {messageCount} {messageCount === 1 ? 'message' : 'messages'}
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
          Loading messages...
        </div>
      )}

      {/* Free Owner - FOMO Banner */}
      {!loading && isFree && messageCount > 0 && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
          border: '2px solid #E91E63',
          borderRadius: '10px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            🔒 You have {messageCount} {messageCount === 1 ? 'message' : 'messages'} from potential clients!
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
            Clients are trying to reach you, but only Premium owners can reply to messages.
            Upgrade now to start conversations and grow your business.
          </p>
          <a href="#premium" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
          }}>
            Upgrade to Premium - $49/mo
          </a>
        </div>
      )}

      {!loading && isFree && messageCount === 0 && (
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>
            💎 Ready to Receive Client Messages?
          </div>
          <p style={{ fontSize: '14px', color: '#92400e', margin: '0 0 16px 0' }}>
            Premium listings can receive and reply to client messages.
            Start conversations and convert inquiries into bookings.
          </p>
          <a href="#premium" style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            Learn More
          </a>
        </div>
      )}

      {/* View Messages Link (Free can see but not reply) */}
      {!loading && isFree && messageCount > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <a href="/owner/inbox" style={{
            color: '#667eea',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            View Messages (Read-Only) →
          </a>
        </div>
      )}

      {/* Premium Owner - Simple Link */}
      {!loading && isPremium && messageCount > 0 && (
        <div style={{ padding: '20px', backgroundColor: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>
            You have {messageCount} {messageCount === 1 ? 'message' : 'messages'} waiting
          </div>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: '0 0 16px 0' }}>
            Check your inbox to reply to client inquiries and grow your business.
          </p>
          <a href="/owner/inbox" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          }}>
            View Inbox →
          </a>
        </div>
      )}

      {!loading && isPremium && messageCount === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', margin: '0 0 8px 0' }}>
            No messages yet
          </p>
          <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px 0' }}>
            When clients message you, they'll appear here
          </p>
          <a href="/owner/inbox" style={{
            color: '#667eea',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            Go to Inbox →
          </a>
        </div>
      )}

      {/* No Listing Type Yet */}
      {!loading && !isFree && !isPremium && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Select a listing type above to enable messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default InboxPreviewCard;
