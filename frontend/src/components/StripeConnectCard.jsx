import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './StripeConnectCard.css';

/**
 * StripeConnectCard Component
 *
 * Handles Stripe Connect onboarding for business owners
 * This allows customers to pay THEM directly through booking URLs
 * Platform takes commission automatically via Stripe Connect
 *
 * This is SEPARATE from Premium Subscription (which is payment to platform)
 *
 * Usage:
 *   <StripeConnectCard businessId="123..." />
 */
const StripeConnectCard = ({ businessId }) => {
  const [loading, setLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) return;
    fetchStripeStatus();
  }, [businessId]);

  const fetchStripeStatus = async () => {
    try {
      const response = await api.get(`/v1/stripe-connect/status/${businessId}`);
      if (response.data.success) {
        setStripeStatus(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Stripe status:', err);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Stripe Connect account link
      const response = await api.post('/v1/stripe-connect/create-account-link', {
        businessId
      });

      if (response.data.success && response.data.data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect Stripe');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setLoading(true);

      // Create Stripe Express Dashboard login link
      const response = await axios.post(`/api/v1/stripe-connect/login-link/${businessId}`);

      if (response.data.success && response.data.data.url) {
        window.open(response.data.data.url, '_blank');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Stripe? Customers will no longer be able to pay online.')) {
      return;
    }

    try {
      setLoading(true);

      await axios.post(`/api/v1/stripe-connect/disconnect/${businessId}`);
      await fetchStripeStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = stripeStatus?.connected === true;
  const chargesEnabled = stripeStatus?.chargesEnabled === true;
  const payoutsEnabled = stripeStatus?.payoutsEnabled === true;

  return (
    <div className="stripe-connect-card">
      <div className="stripe-connect-card__header">
        <div>
          <h2>Accept Online Payments</h2>
          <p className="stripe-connect-card__subtitle">
            Let customers pay you directly through your booking URL
          </p>
        </div>
        <div className={`stripe-connect-card__status stripe-connect-card__status--${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '✅ Connected' : '⚪ Not Connected'}
        </div>
      </div>

      <div className="stripe-connect-card__content">
        {!isConnected && (
          <>
            <div className="stripe-connect-card__benefits">
              <h3>Why Connect Stripe?</h3>
              <ul>
                <li>
                  <span className="benefit-icon">💳</span>
                  <div>
                    <strong>Accept Card Payments</strong>
                    <p>Customers can pay instantly when booking</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">💰</span>
                  <div>
                    <strong>Get Paid Faster</strong>
                    <p>Automatic payouts to your bank account</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">🔒</span>
                  <div>
                    <strong>Secure & Trusted</strong>
                    <p>Powered by Stripe - industry-leading security</p>
                  </div>
                </li>
                <li>
                  <span className="benefit-icon">📊</span>
                  <div>
                    <strong>Track Your Revenue</strong>
                    <p>View payments and manage refunds in Stripe Dashboard</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="stripe-connect-card__commission">
              <p><strong>Platform Commission:</strong> We take a small fee from each booking to maintain the platform.</p>
            </div>

            <button
              className="stripe-connect-card__cta"
              onClick={handleConnectStripe}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Connect Stripe Account'}
            </button>

            <p className="stripe-connect-card__note">
              You'll be redirected to Stripe to complete a secure onboarding process. It takes about 5 minutes.
            </p>
          </>
        )}

        {isConnected && (
          <>
            <div className="stripe-connect-card__connected">
              <div className="stripe-status-grid">
                <div className="stripe-status-item">
                  <span className="stripe-status-label">Payments</span>
                  <span className={`stripe-status-value ${chargesEnabled ? 'enabled' : 'disabled'}`}>
                    {chargesEnabled ? '✅ Enabled' : '⏳ Pending'}
                  </span>
                </div>

                <div className="stripe-status-item">
                  <span className="stripe-status-label">Payouts</span>
                  <span className={`stripe-status-value ${payoutsEnabled ? 'enabled' : 'disabled'}`}>
                    {payoutsEnabled ? '✅ Enabled' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              {!chargesEnabled && (
                <div className="stripe-connect-card__warning">
                  <p>⚠️ Your Stripe account needs more information. Complete your onboarding to accept payments.</p>
                  <button
                    className="stripe-connect-card__secondary"
                    onClick={handleConnectStripe}
                    disabled={loading}
                  >
                    Complete Onboarding
                  </button>
                </div>
              )}

              {chargesEnabled && (
                <div className="stripe-connect-card__success">
                  <p>🎉 You're all set! Customers can now pay you through your booking URL.</p>
                </div>
              )}

              <div className="stripe-connect-card__actions">
                <button
                  className="stripe-connect-card__secondary"
                  onClick={handleOpenDashboard}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Open Stripe Dashboard'}
                </button>

                <button
                  className="stripe-connect-card__danger"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="stripe-connect-card__error">
            {error}
          </div>
        )}
      </div>

      <div className="stripe-connect-card__footnote">
        <p><strong>Important:</strong> This is for customer payments to YOU. It's separate from your Premium subscription to the platform.</p>
      </div>
    </div>
  );
};

export default StripeConnectCard;
