import React from 'react';
import { useHairGoals } from '../context/HairGoalsContext';
import { generateWeeklyReport } from '../utils/hairGoalsReportGenerator';
import '../styles/hairGoalsDiary.css';

export default function WeeklyReportPopup({ weekNumber, onClose, onViewFullReport }) {
  const { getEntryByWeek, weeklyEntries } = useHairGoals();
  
  const entry = getEntryByWeek(weekNumber);
  
  if (!entry) return null;
  
  const report = generateWeeklyReport(entry, weeklyEntries);
  
  return (
    <div className="hgd-popup-overlay" onClick={onClose}>
      <div className="hgd-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="hgd-popup-close" onClick={onClose}>✕</button>
        
        <div className="hgd-popup-header">
          <h2>
            <span className="hgd-popup-emoji">🌟</span>
            Week {report.weekNumber} Hair Glow-Up Report
          </h2>
        </div>
        
        <div className="hgd-popup-body">
          <div className="hgd-popup-row">
            <span className="hgd-popup-label">Goal:</span>
            <span className="hgd-popup-value">{report.goal}</span>
          </div>
          
          {report.routineTags.length > 0 && (
            <div className="hgd-popup-row">
              <span className="hgd-popup-label">Routine:</span>
              <span className="hgd-popup-value">
                {report.routineTags.join(', ')}
              </span>
            </div>
          )}
          
          <div className="hgd-popup-row">
            <span className="hgd-popup-label">Hair felt:</span>
            <span className="hgd-popup-value">
              {report.feelingEmoji} {report.hairWord}
            </span>
          </div>
          
          {report.streak > 0 && (
            <div className="hgd-popup-row">
              <span className="hgd-popup-label">Streak:</span>
              <span className="hgd-popup-value hgd-popup-streak">
                {report.streak} Weeks {report.streak >= 4 && '👑'}
              </span>
            </div>
          )}
          
          {report.wins.length > 0 && (
            <div className="hgd-popup-wins">
              <span className="hgd-popup-label">This week's wins:</span>
              <div className="hgd-popup-wins-list">
                {report.wins.map((win, index) => (
                  <span key={index} className="hgd-popup-win">
                    {win}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="hgd-popup-actions">
          <button 
            className="hgd-btn-primary"
            onClick={onViewFullReport}
          >
            View Full Report →
          </button>
          <button 
            className="hgd-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
