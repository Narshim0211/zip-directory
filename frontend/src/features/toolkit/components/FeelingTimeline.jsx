import React from "react";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";
import "../styles/hairGoalsDiary.css";

/**
 * FeelingTimeline
 *
 * Visual timeline showing emotional journey milestones.
 * Shows 3 key points: Start → Middle → End
 * Clean, minimal design that tells the story arc.
 *
 * @param {Array} weeklyEntries - Array of weekly entries with hairFeeling
 * @param {boolean} compact - If true, shows only emojis (for cards)
 */
export default function FeelingTimeline({ weeklyEntries = [], compact = false }) {
  // Sort entries by week number
  const sorted = [...weeklyEntries]
    .filter(e => e.hairFeeling)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  if (sorted.length === 0) {
    return (
      <div className="ft-empty">
        <span className="ft-empty-text">No feelings logged yet</span>
      </div>
    );
  }

  // Get milestone entries (first, middle, last)
  const getMilestones = () => {
    if (sorted.length === 1) {
      return [{ ...sorted[0], position: "only" }];
    }

    if (sorted.length === 2) {
      return [
        { ...sorted[0], position: "start" },
        { ...sorted[sorted.length - 1], position: "end" }
      ];
    }

    // 3+ entries: show first, middle, last
    const midIndex = Math.floor(sorted.length / 2);
    return [
      { ...sorted[0], position: "start" },
      { ...sorted[midIndex], position: "middle" },
      { ...sorted[sorted.length - 1], position: "end" }
    ];
  };

  const milestones = getMilestones();

  // Compact version (for journey cards in list)
  if (compact) {
    return (
      <div className="ft-compact">
        {milestones.map((entry, index) => (
          <React.Fragment key={entry.weekNumber}>
            <span className="ft-compact-emoji" title={`Week ${entry.weekNumber}`}>
              {getFeelingEmoji(entry.hairFeeling)}
            </span>
            {index < milestones.length - 1 && (
              <span className="ft-compact-arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Full version (for Memory Book)
  return (
    <div className="ft-timeline">
      <div className="ft-track">
        {milestones.map((entry, index) => (
          <div
            key={entry.weekNumber}
            className={`ft-milestone ft-milestone--${entry.position}`}
          >
            <div className="ft-milestone-dot">
              <span className="ft-milestone-emoji">
                {getFeelingEmoji(entry.hairFeeling)}
              </span>
            </div>
            <div className="ft-milestone-info">
              <span className="ft-milestone-week">Week {entry.weekNumber}</span>
              <span className="ft-milestone-word">
                {getHairWord(entry.hairFeeling)}
              </span>
            </div>
            {/* Connecting line (not on last item) */}
            {index < milestones.length - 1 && (
              <div className="ft-connector" />
            )}
          </div>
        ))}
      </div>

      {/* Summary text */}
      {milestones.length >= 2 && (
        <p className="ft-summary">
          {getSummaryText(milestones[0].hairFeeling, milestones[milestones.length - 1].hairFeeling)}
        </p>
      )}
    </div>
  );
}

/**
 * Generate emotional summary based on start and end feelings
 */
function getSummaryText(startFeeling, endFeeling) {
  const improved = endFeeling > startFeeling;
  const same = endFeeling === startFeeling;
  const declined = endFeeling < startFeeling;

  if (improved) {
    if (endFeeling >= 4) {
      return "What an amazing transformation! Your dedication paid off.";
    }
    return "You made real progress on this journey.";
  }

  if (same) {
    if (endFeeling >= 4) {
      return "You maintained great hair health throughout!";
    }
    return "Consistency is key - keep going!";
  }

  if (declined) {
    return "Every journey teaches us something valuable.";
  }

  return "";
}
