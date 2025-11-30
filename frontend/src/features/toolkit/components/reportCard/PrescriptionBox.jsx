import React from "react";
import "../../styles/reportCard.css";

/**
 * PrescriptionBox Component
 *
 * Displays personalized hair care prescription based on data.
 */
export default function PrescriptionBox({ prescription = {}, avgFeeling = 0 }) {
  const { doMore = [], avoid = null, targetGoodWeeks = 0 } = prescription;

  if (!doMore.length && !avoid) {
    return (
      <div className="rc-rx-empty">
        <div className="rc-rx-empty-icon">📋</div>
        <p>Your personalized prescription will appear here!</p>
        <span className="rc-rx-empty-hint">Need more data to generate recommendations</span>
      </div>
    );
  }

  // Determine status message based on avg feeling
  const getStatusMessage = () => {
    if (avgFeeling >= 4) {
      return { emoji: "🌟", text: "You're doing amazing!", color: "#10b981" };
    } else if (avgFeeling >= 3) {
      return { emoji: "💪", text: "Good progress! Keep it up", color: "#8b5cf6" };
    } else {
      return { emoji: "🌱", text: "Room to grow - follow this plan", color: "#f59e0b" };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="rc-rx-container">
      <div className="rc-rx-header">
        <h4>Your Hair Prescription</h4>
        <div className="rc-rx-status" style={{ color: status.color }}>
          <span>{status.emoji}</span>
          <span>{status.text}</span>
        </div>
      </div>

      <div className="rc-rx-content">
        {/* Do More Section */}
        {doMore.length > 0 && (
          <div className="rc-rx-section rc-rx-do-more">
            <div className="rc-rx-section-header">
              <span className="rc-rx-section-icon">✅</span>
              <span className="rc-rx-section-title">Keep Doing</span>
            </div>
            <ul className="rc-rx-list">
              {doMore.map((habit, index) => (
                <li key={index} className="rc-rx-item rc-rx-positive">
                  <span className="rc-rx-check">✓</span>
                  {habit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Avoid Section */}
        {avoid && (
          <div className="rc-rx-section rc-rx-avoid">
            <div className="rc-rx-section-header">
              <span className="rc-rx-section-icon">🚫</span>
              <span className="rc-rx-section-title">Try to Avoid</span>
            </div>
            <div className="rc-rx-avoid-item">
              <span className="rc-rx-x">✗</span>
              {avoid}
            </div>
          </div>
        )}

        {/* Target */}
        {targetGoodWeeks > 0 && (
          <div className="rc-rx-target">
            <div className="rc-rx-target-icon">🎯</div>
            <div className="rc-rx-target-content">
              <span className="rc-rx-target-label">Your Target</span>
              <span className="rc-rx-target-value">
                {targetGoodWeeks} good {targetGoodWeeks === 1 ? "week" : "weeks"} per month
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="rc-rx-footer">
        <p>Based on your {doMore.length > 0 ? "top performing habits" : "journey data"}</p>
      </div>
    </div>
  );
}
