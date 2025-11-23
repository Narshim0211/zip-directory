import React, { useState, useEffect } from 'react';
import { getVisitorInbox, getChatPassStatus } from '../api/chat';
import ChatThread from './ChatThread';
import ChatPassPaywall from './ChatPassPaywall';

/**
 * VisitorInbox Component
 *
 * Shows list of conversations with businesses.
 * Displays FOMO indicators for locked replies.
 */
const VisitorInbox = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatPassStatus, setChatPassStatus] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadInbox();
    loadChatPassStatus();
  }, []);

  const loadInbox = async () => {
    try {
      const response = await getVisitorInbox();
      if (response.success) {
        setThreads(response.threads);
      }
    } catch (error) {
      console.error('Failed to load inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatPassStatus = async () => {
    try {
      const response = await getChatPassStatus();
      if (response.success) {
        setChatPassStatus(response);
      }
    } catch (error) {
      console.error('Failed to load chat pass status:', error);
    }
  };

  const handleThreadClick = (thread) => {
    // If thread has blurred replies and no chat pass, show paywall
    if (thread.hasBlurredReplies && !chatPassStatus?.hasChatPass && !chatPassStatus?.inGracePeriod) {
      setShowPaywall(true);
    } else {
      setSelectedThread(thread);
    }
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    loadInbox(); // Refresh to update unread counts
  };

  if (selectedThread) {
    return (
      <ChatThread
        threadId={selectedThread._id}
        businessName={selectedThread.business?.name}
        onClose={handleCloseThread}
        role="visitor"
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>
            Messages
          </h1>
          <p style={{ fontSize: '16px', color: '#718096' }}>
            Your conversations with salons and stylists
          </p>
        </header>

        {/* Chat Pass Status Banner */}
        {chatPassStatus && !chatPassStatus.hasChatPass && !chatPassStatus.inGracePeriod && (
          <div
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
              border: '2px solid #E91E63',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                💎 Unlock Unlimited Messaging
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Get instant replies from all premium salons for $9.99/mo
              </div>
            </div>
            <button
              onClick={() => setShowPaywall(true)}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Get Chat Pass
            </button>
          </div>
        )}

        {/* Grace Period Banner */}
        {chatPassStatus?.inGracePeriod && (
          <div
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              ⏰ Grace Period Active
            </div>
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              Your chat access expires on{' '}
              {new Date(chatPassStatus.graceEndsAt).toLocaleDateString()}. Renew to keep messaging!
            </div>
          </div>
        )}

        {/* Thread List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ color: '#718096' }}>Loading conversations...</p>
          </div>
        ) : threads.length === 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              No conversations yet
            </h3>
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              Start messaging salons to ask about services, availability, or pricing
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => handleThreadClick(thread)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
                        {thread.business?.name || 'Business'}
                      </h3>
                      {thread.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: '#E91E63',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>
                      {thread.business?.city || 'Location'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: '#a0aec0' }}>
                      {new Date(thread.lastMessageAt).toLocaleDateString()}
                    </div>
                    {thread.hasBlurredReplies && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
                          border: '1px solid #E91E63',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#E91E63',
                        }}
                      >
                        🔒 New Reply
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Pass Paywall Modal */}
      {showPaywall && (
        <ChatPassPaywall
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            loadChatPassStatus();
          }}
        />
      )}
    </div>
  );
};

export default VisitorInbox;
