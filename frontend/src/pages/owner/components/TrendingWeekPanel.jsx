import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MiniSurveyCard from '../../../components/owner/MiniSurveyCard';
import '../../../styles/trendingWeekPanel.css';

/**
 * Trending Week Panel (Right Sidebar)
 * Displays top 5 trending surveys from the last 7 days
 * Ranked by engagement score (loves * unique voters + votes boost)
 */
const TrendingWeekPanel = () => {
  const [trendingWeek, setTrendingWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();

    // Refresh data every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:5000/api/surveys/trending/week?limit=5');

      setTrendingWeek(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch trending week:', err);
      setError('Unable to load trending surveys');
    } finally {
      setLoading(false);
    }
  };

  if (loading && trendingWeek.length === 0) {
    return (
      <div className="trending-week-panel">
        <div className="trending-week-panel__loading">
          <div className="trending-week-panel__spinner"></div>
          <p>Loading trending...</p>
        </div>
      </div>
    );
  }

  if (error && trendingWeek.length === 0) {
    return (
      <div className="trending-week-panel">
        <div className="trending-week-panel__error">
          <p>{error}</p>
          <button onClick={fetchData} className="trending-week-panel__retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (trendingWeek.length === 0) {
    return (
      <div className="trending-week-panel">
        <div className="trending-week-panel__empty">
          <p>📊 No trending surveys this week</p>
          <p className="trending-week-panel__empty-subtitle">
            Be the first to create one!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-week-panel">
      {/* Header */}
      <div className="trending-week-panel__header">
        <h3 className="trending-week-panel__title">
          <span className="trending-week-panel__icon">📈</span>
          Trending This Week
        </h3>
        <p className="trending-week-panel__subtitle">
          Top surveys by engagement
        </p>
      </div>

      {/* Ranked List */}
      <div className="trending-week-panel__list">
        {trendingWeek.map((survey, index) => (
          <div
            key={survey._id}
            className="trending-week-panel__item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MiniSurveyCard
              survey={survey}
              variant="trending-week"
              rank={index + 1}
            />
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="trending-week-panel__footer">
        <p className="trending-week-panel__info">
          📊 Rankings update every 10 minutes
        </p>
      </div>
    </div>
  );
};

export default TrendingWeekPanel;
