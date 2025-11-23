import React, { useState, useEffect } from 'react';
import { getOwnerInbox } from '../api/chat';
import ownerApi from '../api/owner';
import ChatThread from './ChatThread';

/**
 * OwnerInbox Component
 *
 * Shows list of client conversations.
 * Displays FOMO banner if owner is not premium.
 */
const OwnerInbox = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);

  useEffect(() => {
    loadInbox();
    loadBusiness();
  }, []);

  const loadInbox = async () => {
    try {
      const response = await getOwnerInbox();
      if (response.success) {
        setThreads(response.threads);
      }
    } catch (error) {
      console.error('Failed to load inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusiness = async () => {
    try {
      const { data } = await ownerApi.get('/business');
      setBusinessData(data);
    } catch (error) {
      console.error('Failed to load business:', error);
    }
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    loadInbox(); // Refresh to update unread counts
  };

  const isPremium = businessData?.listingType === 'premium' && businessData?.premiumSubscription?.active === true;
  const totalUnread = threads.reduce((sum, thread) => sum + (thread.unreadCount || 0), 0);

  if (selectedThread) {
    return (
      <ChatThread
        threadId={selectedThread._id}
        visitorName={selectedThread.visitor?.name}
        onClose={handleCloseThread}
        role="owner"
        isPremium={isPremium}
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>
            Client Messages
          </h1>
          <p style={{ fontSize: '16px', color: '#718096' }}>
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </header>

        {/* FOMO Banner for Free Owners */}
        {!isPremium && threads.length > 0 && (
          <div
            style={{
              padding: '20px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
              border: '2px solid #E91E63',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              💎 Upgrade to Premium to Reply to Clients
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              You have {threads.length} message{threads.length !== 1 ? 's' : ''} from potential clients. Upgrade to
              Premium ($49/mo) to respond and grow your business.
            </p>
            <a
              href="/owner/my-business"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              Upgrade Now
            </a>
          </div>
        )}

        {/* Thread List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ color: '#718096' }}>Loading messages...</p>
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
              No messages yet
            </h3>
            <p style={{ color: '#718096', marginBottom: '24px' }}>
              {isPremium
                ? 'When clients message you, conversations will appear here'
                : 'Upgrade to Premium to receive and reply to client messages'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {threads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => setSelectedThread(thread)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  border: thread.unreadCount > 0 ? '2px solid #667eea' : '2px solid transparent',
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
                        {thread.visitor?.name || 'Client'}
                      </h3>
                      {thread.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                          }}
                        >
                          {thread.unreadCount} new
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>
                      Last message: {new Date(thread.lastMessageAt).toLocaleString()}
                    </p>
                  </div>

                  {!isPremium && (
                    <div
                      style={{
                        padding: '6px 12px',
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#92400e',
                      }}
                    >
                      Premium Required
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerInbox;
