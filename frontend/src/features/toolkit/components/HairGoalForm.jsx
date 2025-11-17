import React, { useState } from "react";
import { HAIR_GOAL_OPTIONS } from "./HairGoalCard";
import "../styles/hairGoalsDiary.css";

export default function HairGoalForm({ initialGoal, onSave, onCancel }) {
  const [goalType, setGoalType] = useState(initialGoal?.goalType || "");
  const [goalNote, setGoalNote] = useState(initialGoal?.goalNote || "");
  const [saving, setSaving] = useState(false);

  const canSave = goalType && !saving;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalType) return;
    setSaving(true);
    onSave({ goalType, goalNote: goalNote.trim() });
    setSaving(false);
  };

  const headerTitle = initialGoal ? "Edit Hair Goal" : "Choose Your Hair Goal";

  return (
    <form className="hg-goal-modal" onSubmit={handleSubmit}>
      <div className="hg-modal-header">
        <span className="hg-modal-icon">🎯</span>
        <h2>{headerTitle}</h2>
        <p className="hg-modal-subtitle">
          Set one clear focus so every routine and report feels meaningful.
        </p>
      </div>

      <div className="hg-modal-section">
        <label>Main Goal</label>
        <select
          className="hg-modal-input"
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
        >
          <option value="">Select a goal...</option>
          {HAIR_GOAL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="hg-modal-section">
        <label>Why this matters (optional)</label>
        <textarea
          className="hg-modal-textarea"
          rows={3}
          value={goalNote}
          onChange={(e) => setGoalNote(e.target.value)}
          placeholder="Preparing for wedding, recovering from damage, etc."
        />
      </div>

      <div className="hg-modal-footer">
        <button
          type="button"
          className="hg-modal-cancel"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hg-modal-save"
          disabled={!canSave}
        >
          {saving ? "Saving..." : "Save Goal"}
        </button>
      </div>
    </form>
  );
}
