import React from 'react';
import { generateWeeklyReport } from '../utils/hairGoalsReportGenerator';
import { TrendLine, ConsistencyDots, PastNotesList } from './WeeklyReportComponents';
import '../styles/hairGoalsDiary.css';

export default function WeeklyReportCard({ entry, allEntries = [], isCompact = false }) {
  if (!entry) return null;
  
  const report = generateWeeklyReport(entry, allEntries);
  
  if (isCompact) {
    // Smaller version for history list
    return (
      <div className="hgd-report-card compact">
        <div className="hgd-report-header">
          <h3>Week {report.weekNumber}</h3>
          <span className="hgd-report-emoji">{report.feelingEmoji}</span>
        </div>
        
        <div className="hgd-report-summary">
          <p><strong>Goal:</strong> {report.goal}</p>
          <p><strong>Feeling:</strong> {report.hairWord} Hair</p>
          <p><strong>Routine:</strong> {report.routineTags.length} actions</p>
          {report.streak > 0 && (
            <p className="hgd-report-streak">
              🔥 {report.streak} week streak
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Full report
  return (
    <div className="hgd-report-card">
      <div className="hgd-report-header">
        <h2>
          <span className="hgd-report-emoji">🌟</span>
          Week {report.weekNumber} Hair Glow-Up Report
        </h2>
        {report.streak > 0 && (
          <div className="hgd-report-streak-badge">
            {report.streak} Weeks 
            {report.streak >= 4 && ' 👑'}
            {report.streak >= 8 && ' 💎'}
          </div>
        )}
      </div>
      
      {/* Photos */}
      {report.photoUri && (
        <div className="hgd-report-photos">
          <img 
            src={report.photoUri} 
            alt={`Week ${report.weekNumber}`}
            className="hgd-report-photo"
          />
        </div>
      )}
      
      {/* Goal Section */}
      <div className="hgd-report-section">
        <h3 className="hgd-report-section-title">🎯 This Week's Goal</h3>
        <p className="hgd-report-goal">{report.goal}</p>
        {report.goalWhy && (
          <p className="hgd-report-goal-why">Why: {report.goalWhy}</p>
        )}
      </div>
      
      {/* Routine Section */}
      <div className="hgd-report-section">
        <h3 className="hgd-report-section-title">
          💇 Routine 
          <ConsistencyDots score={report.consistency} />
        </h3>
        {report.routineTags.length > 0 ? (
          <div className="hgd-report-routine-tags">
            {report.routineTags.map((tag, index) => (
              <span key={index} className="hgd-report-routine-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="hgd-report-empty">No routine actions this week</p>
        )}
        {report.routineNote && (
          <p className="hgd-report-routine-note">Note: {report.routineNote}</p>
        )}
      </div>
      
      {/* Feeling Section */}
      <div className="hgd-report-section">
        <h3 className="hgd-report-section-title">💆 Hair Status</h3>
        <div className="hgd-report-feeling">
          <span className="hgd-report-feeling-emoji">{report.feelingEmoji}</span>
          <span className="hgd-report-feeling-word">{report.hairWord} Hair</span>
        </div>
      </div>
      
      {/* Trend Section */}
      {report.trend.length > 1 && (
        <div className="hgd-report-section">
          <h3 className="hgd-report-section-title">📈 Trend</h3>
          <TrendLine trend={report.trend} />
        </div>
      )}
      
      {/* Reflection Section */}
      {report.reflection && (
        <div className="hgd-report-section">
          <h3 className="hgd-report-section-title">📝 What Changed</h3>
          <p className="hgd-report-reflection">{report.reflection}</p>
        </div>
      )}
      
      {/* Wins Section */}
      {report.wins.length > 0 && (
        <div className="hgd-report-section hgd-report-wins">
          <h3 className="hgd-report-section-title">✨ This Week's Wins</h3>
          <ul className="hgd-report-wins-list">
            {report.wins.map((win, index) => (
              <li key={index}>{win}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Next Week Focus */}
      <div className="hgd-report-section hgd-report-focus">
        <h3 className="hgd-report-section-title">🎯 Next Week's Focus</h3>
        <p className="hgd-report-focus-text">{report.nextWeekFocus}</p>
      </div>
      
      {/* Past Notes */}
      {report.pastNotes.length > 0 && (
        <div className="hgd-report-section">
          <h3 className="hgd-report-section-title">📚 Previous Notes</h3>
          <PastNotesList notes={report.pastNotes} />
        </div>
      )}
    </div>
  );
}
