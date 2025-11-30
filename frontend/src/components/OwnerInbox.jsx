import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerInbox } from '../api/chatApi';
import ChatThread from './ChatThread';
import { useAuth } from '../context/AuthContext';
import './InboxStyles.css';

/**
 * OwnerInbox Component - REDESIGNED
 * Beautiful light pink + purple theme
 * 100% FREE - NO PAYWALL
 *
 * Shows owner's conversations with visitors and clients.
 * Modern, welcoming design with tab filtering support.
 */
const OwnerInbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'business' | 'owner'
  const [searchQuery, setSearchQuery] = useState('');

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

  // Helper to get display name for a thread's visitor
  const getVisitorDisplayName = (thread) => {
    const fullName = `${thread.visitor?.firstName || ''} ${thread.visitor?.lastName || ''}`.trim();
    return fullName || thread.visitor?.name || 'Client';
  };

  // Filter threads based on search
  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true;
    const displayName = getVisitorDisplayName(thread);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = threads.filter(t => t.unreadByOwner).length;

  // Format relative time
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
    <div className="inbox-container">
      {/* Sidebar / Conversation List */}
      <div className="inbox-sidebar">
        {/* Header */}
        <div className="inbox-header">
          <h1 className="inbox-title">Client Messages</h1>
          <p className="inbox-subtitle">
            {totalUnread > 0 ? `You have ${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
          {totalUnread > 0 && (
            <div className="inbox-unread-summary">
              <span className="inbox-unread-badge">{totalUnread}</span>
              <span>unread message{totalUnread !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="inbox-tabs">
          {[
            { id: 'all', label: 'All Messages', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            )},
            { id: 'business', label: 'Business', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )},
            { id: 'owner', label: 'Personal', icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inbox-tab ${activeTab === tab.id ? 'inbox-tab--active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="inbox-search-container">
          <div className="inbox-search-wrapper">
            <svg className="inbox-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="inbox-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="inbox-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inbox-error-icon">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <span>{error}</span>
            <button onClick={loadInbox} className="inbox-retry-btn">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="inbox-loading">
            <div className="inbox-skeleton">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="inbox-skeleton-item">
                  <div className="inbox-skeleton-avatar" />
                  <div className="inbox-skeleton-content">
                    <div className="inbox-skeleton-name" />
                    <div className="inbox-skeleton-message" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredThreads.length === 0 ? (
          /* Beautiful Empty State */
          <div className="inbox-empty-state">
            <div className="inbox-empty-bubble">
              <svg viewBox="0 0 24 24" fill="none" className="inbox-empty-icon">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="inbox-empty-title">
              {activeTab === 'business'
                ? 'No business messages yet'
                : activeTab === 'owner'
                  ? 'No personal messages yet'
                  : 'No messages yet'}
            </h2>
            <p className="inbox-empty-text">
              When clients message you, conversations will appear here
            </p>
            <button
              className="inbox-empty-cta"
              onClick={() => navigate('/owner/profile')}
            >
              <span>View My Profile</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inbox-cta-arrow">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          /* Thread List */
          <div className="inbox-thread-list">
            {filteredThreads.map((thread) => {
              // Determine who to display based on thread type
              const displayName = getVisitorDisplayName(thread);

              const displaySubtext = thread.threadType === 'business'
                ? `Re: ${thread.business?.businessName || thread.business?.name || 'Your Business'}`
                : thread.visitor?.handle || '';

              const avatarUrl = thread.visitor?.avatarUrl;
              const isUnread = thread.unreadByOwner;
              const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

              return (
                <div
                  key={thread._id}
                  className={`inbox-thread-item ${isUnread ? 'inbox-thread-item--unread' : ''}`}
                  onClick={() => handleThreadClick(thread)}
                >
                  {/* Unread indicator */}
                  {isUnread && <div className="inbox-unread-indicator" />}

                  {/* Avatar */}
                  <div className="inbox-avatar-wrapper">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="inbox-avatar"
                      />
                    ) : (
                      <div className="inbox-avatar-placeholder">
                        {initials}
                      </div>
                    )}
                    {thread.threadType && (
                      <div className={`inbox-avatar-badge ${thread.threadType === 'business' ? 'inbox-avatar-badge--business' : 'inbox-avatar-badge--personal'}`}>
                        {thread.threadType === 'business' ? (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="inbox-thread-content">
                    <div className="inbox-thread-header">
                      <h3 className={`inbox-thread-name ${isUnread ? 'inbox-thread-name--unread' : ''}`}>
                        {displayName}
                      </h3>
                      <span className={`inbox-thread-time ${isUnread ? 'inbox-thread-time--unread' : ''}`}>
                        {formatTime(thread.lastMessageAt)}
                      </span>
                    </div>
                    <div className="inbox-thread-meta">
                      <p className="inbox-thread-subtext">{displaySubtext}</p>
                      {thread.threadType && (
                        <span className={`inbox-thread-type inbox-thread-type--${thread.threadType}`}>
                          {thread.threadType}
                        </span>
                      )}
                    </div>
                    {thread.lastMessage && (
                      <p className={`inbox-thread-preview ${isUnread ? 'inbox-thread-preview--unread' : ''}`}>
                        {thread.lastMessage}
                      </p>
                    )}
                  </div>

                  {/* Unread count badge */}
                  {isUnread && (
                    <div className="inbox-thread-badge">
                      <span>NEW</span>
                    </div>
                  )}
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
