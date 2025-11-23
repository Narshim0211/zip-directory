import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import OwnerPromotionModal from './promotions/OwnerPromotionModal';
import BlogList from './blog/BlogList';
import '../styles/premiumOwnerDashboard.css';

/**
 * PREMIUM OWNER DASHBOARD v1.0
 *
 * The ONLY page a Premium owner ever needs.
 * One page. No tabs. No menus. Pure money, power, and control in under 5 seconds.
 *
 * UX Enhancements v1.1:
 * - Smart contextual hints for first-time users
 * - One-click actions on every stat card
 * - Empty state illustrations with CTAs
 * - Tooltips for clarity
 * - Progressive disclosure (don't overwhelm)
 *
 * Success Metrics:
 * - >2 minutes avg time on dashboard
 * - >70% daily check rate
 * - >90% "worth $49/mo" rating
 * - <4% monthly churn
 */

const PremiumOwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [business, setBusiness] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showHints, setShowHints] = useState(false); // First-time user hints
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    loadDashboardData();

    // Check if this is first visit (show hints)
    const hasSeenDashboard = localStorage.getItem('salonhub_dashboard_seen');
    if (!hasSeenDashboard) {
      setShowHints(true);
      localStorage.setItem('salonhub_dashboard_seen', 'true');
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, businessRes] = await Promise.all([
        api.get('/owner/analytics/dashboard'),
        api.get('/owner/business')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (businessRes.data) {
        setBusiness(businessRes.data);
        // Get user name from business owner or fallback
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Check if owner needs to take action
  const needsAttention = () => {
    if (!stats || !business) return [];
    const items = [];

    if (!business.coverPhotoUrl && !business.logoUrl) {
      items.push({ text: 'Add a cover photo', action: () => navigate('/owner/my-business') });
    }
    if (stats.messages?.unreadCount > 0) {
      items.push({ text: `${stats.messages.unreadCount} unread messages`, action: () => navigate('/owner/inbox') });
    }
    if (!stats.promotion?.hasPromotion) {
      items.push({ text: 'Create your first promotion', action: () => setShowPromoModal(true) });
    }
    if (stats.bookingsThisWeek?.count === 0) {
      items.push({ text: 'Get your first booking', action: () => navigate('/owner/my-business') });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="premium-dashboard">
        <div className="premium-dashboard__loading">
          <div className="premium-dashboard__spinner"></div>
          <p>Loading your Premium Dashboard...</p>
        </div>
      </div>
    );
  }

  const ownerName = business?.name || user?.name || 'Premium Owner';
  const isPremium = business?.listingType === 'premium' && business?.premiumSubscription?.active;
  const nextBillingDate = business?.premiumSubscription?.currentPeriodEnd
    ? new Date(business.premiumSubscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const attentionItems = needsAttention();

  return (
    <div className="premium-dashboard">
      {/* Back Button - Outside container, top of page */}
      <button
        onClick={() => navigate('/owner/plan-selection')}
        style={{
          margin: '20px 0 0 20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#4b5563',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <span style={{ fontSize: '18px' }}>←</span>
        <span>Back to Plan Selection</span>
      </button>

      <div className="premium-dashboard__container">

        {/* HERO GREETING - Premium Badge + Welcome */}
        <header className="premium-dashboard__hero">
          <div className="premium-dashboard__greeting">
            <h1>Welcome back, {ownerName}!</h1>
            {isPremium && (
              <div className="premium-dashboard__badge">
                <span className="premium-badge__icon">💎</span>
                <span className="premium-badge__text">Premium Member</span>
              </div>
            )}
          </div>
        </header>

        {/* SMART ATTENTION BANNER - Action Items */}
        {attentionItems.length > 0 && (
          <div className="premium-dashboard__attention-banner">
            <div className="attention-banner__header">
              <span className="attention-banner__icon">⚡</span>
              <span className="attention-banner__title">Quick Actions ({attentionItems.length})</span>
            </div>
            <div className="attention-banner__items">
              {attentionItems.map((item, index) => (
                <button
                  key={index}
                  className="attention-banner__item"
                  onClick={item.action}
                >
                  <span className="attention-item__text">{item.text}</span>
                  <span className="attention-item__arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MONEY SNAPSHOT - The Dopamine Hit */}
        <div className="premium-dashboard__money-snapshot">
          <div className="money-snapshot__revenue">
            <div className="money-snapshot__amount">${stats?.revenue?.thisMonth?.toLocaleString() || '0'}</div>
            <div className="money-snapshot__label">This month</div>
            {stats?.revenue?.changePercent !== undefined && (
              <div className={`money-snapshot__change ${stats.revenue.changePercent >= 0 ? 'positive' : 'negative'}`}>
                {stats.revenue.changePercent >= 0 ? '↑' : '↓'}{Math.abs(stats.revenue.changePercent)}%
              </div>
            )}
          </div>
          <div className="money-snapshot__bookings">
            <div className="bookings__count">{stats?.bookingsThisWeek?.count || 0} bookings this week</div>
            {stats?.bookingsThisWeek?.changePercent !== undefined && (
              <div className={`bookings__change ${stats.bookingsThisWeek.changePercent >= 0 ? 'positive' : 'negative'}`}>
                ({stats.bookingsThisWeek.changePercent >= 0 ? '+' : ''}{stats.bookingsThisWeek.changePercent}% vs last week)
              </div>
            )}
          </div>
        </div>

        {/* 4 GIANT ACTION BUTTONS - Zero Thinking */}
        <div className="premium-dashboard__action-buttons">
          <button
            className="action-button action-button--edit-profile"
            onClick={() => navigate('/owner/my-business')}
          >
            <span className="action-button__icon">✏️</span>
            <span className="action-button__text">EDIT PROFILE</span>
          </button>

          <button
            className="action-button action-button--bookings"
            onClick={() => navigate('/owner/bookings')}
          >
            <span className="action-button__icon">📅</span>
            <span className="action-button__text">BOOKINGS</span>
          </button>

          <button
            className="action-button action-button--messages"
            onClick={() => navigate('/owner/inbox')}
          >
            <span className="action-button__icon">💬</span>
            <span className="action-button__text">MESSAGES</span>
            {stats?.messages?.unreadCount > 0 && (
              <span className="action-button__badge">{stats.messages.unreadCount}</span>
            )}
          </button>

          <button
            className="action-button action-button--promotion"
            onClick={() => setShowPromoModal(true)}
          >
            <span className="action-button__icon">🎁</span>
            <span className="action-button__text">CREATE PROMOTION</span>
          </button>
        </div>

        {/* LIVE PROFILE PREVIEW + 4 STAT CARDS - Proof It Works */}
        <div className="premium-dashboard__content-grid">

          {/* Live Profile Preview */}
          <div className="premium-dashboard__profile-preview">
            <h2 className="profile-preview__title">Your Public Profile</h2>
            <div className="profile-preview__card">
              {business?.coverPhotoUrl || business?.logoUrl ? (
                <img
                  src={business.coverPhotoUrl || business.logoUrl}
                  alt={business.name}
                  className="profile-preview__image"
                />
              ) : (
                <div className="profile-preview__placeholder">
                  <span>📸</span>
                  <p>Add a cover photo</p>
                </div>
              )}
              <div className="profile-preview__info">
                <h3>{business?.name || 'Your Business'}</h3>
                <p>{business?.city || 'Your City'}</p>
                <div className="profile-preview__rating">
                  <span>⭐</span>
                  <span>{business?.ratingAverage?.toFixed(1) || '0.0'}</span>
                  <span>({business?.ratingsCount || 0} reviews)</span>
                </div>
              </div>
              <button
                className="profile-preview__view-button"
                onClick={() => navigate(`/business/${business?._id || business?.bookingSlug}`)}
              >
                View Live Profile →
              </button>
            </div>
          </div>

          {/* 4 Stat Cards - ALL CLICKABLE */}
          <div className="premium-dashboard__stat-cards">

            {/* Card 1: Revenue This Month → View Bookings */}
            <button
              className="stat-card stat-card--revenue stat-card--clickable"
              onClick={() => navigate('/owner/bookings')}
              title="View all bookings"
            >
              <div className="stat-card__icon">💰</div>
              <div className="stat-card__value">${stats?.revenue?.thisMonth?.toLocaleString() || '0'}</div>
              <div className="stat-card__label">Revenue this month</div>
              {stats?.revenue?.changePercent !== undefined && (
                <div className={`stat-card__change ${stats.revenue.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {stats.revenue.changePercent >= 0 ? '↑' : '↓'}{Math.abs(stats.revenue.changePercent)}%
                </div>
              )}
              <div className="stat-card__cta">View Details →</div>
            </button>

            {/* Card 2: Bookings This Week → Manage Bookings */}
            <button
              className="stat-card stat-card--bookings stat-card--clickable"
              onClick={() => navigate('/owner/booking')}
              title="Manage bookings"
            >
              <div className="stat-card__icon">📅</div>
              <div className="stat-card__value">{stats?.bookingsThisWeek?.count || 0}</div>
              <div className="stat-card__label">Bookings this week</div>
              {stats?.bookingsThisWeek?.changePercent !== undefined && (
                <div className={`stat-card__change ${stats.bookingsThisWeek.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  {stats.bookingsThisWeek.changePercent >= 0 ? '+' : ''}{stats.bookingsThisWeek.changePercent}%
                </div>
              )}
              <div className="stat-card__cta">Manage →</div>
            </button>

            {/* Card 3: Messages → Open Inbox */}
            <button
              className="stat-card stat-card--messages stat-card--clickable"
              onClick={() => navigate('/owner/inbox')}
              title="Open inbox"
            >
              <div className="stat-card__icon">💬</div>
              <div className="stat-card__value">
                {stats?.messages?.unreadCount || 0} unread
              </div>
              <div className="stat-card__label">Messages</div>
              {stats?.messages?.unreadCount > 0 && (
                <div className="stat-card__badge">new</div>
              )}
              <div className="stat-card__cta">Open Inbox →</div>
            </button>

            {/* Card 4: Promotion Performance → Edit/Create Promotion */}
            <button
              className="stat-card stat-card--promotion stat-card--clickable"
              onClick={() => setShowPromoModal(true)}
              title={stats?.promotion?.hasPromotion ? 'Edit promotion' : 'Create promotion'}
            >
              <div className="stat-card__icon">
                {stats?.promotion?.hasPromotion ? '🎁' : '💤'}
              </div>
              {stats?.promotion?.hasPromotion ? (
                <>
                  <div className="stat-card__value">
                    {stats.promotion.views} → {stats.promotion.bookings} booked
                  </div>
                  <div className="stat-card__label">Current Promotion</div>
                  <div className="stat-card__change positive">
                    +{stats.promotion.upliftPercent}% uplift
                  </div>
                  <div className="stat-card__meta">
                    {stats.promotion.daysLeft}d left • {stats.promotion.title}
                  </div>
                  <div className="stat-card__cta">Edit Promo →</div>
                </>
              ) : (
                <>
                  <div className="stat-card__value">No Promotion</div>
                  <div className="stat-card__label">Create one to boost bookings</div>
                  <div className="stat-card__meta">Get more bookings 📈</div>
                  <div className="stat-card__cta">Create Now →</div>
                </>
              )}
            </button>

          </div>
        </div>

        {/* SUBSCRIPTION INFO - Next Billing */}
        {isPremium && nextBillingDate && (
          <div className="premium-dashboard__subscription-info">
            <p>Next billing {nextBillingDate}</p>
            <button
              className="subscription-info__manage-button"
              onClick={() => navigate('/owner/my-business#subscription')}
            >
              Manage subscription
            </button>
          </div>
        )}

        {/* BLOG SECTION - Business Growth Articles */}
        <div style={{ marginTop: '48px', padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
          <BlogList
            limit={3}
            category="business"
            title="Grow Your Business"
            subtitle="Expert tips and strategies to grow your salon business"
          />
        </div>

      </div>

      {/* Promotion Modal */}
      {showPromoModal && (
        <OwnerPromotionModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          businessId={business?._id}
          existingPromotion={stats?.promotion?.hasPromotion ? business?.promotion : null}
          onSuccess={() => {
            setShowPromoModal(false);
            loadDashboardData(); // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default PremiumOwnerDashboard;
