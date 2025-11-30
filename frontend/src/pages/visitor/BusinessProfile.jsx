import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import PreBookingMessageModal from '../../components/PreBookingMessageModal';
import {
  BusinessHero,
  BusinessActions,
  BusinessPhotos,
  BusinessAbout,
  BusinessServices,
  BusinessStaff,
  BookingModal
} from '../../components/business';
import './BusinessProfile.css';

/**
 * Visitor Business Profile Page
 *
 * Marketplace-style 2025 design inspired by Booksy/Fresha.
 * Full business details for authenticated visitors.
 *
 * Sections:
 * 1. Hero Banner - Cover photo, name, rating, verified badge
 * 2. Quick Actions - Save, Message, Directions, Share
 * 3. Photo Gallery - Grid with lightbox
 * 4. About - Description, hours, contact, social
 * 5. Services - List with prices and disabled booking
 * 6. Staff - Team member grid
 * 7. Reviews - Coming soon
 * 8. Sticky Message CTA - Mobile footer
 */
const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!user || user.role !== 'visitor') {
      sessionStorage.setItem('redirectAfterLogin', `/visitor/business/${id}`);
      navigate('/login');
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/visitor/business/${id}/full`);
        setBusiness(data.data);
      } catch (err) {
        console.error('Failed to fetch business:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
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

  // Allow messaging for all businesses (paywall removed for testing)
  // Previously: const canMessage = business?.listingType === 'premium' && business?.premiumSubscription?.active;
  const canMessage = true; // Everyone can message any business

  // Check if booking is enabled for this business
  const canBook = business?.isPublicProfileActive && business?.bookingSlug;

  // Handle message button click
  const handleMessage = () => {
    setShowMessageModal(true);
  };

  // Handle Book Now button click (opens modal at service selection)
  const handleBook = () => {
    setPreSelectedService(null);
    setShowBookingModal(true);
  };

  // Handle Book button on individual service (pre-selects service)
  const handleBookService = (service) => {
    setPreSelectedService(service);
    setShowBookingModal(true);
  };

  // Close booking modal and reset
  const handleCloseBooking = () => {
    setShowBookingModal(false);
    setPreSelectedService(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bp-page">
        <div className="bp-loading">
          <div className="bp-loading__spinner" />
          <p>Loading business...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bp-page">
        <div className="bp-error">
          <div className="bp-error__icon">😔</div>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="bp-btn bp-btn--primary" onClick={() => navigate('/visitor/explore')}>
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  if (!business) {
    return null;
  }

  // Merge Google photos with regular photos for display
  // Google photos are URL strings, regular photos are objects with url property
  const allPhotos = [
    ...(business.googlePhotos || []).map((url, i) => ({ url, _id: `google-${i}`, source: 'google' })),
    ...(business.photos || []).map(p => ({ ...p, source: 'uploaded' }))
  ];

  return (
    <div className="bp-page">
      {/* Section 1: Hero Banner */}
      <BusinessHero business={business} />

      {/* Main Content Container */}
      <div className="bp-container">
        {/* Section 2: Quick Actions */}
        <BusinessActions
          business={business}
          onMessage={handleMessage}
          onBook={handleBook}
          canMessage={canMessage}
          canBook={canBook}
        />

        {/* Section 3: Photo Gallery (merged Google + uploaded photos) */}
        {allPhotos.length > 0 && (
          <section className="bp-section">
            <h2 className="bp-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Photos
            </h2>
            <BusinessPhotos photos={allPhotos} businessName={business.name} />
          </section>
        )}

        {/* Section 4: About */}
        <section className="bp-section">
          <h2 className="bp-section__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            About
          </h2>
          <BusinessAbout business={business} />
        </section>

        {/* Section 5: Services */}
        <section className="bp-section">
          <h2 className="bp-section__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Services
          </h2>
          <BusinessServices
            services={business.services}
            onBookService={handleBookService}
            bookingEnabled={canBook}
          />
        </section>

        {/* Section 6: Staff/Team */}
        {business.staff && business.staff.length > 0 && (
          <section className="bp-section">
            <h2 className="bp-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Meet the Team
            </h2>
            <BusinessStaff staff={business.staff} />
          </section>
        )}

        {/* Section 7: Reviews - Placeholder */}
        <section className="bp-section">
          <h2 className="bp-section__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Reviews
          </h2>
          <div className="bp-reviews-placeholder">
            <div className="bp-reviews-placeholder__icon">⭐</div>
            <p>Reviews coming soon!</p>
            <span className="bp-reviews-placeholder__subtext">
              Be the first to share your experience
            </span>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Message CTA */}
      {canMessage && (
        <div className="bp-sticky-cta">
          <button className="bp-sticky-cta__btn" onClick={handleMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Message {business.name}
          </button>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <PreBookingMessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          businessId={business._id}
          businessName={business.name}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleCloseBooking}
        business={business}
        preSelectedService={preSelectedService}
      />
    </div>
  );
};

export default BusinessProfile;
