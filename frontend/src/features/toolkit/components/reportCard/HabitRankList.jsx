import React from "react";
import "../../styles/reportCard.css";

/**
 * HabitRankList Component
 *
 * Displays ranked habits by effectiveness score.
 * Shows what actually works for the user.
 */
export default function HabitRankList({ habits = [] }) {
  if (!habits.length) {
    return (
      <div className="rc-habits-empty">
        <div className="rc-habits-empty-icon">🌱</div>
        <p>Track more weeks to see what works for you!</p>
        <span className="rc-habits-empty-hint">Need at least 2 weeks with each habit</span>
      </div>
    );
  }

  // Get top 5 habits
  const topHabits = habits.slice(0, 5);

  return (
    <div className="rc-habits-container">
      <div className="rc-habits-header">
        <h4>What Actually Works</h4>
        <span className="rc-habits-subtitle">Based on your good hair days</span>
      </div>

      <div className="rc-habits-list">
        {topHabits.map((habit, index) => {
          const isTopThree = index < 3;
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;

          return (
            <div
              key={habit.habit}
              className={`rc-habit-item ${isTopThree ? "top-three" : ""}`}
            >
              <div className="rc-habit-rank">
                {medal ? (
                  <span className="rc-habit-medal">{medal}</span>
                ) : (
                  <span className="rc-habit-number">#{index + 1}</span>
                )}
              </div>

              <div className="rc-habit-info">
                <span className="rc-habit-name">{habit.label}</span>
                <span className="rc-habit-stats">
                  {habit.goodWeeks}/{habit.totalWeeks} good weeks
                </span>
              </div>

              <div className="rc-habit-score">
                <div className="rc-habit-score-bar">
                  <div
                    className="rc-habit-score-fill"
                    style={{
                      width: `${habit.score}%`,
                      background: isTopThree
                        ? "linear-gradient(90deg, #10b981, #34d399)"
                        : "#6b7280"
                    }}
                  />
                </div>
                <span className="rc-habit-score-text">{habit.score}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length > 5 && (
        <p className="rc-habits-more">
          +{habits.length - 5} more habits tracked
        </p>
      )}
    </div>
  );
}
