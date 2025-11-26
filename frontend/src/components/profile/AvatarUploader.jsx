import React, { useState, useRef } from 'react';
import api from '../../api/axios';

/**
 * AvatarUploader Component
 * Handles avatar/logo upload with glow rings for premium/verified users
 *
 * @param {Object} props
 * @param {Object} props.profile - User profile data
 * @param {boolean} props.isOwner - Whether user is an owner
 * @param {Function} props.onUpload - Callback after successful upload
 */
export default function AvatarUploader({ profile, isOwner, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isPremium = profile?.premium || false;
  const isVerified = profile?.verified || false;
  const avatarUrl = profile?.avatarUrl || '';
  const initials = profile?.firstName?.charAt(0)?.toUpperCase() || '?';

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];

        try {
          const endpoint = isOwner ? '/v1/owner-profiles/me/upload' : '/v1/visitor-profiles/me/upload';
          const { data } = await api.post(endpoint, {
            type: 'avatar',
            base64,
            originalName: file.name,
          });

          onUpload(data.url);
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Upload failed. Please try again.');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        alert('Failed to read file');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const handleClick = () => {
    console.log('📸 [AvatarUploader] Upload button clicked');
    console.log('📸 [AvatarUploader] fileInputRef:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('📸 [AvatarUploader] File picker triggered');
    } else {
      console.error('❌ [AvatarUploader] fileInputRef is null!');
    }
  };

  return (
    <div className="avatar-uploader-container">
      <span className="card-label">
        {isOwner ? '🏢 Business Logo' : '✨ Your Glow-Up Photo'}
      </span>

      <div className="avatar-preview-wrapper">
        {/* Glow Ring */}
        {(isPremium || isVerified) && (
          <div
            className={`avatar-glow-ring ${isPremium ? 'premium' : 'verified'} ${isOwner ? 'owner' : ''}`}
          />
        )}

        {/* Avatar Preview */}
        <div className={`avatar-preview ${isOwner ? 'owner' : ''}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">{initials}</div>
          )}

          {/* Upload Overlay */}
          <div className="avatar-upload-overlay" onClick={handleClick}>
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        className="avatar-upload-button"
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? '⏳ Uploading...' : isOwner ? '📸 Upload Logo' : '📸 Upload Glow-Up'}
      </button>

      {uploading && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
          Processing image...
        </div>
      )}

      {/* Helper Text */}
      <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
        JPG, PNG or WebP • Max 5MB
      </p>
    </div>
  );
}
