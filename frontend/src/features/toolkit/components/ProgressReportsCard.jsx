import React from "react";
import { useHairGoals } from "../context/HairGoalsContext";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";

const formatDate = (value) => {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ProgressReportsCard({
  onOpenCheckin,
  onRestartJourney,
  onOpenPhotos,
  onViewHistory,
  onViewReport,
  onCompare,
  reports = []
}) {
  const { weeklyEntries, getCurrentWeekNumber, currentStreak } = useHairGoals();

  const sourceEntries = reports.length
    ? reports.map((r) => ({
        ...r,
        id: r._id,
        weekNumber: r.week,
        hairFeeling: r.hairFeeling || r.feeling,
        progressNote: r.note,
      }))
    : weeklyEntries;

  const sortedEntries = [...sourceEntries].sort((a, b) => b.weekNumber - a.weekNumber);
  const latestEntry = sortedEntries[0];
  const currentWeek = getCurrentWeekNumber();
  const feelingEmoji = latestEntry ? getFeelingEmoji(latestEntry.hairFeeling) : "✨";
  const feelingWord = latestEntry ? getHairWord(latestEntry.hairFeeling) : "Ready to glow";
  const stepsCompleted = latestEntry?.completedSteps?.length || 0;

  const handleOpenCheckin = () => {
    if (onOpenCheckin) {
      const nextWeek = latestEntry
        ? Math.max(latestEntry.weekNumber + 1, currentWeek)
        : currentWeek;
      onOpenCheckin({
        weekNumber: nextWeek
      });
    }
  };

  return (
    <div className="hg-card hg-progress-card">
      <div className="hg-card-header hg-progress-header">
        <div>
          <h3 className="hg-card-title">📈 Progress & Reports</h3>
          <p className="hg-card-subtitle">Short weekly reflections to see real changes over time.</p>
        </div>
        <button className="hg-timeline-btn" onClick={onOpenPhotos}>
          📷 Photo Timeline
        </button>
      </div>

      {latestEntry ? (
        <div className="hg-progress-summary modern">
          <div className="hg-progress-latest">
            <span className="hg-progress-emoji">{feelingEmoji}</span>
            <div>
              <p className="hg-progress-value">{feelingWord} hair</p>
              <small>
                Week {latestEntry.weekNumber} • {formatDate(latestEntry.date)}
              </small>
            </div>
          </div>

          {latestEntry.progressNote && (
            <p className="hg-progress-note">“{latestEntry.progressNote}”</p>
          )}

          <div className="hg-progress-metrics modern">
            <div>
              <span className="hg-progress-label">Routine completed</span>
              <p className="hg-progress-value">{stepsCompleted} steps</p>
            </div>
            <div>
              <span className="hg-progress-label">Streak</span>
              <p className="hg-progress-value">
                {currentStreak || 1} week{(currentStreak || 1) > 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <span className="hg-progress-label">Product highlight</span>
              <p className="hg-progress-value">{latestEntry.highlightProductName || "—"}</p>
            </div>
          </div>

          <div className="hg-progress-actions">
            <button className="hg-btn primary" onClick={handleOpenCheckin}>
              Log This Week
            </button>
            {onCompare && (
              <button className="hg-btn ghost" onClick={onCompare}>
                Compare Photos
              </button>
            )}
            <button className="hg-btn ghost" onClick={onOpenPhotos}>
              View Photos
            </button>
          </div>
        </div>
      ) : (
        <div className="hg-empty-state">
          <p className="hg-empty-title">No weekly logs yet</p>
          <p className="hg-empty-copy">
            Upload a photo or tap “Log This Week” to capture your first progress entry.
          </p>
          <button className="hg-btn primary" onClick={handleOpenCheckin}>
            Start First Log
          </button>
        </div>
      )}

      {sortedEntries.length > 0 && (
        <div className="hg-progress-journey">
          <div className="hg-journey-header">
            <div>
              <h4>Your Weekly Story</h4>
              <p>Week {currentWeek} in progress — keep tracking every shift in your hair.</p>
            </div>
            <span className="hg-journey-count">{sortedEntries.length} weeks logged</span>
          </div>

          <ul className="hg-progress-log">
            {sortedEntries.slice(0, 5).map((entry) => (
              <li key={entry.weekNumber} className="hg-progress-log-item">
                <div className="hg-progress-log-date">
                  <span>{getFeelingEmoji(entry.hairFeeling)}</span>
                  <div>
                    <strong>Week {entry.weekNumber}</strong>
                    <small>{formatDate(entry.date)}</small>
                  </div>
                </div>
                <div className="hg-progress-log-body">
                  <p className="hg-progress-log-note">
                    {entry.progressNote || "No note captured"}
                  </p>
                  <small>
                    Steps {entry.completedSteps?.length || 0}
                    {entry.highlightProductName ? ` • Loved: ${entry.highlightProductName}` : ""}
                  </small>
                  {onViewReport && entry._id && (
                    <button
                      className="hg-link-btn"
                      onClick={() => onViewReport(entry._id || entry.id)}
                    >
                      View →
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="hg-card-footer stacked">
        <div>
          <p className="hg-restart-title">Restart Hair Journey</p>
          <p className="hg-restart-copy">
            Saves your current goal, routine, products, photos, and logs into History before
            giving you a clean slate.
          </p>
        </div>
        <div className="hg-footer-actions">
          <button className="hg-btn ghost" onClick={onViewHistory}>
            View History
          </button>
          <button className="hg-btn ghost" onClick={onRestartJourney}>
            Restart Journey
          </button>
        </div>
      </div>
    </div>
  );
}
