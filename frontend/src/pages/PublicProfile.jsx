import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from '../api/axios';
import '../styles/publicProfile.css';

export default function PublicProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/public/profile/${slug}`);
      setProfile(response.data.data);
    } catch (err) {
      console.error('Error loading profile:', err);
      const errorCode = err.response?.data?.error?.code;
      const errorMessage = err.response?.data?.error?.message || 'Failed to load profile';

      if (errorCode === 'PROFILE_NOT_FOUND') {
        setError('This profile does not exist or is not active.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (serviceId = null) => {
    if (serviceId) {
      navigate(`/book/${slug}?serviceId=${serviceId}`);
    } else {
      navigate(`/book/${slug}`);
    }
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-container">
        <div className="error-page">
          <div className="error-icon">😕</div>
          <h1>Profile Not Found</h1>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{profile.name} - Book Appointment | SalonHub</title>
        <meta name="description" content={profile.bio || `Book an appointment with ${profile.name}`} />
        <meta property="og:title" content={`${profile.name} - Book Appointment`} />
        <meta property="og:description" content={profile.bio || `Book an appointment with ${profile.name}`} />
        <meta property="og:image" content={profile.coverPhoto || profile.logo} />
        <meta property="og:type" content="business.business" />
      </Helmet>

      <div className="public-profile-container">
        {/* Premium Hero Section */}
        <div className="hero-section" style={{ backgroundImage: `url(${profile.coverPhoto})` }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            {profile.logo && (
              <div className="hero-logo">
                <img src={profile.logo} alt={`${profile.name} logo`} />
              </div>
            )}
            <h1 className="hero-title">{profile.name}</h1>
            {profile.contact?.city && profile.contact?.state && (
              <p className="hero-location">📍 {profile.contact.city}, {profile.contact.state}</p>
            )}
            {profile.rating && profile.rating.count > 0 && (
              <div className="hero-rating">
                <span className="rating-stars">⭐ {profile.rating.average.toFixed(1)}</span>
                <span className="rating-count">({profile.rating.count} reviews)</span>
              </div>
            )}
            <button className="hero-cta" onClick={() => handleBookNow()}>
              📅 Book Appointment
            </button>
          </div>
        </div>

        {/* Highlights Section */}
        {profile.highlights && profile.highlights.length > 0 && (
          <div className="highlights-section">
            <div className="highlights-container">
              {profile.highlights.map((highlight, index) => (
                <span key={index} className="highlight-badge">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="profile-content">
          {/* About */}
          {profile.bio && (
            <section className="profile-section">
              <h2>About Us</h2>
              <p className="profile-bio">{profile.bio}</p>
            </section>
          )}

          {/* Recent Work Carousel */}
          {profile.recentGallery && profile.recentGallery.length > 0 && (
            <section className="profile-section">
              <h2>Recent Work</h2>
              <div className="recent-work-carousel">
                {profile.recentGallery.map((photo, index) => (
                  <div key={index} className="carousel-item" onClick={() => openLightbox(photo)}>
                    <img src={photo.url} alt={photo.caption || `Recent work ${index + 1}`} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Premium Service Cards */}
          {profile.services && profile.services.length > 0 && (
            <section className="profile-section">
              <h2>Our Services</h2>
              <div className="premium-services-grid">
                {profile.services.map((service, index) => (
                  <div key={index} className="premium-service-card">
                    <div className="service-card-content">
                      <h3>{service.name}</h3>
                      <div className="service-meta">
                        {service.duration && (
                          <span className="service-duration">⏱️ {service.duration} min</span>
                        )}
                        {service.price && (
                          <span className="service-price">${service.price}</span>
                        )}
                      </div>
                    </div>
                    <button 
                      className="service-book-btn"
                      onClick={() => handleBookNow(service._id)}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Masonry Gallery */}
          {profile.photos && profile.photos.length > 0 && (
            <section className="profile-section">
              <h2>Gallery</h2>
              <div className="masonry-gallery">
                {profile.photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="masonry-item"
                    onClick={() => openLightbox(photo)}
                  >
                    <img src={photo.url} alt={photo.caption || `Gallery ${index + 1}`} />
                    {photo.caption && (
                      <div className="masonry-caption">{photo.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Video Gallery */}
          {profile.videos && profile.videos.length > 0 && (
            <section className="profile-section">
              <h2>Videos</h2>
              <div className="video-grid">
                {profile.videos.map((video, index) => (
                  <div key={index} className="video-item">
                    <video src={video.url} controls />
                    {video.caption && <p className="video-caption">{video.caption}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          {(profile.contact?.phone || profile.contact?.email || profile.contact?.address) && (
            <section className="profile-section">
              <h2>Contact Information</h2>
              <div className="contact-grid">
                {profile.contact.phone && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p><a href={`tel:${profile.contact.phone}`}>{profile.contact.phone}</a></p>
                    </div>
                  </div>
                )}
                {profile.contact.email && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p><a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a></p>
                    </div>
                  </div>
                )}
                {profile.contact.address && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>
                        {profile.contact.address}
                        {profile.contact.city && `, ${profile.contact.city}`}
                        {profile.contact.state && `, ${profile.contact.state}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Mobile CTA */}
        <div className="sticky-mobile-cta">
          {profile.logo && (
            <img src={profile.logo} alt={profile.name} className="sticky-logo" />
          )}
          <button className="sticky-cta-btn" onClick={() => handleBookNow()}>
            Book with {profile.name} →
          </button>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={closeLightbox}>×</button>
              <img src={lightboxImage.url} alt={lightboxImage.caption || 'Gallery image'} />
              {lightboxImage.caption && (
                <p className="lightbox-caption">{lightboxImage.caption}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
