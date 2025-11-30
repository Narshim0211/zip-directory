import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

/**
 * TrendingMobileSection Component
 *
 * Horizontal scrollable trending section for mobile/tablet devices.
 * Shows on screens < 1200px where sidebars are hidden.
 *
 * Features:
 * - Survey of the Day highlight
 * - Horizontal scroll of trending surveys
 * - Compact card design for mobile
 */
const TrendingMobileSection = () => {
  const navigate = useNavigate();
  const [surveyOfDay, setSurveyOfDay] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // Fetch both in parallel
        const [sotdRes, trendingRes] = await Promise.all([
          api.get('/surveys/trending/survey-of-the-day').catch(() => ({ data: { data: null } })),
          api.get('/surveys/trending/today?limit=6').catch(() => ({ data: { data: [] } }))
        ]);

        setSurveyOfDay(sotdRes.data?.data || null);
        setTrending(trendingRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch trending:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Don't render if no data
  if (!loading && !surveyOfDay && trending.length === 0) {
    return null;
  }

  const handleSurveyClick = (surveyId) => {
    navigate(`/survey/${surveyId}`);
  };

  // Format engagement count
  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="trending-mobile">
      <div className="trending-mobile__header">
        <span className="trending-mobile__icon">🔥</span>
        <h3 className="trending-mobile__title">Trending Now</h3>
      </div>

      {loading ? (
        <div className="trending-mobile__loading">
          <div className="trending-mobile__skeleton" />
          <div className="trending-mobile__skeleton" />
          <div className="trending-mobile__skeleton" />
        </div>
      ) : (
        <div className="trending-mobile__scroll">
          {/* Survey of the Day - Featured */}
          {surveyOfDay && (
            <div
              className="trending-mobile__card trending-mobile__card--featured"
              onClick={() => handleSurveyClick(surveyOfDay._id)}
            >
              <div className="trending-mobile__badge">⭐ Survey of the Day</div>
              <h4 className="trending-mobile__question">{surveyOfDay.question}</h4>
              <div className="trending-mobile__meta">
                <span className="trending-mobile__author">
                  {surveyOfDay.author?.businessName || surveyOfDay.author?.firstName || 'Anonymous'}
                </span>
                <span className="trending-mobile__votes">
                  {formatCount(surveyOfDay.totalVotes || 0)} votes
                </span>
              </div>
            </div>
          )}

          {/* Trending Surveys */}
          {trending.map((survey, index) => (
            <div
              key={survey._id}
              className="trending-mobile__card"
              onClick={() => handleSurveyClick(survey._id)}
            >
              <div className="trending-mobile__rank">#{index + 1}</div>
              <h4 className="trending-mobile__question">{survey.question}</h4>
              <div className="trending-mobile__meta">
                <span className="trending-mobile__votes">
                  {formatCount(survey.totalVotes || 0)} votes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingMobileSection;
