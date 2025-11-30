import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadMessages, replyMessage, sendMessageInThread, markMessagesRead } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import './ChatThreadStyles.css';

/**
 * ChatThread - REDESIGNED with Pink/Purple Theme
 * Beautiful light theme matching the new inbox design
 *
 * Features:
 * - Gradient message bubbles (sender: pink→purple, receiver: light gray)
 * - Auto-scroll to bottom on new messages
 * - Mark messages as read on open
 * - Photo support
 * - Back button to inbox
 * - 100% FREE - NO PAYWALL
 */
const ChatThread = ({ threadId: propThreadId, thread: propThread, onClose }) => {
  const { threadId: paramThreadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Use prop threadId if provided (inline mode), otherwise use URL param (route mode)
  const threadId = propThreadId || paramThreadId;

  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(propThread || null);
  const [messageText, setMessageText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (threadId) {
      fetchMessages();
      markAsRead();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getThreadMessages(threadId);
      setMessages(data.messages || []);
      setThread(data.thread);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await markMessagesRead(threadId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    setSending(true);
    setError('');

    try {
      // Use different API based on user role:
      // - Owners use /reply endpoint
      // - Visitors use /send endpoint (with thread context)
      if (user?.role === 'owner') {
        await replyMessage(threadId, messageText.trim(), photoUrl);
      } else {
        // Visitor: use sendMessageInThread which calls /send with thread info
        if (!thread) {
          throw new Error('Thread info not available');
        }
        await sendMessageInThread(thread, messageText.trim(), photoUrl);
      }

      // Clear input
      setMessageText('');
      setPhotoUrl('');

      // Refresh messages
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getSenderName = (message) => {
    if (typeof message.senderId === 'object' && message.senderId !== null) {
      const sender = message.senderId;
      // Try firstName + lastName first, then fall back to name field
      const fullName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
      return fullName || sender.name || 'User';
    }
    return message.senderRole === 'owner' ? 'Owner' : 'Visitor';
  };

  const getSenderAvatar = (message) => {
    if (typeof message.senderId === 'object' && message.senderId !== null) {
      return message.senderId.avatarUrl;
    }
    return null;
  };

  const getSenderInitials = (message) => {
    const name = getSenderName(message);
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.createdAt });
      }
      groups.push({ type: 'message', data: msg });
    });

    return groups;
  };

  // Determine correct inbox path based on user role
  const getInboxPath = () => {
    if (user?.role === 'owner') return '/owner/inbox';
    return '/visitor/inbox';
  };

  // Handle back button - use onClose prop if in inline mode, otherwise navigate
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(getInboxPath());
    }
  };

  // Get thread participant info
  const getParticipantInfo = () => {
    if (!thread) return { name: 'Chat', subtext: '' };

    if (user?.role === 'owner') {
      // Owner sees visitor info
      const visitor = thread.visitor;
      const visitorFullName = visitor ? `${visitor.firstName || ''} ${visitor.lastName || ''}`.trim() : '';
      return {
        name: visitorFullName || visitor?.name || 'Client',
        subtext: visitor?.handle || '',
        avatar: visitor?.avatarUrl
      };
    } else {
      // Visitor sees business or owner info
      if (thread.threadType === 'business' && thread.business) {
        return {
          name: thread.business.businessName || thread.business.name || 'Business',
          subtext: thread.business.location || thread.business.city || '',
          avatar: thread.business.logo || thread.business.logoUrl
        };
      } else if (thread.owner) {
        const ownerFullName = `${thread.owner.firstName || ''} ${thread.owner.lastName || ''}`.trim();
        return {
          name: ownerFullName || thread.owner.name || 'Owner',
          subtext: thread.owner.handle || '',
          avatar: thread.owner.avatarUrl
        };
      }
    }
    return { name: 'Chat', subtext: '' };
  };

  const participant = getParticipantInfo();
  const participantInitials = participant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Loading state
  if (loading) {
    return (
      <div className="chat-thread-container">
        <div className="chat-thread-header">
          <button onClick={handleBack} className="chat-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>
        <div className="chat-thread-loading">
          <div className="chat-loading-spinner"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="chat-thread-container">
        <div className="chat-thread-header">
          <button onClick={handleBack} className="chat-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>
        <div className="chat-thread-error">
          <div className="chat-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchMessages} className="chat-retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="chat-thread-container">
      {/* Header */}
      <div className="chat-thread-header">
        <button onClick={handleBack} className="chat-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="chat-back-text">Back</span>
        </button>

        <div className="chat-header-info">
          <div className="chat-header-avatar">
            {participant.avatar ? (
              <img src={participant.avatar} alt={participant.name} />
            ) : (
              <div className="chat-avatar-placeholder">{participantInitials}</div>
            )}
          </div>
          <div className="chat-header-details">
            <h2 className="chat-header-name">{participant.name}</h2>
            {participant.subtext && (
              <p className="chat-header-subtext">{participant.subtext}</p>
            )}
          </div>
        </div>

        {thread?.threadType && (
          <span className={`chat-type-badge chat-type-badge--${thread.threadType}`}>
            {thread.threadType}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-messages">
            <div className="chat-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h3>Start the conversation</h3>
            <p>Send a message to begin chatting</p>
          </div>
        ) : (
          groupedMessages.map((item, index) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${index}`} className="chat-date-divider">
                  <span>{formatDate(item.date)}</span>
                </div>
              );
            }

            const message = item.data;
            const isCurrentUser = message.senderId?._id === user?.id || message.senderId === user?.id;
            const avatarUrl = getSenderAvatar(message);
            const initials = getSenderInitials(message);

            return (
              <div
                key={message._id}
                className={`chat-message ${isCurrentUser ? 'chat-message--sent' : 'chat-message--received'}`}
              >
                {!isCurrentUser && (
                  <div className="chat-message-avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" />
                    ) : (
                      <div className="chat-avatar-placeholder chat-avatar-placeholder--small">
                        {initials}
                      </div>
                    )}
                  </div>
                )}

                <div className="chat-message-content">
                  {!isCurrentUser && (
                    <span className="chat-message-sender">{getSenderName(message)}</span>
                  )}

                  <div className={`chat-bubble ${isCurrentUser ? 'chat-bubble--sent' : 'chat-bubble--received'}`}>
                    <p className="chat-bubble-text">{message.text}</p>

                    {message.photoUrl && (
                      <img src={message.photoUrl} alt="Attachment" className="chat-bubble-image" />
                    )}
                  </div>

                  <span className="chat-message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        {error && messages.length > 0 && (
          <div className="chat-input-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="chat-input-wrapper">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            rows="1"
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <div className="chat-send-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatThread;
