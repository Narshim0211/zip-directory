import React, { useState, useEffect } from 'react';
import { getOwnerInbox } from '../api/chatApi';
import ChatThread from './ChatThread';
import { useAuth } from '../context/AuthContext';

/**
 * OwnerInbox Component
 * 100% FREE - NO PAYWALL
 *
 * Shows owner's conversations with visitors and clients.
 * Clean, futuristic design with tab filtering support.
 */
const OwnerInbox = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'business' | 'owner'

  useEffect(() => {
    loadInbox();
  }, [activeTab]);

  const loadInbox = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOwnerInbox(activeTab);

      if (response.success) {
        setThreads(response.threads || []);
      } else {
        setError(response.message || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
  };

  const handleCloseThread = () => {
    setSelectedThread(null);
    loadInbox(); // Refresh to update unread counts
  };

  const totalUnread = threads.filter(t => t.unreadByOwner).length;

  // If thread is selected, show the thread view
  if (selectedThread) {
    return (
      <ChatThread
        threadId={selectedThread._id}
        thread={selectedThread}
        onClose={handleCloseThread}
        role="owner"
      />
    );
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Client Messages
          </h1>
          <p style={{ fontSize: '16px', color: '#888' }}>
            {totalUnread > 0 ? `${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </header>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid #333',
          paddingBottom: '12px'
        }}>
          {['all', 'business', 'owner'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === tab ? '#E91E63' : 'transparent',
                color: activeTab === tab ? '#ffffff' : '#888',
                border: activeTab === tab ? 'none' : '1px solid #333',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = '#E91E63';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {tab === 'all' ? 'All' : tab === 'business' ? 'Business' : 'Personal'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '16px 20px',
            marginBottom: '24px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #F44336',
            borderRadius: '12px',
            color: '#F44336'
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p style={{ color: '#888' }}>Loading messages...</p>
          </div>
        ) : threads.length === 0 ? (
          /* Empty State */
          <div
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              No messages yet
            </h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>
              When clients message you, conversations will appear here
            </p>
          </div>
        ) : (
          /* Thread List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {threads.map((thread) => {
              // Determine who to display based on thread type
              const displayName = thread.visitor?.firstName
                ? `${thread.visitor.firstName} ${thread.visitor.lastName || ''}`.trim()
                : 'Client';

              const displaySubtext = thread.threadType === 'business'
                ? `Re: ${thread.business?.businessName || 'Your Business'}`
                : thread.visitor?.handle || '@visitor';

              const avatarUrl = thread.visitor?.avatarUrl;

              return (
                <div
                  key={thread._id}
                  onClick={() => handleThreadClick(thread)}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    border: thread.unreadByOwner ? '2px solid #E91E63' : '1px solid #333',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E91E63';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = thread.unreadByOwner ? '#E91E63' : '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                    {/* Avatar */}
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #333'
                        }}
                      />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                          {displayName}
                        </h3>
                        {thread.unreadByOwner && (
                          <span
                            style={{
                              backgroundColor: '#E91E63',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '10px',
                            }}
                          >
                            NEW
                          </span>
                        )}
                        {thread.threadType && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#666',
                              padding: '2px 8px',
                              backgroundColor: '#222',
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {thread.threadType}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0 0' }}>
                        {displaySubtext}
                      </p>

                      {/* Last Message Preview */}
                      {thread.lastMessage && (
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          margin: '8px 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {thread.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {new Date(thread.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerInbox;
