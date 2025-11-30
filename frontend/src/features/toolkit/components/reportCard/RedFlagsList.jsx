import React from "react";
import "../../styles/reportCard.css";

/**
 * RedFlagsList Component
 *
 * Displays things correlated with bad hair days.
 * Helps users identify what to avoid.
 */
export default function RedFlagsList({ redFlags = [] }) {
  if (!redFlags.length) {
    return (
      <div className="rc-flags-empty">
        <div className="rc-flags-empty-icon">🚩</div>
        <p>No red flags identified yet!</p>
        <span className="rc-flags-empty-hint">Keep logging to discover patterns</span>
      </div>
    );
  }

  return (
    <div className="rc-flags-container">
      <div className="rc-flags-header">
        <h4>Red Flags to Avoid</h4>
        <span className="rc-flags-subtitle">Things that hurt your hair</span>
      </div>

      <div className="rc-flags-list">
        {redFlags.map((flag, index) => {
          const severity = flag.correlation >= 60 ? "high" : flag.correlation >= 40 ? "medium" : "low";

          return (
            <div key={flag.issue} className={`rc-flag-item severity-${severity}`}>
              <div className="rc-flag-icon">
                {severity === "high" ? "🚨" : severity === "medium" ? "⚠️" : "📌"}
              </div>

              <div className="rc-flag-info">
                <span className="rc-flag-name">{flag.label}</span>
                <span className="rc-flag-stats">
                  {flag.badWeeks}/{flag.totalWeeks} bad weeks
                </span>
              </div>

              <div className="rc-flag-correlation">
                <div className="rc-flag-bar">
                  <div
                    className="rc-flag-bar-fill"
                    style={{
                      width: `${flag.correlation}%`,
                      background:
                        severity === "high"
                          ? "linear-gradient(90deg, #ef4444, #f87171)"
                          : severity === "medium"
                          ? "linear-gradient(90deg, #f97316, #fb923c)"
                          : "#6b7280"
                    }}
                  />
                </div>
                <span className="rc-flag-percent">{flag.correlation}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rc-flags-tip">
        <span className="rc-flags-tip-icon">💡</span>
        <p>Higher correlation = stronger link to bad hair days</p>
      </div>
    </div>
  );
}
