import React from "react";
import { getFeelingOption } from "../../../../config/goalQuestions";
import "../../styles/reportCard.css";

/**
 * TrendChart Component
 *
 * Displays the feeling trend line for the last 12 weeks.
 * Shows emoji representations with connecting visual line.
 */
export default function TrendChart({ trendData = [], weeksTracked = 0 }) {
  if (!trendData.length) {
    return (
      <div className="rc-trend-empty">
        <div className="rc-trend-empty-icon">📊</div>
        <p>Complete your first check-in to start tracking your trend!</p>
      </div>
    );
  }

  // Take last 12 weeks max
  const displayData = trendData.slice(-12);

  return (
    <div className="rc-trend-container">
      <div className="rc-trend-header">
        <h4>Your Hair Trend</h4>
        <span className="rc-trend-weeks">{weeksTracked} weeks tracked</span>
      </div>

      <div className="rc-trend-chart">
        <div className="rc-trend-line-bg" />
        <div className="rc-trend-points">
          {displayData.map((point, index) => {
            const feeling = getFeelingOption(point.feeling);
            const topPosition = 100 - ((point.feeling - 1) / 4) * 80; // Map 1-5 to 80%-0%

            return (
              <div
                key={point.week}
                className="rc-trend-point"
                style={{
                  left: `${(index / (displayData.length - 1 || 1)) * 100}%`,
                  top: `${topPosition}%`
                }}
              >
                <div
                  className="rc-trend-emoji"
                  style={{ backgroundColor: feeling.color + "20", borderColor: feeling.color }}
                >
                  {feeling.emoji}
                </div>
                <span className="rc-trend-week-label">W{point.week}</span>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="rc-trend-y-axis">
          <span>Amazing</span>
          <span>Good</span>
          <span>Okay</span>
          <span>Not great</span>
          <span>Struggling</span>
        </div>
      </div>

      {/* Simple emoji summary */}
      <div className="rc-trend-summary">
        {displayData.slice(-5).map((point, index) => {
          const feeling = getFeelingOption(point.feeling);
          return (
            <div key={index} className="rc-trend-summary-item">
              <span className="rc-trend-summary-emoji">{feeling.emoji}</span>
              <span className="rc-trend-summary-week">W{point.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
