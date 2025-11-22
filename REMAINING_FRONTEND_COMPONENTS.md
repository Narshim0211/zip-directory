# Remaining Frontend Components to Create

## Summary

✅ **Backend**: 100% Complete and tested
✅ **Created**: VerificationStatusBanner.jsx + CSS (2/8 files)
⏳ **Remaining**: 6 files (copy code below and create manually)

---

## Quick Create Instructions

Copy each code block below and save to the specified file path:

---

## File 1: PremiumSubscription.jsx
**Path**: `frontend/src/components/PremiumSubscription.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PremiumSubscription.css';

const PremiumSubscription = ({ businessId }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    fetchSubscriptionStatus();
  }, [businessId]);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/premium/status/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      setError('Unable to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        '/api/v1/premium/create-checkout',
        { businessId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError('Unable to start subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        '/api/v1/premium/create-portal-session',
        { businessId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      console.error('Failed to open portal:', err);
      setError('Unable to open billing portal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="premium-subscription premium-subscription--loading">
        <p>Loading subscription status...</p>
      </div>
    );
  }

  const isActive = subscription?.active === true;
  const status = subscription?.status || 'inactive';

  return (
    <div className="premium-subscription">
      <div className="premium-subscription__header">
        <h2>💎 Premium Subscription</h2>
        <span className={`premium-subscription__status premium-subscription__status--${status}`}>
          {status === 'active' && '✓ Active'}
          {status === 'past_due' && '⚠ Past Due'}
          {status === 'canceled' && '✗ Canceled'}
          {status === 'inactive' && 'Not Subscribed'}
        </span>
      </div>

      <div className="premium-subscription__content">
        {!isActive ? (
          <>
            <div className="premium-subscription__pitch">
              <h3>Unlock Premium Features</h3>
              <p>Get discovered by more customers with premium placement and exclusive features</p>
            </div>

            <div className="premium-subscription__features">
              <div className="premium-feature">
                <div className="premium-feature__icon">🔝</div>
                <div>
                  <strong>Top Search Placement</strong>
                  <p>Appear at the top of directory search results</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">💎</div>
                <div>
                  <strong>Premium Badge</strong>
                  <p>Stand out with a verified premium badge on your listing</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">📊</div>
                <div>
                  <strong>Advanced Analytics</strong>
                  <p>Detailed insights on views, clicks, and customer engagement</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">⚡</div>
                <div>
                  <strong>Priority Support</strong>
                  <p>Get faster response times and dedicated support</p>
                </div>
              </div>
            </div>

            <div className="premium-subscription__pricing">
              <div className="premium-price">
                <span className="premium-price__amount">$29</span>
                <span className="premium-price__period">/month</span>
              </div>
              <p className="premium-price__note">Cancel anytime. No long-term commitment.</p>
            </div>

            <button
              className="premium-subscription__cta"
              onClick={handleSubscribe}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : 'Upgrade to Premium'}
            </button>

            <div className="premium-subscription__note">
              <p>
                <strong>Note:</strong> Premium subscription unlocks platform features.
                To accept online payments from customers, you'll also need to connect Stripe below.
              </p>
            </div>
          </>
        ) : (
          <div className="premium-subscription__active">
            <div className="premium-active__info">
              <p><strong>✅ You're subscribed to Premium!</strong></p>
              <p className="premium-active__details">
                Enjoying top placement, premium badge, and advanced analytics.
              </p>
              {subscription.currentPeriodEnd && (
                <p className="premium-active__renewal">
                  {subscription.cancelAtPeriodEnd
                    ? `Ends on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>

            <button
              className="premium-subscription__manage"
              onClick={handleManage}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          </div>
        )}

        {status === 'past_due' && (
          <div className="premium-subscription__warning">
            <p><strong>⚠ Payment Issue</strong></p>
            <p>Your payment method failed. Update it to keep your premium benefits.</p>
            <button
              className="premium-subscription__cta"
              onClick={handleManage}
              disabled={actionLoading}
            >
              Update Payment Method
            </button>
          </div>
        )}

        {error && (
          <div className="premium-subscription__error">{error}</div>
        )}
      </div>
    </div>
  );
};

export default PremiumSubscription;
```

---

## File 2: PremiumSubscription.css
**Path**: `frontend/src/components/PremiumSubscription.css`

```css
/* Premium Subscription Component Styles */

.premium-subscription {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.premium-subscription--loading {
  text-align: center;
  padding: 48px 32px;
  color: #64748b;
}

.premium-subscription__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.premium-subscription__header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.premium-subscription__status {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
}

.premium-subscription__status--active {
  background: #dcfce7;
  color: #16a34a;
}

.premium-subscription__status--past_due {
  background: #fef3c7;
  color: #ca8a04;
}

.premium-subscription__status--canceled {
  background: #fee2e2;
  color: #dc2626;
}

.premium-subscription__status--inactive {
  background: #f1f5f9;
  color: #64748b;
}

.premium-subscription__content {
  margin-bottom: 0;
}

.premium-subscription__pitch h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.premium-subscription__pitch p {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #64748b;
}

.premium-subscription__features {
  display: grid;
  gap: 16px;
  margin-bottom: 32px;
}

.premium-feature {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.premium-feature__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  font-size: 24px;
}

.premium-feature strong {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.premium-feature p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.premium-subscription__pricing {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.premium-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.premium-price__amount {
  font-size: 48px;
  font-weight: 700;
  color: #E91E63;
}

.premium-price__period {
  font-size: 20px;
  font-weight: 600;
  color: #64748b;
}

.premium-price__note {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #64748b;
}

.premium-subscription__cta {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #E91E63 0%, #F06292 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.premium-subscription__cta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(233, 30, 99, 0.3);
}

.premium-subscription__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.premium-subscription__active {
  padding: 24px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 2px solid #86efac;
}

.premium-active__info p {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #0f172a;
}

.premium-active__details {
  font-size: 14px;
  color: #64748b;
}

.premium-active__renewal {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.premium-subscription__manage {
  width: 100%;
  padding: 12px 24px;
  margin-top: 16px;
  background: white;
  color: #E91E63;
  border: 2px solid #E91E63;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.premium-subscription__manage:hover:not(:disabled) {
  background: #fdf2f8;
}

.premium-subscription__warning {
  padding: 16px;
  background: #fef3c7;
  border: 2px solid #eab308;
  border-radius: 12px;
  margin-top: 16px;
}

.premium-subscription__warning p {
  margin: 0 0 12px 0;
  color: #78350f;
}

.premium-subscription__error {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-top: 16px;
}

.premium-subscription__note {
  padding: 16px;
  background: #f8fafc;
  border-left: 4px solid #E91E63;
  border-radius: 8px;
  margin-top: 16px;
}

.premium-subscription__note p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

.premium-subscription__note strong {
  color: #0f172a;
}

@media (max-width: 768px) {
  .premium-subscription {
    padding: 24px;
  }

  .premium-subscription__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .premium-price__amount {
    font-size: 36px;
  }
}
```

---

## File 3: StripeConnectCard.jsx
**Path**: `frontend/src/components/StripeConnectCard.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StripeConnectCard.css';

const StripeConnectCard = ({ businessId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    fetchStripeStatus();
  }, [businessId]);

  const fetchStripeStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/stripe-connect/status/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setStatus(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe status:', err);
      setError('Unable to load Stripe connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post(
        '/api/v1/stripe-connect/create-account-link',
        { businessId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      console.error('Failed to create account link:', err);
      setError('Unable to start Stripe connection. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    try {
      setActionLoading(true);
      const response = await axios.get(
        `/api/v1/stripe-connect/dashboard-link/${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success && response.data.data.url) {
        window.open(response.data.data.url, '_blank');
      }
    } catch (err) {
      console.error('Failed to open dashboard:', err);
      setError('Unable to open Stripe dashboard. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stripe-connect-card stripe-connect-card--loading">
        <p>Loading Stripe connection status...</p>
      </div>
    );
  }

  const isConnected = status?.connected === true;
  const chargesEnabled = status?.chargesEnabled === true;
  const payoutsEnabled = status?.payoutsEnabled === true;

  return (
    <div className="stripe-connect-card">
      <div className="stripe-connect-card__header">
        <div>
          <h2>Stripe Connect</h2>
          <p className="stripe-connect-card__subtitle">Accept customer payments online</p>
        </div>
        <span
          className={`stripe-connect-card__status ${
            isConnected
              ? 'stripe-connect-card__status--connected'
              : 'stripe-connect-card__status--disconnected'
          }`}
        >
          {isConnected ? '✓ Connected' : 'Not Connected'}
        </span>
      </div>

      <div className="stripe-connect-card__content">
        {!isConnected ? (
          <>
            <div className="stripe-connect-card__benefits">
              <h3>Why Connect Stripe?</h3>
              <ul>
                <li>
                  <div className="benefit-icon">💳</div>
                  <div>
                    <strong>Accept Online Payments</strong>
                    <p>Let customers pay for bookings with credit/debit cards</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">🔒</div>
                  <div>
                    <strong>Secure & Trusted</strong>
                    <p>Bank-level security powered by Stripe</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">📈</div>
                  <div>
                    <strong>Automated Commissions</strong>
                    <p>Platform fee automatically deducted, rest goes to you</p>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">🎯</div>
                  <div>
                    <strong>Trust Signal</strong>
                    <p>Show "Accepts Online Payments" badge on your listing</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="stripe-connect-card__commission">
              <p>
                <strong>Platform Commission:</strong> 10% service fee on each booking.
                Stripe processing fees apply separately.
              </p>
            </div>

            <button
              className="stripe-connect-card__cta"
              onClick={handleConnect}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : 'Connect with Stripe'}
            </button>

            <p className="stripe-connect-card__note">
              You'll be redirected to Stripe to complete setup (takes 2-3 minutes)
            </p>
          </>
        ) : (
          <>
            <div className="stripe-connect-card__connected">
              <div className="stripe-status-grid">
                <div className="stripe-status-item">
                  <span className="stripe-status-label">Charges</span>
                  <span className={`stripe-status-value ${chargesEnabled ? 'enabled' : 'disabled'}`}>
                    {chargesEnabled ? 'Enabled ✓' : 'Disabled'}
                  </span>
                </div>
                <div className="stripe-status-item">
                  <span className="stripe-status-label">Payouts</span>
                  <span className={`stripe-status-value ${payoutsEnabled ? 'enabled' : 'disabled'}`}>
                    {payoutsEnabled ? 'Enabled ✓' : 'Disabled'}
                  </span>
                </div>
              </div>

              {!chargesEnabled && (
                <div className="stripe-connect-card__warning">
                  <p>
                    <strong>⚠ Account Setup Incomplete</strong>
                  </p>
                  <p>
                    Complete your Stripe account setup to start accepting payments.
                  </p>
                  <button
                    className="stripe-connect-card__cta"
                    onClick={handleConnect}
                    disabled={actionLoading}
                  >
                    Complete Setup
                  </button>
                </div>
              )}

              {chargesEnabled && (
                <div className="stripe-connect-card__success">
                  <p>✅ <strong>Ready to accept payments!</strong> Customers can now pay you online.</p>
                </div>
              )}
            </div>

            <div className="stripe-connect-card__actions">
              <button
                className="stripe-connect-card__secondary"
                onClick={handleDashboard}
                disabled={actionLoading}
              >
                {actionLoading ? 'Loading...' : 'Open Stripe Dashboard'}
              </button>
            </div>

            <div className="stripe-connect-card__footnote">
              <p>
                <strong>Manage your Stripe account:</strong> View earnings, payouts, and update settings in your Stripe Dashboard.
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="stripe-connect-card__error">{error}</div>
        )}
      </div>
    </div>
  );
};

export default StripeConnectCard;
```

---

Due to length limits, I'll create a second documentation file with the remaining components...
