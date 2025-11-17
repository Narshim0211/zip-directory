import React from 'react';
import { useHairGoals } from '../context/HairGoalsContext';
import { getLatestSummary } from '../utils/hairGoalsReportGenerator';
import '../styles/hairGoalsDiary.css';

export default function HairGoalsSummaryCard({ onEditGoal, onFinishCheckin, onAddPhoto, onViewReport }) {
  const { weeklyEntries, getCurrentWeekNumber, getCurrentWeekEntry } = useHairGoals();
  
  const summary = getLatestSummary(weeklyEntries);
  const currentWeek = getCurrentWeekNumber();
  const currentEntry = getCurrentWeekEntry();
  
  if (!summary || !currentEntry) {
    // Empty state - no entries yet
    return (
      <div className="hgd-summary-card empty">
        <div className="hgd-summary-icon">✨</div>
        <h3>Start Your Hair Glow-Up Diary</h3>
        <p>Track what's actually working for your hair — one week at a time.</p>
        <button className="hgd-btn-primary" onClick={onFinishCheckin}>
          Start This Week
        </button>
      </div>
    );
  }
  
  // Current week card - always editable
  const hasGoal = currentEntry.goal;
  const hasPhoto = currentEntry.photoUri;
  const hasFeeling = currentEntry.hairFeeling;
  const routineCount = currentEntry.completedSteps?.length || 0;
  const isComplete = hasGoal && hasFeeling;
  
  return (
    <div className="hgd-summary-card">
      <div className="hgd-summary-header">
        <h3>This Week</h3>
        <span className="hgd-summary-week-badge">Week {currentWeek}</span>
      </div>
      
      <div className="hgd-summary-content">
        {/* Goal Section */}
        <div className="hgd-summary-section">
          <div className="hgd-summary-section-header">
            <span className="hgd-summary-label">🎯 Goal</span>
            {hasGoal && (
              <button className="hgd-edit-btn" onClick={onEditGoal}>
                ✏️ Edit
              </button>
            )}
          </div>
          <p className="hgd-summary-text">
            {hasGoal ? currentEntry.goal : 'Not set yet'}
          </p>
        </div>

        {/* Status Section */}
        {hasFeeling && (
          <div className="hgd-summary-section">
            <span className="hgd-summary-label">💇 Status</span>
            <p className="hgd-summary-text">
              {summary.feelingEmoji} {summary.hairWord} Hair
            </p>
          </div>
        )}

        {/* Routine Section */}
        {routineCount > 0 && (
          <div className="hgd-summary-section">
            <span className="hgd-summary-label">🧴 Routine</span>
            <p className="hgd-summary-text">
              {routineCount} step{routineCount > 1 ? 's' : ''} completed
            </p>
          </div>
        )}

        {/* Streak */}
        {summary.streak > 0 && (
          <div className="hgd-summary-section">
            <span className="hgd-summary-label">🔥 Streak</span>
            <p className="hgd-summary-text">
              {summary.streak} week{summary.streak > 1 ? 's' : ''} {summary.streak >= 4 && '👑'}
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="hgd-summary-actions">
        {!hasGoal && (
          <button className="hgd-btn-primary full-width" onClick={onEditGoal}>
            Set This Week's Goal
          </button>
        )}
        
        {hasGoal && !isComplete && (
          <>
            <button className="hgd-btn-primary" onClick={onFinishCheckin}>
              Log Progress
            </button>
            {!hasPhoto && (
              <button className="hgd-btn-secondary" onClick={onAddPhoto}>
                Add Photo
              </button>
            )}
          </>
        )}
        
        {isComplete && (
          <button className="hgd-btn-primary full-width" onClick={onViewReport}>
            View This Week's Summary
          </button>
        )}
      </div>
    </div>
  );
}
