import React, { useState, useEffect, useMemo } from 'react';
import { getTwinInsights, canShowInsights } from '../utils/twinInsightsData';
import { getCommunityInsights } from '../../../api/hairGoalsReportsApi';
import '../styles/hairTwinInsights.css';

/**
 * Hair Twin Insights Card
 * Shows anonymous community comparison to boost motivation
 *
 * Hybrid approach:
 * 1. First tries to fetch real data from API (when enough users exist)
 * 2. Falls back to local seeded data if API fails or user not logged in
 *
 * Props:
 * - goalName: User's selected hair goal
 * - weekNumber: Current week in their journey
 * - completedCount: Number of routine steps completed
 * - totalSteps: Total routine steps
 */
function HairTwinInsights({ goalName, weekNumber, completedCount, totalSteps }) {
  const [apiInsights, setApiInsights] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate completion percentage
  const completionPercent = useMemo(() => {
    if (totalSteps === 0) return 0;
    return (completedCount / totalSteps) * 100;
  }, [completedCount, totalSteps]);

  // Try to fetch real insights from API
  useEffect(() => {
    let cancelled = false;

    async function fetchInsights() {
      // Don't fetch if no goal or no steps
      if (!goalName || totalSteps === 0) return;

      setLoading(true);
      try {
        const data = await getCommunityInsights(goalName, weekNumber, Math.round(completionPercent));
        if (!cancelled && data) {
          setApiInsights(data);
          setApiError(false);
        }
      } catch (err) {
        // Silently fall back to local data
        if (!cancelled) {
          setApiError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInsights();
    return () => { cancelled = true; };
  }, [goalName, weekNumber, completionPercent, totalSteps]);

  // Get insights: prefer API data, fall back to local seeded data
  const insights = useMemo(() => {
    if (!canShowInsights(totalSteps, completedCount)) return null;

    // Use API data if available
    if (apiInsights && !apiError) {
      return {
        headline: apiInsights.headline,
        subtext: apiInsights.subtext,
        percentile: apiInsights.percentile,
        userPercent: apiInsights.userCompletion,
        averagePercent: apiInsights.averageCompletion,
        isAboveAverage: apiInsights.isAboveAverage,
        isCrushing: apiInsights.isCrushing,
        tip: apiInsights.tip
      };
    }

    // Fall back to local seeded data
    return getTwinInsights(goalName, weekNumber, completionPercent);
  }, [goalName, weekNumber, completionPercent, totalSteps, completedCount, apiInsights, apiError]);

  // Don't render if no insights available or still loading initially
  if (!insights || (loading && !apiInsights && !apiError)) {
    return null;
  }

  // Determine card style based on performance
  const cardClass = insights.isCrushing
    ? 'twin-insights-card crushing'
    : insights.isAboveAverage
    ? 'twin-insights-card above-average'
    : 'twin-insights-card';

  return (
    <div className={cardClass}>
      {/* Sparkle decoration for top performers */}
      {insights.isCrushing && (
        <div className="twin-insights-sparkles">
          <span className="sparkle">✨</span>
          <span className="sparkle">⭐</span>
          <span className="sparkle">✨</span>
        </div>
      )}

      {/* Main headline */}
      <h3 className="twin-insights-headline">
        {insights.isCrushing && <span className="star-icon">🌟</span>}
        {insights.headline}
      </h3>

      {/* Subtext with context */}
      <p className="twin-insights-subtext">{insights.subtext}</p>

      {/* Divider */}
      <div className="twin-insights-divider" />

      {/* Tip from top performers */}
      <div className="twin-insights-tip">
        <span className="tip-icon">💡</span>
        <div className="tip-content">
          <span className="tip-label">Tip from top performers:</span>
          <span className="tip-text">
            "{insights.tip.habit}" — {insights.tip.percentage}% of them do it
          </span>
        </div>
      </div>
    </div>
  );
}

export default HairTwinInsights;
