import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from '../../api/chatApi';

/**
 * ProfileMessageButton - Message button for owner profiles
 *
 * Creates a new chat thread or navigates to existing one
 * Supports dual-identity messaging (owner personal profile)
 * 100% FREE - NO PAYWALL
 */
const ProfileMessageButton = ({ profileUser }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DEBUG: Log what we're receiving
  console.log('🔍 [ProfileMessageButton] Component rendered');
  console.log('   profileUser:', profileUser);
  console.log('   profileUser._id:', profileUser?._id);
  console.log('   profileUser.id:', profileUser?.id);
  console.log('   profileUser.role:', profileUser?.role);
  console.log('   user:', user);
  console.log('   user.id:', user?.id);
  console.log('   user._id:', user?._id);

  // Don't show message button if:
  // - User is not logged in
  // - User is viewing their own profile
  if (!user) {
    console.log('❌ No user logged in');
    return null;
  }

  // Compare IDs as strings to handle ObjectId vs string comparison
  const currentUserId = user.id?.toString() || user._id?.toString();
  const profileUserId = profileUser._id?.toString() || profileUser.id?.toString() || profileUser.userId?.toString();

  console.log('   currentUserId:', currentUserId);
  console.log('   profileUserId:', profileUserId);

  if (currentUserId === profileUserId) {
    console.log('❌ User is viewing their own profile');
    return null;
  }

  const handleMessageClick = async () => {
    setLoading(true);
    setError('');

    try {
      // Determine thread type based on profile user's role
      // If messaging an owner, use 'owner' threadType
      // If messaging a visitor, use 'visitor' threadType (we'll need to add this support)
      const threadType = profileUser.role === 'owner' ? 'owner' : 'visitor';
      const targetId = profileUser._id || profileUser.id || profileUser.userId;

      console.log('🚀 [ProfileMessageButton] About to send message');
      console.log('   threadType:', threadType);
      console.log('   targetId:', targetId);
      console.log('   profileUser._id:', profileUser._id);
      console.log('   profileUser.id:', profileUser.id);

      // Send initial message to create/get thread
      const response = await sendMessage(
        threadType,
        targetId,
        'Hi!', // Initial message text
        '' // photoUrl
      );

      // Navigate to the chat thread (adjust path based on current user role)
      if (response.threadId) {
        const chatPath = user.role === 'visitor' ? `/visitor/chat/${response.threadId}` : `/owner/chat/${response.threadId}`;
        navigate(chatPath);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation. The messaging system may need to be configured for this user type.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <button
        onClick={handleMessageClick}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          width: '100%',
          background: loading
            ? 'linear-gradient(135deg, #888 0%, #666 100%)'
            : 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(233, 30, 99, 0.3)',
          transition: 'all 0.2s ease',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 30, 99, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(233, 30, 99, 0.3)';
          }
        }}
      >
        <span style={{ fontSize: '18px' }}>💬</span>
        <span>{loading ? 'Opening chat...' : 'Message'}</span>
      </button>

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          border: '1px solid #F44336',
          borderRadius: '6px',
          color: '#F44336',
          fontSize: '13px',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfileMessageButton;
