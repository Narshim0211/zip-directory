import React from 'react';
import '../styles/hairGoalsDiary.css';

/**
 * Trend Line - Shows last 4 feelings as emoji progression
 */
export function TrendLine({ trend = [] }) {
  if (trend.length === 0) {
    return (
      <div className="hgd-trend-line">
        <p className="hgd-trend-empty">Complete more weeks to see your trend</p>
      </div>
    );
  }

  return (
    <div className="hgd-trend-line">
      <div className="hgd-trend-emojis">
        {trend.map((item, index) => (
          <React.Fragment key={item.week}>
            <div className="hgd-trend-item">
              <span className="hgd-trend-emoji">{item.emoji}</span>
              <span className="hgd-trend-week">W{item.week}</span>
            </div>
            {index < trend.length - 1 && (
              <span className="hgd-trend-arrow">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * Consistency Dots - Shows routine consistency score
 */
export function ConsistencyDots({ score = 0 }) {
  const maxDots = 3;
  
  return (
    <div className="hgd-consistency-dots">
      {[...Array(maxDots)].map((_, index) => (
        <span
          key={index}
          className={`hgd-consistency-dot ${index < score ? 'filled' : ''}`}
        >
          ●
        </span>
      ))}
    </div>
  );
}

/**
 * Past Notes List - Shows previous weeks' reflections
 */
export function PastNotesList({ notes = [] }) {
  if (notes.length === 0) {
    return (
      <div className="hgd-past-notes">
        <p className="hgd-past-notes-empty">No previous notes yet</p>
      </div>
    );
  }

  return (
    <div className="hgd-past-notes">
      {notes.map(note => (
        <div key={note.week} className="hgd-past-note">
          <span className="hgd-past-note-week">Week {note.week}</span>
          <span className="hgd-past-note-divider">—</span>
          <span className="hgd-past-note-text">{note.note}</span>
        </div>
      ))}
    </div>
  );
}
