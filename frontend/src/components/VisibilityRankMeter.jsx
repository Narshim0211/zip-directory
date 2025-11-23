import React from 'react';

/**
 * VisibilityRankMeter Component
 *
 * Shows listing visibility status and ranking
 * Displays FOMO message for free users
 */
const VisibilityRankMeter = ({ businessId, listingType, businessStatus }) => {
  const isFree = listingType === 'free';
  const isPremium = listingType === 'premium';
  const isActive = businessStatus === 'active';

  // Calculate visibility percentage (mock for now, can be enhanced with real data)
  const freeVisibility = 25; // Free listings get 25% visibility
  const premiumVisibility = 100; // Premium listings get 100% visibility
  const currentVisibility = isPremium ? premiumVisibility : freeVisibility;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c', margin: '0 0 8px 0' }}>
          📊 Listing Visibility
        </h3>
        <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
          Your listing's reach in search results
        </p>
      </div>

      {/* Visibility Meter */}
      <div style={{ marginBottom: '20px' }}>
        {/* Progress Bar */}
        <div style={{
          position: 'relative',
          height: '32px',
          backgroundColor: '#f7fafc',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid #e2e8f0',
        }}>
          <div style={{
            height: '100%',
            width: `${currentVisibility}%`,
            background: isPremium
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
            transition: 'width 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
              {currentVisibility}%
            </span>
          </div>
        </div>

        {/* Visibility Label */}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          {isPremium ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#047857' }}>
                Maximum Visibility - Top of Search Results
              </span>
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                Limited Visibility - Listed After Premium
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {!isActive && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
            ⏳ Listing Pending Approval
          </div>
          <div style={{ fontSize: '13px', color: '#991b1b' }}>
            Your listing is under review. Once approved, it will appear in search results.
          </div>
        </div>
      )}

      {/* Free User FOMO Message */}
      {isFree && isActive && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
          border: '2px solid #E91E63',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            🚀 Get 3x More Views with Premium
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
            Premium listings appear at the top of search results and get 3x more profile views.
            Upgrade now to maximize your visibility and attract more clients.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#E91E63' }}>25%</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Free Visibility</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '24px', color: '#E91E63' }}>→</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>100%</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Premium Visibility</div>
            </div>
          </div>
          <a href="#premium" style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
          }}>
            Upgrade to Premium
          </a>
        </div>
      )}

      {/* Premium User Success Message */}
      {isPremium && isActive && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#047857', marginBottom: '8px' }}>
            🎉 Your listing is maximized!
          </div>
          <p style={{ fontSize: '14px', color: '#166534', margin: 0 }}>
            You're getting maximum visibility in search results.
            Premium listings appear first and attract the most clients.
          </p>
        </div>
      )}

      {/* Verification Reminder (if not verified) */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #93c5fd',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#1e40af',
      }}>
        💡 <strong>Tip:</strong> Complete your profile verification and add photos to improve your ranking within your tier.
      </div>
    </div>
  );
};

export default VisibilityRankMeter;
