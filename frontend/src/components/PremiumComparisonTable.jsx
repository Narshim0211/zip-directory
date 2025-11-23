import React from 'react';

/**
 * PremiumComparisonTable Component
 *
 * Shows free vs premium feature comparison
 * Encourages upgrade with clear value proposition
 */
const PremiumComparisonTable = () => {
  const features = [
    { name: 'Chat with clients', free: false, premium: true, highlight: true },
    { name: 'Reply to messages', free: false, premium: true, highlight: true },
    { name: 'Top placement in search', free: false, premium: true, highlight: true },
    { name: 'Booking deposits', free: false, premium: true },
    { name: 'Cancellation policies', free: false, premium: true },
    { name: 'Promotions & offers', free: false, premium: true },
    { name: 'Full image gallery', free: false, premium: true },
    { name: 'Reply to reviews', free: false, premium: true },
    { name: 'Unlimited staff', free: false, premium: true },
    { name: 'Analytics dashboard', free: false, premium: true },
    { name: 'Priority support', free: false, premium: true },
    { name: 'Basic listing', free: true, premium: true },
    { name: 'Profile verification', free: true, premium: true },
    { name: 'Booking page', free: true, premium: true },
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: '0 0 8px 0' }}>
          Upgrade to Premium
        </h2>
        <p style={{ fontSize: '16px', color: '#718096', margin: 0 }}>
          Get more bookings, manage clients, and grow your business
        </p>
      </div>

      {/* Comparison Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#718096',
                textTransform: 'uppercase',
              }}>
                Feature
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: '#718096',
                textTransform: 'uppercase',
              }}>
                Free
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
                color: '#E91E63',
                textTransform: 'uppercase',
                borderRadius: '8px 8px 0 0',
              }}>
                Premium
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid #f7fafc',
                  backgroundColor: feature.highlight ? '#fffbeb' : 'white',
                }}
              >
                <td style={{
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: feature.highlight ? '600' : '400',
                  color: feature.highlight ? '#1a202c' : '#4a5568',
                }}>
                  {feature.name}
                  {feature.highlight && <span style={{ marginLeft: '8px', fontSize: '16px' }}>⭐</span>}
                </td>
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '20px',
                }}>
                  {feature.free ? '✅' : '❌'}
                </td>
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '20px',
                  backgroundColor: feature.highlight ? '#fdf2f8' : 'transparent',
                }}>
                  {feature.premium ? '✅' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pricing */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
        border: '2px solid #E91E63',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', fontWeight: '800', color: '#E91E63', marginBottom: '8px' }}>
          $49
          <span style={{ fontSize: '20px', color: '#64748b', fontWeight: '600' }}>/month</span>
        </div>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          Cancel anytime • No long-term contracts
        </p>
        <a href="#premium" style={{
          display: 'inline-block',
          padding: '16px 48px',
          background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: '700',
          boxShadow: '0 8px 16px rgba(233, 30, 99, 0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Upgrade to Premium Now
        </a>
      </div>

      {/* Benefits Summary */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '4px' }}>
            3x More Visibility
          </div>
          <div style={{ fontSize: '13px', color: '#15803d' }}>
            Appear at the top of search results
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
            Connect with Clients
          </div>
          <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
            Reply to messages and build relationships
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
            Secure Deposits
          </div>
          <div style={{ fontSize: '13px', color: '#78350f' }}>
            Reduce no-shows with booking deposits
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumComparisonTable;
