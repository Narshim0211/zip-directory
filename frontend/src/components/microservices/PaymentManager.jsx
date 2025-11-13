import React, { useState, useEffect } from 'react';
import paymentService from '../../api/paymentService';

/**
 * Payment Manager Component
 * Demonstrates Payment Microservice Integration
 * 
 * Features:
 * - View payment transactions
 * - Manage subscriptions
 * - Connect Stripe account
 * - Process payments
 */
const PaymentManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, subscriptions, stripe

  useEffect(() => {
    loadPaymentData();
  }, [activeTab]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'transactions') {
        await loadTransactions();
      } else if (activeTab === 'subscriptions') {
        await loadSubscriptions();
      } else if (activeTab === 'stripe') {
        await loadStripeAccount();
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError(err.response?.data?.message || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await paymentService.getMyTransactions();
      
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
      setTransactions([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const response = await paymentService.getMySubscriptions();
      
      if (response.success) {
        setSubscriptions(response.data || []);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
      setSubscriptions([]);
    }
  };

  const loadStripeAccount = async () => {
    try {
      const response = await paymentService.getStripeAccount();
      
      if (response.success) {
        setStripeAccount(response.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        throw err;
      }
      setStripeAccount(null);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await paymentService.createConnectAccount();
      
      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error connecting Stripe:', err);
      setError(err.response?.data?.message || 'Failed to connect Stripe account');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      trialing: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderTransactions = () => (
    <div className="space-y-4">
      {loading && <div className="text-center py-4">Loading transactions...</div>}
      
      {!loading && transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions yet.</p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <>
          {transactions.map((transaction) => (
            <div key={transaction._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {transaction.type === 'payment' ? 'Payment' : 'Refund'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                <div>
                  <p className="text-gray-500">Stripe Payment ID</p>
                  <p className="font-mono text-xs">{transaction.stripePaymentIntentId}</p>
                </div>
                {transaction.description && (
                  <div>
                    <p className="text-gray-500">Description</p>
                    <p>{transaction.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-4">
      {loading && <div className="text-center py-4">Loading subscriptions...</div>}
      
      {!loading && subscriptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No active subscriptions.</p>
        </div>
      )}

      {!loading && subscriptions.length > 0 && (
        <>
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                  <p className="text-sm text-gray-600">
                    Started: {formatDate(subscription.startDate)}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(subscription.status)}`}>
                  {subscription.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Billing Cycle</p>
                  <p className="font-medium capitalize">{subscription.billingCycle}</p>
                </div>
                {subscription.nextBillingDate && (
                  <div>
                    <p className="text-gray-500">Next Billing</p>
                    <p className="font-medium">{formatDate(subscription.nextBillingDate)}</p>
                  </div>
                )}
              </div>
              
              {subscription.features && subscription.features.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Features:</p>
                  <ul className="list-disc list-inside text-sm">
                    {subscription.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderStripeAccount = () => (
    <div className="space-y-4">
      {loading && <div className="text-center py-4">Loading Stripe account...</div>}
      
      {!loading && !stripeAccount && (
        <div className="text-center py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Connect Your Stripe Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Stripe account to start accepting payments from your customers.
            </p>
            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              Connect with Stripe
            </button>
          </div>
        </div>
      )}

      {!loading && stripeAccount && (
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Stripe Account Connected</h3>
            <span className={`px-3 py-1 rounded-full ${stripeAccount.chargesEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {stripeAccount.chargesEnabled ? 'Active' : 'Pending'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Account ID</p>
              <p className="font-mono text-sm">{stripeAccount.stripeAccountId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Charges Enabled</p>
              <p className="font-medium">{stripeAccount.chargesEnabled ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payouts Enabled</p>
              <p className="font-medium">{stripeAccount.payoutsEnabled ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Details Submitted</p>
              <p className="font-medium">{stripeAccount.detailsSubmitted ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {!stripeAccount.chargesEnabled && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                Your account is pending verification. Please complete your Stripe account setup.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="payment-manager p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'transactions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'stripe'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stripe Account
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'stripe' && renderStripeAccount()}
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;
