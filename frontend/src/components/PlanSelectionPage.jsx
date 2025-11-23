import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Plan Selection Page
 *
 * Simple page that allows owners to navigate between:
 * - Free Listing (OwnerMyBusiness)
 * - Premium Dashboard (PremiumOwnerDashboard)
 */
const PlanSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            margin: '0 0 16px 0',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            fontSize: '20px',
            opacity: 0.95,
            margin: 0
          }}>
            Navigate between Free and Premium dashboards
          </p>
        </div>

        {/* Plan Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>

          {/* Free Listing Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/owner/my-business')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '40px' }}>🆓</span>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a202c',
                margin: 0
              }}>
                Free Listing
              </h2>
            </div>

            <p style={{
              fontSize: '16px',
              color: '#718096',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Basic listing with essential features. Perfect for getting started on SalonHub.
            </p>

            <div style={{
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Basic business profile</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Profile verification</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Booking page</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                <span style={{ fontSize: '15px', color: '#9ca3af' }}>No messaging</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#ef4444', fontSize: '20px' }}>✗</span>
                <span style={{ fontSize: '15px', color: '#9ca3af' }}>Limited visibility</span>
              </div>
            </div>

            <button style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            >
              View Free Dashboard →
            </button>
          </div>

          {/* Premium Listing Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '3px solid #E91E63',
            transition: 'transform 0.3s, box-shadow 0.3s',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => navigate('/owner/dashboard')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(233, 30, 99, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
          }}
          >
            {/* Popular Badge */}
            <div style={{
              position: 'absolute',
              top: '-16px',
              right: '32px',
              background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.4)'
            }}>
              ⭐ RECOMMENDED
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '40px' }}>💎</span>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1a202c',
                margin: 0
              }}>
                Premium
              </h2>
            </div>

            <p style={{
              fontSize: '16px',
              color: '#718096',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Full-featured dashboard with everything you need to grow your business.
            </p>

            <div style={{
              marginBottom: '32px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568', fontWeight: '600' }}>Everything in Free</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Unlimited client messaging</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Top placement in search</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Booking deposits</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#4a5568' }}>Analytics & insights</span>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#E91E63'
              }}>
                $49
                <span style={{
                  fontSize: '20px',
                  color: '#718096',
                  fontWeight: '600'
                }}>/month</span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                Cancel anytime • No long-term contracts
              </div>
            </div>

            <button style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(233, 30, 99, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(233, 30, 99, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(233, 30, 99, 0.3)';
            }}
            >
              View Premium Dashboard →
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          color: 'white',
          opacity: 0.9
        }}>
          <p style={{
            fontSize: '14px',
            margin: 0
          }}>
            ℹ️ This is a development feature to navigate between Free and Premium dashboards. In production, this would be based on your subscription status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionPage;
