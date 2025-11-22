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
        <h2>=Ž Premium Subscription</h2>
        <span className={`premium-subscription__status premium-subscription__status--${status}`}>
          {status === 'active' && ' Active'}
          {status === 'past_due' && '  Past Due'}
          {status === 'canceled' && ' Canceled'}
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
                <div className="premium-feature__icon">=</div>
                <div>
                  <strong>Top Search Placement</strong>
                  <p>Appear at the top of directory search results</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">=Ž</div>
                <div>
                  <strong>Premium Badge</strong>
                  <p>Stand out with a verified premium badge on your listing</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">=Ê</div>
                <div>
                  <strong>Advanced Analytics</strong>
                  <p>Detailed insights on views, clicks, and customer engagement</p>
                </div>
              </div>

              <div className="premium-feature">
                <div className="premium-feature__icon">¡</div>
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
              <p><strong> You're subscribed to Premium!</strong></p>
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
            <p><strong>  Payment Issue</strong></p>
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
