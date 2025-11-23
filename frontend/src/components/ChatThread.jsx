import React, { useState, useEffect, useRef } from 'react';
import { getThreadMessages, visitorSendMessage, ownerReplyMessage, markMessagesRead } from '../api/chat';
import ChatPassPaywall from './ChatPassPaywall';

/**
 * ChatThread Component
 *
 * Displays conversation messages between visitor and owner.
 * Handles blurred messages and FOMO paywalls.
 */
const ChatThread = ({ threadId, businessName, visitorName, onClose, role, isPremium }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Mark messages as read
    markMessagesRead(threadId).catch(console.error);
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await getThreadMessages(threadId);
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');

    try {
      let response;
      if (role === 'visitor') {
        response = await visitorSendMessage(null, newMessage.trim(), ''); // threadId will be handled by backend
      } else {
        response = await ownerReplyMessage(threadId, newMessage.trim());
      }

      if (response.success) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const errorData = err.response.data;
        if (errorData.requiresPayment) {
          // Visitor needs chat pass
          setShowPaywall(true);
        } else if (errorData.requiresUpgrade) {
          // Owner needs premium
          setError('Premium subscription required to reply');
        } else {
          setError(errorData.message || 'Unable to send message');
        }
      } else {
        setError('Failed to send message');
      }
    } finally {
      setSending(false);
    }
  };

  const hasBlurredMessages = messages.some((msg) => msg.isBlurred);

  return (
    <>
      {/* CSS Animations for Blurred Messages */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.8;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
            {businessName || visitorName || 'Conversation'}
          </h2>
        </div>
      </div>

      {/* FOMO Banner for Blurred Messages (Visitor) */}
      {role === 'visitor' && hasBlurredMessages && (
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
            border: '2px solid #E91E63',
            borderBottom: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              🔒 {businessName} replied! Unlock to read.
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Get unlimited messaging with all premium salons for $9.99/mo
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
            Unlock Now
          </button>
        </div>
      )}

      {/* FOMO Banner for Non-Premium Owner */}
      {role === 'owner' && !isPremium && (
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderBottom: 'none',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>
            💎 Premium Required to Reply
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            Upgrade to Premium ($49/mo) to respond to client messages and grow your business.{' '}
            <a href="/owner/my-business" style={{ color: '#92400e', fontWeight: '600', textDecoration: 'underline' }}>
              Upgrade Now
            </a>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#718096' }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#718096' }}>No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderRole === role;
            const isBlurred = msg.isBlurred && role === 'visitor';

            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: isOwnMessage ? '#667eea' : 'white',
                    color: isOwnMessage ? 'white' : '#1a202c',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    position: 'relative',
                    cursor: isBlurred ? 'pointer' : 'default',
                  }}
                  onClick={isBlurred ? () => setShowPaywall(true) : undefined}
                >
                  {isBlurred ? (
                    <>
                      {/* Blurred Message Preview with FOMO Overlay */}
                      <div style={{
                        filter: 'blur(8px)',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        color: '#718096'
                      }}>
                        This message has been blurred to protect privacy and create intrigue
                      </div>

                      {/* Unlock Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.15) 0%, rgba(240, 98, 146, 0.15) 100%)',
                        backdropFilter: 'blur(2px)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          fontSize: '24px',
                          animation: 'pulse 2s ease-in-out infinite'
                        }}>
                          🔒
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#E91E63',
                          textAlign: 'center',
                          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                        }}>
                          Tap to Unlock
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#64748b',
                          textAlign: 'center',
                          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                        }}>
                          $9.99/mo
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  )}
                  {!isBlurred && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '11px',
                        opacity: 0.7,
                        textAlign: 'right',
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Message Input */}
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !sending && handleSend()}
          placeholder="Type a message..."
          maxLength={500}
          disabled={sending || (role === 'owner' && !isPremium)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '15px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim() || (role === 'owner' && !isPremium)}
          style={{
            padding: '12px 24px',
            background:
              sending || !newMessage.trim() || (role === 'owner' && !isPremium)
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor:
              sending || !newMessage.trim() || (role === 'owner' && !isPremium) ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Chat Pass Paywall */}
      {showPaywall && (
        <ChatPassPaywall
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            loadMessages(); // Reload to see unblurred messages
          }}
        />
      )}
    </div>
    </>
  );
};

export default ChatThread;
