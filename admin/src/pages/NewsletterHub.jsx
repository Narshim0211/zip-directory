import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNewsletterOverview } from '../api/newsletter';
import Layout from '../components/layout/Layout';
import './NewsletterHub.css';

const NewsletterHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({
    subscriberCounts: { visitors: 0, owners: 0, total: 0 },
    recentCampaigns: [],
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNewsletterOverview();
      setOverview(response.data);
    } catch (err) {
      console.error('Error fetching newsletter overview:', err);
      setError('Failed to load newsletter overview');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not sent';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = 'campaign-status-badge';
    switch (status) {
      case 'SENT':
        return `${baseClass} status-sent`;
      case 'SCHEDULED':
        return `${baseClass} status-scheduled`;
      case 'SENDING':
        return `${baseClass} status-sending`;
      case 'DRAFT':
        return `${baseClass} status-draft`;
      case 'FAILED':
        return `${baseClass} status-failed`;
      default:
        return baseClass;
    }
  };

  if (loading) {
    return (
      <div className="newsletter-hub-container">
        <div className="newsletter-hub-loading">Loading newsletter data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="newsletter-hub-container">
        <div className="newsletter-hub-error">{error}</div>
        <button onClick={fetchOverview} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const { subscriberCounts, recentCampaigns } = overview;

  return (
    <Layout>
      <div className="newsletter-hub-container">
      <div className="newsletter-hub-header">
        <div>
          <h1 className="newsletter-hub-title">Newsletter Hub</h1>
          <p className="newsletter-hub-subtitle">
            Create and send newsletters to Visitors and Owners
          </p>
        </div>
        <div className="newsletter-hub-actions">
          <button
            onClick={() => navigate('/newsletter/visitor')}
            className="btn-primary"
          >
            Create Visitor Newsletter
          </button>
          <button
            onClick={() => navigate('/newsletter/owner')}
            className="btn-secondary"
          >
            Create Owner Newsletter
          </button>
        </div>
      </div>

      {/* Subscriber Counts */}
      <div className="subscriber-cards">
        <div className="subscriber-card">
          <div className="subscriber-card-icon visitor-icon">👥</div>
          <div className="subscriber-card-content">
            <h3 className="subscriber-card-title">Visitor Subscribers</h3>
            <p className="subscriber-card-count">{subscriberCounts.visitors.toLocaleString()}</p>
            <button
              onClick={() => navigate('/newsletter/subscribers/visitor')}
              className="subscriber-card-link"
            >
              View list →
            </button>
          </div>
        </div>

        <div className="subscriber-card">
          <div className="subscriber-card-icon owner-icon">💼</div>
          <div className="subscriber-card-content">
            <h3 className="subscriber-card-title">Owner Subscribers</h3>
            <p className="subscriber-card-count">{subscriberCounts.owners.toLocaleString()}</p>
            <button
              onClick={() => navigate('/newsletter/subscribers/owner')}
              className="subscriber-card-link"
            >
              View list →
            </button>
          </div>
        </div>

        <div className="subscriber-card">
          <div className="subscriber-card-icon total-icon">📊</div>
          <div className="subscriber-card-content">
            <h3 className="subscriber-card-title">Total Subscribers</h3>
            <p className="subscriber-card-count">{subscriberCounts.total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="recent-campaigns-section">
        <div className="recent-campaigns-header">
          <h2 className="recent-campaigns-title">Recent Campaigns</h2>
          <button
            onClick={() => navigate('/newsletter/campaigns')}
            className="view-all-link"
          >
            View all campaigns →
          </button>
        </div>

        {recentCampaigns.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">
              No campaigns yet. Create your first newsletter above!
            </p>
          </div>
        ) : (
          <div className="campaigns-table-container">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>Audience</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Sent Date</th>
                  <th>Recipients</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign) => (
                  <tr
                    key={campaign._id}
                    onClick={() => navigate(`/newsletter/campaigns/${campaign._id}`)}
                    className="campaigns-table-row"
                  >
                    <td>
                      <span className={`audience-badge audience-${campaign.audience.toLowerCase()}`}>
                        {campaign.audience}
                      </span>
                    </td>
                    <td className="campaign-subject">{campaign.subject}</td>
                    <td>
                      <span className={getStatusBadgeClass(campaign.status)}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="campaign-date">{formatDate(campaign.sentAt)}</td>
                    <td className="campaign-recipients">
                      {campaign.stats?.totalRecipients?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default NewsletterHub;
