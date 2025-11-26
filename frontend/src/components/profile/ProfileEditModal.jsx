import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { useAutoSave } from '../../hooks/useAutoSave';
import AvatarUploader from './AvatarUploader';
import HeadlineEditor from './HeadlineEditor';
import BioEditor from './BioEditor';
import LinksEditor from './LinksEditor';
import '../../styles/profileEditModal.css';

/**
 * ProfileEditModal - Unified futuristic profile editor
 * Works for both Owner and Visitor profiles with zero duplication
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Optional callback after successful save
 */
export default function ProfileEditModal({ isOpen, onClose, onSave }) {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.role === 'owner';
  const apiBase = isOwner ? '/v1/owner-profiles' : '/v1/visitor-profiles';

  // Fetch profile data
  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`${apiBase}/me`);
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
        alert('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, apiBase]);

  // Auto-save function
  const saveProfile = async (updatedData) => {
    try {
      const { data } = await api.put(`${apiBase}/me`, updatedData);
      setProfile(data);

      // 🔄 Sync avatar to AuthContext so ProfileAvatar updates immediately
      if (data.avatarUrl) {
        updateUser({ avatarUrl: data.avatarUrl });
      }

      if (onSave) onSave(data);
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const { save, saving, saved, error } = useAutoSave(saveProfile, 1000);

  // Handle field changes
  const handleChange = (field, value) => {
    console.log('🔧 [ProfileEditModal] handleChange called:', { field, value });
    const updatedProfile = { ...profile, [field]: value };
    console.log('📝 [ProfileEditModal] Updated profile:', updatedProfile);
    setProfile(updatedProfile);
    save(updatedProfile);
  };

  // Handle nested field changes (e.g., socialLinks)
  const handleNestedChange = (parent, field, value) => {
    console.log('🔧 [ProfileEditModal] handleNestedChange called:', { parent, field, value });
    const updatedProfile = {
      ...profile,
      [parent]: {
        ...profile[parent],
        [field]: value,
      },
    };
    console.log('📝 [ProfileEditModal] Updated profile:', updatedProfile);
    setProfile(updatedProfile);
    save(updatedProfile);
  };

  // Handle close with escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="profile-edit-overlay" onClick={onClose}>
      <div className="profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="profile-edit-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Header */}
        <div className="profile-edit-header">
          <h2 className="profile-edit-title">
            {isOwner ? 'Edit Business Profile' : 'Edit Your Profile'}
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
            Loading profile...
          </div>
        ) : profile ? (
          <>
            {/* 4 Giant Cards */}
            <div className="profile-edit-cards">
              {/* Card 1: Avatar */}
              <div className="profile-edit-card">
                <AvatarUploader
                  profile={profile}
                  isOwner={isOwner}
                  onUpload={(url) => handleChange(isOwner ? 'avatarUrl' : 'avatarUrl', url)}
                />
              </div>

              {/* Card 2: Headline */}
              <div className="profile-edit-card">
                <HeadlineEditor
                  profile={profile}
                  isOwner={isOwner}
                  onChange={handleChange}
                />
              </div>

              {/* Card 3: Bio */}
              <div className="profile-edit-card">
                <BioEditor
                  profile={profile}
                  isOwner={isOwner}
                  onChange={handleChange}
                />
              </div>

              {/* Card 4: Links */}
              <div className="profile-edit-card">
                <LinksEditor
                  profile={profile}
                  isOwner={isOwner}
                  onChange={handleNestedChange}
                />
              </div>

              {/* Owner-specific: Featured Businesses */}
              {isOwner && profile.featuredBusinesses && (
                <div className="profile-edit-card">
                  <span className="card-label">Featured Businesses</span>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    {profile.featuredBusinesses.length > 0
                      ? `${profile.featuredBusinesses.length} business(es) featured`
                      : 'No businesses featured'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '8px' }}>
                    Edit featured businesses from your dashboard
                  </p>
                </div>
              )}
            </div>

            {/* Save Button and Auto-save Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div className={`autosave-indicator ${saving ? 'saving' : saved ? 'saved' : ''}`}>
                {saving ? '💾 Saving...' : saved ? '✓ Saved' : error ? `⚠ ${error}` : 'Changes save automatically'}
              </div>
              <button
                onClick={() => {
                  save(profile);
                  onClose();
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
              >
                Save & Close
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,100,100,0.9)' }}>
            Failed to load profile
          </div>
        )}
      </div>
    </div>
  );
}
