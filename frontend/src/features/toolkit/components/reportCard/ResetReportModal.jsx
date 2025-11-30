import React, { useState } from "react";
import "../../styles/reportCard.css";

/**
 * ResetReportModal Component
 *
 * Allows users to archive current Report Card and start fresh.
 * Provides input for journey title and confirmation.
 */
export default function ResetReportModal({ isOpen, onClose, onConfirm, weeksTracked = 0 }) {
  const [title, setTitle] = useState("My Hair Journey");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!title.trim()) {
      setError("Please enter a title for your journey");
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      await onConfirm(title.trim());
      onClose();
    } catch (err) {
      setError(err.message || "Failed to archive. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="rc-modal-overlay" onClick={onClose}>
      <div className="rc-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="rc-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="rc-reset-modal">
          <div className="rc-reset-icon">📦</div>
          <h3>Start Fresh?</h3>
          <p className="rc-reset-subtitle">
            Archive your current journey and begin a new chapter
          </p>

          <div className="rc-reset-stats">
            <div className="rc-reset-stat">
              <span className="rc-reset-stat-value">{weeksTracked}</span>
              <span className="rc-reset-stat-label">Weeks Tracked</span>
            </div>
          </div>

          <div className="rc-reset-form">
            <label className="rc-reset-label">Name this journey</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer 2025 Hair Goals"
              maxLength={50}
              className="rc-reset-input"
            />
            <span className="rc-reset-hint">
              You can view archived journeys anytime
            </span>
          </div>

          {error && <p className="rc-reset-error">{error}</p>}

          <div className="rc-reset-warning">
            <span className="rc-reset-warning-icon">⚠️</span>
            <p>
              Your Report Card will be saved as an archive. All current stats will reset,
              but you'll keep your routine and products.
            </p>
          </div>

          <div className="rc-reset-actions">
            <button className="rc-btn rc-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className="rc-btn rc-btn-primary"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Archiving..." : "Archive & Start Fresh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
