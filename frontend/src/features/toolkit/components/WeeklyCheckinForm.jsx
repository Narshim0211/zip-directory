import React, { useState, useEffect } from 'react';
import { useHairGoals } from '../context/HairGoalsContext';
import RoutineChips from './RoutineChips';
import FeelingEmojiPicker from './FeelingEmojiPicker';
import '../styles/hairGoalsDiary.css';

export default function WeeklyCheckinForm({ onComplete, onCancel, editMode = 'full' }) {
  const { getCurrentWeekNumber, getCurrentWeekEntry, addOrUpdateWeeklyEntry } = useHairGoals();
  
  const currentWeek = getCurrentWeekNumber();
  const existingEntry = getCurrentWeekEntry();
  
  // Form state
  const [goal, setGoal] = useState('');
  const [routineTags, setRoutineTags] = useState([]);
  const [hairFeeling, setHairFeeling] = useState(null);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine what to show based on editMode
  // 'goal' = only goal field (for quick edit)
  // 'full' = complete check-in form
  
  // Load existing entry data if available
  useEffect(() => {
    if (existingEntry) {
      setGoal(existingEntry.goal || '');
      setRoutineTags(existingEntry.routineTags || []);
      setHairFeeling(existingEntry.hairFeeling || null);
      setReflection(existingEntry.reflection || '');
    }
  }, [existingEntry]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation based on edit mode
    if (editMode === 'goal') {
      // Only validate goal
      if (!goal.trim()) {
        alert('Please enter a goal for this week');
        return;
      }
    } else {
      // Full validation
      if (!goal.trim()) {
        alert('Please enter a goal for this week');
        return;
      }
      
      if (!hairFeeling) {
        alert('Please select how your hair feels');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      const entryData = {
        weekNumber: currentWeek,
        date: new Date().toISOString(),
        goal: goal.trim(),
        routineTags,
        hairFeeling: hairFeeling || existingEntry?.hairFeeling,
        reflection: reflection.trim(),
      };
      
      const success = addOrUpdateWeeklyEntry(entryData);
      
      if (success) {
        // Check if photo exists to show popup
        const hasPhoto = existingEntry?.photoUri;
        
        if (onComplete) {
          onComplete({ hasPhoto, entryData, editMode });
        }
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('An error occurred. Your data may still be saved locally.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const canSubmit = editMode === 'goal' 
    ? goal.trim() && !isSaving
    : goal.trim() && hairFeeling !== null && !isSaving;
  
  // Goal-only edit mode (simple popup)
  if (editMode === 'goal') {
    return (
      <div className="hgd-checkin-form compact">
        <div className="hgd-checkin-header">
          <h2>Edit Weekly Goal</h2>
          <p className="hgd-checkin-week">Week {currentWeek}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="hgd-form-section">
            <label className="hgd-form-label">
              🎯 This week's hair goal
            </label>
            <input
              type="text"
              className="hgd-form-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Example: avoid heat, reduce frizz, add shine..."
              maxLength={50}
              autoFocus
            />
            <span className="hgd-char-count">{goal.length}/50</span>
          </div>
          
          <div className="hgd-form-actions">
            <button
              type="submit"
              className="hgd-btn-primary"
              disabled={!canSubmit}
            >
              {isSaving ? 'Saving...' : 'Save Goal'}
            </button>
            
            {onCancel && (
              <button
                type="button"
                className="hgd-btn-secondary"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
  
  // Full check-in form
  return (
    <div className="hgd-checkin-form">
      <div className="hgd-checkin-header">
        <h2>Finish This Week's Check-In</h2>
        <p className="hgd-checkin-subtitle">3 simple steps</p>
        <p className="hgd-checkin-week">Week {currentWeek}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Goal */}
        <div className="hgd-form-section">
          <label className="hgd-form-label">
            🎯 Step 1: This week's goal <span className="hgd-required">*</span>
          </label>
          <input
            type="text"
            className="hgd-form-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Example: avoid heat, reduce frizz, add shine..."
            maxLength={50}
          />
          <span className="hgd-char-count">{goal.length}/50</span>
        </div>
        
        {/* Step 2: Routine */}
        <div className="hgd-form-section">
          <label className="hgd-form-label">
            🧴 Step 2: What did you do this week?
          </label>
          <p className="hgd-form-hint">Tap 1-3 things you tried</p>
          <RoutineChips
            selectedTags={routineTags}
            onChange={setRoutineTags}
            maxSelection={3}
          />
        </div>
        
        {/* Step 3: Feeling */}
        <div className="hgd-form-section">
          <label className="hgd-form-label">
            😊 Step 3: How does your hair feel? <span className="hgd-required">*</span>
          </label>
          <FeelingEmojiPicker
            value={hairFeeling}
            onChange={setHairFeeling}
          />
        </div>
        
        {/* Optional Reflection */}
        <div className="hgd-form-section">
          <label className="hgd-form-label">
            📝 What changed? <span className="hgd-optional">(optional)</span>
          </label>
          <textarea
            className="hgd-form-textarea"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Example: more shine, less frizz, softer texture..."
            maxLength={100}
            rows={2}
          />
          <span className="hgd-char-count">{reflection.length}/100</span>
        </div>
        
        {/* Photo hint */}
        {!existingEntry?.photoUri && (
          <div className="hgd-photo-hint">
            💡 Add this week's photo after saving to see your full report
          </div>
        )}
        
        {/* Buttons */}
        <div className="hgd-form-actions">
          <button
            type="submit"
            className="hgd-btn-primary full-width"
            disabled={!canSubmit}
          >
            {isSaving ? 'Saving...' : '✓ Save & Finish'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              className="hgd-btn-text"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
