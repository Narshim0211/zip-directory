import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVisitorInbox, getOwnerInbox } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

/**
 * ChatInbox - Unified inbox with dual-identity support
 *
 * Features:
 * - Visitor inbox: All threads
 * - Owner inbox: Tabs (All / Business / Personal)
 * - Unread badges
 * - Click to open conversation
 * - 100% FREE - NO PAYWALL
 */
const ChatInbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // For owners: all | business | owner
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchInbox();
    }
  }, [activeTab, user]);

  const fetchInbox = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (user.role === 'owner') {
        data = await getOwnerInbox(activeTab);
      } else {
        data = await getVisitorInbox();
      }
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Failed to load inbox:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (threadId) => {
    navigate(`/chat/${threadId}`);
  };

  const getThreadName = (thread) => {
    if (user.role === 'owner') {
      // Owner sees visitor name
      const visitor = thread.visitor;
      return visitor ? `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
    } else {
      // Visitor sees business or owner name
      if (thread.threadType === 'business' && thread.business) {
        return thread.business.name || 'Business';
      } else if (thread.threadType === 'owner' && thread.owner) {
        return `${thread.owner.firstName || ''} ${thread.owner.lastName || ''}`.trim() || 'Owner';
      }
      return 'Chat';
    }
  };

  const getThreadAvatar = (thread) => {
    if (user.role === 'owner') {
      return thread.visitor?.avatarUrl || '/default-avatar.png';
    } else {
      if (thread.threadType === 'business') {
        return thread.business?.logoUrl || '/default-avatar.png';
      } else {
        return thread.owner?.avatarUrl || '/default-avatar.png';
      }
    }
  };

  return (
    <div className="chat-inbox">
      <div className="chat-inbox__header">
        <h1 className="chat-inbox__title">Messages</h1>
      </div>

      {/* Tabs for owners only */}
      {user?.role === 'owner' && (
        <div className="chat-inbox__tabs">
          <button
            className={`chat-inbox__tab ${activeTab === 'all' ? 'chat-inbox__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`chat-inbox__tab ${activeTab === 'business' ? 'chat-inbox__tab--active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Business
          </button>
          <button
            className={`chat-inbox__tab ${activeTab === 'owner' ? 'chat-inbox__tab--active' : ''}`}
            onClick={() => setActiveTab('owner')}
          >
            Personal
          </button>
        </div>
      )}

      {/* Thread list */}
      <div className="chat-inbox__threads">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : error ? (
          <div className="chat-empty">
            <div className="chat-empty__icon"> </div>
            <p className="chat-empty__text">{error}</p>
            <button onClick={fetchInbox} className="message-btn" style={{ marginTop: '16px' }}>
              Retry
            </button>
          </div>
        ) : threads.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty__icon">=¬</div>
            <p className="chat-empty__text">
              {activeTab === 'business'
                ? 'No business messages yet'
                : activeTab === 'owner'
                ? 'No personal messages yet'
                : 'No messages yet'}
            </p>
          </div>
        ) : (
          threads.map(thread => (
            <div
              key={thread._id}
              className={`chat-thread-item ${thread.unreadCount > 0 ? 'chat-thread-item--unread' : ''}`}
              onClick={() => handleThreadClick(thread._id)}
            >
              <div className="chat-thread-item__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={getThreadAvatar(thread)}
                    alt="Avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <span className="chat-thread-item__name">{getThreadName(thread)}</span>
                    {thread.threadType && (
                      <span className="chat-thread-item__badge">
                        {thread.threadType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-thread-item__meta">
                <span>{new Date(thread.lastMessageAt).toLocaleDateString()}</span>
                {thread.unreadCount > 0 && (
                  <span className="chat-thread-item__unread">{thread.unreadCount}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
