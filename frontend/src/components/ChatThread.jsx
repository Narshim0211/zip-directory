import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadMessages, sendMessage, replyMessage, markMessagesRead } from '../api/chatApi';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

/**
 * ChatThread - Conversation view with gradient message bubbles
 *
 * Features:
 * - Gradient message bubbles (owner: pink→purple, visitor: blue→cyan)
 * - Auto-scroll to bottom on new messages
 * - Mark messages as read on open
 * - Photo support
 * - Back button to inbox
 * - 100% FREE - NO PAYWALL
 */
const ChatThread = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
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
    try {
      if (user.role === 'owner') {
        // Owner replying to visitor
        await replyMessage(threadId, messageText.trim(), photoUrl);
      } else {
        // Visitor sending message (would need threadType and targetId from thread context)
        // For simplicity, we'll use replyMessage for both since we're in an existing thread
        // In a real implementation, visitor would also use the reply endpoint
        await replyMessage(threadId, messageText.trim(), photoUrl);
      }

      // Clear input
      setMessageText('');
      setPhotoUrl('');

      // Refresh messages
      await fetchMessages();
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getMessageBubbleClass = (message) => {
    const isCurrentUser = message.senderId?._id === user.id || message.senderId === user.id;
    const senderRole = message.senderRole;

    if (isCurrentUser) {
      return senderRole === 'owner' ? 'message-bubble--owner-self' : 'message-bubble--visitor-self';
    } else {
      return senderRole === 'owner' ? 'message-bubble--owner-other' : 'message-bubble--visitor-other';
    }
  };

  const getSenderName = (message) => {
    if (typeof message.senderId === 'object' && message.senderId !== null) {
      const sender = message.senderId;
      return `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User';
    }
    return message.senderRole === 'owner' ? 'Owner' : 'Visitor';
  };

  const getSenderAvatar = (message) => {
    if (typeof message.senderId === 'object' && message.senderId !== null) {
      return message.senderId.avatarUrl || '/default-avatar.png';
    }
    return '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="chat-thread">
        <div className="chat-loading">Loading conversation...</div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="chat-thread">
        <div className="chat-thread__header">
          <button onClick={() => navigate('/inbox')} className="chat-thread__back-btn">
            ← Back
          </button>
        </div>
        <div className="chat-empty">
          <div className="chat-empty__icon">⚠️</div>
          <p className="chat-empty__text">{error}</p>
          <button onClick={fetchMessages} className="message-btn" style={{ marginTop: '16px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-thread">
      {/* Header with back button */}
      <div className="chat-thread__header">
        <button onClick={() => navigate('/inbox')} className="chat-thread__back-btn">
          ← Back to Messages
        </button>
        {thread && (
          <div className="chat-thread__info">
            <span className="chat-thread__type-badge">{thread.threadType}</span>
          </div>
        )}
      </div>

      {/* Messages container */}
      <div className="chat-thread__messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty__icon">💬</div>
            <p className="chat-empty__text">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId?._id === user.id || message.senderId === user.id;

            return (
              <div
                key={message._id}
                className={`message-wrapper ${isCurrentUser ? 'message-wrapper--self' : 'message-wrapper--other'}`}
              >
                {!isCurrentUser && (
                  <img
                    src={getSenderAvatar(message)}
                    alt="Avatar"
                    className="message-avatar"
                  />
                )}

                <div className={`message-bubble ${getMessageBubbleClass(message)}`}>
                  {!isCurrentUser && (
                    <div className="message-bubble__sender">{getSenderName(message)}</div>
                  )}

                  <div className="message-bubble__text">{message.text}</div>

                  {message.photoUrl && (
                    <img
                      src={message.photoUrl}
                      alt="Attachment"
                      className="message-bubble__photo"
                    />
                  )}

                  <div className="message-bubble__timestamp">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {isCurrentUser && (
                  <img
                    src={getSenderAvatar(message)}
                    alt="Avatar"
                    className="message-avatar"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="chat-thread__input-form">
        <div className="chat-thread__input-container">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="chat-thread__input"
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
            className="chat-thread__send-btn"
            disabled={!messageText.trim() || sending}
          >
            {sending ? '...' : '→'}
          </button>
        </div>

        {error && <div className="chat-thread__error">{error}</div>}
      </form>
    </div>
  );
};

export default ChatThread;
