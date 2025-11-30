import React, { useState, useEffect, useRef } from "react";
import { sanitizeText, generateJourneyName } from "../utils/hairGoalsStorage";
import "../styles/hairGoalsDiary.css";

/**
 * JourneyNameModal
 *
 * Beautiful, minimal modal for naming a journey before archiving.
 * Features:
 * - Optional naming (skip generates auto-name)
 * - Tagline for emotional context
 * - Input validation and sanitization
 * - Smooth animations
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close without saving
 * @param {function} onSave - Save with { name, tagline }
 * @param {Object} journeyData - { goal, startDate, endDate } for auto-name generation
 */
export default function JourneyNameModal({
  isOpen,
  onClose,
  onSave,
  journeyData = {}
}) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

  // Generate default name suggestion
  const defaultName = generateJourneyName(
    journeyData.goal,
    journeyData.startDate,
    journeyData.endDate
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setTagline("");
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);

    // Use custom name or generate default
    const finalName = name.trim() || defaultName;
    const finalTagline = tagline.trim();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeText(finalName, 100),
      tagline: finalTagline ? sanitizeText(finalTagline, 200) : undefined
    };

    await onSave(sanitizedData);
    setIsSaving(false);
  };

  const handleSkip = () => {
    // Generate auto-name and save
    onSave({
      name: defaultName,
      tagline: undefined
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="jnm-overlay" onClick={onClose}>
      <div
        className="jnm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="jnm-title"
      >
        {/* Header */}
        <div className="jnm-header">
          <span className="jnm-icon" role="img" aria-label="sparkles">✨</span>
          <h2 id="jnm-title" className="jnm-title">Name This Chapter</h2>
          <p className="jnm-subtitle">
            Give your journey a name you'll remember
          </p>
        </div>

        {/* Form */}
        <div className="jnm-form">
          {/* Name Input */}
          <div className="jnm-field">
            <label htmlFor="journey-name" className="jnm-label">
              Journey Name
            </label>
            <input
              ref={nameInputRef}
              id="journey-name"
              type="text"
              className="jnm-input"
              placeholder={defaultName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={100}
              autoComplete="off"
            />
            <span className="jnm-hint">
              Leave blank to use: "{defaultName}"
            </span>
          </div>

          {/* Tagline Input */}
          <div className="jnm-field">
            <label htmlFor="journey-tagline" className="jnm-label">
              Add a tagline <span className="jnm-optional">(optional)</span>
            </label>
            <input
              id="journey-tagline"
              type="text"
              className="jnm-input"
              placeholder="e.g., The journey that got me to waist length"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="jnm-actions">
          <button
            type="button"
            className="jnm-btn jnm-btn-skip"
            onClick={handleSkip}
            disabled={isSaving}
          >
            Skip
          </button>
          <button
            type="button"
            className="jnm-btn jnm-btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save & Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
