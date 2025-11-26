import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAutoSave } from '../../hooks/useAutoSave';
import '../../styles/profileEditModal.css';

/**
 * EditBusinessProfileModal - Business profile editor (CREATE + EDIT modes)
 *
 * This edits OR creates a BUSINESS entity (salon/spa/shop):
 * - Business name: "Nites Salon"
 * - Business logo (square)
 * - Business description/tagline
 * - Business location
 * - Business category
 *
 * This is SEPARATE from the owner's personal profile
 *
 * API:
 * - CREATE: POST /v1/businesses
 * - EDIT: PUT /v1/businesses/:id
 * Database: businesses collection
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.businessId - Business ID to edit (if null, CREATE mode)
 * @param {Function} props.onSave - Optional callback after successful save
 */
export default function EditBusinessProfileModal({ isOpen, onClose, businessId, onSave }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const isCreateMode = !businessId;

  // Fetch business data OR initialize empty business
  useEffect(() => {
    if (!isOpen) return;

    if (isCreateMode) {
      // CREATE mode - start with empty business
      console.log('[EditBusinessProfileModal] CREATE mode - initializing empty business');
      setBusiness({
        name: '',
        category: 'Salon',
        description: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      });
      setLoading(false);
    } else {
      // EDIT mode - fetch existing business
      const fetchBusiness = async () => {
        setLoading(true);
        try {
          console.log('[EditBusinessProfileModal] EDIT mode - loading business:', businessId);
          const { data } = await api.get(`/v1/businesses/${businessId}`);
          console.log('[EditBusinessProfileModal] Business loaded:', data);
          setBusiness(data);
        } catch (error) {
          console.error('[EditBusinessProfileModal] Failed to load:', error);
          alert('Failed to load business. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchBusiness();
    }
  }, [isOpen, businessId, isCreateMode]);

  // Save function (handles both CREATE and EDIT)
  const saveBusiness = async (updatedData) => {
    try {
      if (isCreateMode) {
        console.log('[EditBusinessProfileModal] Creating new business:', updatedData);
        const { data } = await api.post('/v1/businesses', updatedData);
        setBusiness(data);
        if (onSave) onSave(data);
        return data;
      } else {
        console.log('[EditBusinessProfileModal] Updating business:', updatedData);
        const { data } = await api.put(`/v1/businesses/${businessId}`, updatedData);
        setBusiness(data);
        if (onSave) onSave(data);
        return data;
      }
    } catch (error) {
      console.error('[EditBusinessProfileModal] Save failed:', error);
      throw error;
    }
  };

  const { save, saving, saved, error } = useAutoSave(saveBusiness, 1000);

  // Handle field changes
  const handleChange = (field, value) => {
    console.log('🔧 [EditBusinessProfileModal] handleChange:', { field, value });
    const updated = { ...business, [field]: value };
    setBusiness(updated);

    // Only auto-save in EDIT mode (not in CREATE mode)
    if (!isCreateMode) {
      save(updated);
    }
  };

  // Logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploadingLogo(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];

        if (isCreateMode) {
          // CREATE mode: Store as data URL locally until business is created
          const localUrl = reader.result;
          console.log('[EditBusinessProfileModal] Storing logo locally for CREATE mode');
          handleChange('logoUrl', localUrl);
        } else {
          // EDIT mode: Upload immediately to server
          console.log('[EditBusinessProfileModal] Uploading logo for existing business');
          const { data } = await api.post(`/v1/businesses/${businessId}/upload`, {
            type: 'logo',
            base64,
            originalName: file.name
          });
          console.log('[EditBusinessProfileModal] Logo uploaded:', data.url);
          handleChange('logoUrl', data.url);
        }
        setUploadingLogo(false);
      };

      reader.onerror = () => {
        console.error('[EditBusinessProfileModal] FileReader error');
        alert('Failed to read file. Please try again.');
        setUploadingLogo(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('[EditBusinessProfileModal] Logo upload failed:', error);
      alert(error.response?.data?.message || 'Upload failed. Please try again.');
      setUploadingLogo(false);
    }
  };

  // Manual save for CREATE mode
  const handleCreate = async () => {
    // Validation
    if (!business.name || !business.category || !business.city) {
      alert('Please fill in Business Name, Category, and City (required fields)');
      return;
    }

    try {
      console.log('[EditBusinessProfileModal] Creating business:', business);
      const { data } = await api.post('/v1/businesses', business);
      console.log('[EditBusinessProfileModal] Business created:', data);
      if (onSave) onSave(data);
      onClose();
    } catch (error) {
      console.error('[EditBusinessProfileModal] Create failed:', error);
      alert(error.response?.data?.message || 'Failed to create business. Please try again.');
    }
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
            {isCreateMode ? '➕ Create New Business' : '🏢 Edit Business Profile'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            {isCreateMode
              ? 'Add a new salon, spa, or shop to your profile'
              : 'Update your business/salon information'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {isCreateMode ? 'Preparing form...' : 'Loading business...'}
          </div>
        ) : business ? (
          <>
            {/* 4 Giant Cards */}
            <div className="profile-edit-cards">
              {/* Card 1: Business Logo */}
              <div className="profile-edit-card">
                <span className="card-label">🏢 Business Logo</span>
                <div style={{ textAlign: 'center' }}>
                  {/* Hidden file input */}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />

                  {/* Logo preview */}
                  <div style={{
                    width: '160px',
                    height: '160px',
                    margin: '0 auto 16px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(139, 92, 246, 0.3)',
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                    onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                    onMouseOver={(e) => {
                      if (!uploadingLogo) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    {uploadingLogo ? (
                      <div style={{ fontSize: '24px', color: '#8b5cf6' }}>⏳</div>
                    ) : business.logoUrl ? (
                      <img src={business.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '48px', color: '#8b5cf6' }}>🏢</div>
                    )}
                  </div>

                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    style={{
                      background: uploadingLogo ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: uploadingLogo ? 'none' : '0 2px 8px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      if (!uploadingLogo) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!uploadingLogo) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
                      }
                    }}
                  >
                    {uploadingLogo ? '⏳ Uploading...' : business.logoUrl ? '🔄 Change Logo' : '📤 Upload Logo'}
                  </button>
                  <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '8px' }}>
                    Square images work best • Max 5MB
                  </p>
                </div>
              </div>

              {/* Card 2: Business Identity */}
              <div className="profile-edit-card">
                <span className="card-label">🏆 Business Identity</span>

                <div className="profile-input-group">
                  <label className="profile-input-label">Business Name</label>
                  <input
                    type="text"
                    className="profile-input large"
                    value={business.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nites Salon"
                  />
                </div>

                <div className="profile-input-group">
                  <label className="profile-input-label">Category</label>
                  <select
                    className="profile-input"
                    value={business.category || 'Salon'}
                    onChange={(e) => handleChange('category', e.target.value)}
                  >
                    <option value="Salon">Salon</option>
                    <option value="Spa">Spa</option>
                    <option value="Barbershop">Barbershop</option>
                    <option value="Freelance Stylist">Freelance Stylist</option>
                  </select>
                </div>
              </div>

              {/* Card 3: Business Description */}
              <div className="profile-edit-card">
                <span className="card-label">📝 Professional Summary</span>
                <textarea
                  className="bio-textarea"
                  value={business.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="We specialize in braids, weaves, and natural hair care..."
                  maxLength={1000}
                  rows={6}
                  style={{
                    minHeight: '120px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    color: '#1f2937'
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  {business.description?.length || 0}/1000
                </div>
              </div>

              {/* Card 4: Location */}
              <div className="profile-edit-card">
                <span className="card-label">📍 Location</span>

                <div className="profile-input-group">
                  <label className="profile-input-label">Address</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={business.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div className="profile-input-group">
                    <label className="profile-input-label">City</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={business.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Dallas"
                    />
                  </div>

                  <div className="profile-input-group">
                    <label className="profile-input-label">State</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={business.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="TX"
                      maxLength={2}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="profile-input-group">
                    <label className="profile-input-label">ZIP</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={business.zip || ''}
                      onChange={(e) => handleChange('zip', e.target.value)}
                      placeholder="75001"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button and Auto-save Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div className={`autosave-indicator ${saving ? 'saving' : saved ? 'saved' : ''}`}>
                {isCreateMode
                  ? 'Fill out the form and click Create Business'
                  : (saving ? '💾 Saving...' : saved ? '✓ Saved' : error ? `⚠ ${error}` : 'Changes save automatically')}
              </div>
              <button
                onClick={isCreateMode ? handleCreate : () => { save(business); onClose(); }}
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
                {isCreateMode ? '➕ Create Business' : 'Save & Close'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            Failed to load business
          </div>
        )}
      </div>
    </div>
  );
}
