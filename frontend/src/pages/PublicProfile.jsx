import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from '../api/axios';
import ReviewList from '../components/reviews/ReviewList';
import PromotionBanner from '../components/promotions/PromotionBanner';
import MessageButton from '../components/MessageButton';
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
        <div className="hero-section" style={{ backgroundImage: `url(${profile.coverPhoto})`, position: 'relative' }}>
          <div className="hero-overlay"></div>

          {/* Premium Orbit Badges - Only for Premium Listings */}
          {profile.listingType === 'premium' && profile.premiumSubscription?.active && (
            <style>
              {`
                @keyframes orbit {
                  from {
                    transform: rotate(0deg) translateX(80px) rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg) translateX(80px) rotate(-360deg);
                  }
                }
                @keyframes orbit-reverse {
                  from {
                    transform: rotate(0deg) translateX(90px) rotate(0deg);
                  }
                  to {
                    transform: rotate(-360deg) translateX(90px) rotate(360deg);
                  }
                }
                @keyframes pulse {
                  0%, 100% {
                    transform: scale(1);
                  }
                  50% {
                    transform: scale(1.1);
                  }
                }
              `}
            </style>
          )}

          <div className="hero-content">
            {profile.logo && (
              <div className="hero-logo" style={{ position: 'relative' }}>
                <img src={profile.logo} alt={`${profile.name} logo`} />

                {/* Premium Orbit Animation */}
                {profile.listingType === 'premium' && profile.premiumSubscription?.active && (
                  <>
                    {/* Orbit Badge 1: Premium */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '40px',
                      height: '40px',
                      marginLeft: '-20px',
                      marginTop: '-20px',
                      animation: 'orbit 8s linear infinite'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: '0 4px 12px rgba(255, 215, 0, 0.5)',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}>
                        💎
                      </div>
                    </div>

                    {/* Orbit Badge 2: Verified */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '36px',
                      height: '36px',
                      marginLeft: '-18px',
                      marginTop: '-18px',
                      animation: 'orbit-reverse 10s linear infinite'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
                        animation: 'pulse 2.5s ease-in-out infinite'
                      }}>
                        ✓
                      </div>
                    </div>

                    {/* Orbit Badge 3: Star */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '38px',
                      height: '38px',
                      marginLeft: '-19px',
                      marginTop: '-19px',
                      animation: 'orbit 12s linear infinite',
                      animationDelay: '-4s'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(233, 30, 99, 0.5)',
                        animation: 'pulse 3s ease-in-out infinite'
                      }}>
                        ⭐
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="hero-title-row">
              <h1 className="hero-title">{profile.name}</h1>
              {profile.verificationStatus === 'fully_verified' && (
                <span className="verified-badge" title="Verified Business">
                  ✓
                </span>
              )}
            </div>
            <div className="hero-meta">
              {profile.contact?.city && profile.contact?.state && (
                <p className="hero-location">📍 {profile.contact.city}, {profile.contact.state}</p>
              )}
              {profile.isOpenNow !== undefined && (
                <span className={`open-now-pill ${profile.isOpenNow ? 'open' : 'closed'}`}>
                  {profile.isOpenNow ? '🟢 Open Now' : '🔴 Closed'}
                </span>
              )}
            </div>
            {profile.rating && profile.rating.count > 0 && (
              <div className="hero-rating">
                <span className="rating-stars">⭐ {profile.rating.average.toFixed(1)}</span>
                <span className="rating-count">({profile.rating.count} reviews)</span>
              </div>
            )}
            <button className="hero-cta" onClick={() => handleBookNow()}>
              📅 Book Appointment
            </button>

            {/* 💬 Message Button - Chat System */}
            <MessageButton
              businessId={profile._id}
              businessName={profile.name}
              isPremium={profile.listingType === 'premium' && profile.premiumSubscription?.active}
            />
          </div>
        </div>

        {/* 🎁 Promotions Banner */}
        <PromotionBanner
          promotion={profile.promotion}
          onBookNow={() => handleBookNow()}
        />

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
        <div className="profile-content" style={{ paddingBottom: '100px' }}>
          {/* About */}
          {profile.bio && (
            <section className="profile-section">
              <h2>About Us</h2>
              <p className="profile-bio">{profile.bio}</p>
            </section>
          )}

          {/* Recent Work - Masonry Grid */}
          {profile.recentGallery && profile.recentGallery.length > 0 && (
            <section className="profile-section">
              <h2>Recent Work</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
                width: '100%'
              }}>
                {profile.recentGallery.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => openLightbox(photo)}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      aspectRatio: '1 / 1',
                      background: '#f3f4f6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Recent work ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {photo.caption && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: 'white',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {photo.caption}
                      </div>
                    )}
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

          {/* 👥 Team Section */}
          {profile.team && profile.team.length > 0 && (
            <section className="profile-section">
              <h2>Meet Our Team</h2>
              <div className="team-scroll">
                {profile.team.map((member, index) => (
                  <div key={index} className="team-card">
                    <div className="team-photo">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} />
                      ) : (
                        <div className="team-placeholder">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h4 className="team-name">{member.name}</h4>
                    {member.role && (
                      <p className="team-role">{member.role}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Masonry Gallery */}
          {profile.photos && profile.photos.length > 0 && (
            <section className="profile-section">
              <h2>Gallery</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
                width: '100%'
              }}>
                {profile.photos.map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => openLightbox(photo)}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      aspectRatio: '1 / 1',
                      background: '#f3f4f6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Gallery ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {photo.caption && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: 'white',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {photo.caption}
                      </div>
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

          {/* 🕒 Hours Section */}
          {profile.hours && Object.keys(profile.hours).length > 0 && (
            <section className="profile-section">
              <h2>Hours</h2>
              <div className="hours-table">
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                  const dayName = {
                    mon: 'Monday',
                    tue: 'Tuesday',
                    wed: 'Wednesday',
                    thu: 'Thursday',
                    fri: 'Friday',
                    sat: 'Saturday',
                    sun: 'Sunday'
                  }[day];

                  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().substring(0, 3);
                  const isToday = day === today;
                  const hours = profile.hours[day] || 'Closed';

                  return (
                    <div key={day} className={`hours-row ${isToday ? 'today' : ''}`}>
                      <span className="hours-day">{dayName}</span>
                      <span className="hours-time">{hours}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ⭐ Reviews Section */}
          <section className="profile-section">
            <h2>Reviews</h2>
            <ReviewList businessId={profile._id} />
          </section>
        </div>

        {/* Sticky CTA Ribbon - Book, Message, Call */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          padding: '12px 16px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          borderTop: '1px solid #e5e7eb'
        }}>
          {/* Message Button */}
          <MessageButton
            businessId={profile._id}
            businessName={profile.name}
            isPremium={profile.listingType === 'premium' && profile.premiumSubscription?.active}
            compact={true}
          />

          {/* Book Now Button - Primary */}
          <button
            onClick={() => handleBookNow()}
            style={{
              flex: 1,
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(233, 30, 99, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 30, 99, 0.3)';
            }}
          >
            <span style={{ fontSize: '18px' }}>📅</span>
            <span>Book Now</span>
          </button>

          {/* Call Button */}
          {profile.contact?.phone && (
            <a
              href={`tel:${profile.contact.phone}`}
              style={{
                padding: '14px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span style={{ fontSize: '18px' }}>📞</span>
              <span>Call</span>
            </a>
          )}
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
