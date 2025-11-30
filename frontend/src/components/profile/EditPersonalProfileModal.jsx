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
 * EditPersonalProfileModal - Personal profile editor for OWNER
 *
 * This edits the PERSONAL identity of the owner (the human):
 * - Personal name: "Nitesh Siwakoti"
 * - Personal handle: "@nitesh"
 * - Personal avatar (round photo)
 * - Personal bio
 * - Personal social links
 *
 * This is SEPARATE from business profiles (salons/spas owned by this person)
 *
 * API: PUT /v1/owner-profiles/me
 * Database: ownerprofiles collection
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSave - Optional callback after successful save
 */
export default function EditPersonalProfileModal({ isOpen, onClose, onSave }) {
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
        console.log('[EditPersonalProfileModal] Loaded personal profile:', data);
        setProfile(data);
      } catch (error) {
        console.error('[EditPersonalProfileModal] Failed to load profile:', error);
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
      console.log('[EditPersonalProfileModal] Saving personal profile:', updatedData);
      const { data } = await api.put(`${apiBase}/me`, updatedData);
      setProfile(data);
      if (onSave) onSave(data);
    } catch (error) {
      console.error('[EditPersonalProfileModal] Save failed:', error);
      throw error;
    }
  };

  const { save, saving, saved, error } = useAutoSave(saveProfile, 1000);

  // Handle field changes
  const handleChange = (field, value) => {
    console.log('🔧 [EditPersonalProfileModal] handleChange:', { field, value });
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    save(updatedProfile);

    // Update auth context for fields that appear in ProfileAvatar
    if (['firstName', 'lastName', 'handle', 'avatarUrl'].includes(field)) {
      updateUser({ [field]: value });
    }
  };

  // Handle nested field changes (e.g., socialLinks)
  const handleNestedChange = (parent, field, value) => {
    console.log('🔧 [EditPersonalProfileModal] handleNestedChange:', { parent, field, value });
    const updatedProfile = {
      ...profile,
      [parent]: {
        ...profile[parent],
        [field]: value,
      },
    };
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
            {isOwner ? '✨ Edit Your Profile' : '✨ Edit Your Profile'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            {isOwner
              ? 'This is your personal profile (not business profile)'
              : 'Update your personal information'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading your profile...
          </div>
        ) : profile ? (
          <>
            {/* 4 Giant Cards */}
            <div className="profile-edit-cards">
              {/* Card 1: Avatar */}
              <div className="profile-edit-card">
                {/* Use actual isOwner to determine correct upload endpoint */}
                <AvatarUploader
                  profile={profile}
                  isOwner={isOwner}
                  onUpload={(url) => {
                    console.log('[EditPersonalProfileModal] Avatar uploaded:', url);
                    // Update local profile state
                    handleChange('avatarUrl', url);
                    // Update global auth context so avatar shows everywhere
                    updateUser({ avatarUrl: url });
                  }}
                />
              </div>

              {/* Card 2: Headline (Name, Handle, Title) */}
              <div className="profile-edit-card">
                {/* Use visitor style for personal */}
                <HeadlineEditor
                  profile={profile}
                  isOwner={false}
                  onChange={handleChange}
                />
              </div>

              {/* Card 3: Bio */}
              <div className="profile-edit-card">
                {/* Use visitor style for personal */}
                <BioEditor
                  profile={profile}
                  isOwner={false}
                  onChange={handleChange}
                />
              </div>

              {/* Card 4: Personal Social Links */}
              <div className="profile-edit-card">
                {/* Use visitor style for personal */}
                <LinksEditor
                  profile={profile}
                  isOwner={false}
                  onChange={handleNestedChange}
                />
              </div>
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            Failed to load profile
          </div>
        )}
      </div>
    </div>
  );
}
