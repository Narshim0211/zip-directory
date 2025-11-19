import React, { useEffect, useState } from 'react';
import { profileAnalytics } from '../../api/analytics';
import './ProfileInsightBar.css';

/**
 * ProfileInsightBar Component
 * Shows business profile visit analytics for owners
 * Simple, clean, X/Twitter-style metrics strip
 * NO duplication - used ONLY on business listing pages
 */
const ProfileInsightBar = ({ ownerId }) => {
  const [insights, setInsights] = useState({
    today: 0,
    last7Days: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await profileAnalytics.getInsights(ownerId);
        
        if (response.success) {
          setInsights(response.data);
        }
      } catch (err) {
        console.error('Error fetching profile insights:', err);
        setError('Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [ownerId]);

  if (!ownerId) return null;
  
  if (loading) {
    return (
      <div className="profile-insight-bar loading">
        <div className="insight-header">📊 Engagement Insights</div>
        <div className="insight-loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-insight-bar error">
        <div className="insight-header">📊 Engagement Insights</div>
        <div className="insight-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-insight-bar">
      <div className="insight-header">
        <span className="insight-icon">📊</span>
        <span className="insight-title">Engagement Insights</span>
      </div>
      
      <div className="insight-metrics">
        <div className="metric">
          <span className="metric-icon">👁</span>
          <span className="metric-label">Total Profile Visits Today</span>
          <span className="metric-value">{insights.today}</span>
        </div>
        
        <div className="metric">
          <span className="metric-icon">📈</span>
          <span className="metric-label">Total Profile Visits (Last 7 Days)</span>
          <span className="metric-value">{insights.last7Days}</span>
        </div>
        
        {insights.total > 0 && (
          <div className="metric secondary">
            <span className="metric-icon">✨</span>
            <span className="metric-label">All Time</span>
            <span className="metric-value">{insights.total}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInsightBar;
