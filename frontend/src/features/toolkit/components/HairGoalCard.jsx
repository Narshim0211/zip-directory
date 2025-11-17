import React from "react";
import "../styles/hairGoalsDiary.css";

export const HAIR_GOAL_OPTIONS = [
  "Grow longer",
  "Get thicker",
  "Healthier hair",
  "Reduce frizz",
  "Improve shine",
  "Maintain color",
  "Stronger curls",
  "Heal dryness"
];

export default function HairGoalCard({ goal, onEdit }) {
  const hasGoal = goal && goal.goalType;

  return (
    <div className="hg-card">
      <div className="hg-card-header">
        <div>
          <h3 className="hg-card-title">🎯 Your Hair Goal</h3>
          <p className="hg-card-subtitle">
            Pick a single focus so every routine and check-in ladders up to it
          </p>
        </div>
        <button className="hg-btn ghost" onClick={onEdit}>
          {hasGoal ? "Edit Goal" : "Set Goal"}
        </button>
      </div>

      {hasGoal ? (
        <div className="hg-goal-details">
          <div>
            <span className="hg-goal-label">Goal</span>
            <p className="hg-goal-value">{goal.goalType}</p>
          </div>
          {goal.goalNote && (
            <div>
              <span className="hg-goal-label">Why it matters</span>
              <p className="hg-goal-note">{goal.goalNote}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="hg-empty-state">
          <p className="hg-empty-title">No goal yet</p>
          <p className="hg-empty-copy">
            Set one north-star hair goal so your routine and reports feel meaningful.
          </p>
          <button className="hg-btn primary" onClick={onEdit}>
            Choose Goal
          </button>
        </div>
      )}
    </div>
  );
}
