import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MessageButton from '../../components/MessageButton';
import './BusinessProfile.css';

/**
 * Visitor Business Profile Page
 * Full business details for authenticated visitors
 * Protected route - requires visitor login
 * NO duplication with public soft profiles or owner management
 */
const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!user || user.role !== 'visitor') {
      // Redirect to login with intended URL
      sessionStorage.setItem('redirectAfterLogin', `/visitor/business/${id}`);
      navigate('/login');
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/visitor/business/${id}/full`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBusiness(data.data);
      } catch (err) {
        console.error('Failed to fetch business:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Auth error - redirect to login
          sessionStorage.setItem('redirectAfterLogin', `/visitor/business/${id}`);
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Business not found');
        } else {
          setError('Unable to load business details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="business-profile">
        <div className="business-profile__loading">
          <div className="spinner-large"></div>
          <p>Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="business-profile">
        <div className="business-profile__error">
          <div className="error-icon-large">⚠️</div>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/directory')}>Back to Search</button>
        </div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  const defaultImage = 'https://via.placeholder.com/1200x400/667eea/ffffff?text=No+Cover+Photo';

  return (
    <div className="business-profile">
      {/* Cover Photo */}
      <div className="business-profile__cover">
        <img
          src={business.coverPhotoUrl || defaultImage}
          alt={business.name}
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
      </div>

      {/* Main Content */}
      <div className="business-profile__container">
        {/* Header */}
        <div className="business-profile__header">
          <div className="business-profile__logo">
            {business.logoUrl && (
              <img src={business.logoUrl} alt={`${business.name} logo`} />
            )}
          </div>

          <div className="business-profile__info">
            <h1>{business.name}</h1>
            <p className="business-type">{business.category}</p>
            <div className="business-rating">
              <span className="stars">⭐</span>
              <span>{business.ratingAverage.toFixed(1)}</span>
              <span className="reviews-count">({business.ratingsCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="business-profile__grid">
          {/* Left Column */}
          <div className="business-profile__main">
            {/* About */}
            {business.description && (
              <div className="business-card">
                <h2>About</h2>
                <p>{business.description}</p>
              </div>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="business-card">
                <h2>Services</h2>
                <div className="services-list">
                  {business.services.map((service, index) => (
                    <div key={index} className="service-item">
                      <span className="service-name">{service.name}</span>
                      {service.price && (
                        <span className="service-price">${service.price}</span>
                      )}
                      {service.duration && (
                        <span className="service-duration">{service.duration} min</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {business.images && business.images.length > 0 && (
              <div className="business-card">
                <h2>Gallery</h2>
                <div className="business-gallery">
                  {business.images.map((img, index) => (
                    <div key={index} className="gallery-item">
                      <img src={img} alt={`${business.name} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Hours */}
          <div className="business-profile__sidebar">
            {/* Contact Information */}
            <div className="business-card">
              <h3>Contact Information</h3>
              <div className="contact-info">
                {business.address && (
                  <div className="contact-item">
                    <span className="icon">📍</span>
                    <div>
                      <strong>Address</strong>
                      <p>{business.address}</p>
                      <p>{business.city}, {business.state} {business.zip}</p>
                    </div>
                  </div>
                )}

                {business.phone && (
                  <div className="contact-item">
                    <span className="icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <p>
                        <a href={`tel:${business.phone}`}>{business.phone}</a>
                      </p>
                    </div>
                  </div>
                )}

                {business.email && (
                  <div className="contact-item">
                    <span className="icon">✉️</span>
                    <div>
                      <strong>Email</strong>
                      <p>
                        <a href={`mailto:${business.email}`}>{business.email}</a>
                      </p>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="contact-item">
                    <span className="icon">🌐</span>
                    <div>
                      <strong>Website</strong>
                      <p>
                        <a href={business.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {business.hours && Object.keys(business.hours).length > 0 && (
              <div className="business-card">
                <h3>Business Hours</h3>
                <div className="hours-list">
                  {Object.entries(business.hours).map(([day, hours]) => (
                    <div key={day} className="hours-item">
                      <span className="day">{day}</span>
                      <span className="time">{hours || 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking CTA */}
            {business.bookingEnabled && business.bookingSlug && (
              <div className="business-card">
                <button
                  className="booking-cta"
                  onClick={() => navigate(`/book/${business.bookingSlug}`)}
                >
                  📅 Book Appointment
                </button>
              </div>
            )}

            {/* Message Button - Chat System */}
            <MessageButton
              businessId={business._id}
              businessName={business.name}
              isPremium={business.listingType === 'premium' && business.premiumSubscription?.active}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
