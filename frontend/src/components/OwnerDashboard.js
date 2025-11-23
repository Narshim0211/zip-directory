import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import OwnerPromotionModal from './promotions/OwnerPromotionModal';

// Reconstruct v1Client structure for backward compatibility
const v1Client = {
  owner: {
    getFollowing: async (params) => {
      const response = await api.get('/owner/following', { params });
      return response.data;
    },
    getFollowers: async (params) => {
      const response = await api.get('/owner/followers', { params });
      return response.data;
    },
    getMyBusiness: async () => {
      const response = await api.get('/owner/business');
      return response.data;
    },
    getPromotion: async (businessId) => {
      const response = await api.get(`/owner/promotion/${businessId}`);
      return response.data;
    }
  }
};

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ following: 0, followers: 0, surveys: 0 });
  const [moneyStats, setMoneyStats] = useState(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch owner stats (following/followers)
        try {
          const [followingRes, followersRes] = await Promise.all([
            v1Client.owner.getFollowing({ limit: 1 }),
            v1Client.owner.getFollowers({ limit: 1 })
          ]);
          setStats({
            following: followingRes.pagination?.total || 0,
            followers: followersRes.pagination?.total || 0,
            surveys: 0 // Will be populated later
          });
        } catch (statsErr) {
          console.warn('Could not fetch stats:', statsErr);
        }

        // Fetch business ID and current promotion
        try {
          const businessResponse = await v1Client.owner.getMyBusiness();
          if (businessResponse.success && businessResponse.business) {
            setBusinessId(businessResponse.business._id);

            // Fetch current promotion if business exists
            try {
              const promoResponse = await v1Client.owner.getPromotion(businessResponse.business._id);
              if (promoResponse.success && promoResponse.hasPromotion) {
                setCurrentPromotion(promoResponse.promotion);
              }
            } catch (promoErr) {
              console.log('No active promotion');
            }
          }
        } catch (businessErr) {
          console.warn('Could not fetch business:', businessErr);
        }

        // Fetch money dashboard stats (revenue, returning %, top service, promo)
        try {
          const analyticsResponse = await api.get('/owner/analytics/dashboard');
          if (analyticsResponse.data.success) {
            setMoneyStats(analyticsResponse.data.stats);
          }
        } catch (analyticsErr) {
          console.warn('Could not fetch analytics:', analyticsErr);
        }
      } catch (err) {
        console.error('Dashboard loading failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <header style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '8px'
          }}>Welcome to Your Dashboard</h1>
          <p style={{
            fontSize: '16px',
            color: '#718096'
          }}>
            Discover trends, connect with other salon owners, and grow your business.
          </p>
        </header>

        {/* Compact Social Stats */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#4a5568',
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span style={{ marginRight: '32px' }}>
            <strong style={{ fontSize: '18px', color: '#2d3748' }}>{stats.following}</strong> Following
          </span>
          <span style={{ marginRight: '32px' }}>
            <strong style={{ fontSize: '18px', color: '#2d3748' }}>{stats.followers}</strong> Followers
          </span>
          <span>
            <strong style={{ fontSize: '18px', color: '#2d3748' }}>{stats.surveys}</strong> Surveys
          </span>
        </div>

        {/* Money Dashboard Cards */}
        {moneyStats ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {/* Card 1: Monthly Revenue */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>💰</div>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                ${moneyStats.revenue.thisMonth.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                This Month
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {moneyStats.revenue.changePercent > 0 ? '↑' : moneyStats.revenue.changePercent < 0 ? '↓' : '→'} {Math.abs(moneyStats.revenue.changePercent)}% vs last month
              </div>
            </div>

            {/* Card 2: Returning Clients */}
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🔄</div>
              <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                {moneyStats.returning.percentage}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Returning Clients
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {moneyStats.returning.total} bookings this month
              </div>
            </div>

            {/* Card 3: Top Service */}
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🏆</div>
              <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', lineHeight: '1.2' }}>
                {moneyStats.topService.name}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Top Service
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                ${moneyStats.topService.revenue.toLocaleString()} ({moneyStats.topService.bookings} bookings)
              </div>
            </div>

            {/* Card 4: Active Promotion */}
            <div style={{
              background: moneyStats.promotion.hasPromotion
                ? 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)'
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              boxShadow: moneyStats.promotion.hasPromotion
                ? '0 4px 12px rgba(120, 115, 245, 0.3)'
                : '0 4px 12px rgba(189, 189, 189, 0.3)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                {moneyStats.promotion.hasPromotion ? '🎁' : '💤'}
              </div>
              {moneyStats.promotion.hasPromotion ? (
                <>
                  <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                    {moneyStats.promotion.bookings}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    Promo Bookings
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {moneyStats.promotion.daysLeft}d left • {moneyStats.promotion.title}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
                    No Promotion
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    Create one below
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    Get more bookings 📈
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
              Loading Your Analytics...
            </h3>
            <p style={{ color: '#718096' }}>
              We're gathering your revenue, client, and service data
            </p>
          </div>
        )}

        {/* Quick Actions Section */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Promotions Button */}
          <button
            onClick={() => setShowPromoModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ff6ec4 0%, #7873f5 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(120, 115, 245, 0.4)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(120, 115, 245, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(120, 115, 245, 0.4)';
            }}
          >
            <span>{currentPromotion ? '✏️' : '🎁'}</span>
            <span>{currentPromotion ? 'Update Special Offer' : 'Create Special Offer'}</span>
          </button>

          {/* Client Messages Button */}
          <a
            href="/owner/inbox"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            <span>💬</span>
            <span>Client Messages</span>
          </a>
        </div>
      </div>

      {/* Create/Update Promotion Modal */}
      <OwnerPromotionModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        businessId={businessId}
        existingPromotion={currentPromotion}
        onSuccess={(promotion) => {
          setCurrentPromotion(promotion);
          setShowPromoModal(false);
        }}
      />
    </div>
  );
};

export default OwnerDashboard;
