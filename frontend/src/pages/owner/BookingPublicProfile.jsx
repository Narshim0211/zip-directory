import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import FileUpload from '../../components/FileUpload';
import '../../styles/ownerPublicProfile.css';

export default function BookingPublicProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState({
    bookingSlug: '',
    logoUrl: '',
    coverPhotoUrl: '',
    bio: '',
    phone: '',
    email: '',
    photos: [],
    videos: [],
    displayServices: [],
    isPublicProfileActive: false,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const previousProfileRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadServices();
  }, []);

  // Auto-save effect with 1 second debounce
  useEffect(() => {
    if (!previousProfileRef.current) {
      previousProfileRef.current = profile;
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only auto-save text fields (bio, phone, email)
    const textFieldsChanged = 
      previousProfileRef.current.bio !== profile.bio ||
      previousProfileRef.current.phone !== profile.phone ||
      previousProfileRef.current.email !== profile.email;

    if (textFieldsChanged && !loading) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveProfile();
      }, 1000);
    }

    previousProfileRef.current = profile;

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [profile.bio, profile.phone, profile.email]);

  const autoSaveProfile = async () => {
    try {
      setAutoSaving(true);
      await axios.patch('/owner/booking-profile', {
        bio: profile.bio,
        phone: profile.phone,
        email: profile.email,
      });
      // Silent success - no toast
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      const { data: { data: profileData } } = await axios.get('/owner/booking-profile');
      
      const normalizedProfile = profileData || {
        bookingSlug: '',
        logoUrl: '',
        coverPhotoUrl: '',
        bio: '',
        phone: '',
        email: '',
        photos: [],
        videos: [],
        displayServices: [],
        isPublicProfileActive: false,
      };
      
      setProfile(normalizedProfile);
      
      if (normalizedProfile.bookingSlug) {
        setPublicUrl(`${window.location.origin}/profile/${normalizedProfile.bookingSlug}`);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.data?.success === false) {
        setErrors({ general: error.response?.data?.error?.message || 'Failed to load profile' });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const { data } = await axios.get('/owner/booking-profile');
      setServices(data.data.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    // Don't clear success message for auto-save fields
    if (!['bio', 'phone', 'email'].includes(field)) {
      setSuccessMessage('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (uploadData) => {
    setProfile((prev) => ({ ...prev, logoUrl: uploadData.url }));
    setSuccessMessage('Logo uploaded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCoverUpload = (uploadData) => {
    setProfile((prev) => ({ ...prev, coverPhotoUrl: uploadData.url }));
    setSuccessMessage('Cover photo uploaded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePhotosUpload = (uploadData) => {
    const newPhotos = Array.isArray(uploadData) ? uploadData : [uploadData];
    setProfile((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        ...newPhotos.map(item => ({
          url: item.url,
          caption: '',
          uploadedAt: new Date().toISOString(),
        })),
      ],
    }));
    setSuccessMessage(`${newPhotos.length} photo(s) uploaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setErrors({ upload: error.message || 'Upload failed' });
    setTimeout(() => setErrors({}), 5000);
  };

  const toggleServiceVisibility = async (serviceId) => {
    const isSelected = profile.displayServices.includes(serviceId);
    const updatedServices = isSelected
      ? profile.displayServices.filter(id => id !== serviceId)
      : [...profile.displayServices, serviceId];
    
    setProfile((prev) => ({
      ...prev,
      displayServices: updatedServices,
    }));

    // Auto-save instantly for service visibility
    try {
      await axios.patch('/owner/booking-profile', {
        displayServices: updatedServices,
      });
    } catch (error) {
      console.error('Failed to save service visibility:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setErrors({});
      setSuccessMessage('');

      await axios.patch('/owner/booking-profile', {
        logoUrl: profile.logoUrl,
        coverPhotoUrl: profile.coverPhotoUrl,
        bio: profile.bio,
        phone: profile.phone,
        email: profile.email,
        photos: profile.photos,
        videos: profile.videos,
      });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ general: error.response?.data?.error?.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSlug = async () => {
    try {
      setSaving(true);
      setErrors({});
      setSuccessMessage('');

      if (!profile.bookingSlug) {
        setErrors({ slug: 'Booking handle is required' });
        setSaving(false);
        return;
      }

      const response = await axios.patch('/owner/booking-slug', {
        slug: profile.bookingSlug,
      });

      setPublicUrl(response.data.data.publicUrl);
      setSuccessMessage('Booking handle updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving slug:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to save handle';
      const errorCode = error.response?.data?.error?.code;

      if (errorCode === 'SLUG_TAKEN') {
        setErrors({ slug: 'This handle is already taken. Please choose another.' });
      } else if (errorCode === 'INVALID_SLUG') {
        setErrors({ slug: 'Handle can only contain lowercase letters, numbers, and hyphens.' });
      } else {
        setErrors({ slug: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setSaving(true);
      setErrors({});

      const response = await axios.patch('/owner/booking-profile/activate', {
        isActive: !profile.isPublicProfileActive,
      });

      setProfile((prev) => ({
        ...prev,
        isPublicProfileActive: response.data.data.isPublicProfileActive,
      }));

      setSuccessMessage(
        `Profile ${response.data.data.isPublicProfileActive ? 'activated' : 'deactivated'} successfully!`
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling profile:', error);
      setErrors({ general: error.response?.data?.error?.message || 'Failed to toggle profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVideo = (index) => {
    setProfile((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoCaption = (index, caption) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.map((photo, i) => 
        i === index ? { ...photo, caption } : photo
      ),
    }));
  };

  if (loading) {
    return (
      <div className="owner-public-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="owner-public-profile">
      <div className="profile-header">
        <h1>Booking Site & Public Profile</h1>
        <p className="profile-subtitle">Create your professional booking website</p>
      </div>

      {errors.general && <div className="alert alert-error">{errors.general}</div>}
      {errors.upload && <div className="alert alert-error">{errors.upload}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Card 1: Your Booking Link */}
      {publicUrl && (
        <div className="profile-card">
          <h2>🔗 Your Booking Link</h2>
          <div className="booking-link-display">
            <input 
              type="text" 
              value={publicUrl} 
              readOnly 
              className="booking-link-input"
            />
            <button 
              onClick={handleCopyLink} 
              className="btn btn-copy"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="help-text">Share this link with your clients to book appointments</p>
        </div>
      )}

      {/* Card 2: Profile Status */}
      <div className="profile-card">
        <div className="card-header-row">
          <div>
            <h2>Profile Status</h2>
            <p className="help-text">When Active, your booking site is visible to anyone with the link</p>
          </div>
          <button
            className={`btn-toggle ${profile.isPublicProfileActive ? 'active' : ''}`}
            onClick={handleToggleActive}
            disabled={saving}
          >
            {profile.isPublicProfileActive ? '🟢 Active' : '⭕ Inactive'}
          </button>
        </div>
      </div>

      {/* Card 3: Booking URL Name */}
      <div className="profile-card">
        <h2>Booking URL Name</h2>
        <p className="help-text">This name becomes your booking link. Only lowercase letters, numbers, and hyphens.</p>
        <div className="input-group">
          <label htmlFor="bookingSlug">Your Booking Handle</label>
          <div className="slug-input-wrapper">
            <span className="slug-prefix">{window.location.origin}/profile/</span>
            <input
              type="text"
              id="bookingSlug"
              value={profile.bookingSlug}
              onChange={(e) => handleInputChange('bookingSlug', e.target.value.toLowerCase())}
              placeholder="mystudio"
              disabled={saving}
              className="slug-input"
            />
          </div>
          {errors.slug && <span className="error-text">{errors.slug}</span>}
          <button className="btn btn-primary" onClick={handleSaveSlug} disabled={saving}>
            {saving ? 'Saving...' : 'Save URL'}
          </button>
        </div>
      </div>

      {/* Card 4: Branding */}
      <div className="profile-card">
        <h2>Branding</h2>
        <div className="branding-grid">
          <div className="branding-item">
            <h3>Logo</h3>
            <p className="help-text">Square image recommended (500x500px)</p>
            <FileUpload
              label="Upload Logo"
              accept="image/*"
              currentUrl={profile.logoUrl}
              onUploadSuccess={handleLogoUpload}
              onUploadError={handleUploadError}
              preview={true}
            />
          </div>
          <div className="branding-item">
            <h3>Cover Photo</h3>
            <p className="help-text">Wide banner image (1920x1080px)</p>
            <FileUpload
              label="Upload Cover Photo"
              accept="image/*"
              currentUrl={profile.coverPhotoUrl}
              onUploadSuccess={handleCoverUpload}
              onUploadError={handleUploadError}
              preview={true}
            />
          </div>
        </div>
      </div>

      {/* Card 5: About & Contact */}
      <div className="profile-card">
        <h2>About Your Salon</h2>
        <div className="input-group">
          <label htmlFor="bio">Tell new clients what makes you special</label>
          <textarea
            id="bio"
            rows="6"
            value={profile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Share your story, specialties, and what clients love about your salon..."
            maxLength="2000"
            disabled={saving}
            className="textarea-large"
          />
          <span className="char-count">{profile.bio.length} / 2000</span>
        </div>
      </div>

      <div className="profile-card">
        <h2>Contact Information</h2>
        <div className="contact-grid">
          <div className="input-group">
            <label htmlFor="phone">📞 Phone</label>
            <input
              type="tel"
              id="phone"
              value={profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={saving}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">✉️ Email</label>
            <input
              type="email"
              id="email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="info@mysalon.com"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Card 6: Photo Gallery */}
      <div className="profile-card">
        <h2>📸 Photo Gallery</h2>
        <p className="help-text">Showcase your best work (hair styles, salon interior, before & after)</p>

        <FileUpload
          label="Add Photos"
          accept="image/*"
          multiple={true}
          maxFiles={10}
          onUploadSuccess={handlePhotosUpload}
          onUploadError={handleUploadError}
          preview={false}
        />

        <div className="media-grid">
          {profile.photos.map((photo, index) => (
            <div key={index} className="media-item">
              <img src={photo.url} alt={photo.caption || 'Gallery photo'} />
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => handlePhotoCaption(index, e.target.value)}
                placeholder="Add caption..."
                className="caption-input"
              />
              <button className="btn-remove" onClick={() => handleRemovePhoto(index)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        {profile.photos.length === 0 && (
          <div className="empty-state">
            <p>No photos yet. Upload some to showcase your work!</p>
          </div>
        )}
      </div>

      {/* Card 7: Services Shown on Booking Page */}
      <div className="profile-card">
        <h2>✂️ Services Shown on Booking Page</h2>
        <p className="help-text">Choose which services appear on your public booking site</p>
        
        {services.length > 0 ? (
          <div className="services-list">
            {services.map((service) => (
              <label key={service._id} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={profile.displayServices.includes(service._id)}
                  onChange={() => toggleServiceVisibility(service._id)}
                />
                <div className="service-info">
                  <span className="service-name">{service.name}</span>
                  <span className="service-details">
                    {service.duration} min · ${service.price}
                  </span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No services found. Add services in the Services page first.</p>
          </div>
        )}
      </div>

      {/* Save & Preview Actions */}
      <div className="profile-actions">
        <button className="btn btn-primary btn-large" onClick={handleSaveProfile} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Profile Changes'}
        </button>
        {publicUrl && profile.isPublicProfileActive && (
          <a 
            href={publicUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary btn-large"
          >
            👁️ Preview Booking Site
          </a>
        )}
      </div>
    </div>
  );
}
