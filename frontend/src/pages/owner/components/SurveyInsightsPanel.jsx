import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import MiniSurveyCard from '../../../components/owner/MiniSurveyCard';
import '../../../styles/surveyInsightsPanel.css';

/**
 * Survey Insights Panel (Left Sidebar)
 * Displays Survey of the Day + Trending Today surveys
 */
const SurveyInsightsPanel = () => {
  const [surveyOfDay, setSurveyOfDay] = useState(null);
  const [trendingToday, setTrendingToday] = useState([]);
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

      // Fetch both in parallel
      const [sodResponse, ttResponse] = await Promise.all([
        api.get('/surveys/trending/survey-of-the-day'),
        api.get('/surveys/trending/today?limit=5')
      ]);

      setSurveyOfDay(sodResponse.data.data);
      setTrendingToday(ttResponse.data.data || []);
    } catch (err) {
      console.error('Failed to fetch survey insights:', err);
      setError('Unable to load trending surveys');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !surveyOfDay && trendingToday.length === 0) {
    return (
      <div className="survey-insights-panel">
        <div className="survey-insights-panel__loading">
          <div className="survey-insights-panel__spinner"></div>
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error && !surveyOfDay && trendingToday.length === 0) {
    return (
      <div className="survey-insights-panel">
        <div className="survey-insights-panel__error">
          <p>{error}</p>
          <button onClick={fetchData} className="survey-insights-panel__retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasSurveyOfDay = surveyOfDay && surveyOfDay._id;
  const hasTrendingToday = trendingToday && trendingToday.length > 0;

  // Don't show panel if no data at all
  if (!hasSurveyOfDay && !hasTrendingToday) {
    return null;
  }

  return (
    <div className="survey-insights-panel">
      {/* Survey of the Day */}
      {hasSurveyOfDay && (
        <section className="survey-insights-panel__section survey-insights-panel__section--sotd">
          <h3 className="survey-insights-panel__title">
            <span className="survey-insights-panel__icon">🌟</span>
            Survey of the Day
          </h3>
          <MiniSurveyCard survey={surveyOfDay} variant="survey-of-day" />
        </section>
      )}

      {/* Trending Today */}
      {hasTrendingToday && (
        <section className="survey-insights-panel__section">
          <h3 className="survey-insights-panel__title">
            <span className="survey-insights-panel__icon">🔥</span>
            Trending Today
          </h3>
          <div className="survey-insights-panel__list">
            {trendingToday.map((survey, index) => (
              <MiniSurveyCard
                key={survey._id}
                survey={survey}
                variant="trending-today"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasSurveyOfDay && !hasTrendingToday && (
        <div className="survey-insights-panel__empty">
          <p>✨ No trending surveys yet today</p>
          <p className="survey-insights-panel__empty-subtitle">
            Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default SurveyInsightsPanel;
