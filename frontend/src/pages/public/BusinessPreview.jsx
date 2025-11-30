import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './BusinessPreview.css';

/**
 * Public Business Preview Page (Soft Profile)
 * Shows enticing preview WITHOUT sensitive contact info
 * Sign-up required for: phone, address, booking
 *
 * World-class design to maximize conversions
 */
const BusinessPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        // Use the public search endpoint to get soft profile data
        const { data } = await api.get(`/public/directory/search?q=${id}`);

        // Find the business by ID in results, or fetch individually
        let found = data.data?.find(b => b.id === id);

        if (!found) {
          // Try fetching directly from soft profile endpoint
          const softRes = await api.get(`/public/directory/business/${id}/soft`);
          found = softRes.data?.data;
        }

        if (found) {
          setBusiness(found);
        } else {
          setError('Business not found');
        }
      } catch (err) {
        console.error('Failed to load business:', err);
        setError('Unable to load business details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBusiness();
  }, [id]);

  // If user is already logged in as visitor, redirect to full profile
  useEffect(() => {
    if (user && user.role === 'visitor' && business) {
      navigate(`/visitor/business/${id}`, { replace: true });
    }
  }, [user, business, id, navigate]);

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (business?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % business.photos.length);
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (business?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + business.photos.length) % business.photos.length);
    }
  };

  const handleContactClick = () => {
    setShowSignUpPrompt(true);
  };

  const handleSignUp = () => {
    // Store the business ID to redirect after signup
    sessionStorage.setItem('redirectAfterAuth', `/visitor/business/${id}`);
    navigate('/register');
  };

  const handleLogin = () => {
    sessionStorage.setItem('redirectAfterAuth', `/visitor/business/${id}`);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="bp-preview">
        <div className="bp-preview__loading">
          <div className="bp-preview__spinner"></div>
          <p>Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="bp-preview">
        <div className="bp-preview__error">
          <h2>Business Not Found</h2>
          <p>{error || 'This business may no longer be available.'}</p>
          <Link to="/" className="bp-preview__btn">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Build photos array
  const photos = business.photos?.length > 0
    ? business.photos
    : (business.heroImage ? [business.heroImage] : []);
  const currentPhoto = photos[currentPhotoIndex] || '';
  const hasMultiplePhotos = photos.length > 1;

  // Stars rendering
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="bp-preview__star bp-preview__star--filled" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="bp-preview__star bp-preview__star--half" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#fbbf24"/>
                <stop offset="50%" stopColor="#e5e7eb"/>
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="bp-preview__star bp-preview__star--empty" viewBox="0 0 24 24" fill="#e5e7eb">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bp-preview">
      {/* Hero Section */}
      <div className="bp-preview__hero">
        <div className="bp-preview__hero-image">
          {currentPhoto ? (
            <img src={currentPhoto} alt={business.name} />
          ) : (
            <div className="bp-preview__hero-placeholder">
              <span>{business.name?.charAt(0) || '?'}</span>
            </div>
          )}

          {/* Photo Navigation */}
          {hasMultiplePhotos && (
            <>
              <button className="bp-preview__photo-nav bp-preview__photo-nav--prev" onClick={handlePrevPhoto}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <button className="bp-preview__photo-nav bp-preview__photo-nav--next" onClick={handleNextPhoto}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
              <div className="bp-preview__photo-dots">
                {photos.map((_, idx) => (
                  <span
                    key={idx}
                    className={`bp-preview__photo-dot ${idx === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Photo count */}
          {photos.length > 1 && (
            <span className="bp-preview__photo-count">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              {photos.length} photos
            </span>
          )}
        </div>

        <div className="bp-preview__hero-overlay">
          <div className="bp-preview__hero-content">
            <span className="bp-preview__category-badge">{business.category}</span>
            <h1 className="bp-preview__name">{business.name}</h1>
            <p className="bp-preview__location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {business.city}{business.state ? `, ${business.state}` : ''}
              {business.distance && ` • ${business.distance.toFixed(1)} mi away`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bp-preview__content">
        {/* Rating Section */}
        <div className="bp-preview__rating-section">
          {business.reviewCount > 0 ? (
            <>
              <div className="bp-preview__stars">
                {renderStars(business.rating || 0)}
              </div>
              <div className="bp-preview__rating-text">
                <span className="bp-preview__rating-number">{(business.rating || 0).toFixed(1)}</span>
                <span className="bp-preview__rating-count">({business.reviewCount} Google reviews)</span>
              </div>
            </>
          ) : (
            <div className="bp-preview__new-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              New Listing - Be the first to review!
            </div>
          )}
        </div>

        {/* Description */}
        {business.description && (
          <div className="bp-preview__description">
            <p>{business.description}</p>
          </div>
        )}

        {/* What's Included Section */}
        <div className="bp-preview__features">
          <h2>What you'll see after signing up:</h2>
          <ul>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Full contact information (phone & address)
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Complete service menu with pricing
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Business hours & availability
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Direct messaging with the business
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Save to favorites & leave reviews
            </li>
          </ul>
        </div>

        {/* Contact Info Teaser (Blurred) */}
        <div className="bp-preview__contact-teaser">
          <h3>Contact Information</h3>
          <div className="bp-preview__blurred-content">
            <p className="bp-preview__blurred-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
              </svg>
              <span className="bp-preview__blur">(XXX) XXX-XXXX</span>
            </p>
            <p className="bp-preview__blurred-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="bp-preview__blur">123 Business Address, City TX</span>
            </p>
          </div>
          <button className="bp-preview__reveal-btn" onClick={handleContactClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Sign up to reveal contact info
          </button>
        </div>

        {/* CTA Section */}
        <div className="bp-preview__cta-section">
          <h2>Ready to connect with {business.name}?</h2>
          <p>Create a free account to view full details, send messages, and book appointments.</p>
          <div className="bp-preview__cta-buttons">
            <button className="bp-preview__btn bp-preview__btn--primary" onClick={handleSignUp}>
              Create Free Account
            </button>
            <button className="bp-preview__btn bp-preview__btn--secondary" onClick={handleLogin}>
              Already have an account? Log in
            </button>
          </div>
          <p className="bp-preview__cta-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            100% free. No credit card required.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="bp-preview__back">
        <Link to="/" className="bp-preview__back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Back to search
        </Link>
      </div>

      {/* Sign Up Prompt Modal */}
      {showSignUpPrompt && (
        <div className="bp-preview__modal-overlay" onClick={() => setShowSignUpPrompt(false)}>
          <div className="bp-preview__modal" onClick={(e) => e.stopPropagation()}>
            <button className="bp-preview__modal-close" onClick={() => setShowSignUpPrompt(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="bp-preview__modal-content">
              <div className="bp-preview__modal-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2>Create a free account to continue</h2>
              <p>Sign up to view full contact details, send messages, and connect with {business.name}.</p>
              <button className="bp-preview__btn bp-preview__btn--primary" onClick={handleSignUp}>
                Sign Up Free
              </button>
              <p className="bp-preview__modal-login">
                Already have an account?{' '}
                <button onClick={handleLogin}>Log in</button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPreview;
