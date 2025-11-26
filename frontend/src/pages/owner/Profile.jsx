import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import api from '../../api/axios';
import InviteModal from '../../components/InviteModal';
import EditPersonalProfileModal from '../../components/profile/EditPersonalProfileModal';
import EditBusinessProfileModal from '../../components/profile/EditBusinessProfileModal';
import '../../styles/profileOwner.css';

/**
 * Owner Profile Page
 * NOW with CLEAR SEPARATION:
 * - Section 1: Personal Profile (Nitesh Siwakoti @nitesh)
 * - Section 2: My Business(es) (Nites Salon, etc.)
 */
export default function OwnerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);
  const [showBusinessEditModal, setShowBusinessEditModal] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Fetch PERSONAL profile
        const profileRes = await api.get('/v2/owner-profiles/me');
        if (!mounted) return;
        const profileData = profileRes.data?.data || profileRes.data;
        console.log('[OwnerProfilePage] Personal profile loaded:', profileData);
        setProfile(profileData);

        // Fetch BUSINESSES
        try {
          const businessRes = await api.get('/v1/businesses/my-businesses');
          if (!mounted) return;
          console.log('[OwnerProfilePage] Businesses loaded:', businessRes.data?.length || 0);
          setBusinesses(businessRes.data || []);
        } catch (bizError) {
          console.warn('[OwnerProfilePage] Could not load businesses:', bizError);
          // Not critical - owner might not have businesses yet
          setBusinesses([]);
        }

      } catch (e) {
        if (mounted) {
          console.error('[OwnerProfilePage] Error loading:', e);
          setError(e.response?.data?.message || e.message || 'Failed to load');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return null;

  return (
    <div className="owner-profile-page">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: PERSONAL PROFILE (The Human)                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div
        className="owner-profile__header"
        style={{
          borderBottom: '3px solid #8b5cf6',
          paddingBottom: '24px',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))',
          padding: '32px',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <img
            className="owner-profile__avatar"
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.firstName || 'O')}+${encodeURIComponent(profile.lastName || '')}`}
            alt="Personal avatar"
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #8b5cf6' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0 }}>
                {profile.firstName} {profile.lastName}
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, rgba(200,100,255,0.2), rgba(255,100,200,0.2))',
                border: '1px solid rgba(200,100,255,0.5)',
                color: '#8b5cf6',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                Personal Profile
              </span>
            </div>
            <div className="owner-profile__handle" style={{ fontSize: '18px', color: '#6b7280', marginBottom: '12px' }}>
              @{profile.handle}
            </div>
            <div className="owner-profile__stats" style={{ display: 'flex', gap: '24px' }}>
              <span><strong>{profile.counts?.followers || 0}</strong> followers</span>
              <span><strong>{profile.counts?.following || 0}</strong> following</span>
              <span><strong>{profile.counts?.posts || 0}</strong> posts</span>
            </div>
          </div>
          <div className="owner-profile__actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setShowPersonalEditModal(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(200,100,255,0.9), rgba(255,100,200,0.9))',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                color: 'white',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(200,100,255,0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(200,100,255,0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(200,100,255,0.4)';
              }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                color: 'white',
                fontSize: '16px'
              }}
            >
              ✨ Invite Clients & Friends
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: MY BUSINESS(ES) (The Salons/Spas)                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>My Business</h3>
          {businesses.length > 0 && (
            <button
              onClick={() => {
                console.log('[OwnerProfilePage] Add Another Business clicked');
                setSelectedBusinessId(null); // null = CREATE mode
                setShowBusinessEditModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Add Another Business
            </button>
          )}
        </div>

        {businesses.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {businesses.map((business) => (
              <div
                key={business._id}
                className="tm-card"
                style={{
                  padding: '32px',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{business.name}</h4>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#6366f1',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {business.category}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>
                      {business.description || 'No description yet'}
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📍</span>
                      {business.address && `${business.address}, `}
                      {business.city}, {business.state} {business.zip}
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Status: <strong style={{ color: business.moderationStatus === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
                          {business.moderationStatus}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      console.log('[OwnerProfilePage] Edit business clicked:', business._id);
                      setSelectedBusinessId(business._id);
                      setShowBusinessEditModal(true);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '15px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    🏢 Edit Business Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="tm-card"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))',
              border: '2px dashed rgba(139, 92, 246, 0.3)',
              borderRadius: '16px'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏢</div>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
              No businesses yet
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
              Create your first business profile to get started
            </p>
            <button
              onClick={() => {
                console.log('[OwnerProfilePage] Create Your First Business clicked');
                setSelectedBusinessId(null); // null = CREATE mode
                setShowBusinessEditModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '16px',
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
              ➕ Create Your First Business
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ORIGINAL SECTIONS (Compose, Recent Activity)                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="owner-profile__grid" style={{ marginTop: '48px' }}>
        <section className="tm-card">
          <div className="tm-card__title">Compose</div>
          <div className="empty">Post an update or create a survey (coming soon).</div>
        </section>

        <section className="tm-card" style={{ gridColumn: '1 / -1' }}>
          <div className="tm-card__title">Recent Activity</div>
          <div className="empty">Posts and surveys will appear here (coming soon).</div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      <EditPersonalProfileModal
        isOpen={showPersonalEditModal}
        onClose={() => setShowPersonalEditModal(false)}
        onSave={(updatedProfile) => {
          console.log('[OwnerProfilePage] Personal profile updated:', updatedProfile);
          setProfile(updatedProfile);
        }}
      />

      <EditBusinessProfileModal
        isOpen={showBusinessEditModal}
        onClose={() => setShowBusinessEditModal(false)}
        businessId={selectedBusinessId}
        onSave={(savedBusiness) => {
          console.log('[OwnerProfilePage] Business saved:', savedBusiness);

          // Check if this is a NEW business (CREATE mode) or UPDATED business (EDIT mode)
          const isNewBusiness = !businesses.find(b => b._id === savedBusiness._id);

          if (isNewBusiness) {
            // CREATE mode - add new business to list
            console.log('[OwnerProfilePage] Adding new business to list');
            setBusinesses(prev => [...prev, savedBusiness]);
          } else {
            // EDIT mode - update existing business in list
            console.log('[OwnerProfilePage] Updating existing business in list');
            setBusinesses(prev =>
              prev.map(b => b._id === savedBusiness._id ? savedBusiness : b)
            );
          }
        }}
      />
    </div>
  );
}
