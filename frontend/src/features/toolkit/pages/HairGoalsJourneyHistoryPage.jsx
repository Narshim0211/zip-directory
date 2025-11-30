import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider } from "../context/HairGoalsContext";
import FeelingTimeline from "../components/FeelingTimeline";
import {
  loadJourneyHistory,
  loadPhotos,
  updateJourneyDetails,
  sanitizeText
} from "../utils/hairGoalsStorage";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";
import PhotoCompareModal from "../components/PhotoCompareModal";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

/**
 * Format date as "Mar 15, 2025"
 */
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Get journey duration in weeks
 */
function getWeeksDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil(diffDays / 7));
}

/**
 * JourneyHistoryContent - Emotional scrapbook of past journeys
 */
function JourneyHistoryContent() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit mode state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");

  useEffect(() => {
    try {
      const stored = loadJourneyHistory();
      setHistory(stored);
      const current = loadPhotos() || [];
      setCurrentPhotos(Array.isArray(current) ? current : []);
    } catch (error) {
      console.error("Failed to load journey history", error);
    }
  }, []);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const compareToCurrent = (journey) => {
    const currentSorted = [...currentPhotos].sort((a, b) => a.weekNumber - b.weekNumber);
    const historySorted = (journey.photos || []).sort((a, b) => a.weekNumber - b.weekNumber);
    if (currentSorted.length === 0 || historySorted.length === 0) {
      setToast("Need photos in both journeys to compare.");
      return;
    }
    setCompareData({
      before: historySorted[historySorted.length - 1],
      after: currentSorted[currentSorted.length - 1]
    });
  };

  // Start editing a journey name
  const startEdit = (journey) => {
    setEditingId(journey.id);
    setEditName(journey.name || "");
    setEditTagline(journey.tagline || "");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditTagline("");
  };

  // Save edited name/tagline
  const saveEdit = () => {
    if (!editingId) return;

    const result = updateJourneyDetails(editingId, {
      name: sanitizeText(editName, 100),
      tagline: sanitizeText(editTagline, 200)
    });

    if (result.success) {
      // Update local state
      setHistory((prev) =>
        prev.map((j) =>
          j.id === editingId
            ? { ...j, name: editName.trim(), tagline: editTagline.trim() }
            : j
        )
      );
      setToast("Journey updated!");
    } else {
      setToast("Failed to save changes");
    }

    cancelEdit();
  };

  // Get cover photo (first or last photo from journey)
  const getCoverPhoto = (journey) => {
    const photos = journey.photos || [];
    if (photos.length === 0) return null;
    // Return the last photo (most recent progress)
    const sorted = [...photos].sort((a, b) => b.weekNumber - a.weekNumber);
    return sorted[0]?.data || null;
  };

  // Render a single journey card
  const renderJourneyCard = (journey, index) => {
    const coverPhoto = getCoverPhoto(journey);
    const weeksDuration = getWeeksDuration(journey.startDate, journey.endDate);
    const weeksLogged = journey.weeklyEntries?.length || 0;

    // Get final feeling from summary or last entry
    const finalFeeling =
      journey.summary?.finalFeeling ||
      journey.weeklyEntries
        ?.slice()
        ?.sort((a, b) => b.weekNumber - a.weekNumber)?.[0]?.hairFeeling;

    const isEditing = editingId === journey.id;

    // Display name: custom name, auto-generated, or goal title
    const displayName =
      journey.name || journey.goal?.title || "Hair Journey";

    return (
      <article key={journey.id} className="jhp-card">
        {/* Cover Photo / Placeholder */}
        <div
          className="jhp-card-cover"
          onClick={() => navigate(`/visitor/toolkit/goals/history/${journey.id}`)}
        >
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={displayName}
              className="jhp-card-cover-img"
            />
          ) : (
            <div className="jhp-card-cover-placeholder">
              <span className="jhp-card-cover-emoji">
                {journey.goal?.emoji || "💇"}
              </span>
            </div>
          )}
          {/* Journey number badge */}
          <span className="jhp-card-badge">
            #{history.length - index}
          </span>
        </div>

        {/* Card Content */}
        <div className="jhp-card-content">
          {isEditing ? (
            // Edit Mode
            <div className="jhp-card-edit">
              <input
                type="text"
                className="jhp-edit-input"
                placeholder="Journey name..."
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={100}
                autoFocus
              />
              <input
                type="text"
                className="jhp-edit-input jhp-edit-tagline"
                placeholder="Add a tagline (optional)..."
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                maxLength={200}
              />
              <div className="jhp-edit-actions">
                <button className="jhp-edit-btn jhp-edit-cancel" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="jhp-edit-btn jhp-edit-save" onClick={saveEdit}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              <header className="jhp-card-header">
                <h3 className="jhp-card-title">{displayName}</h3>
                <button
                  className="jhp-card-edit-btn"
                  onClick={() => startEdit(journey)}
                  title="Edit name"
                  aria-label="Edit journey name"
                >
                  ✏️
                </button>
              </header>

              {journey.tagline && (
                <p className="jhp-card-tagline">"{journey.tagline}"</p>
              )}

              {/* Date Range */}
              <p className="jhp-card-dates">
                {formatDate(journey.startDate)} — {formatDate(journey.endDate)}
              </p>

              {/* Stats Row */}
              <div className="jhp-card-stats">
                <div className="jhp-stat">
                  <span className="jhp-stat-value">{weeksDuration}</span>
                  <span className="jhp-stat-label">weeks</span>
                </div>
                <div className="jhp-stat">
                  <span className="jhp-stat-value">{weeksLogged}</span>
                  <span className="jhp-stat-label">logged</span>
                </div>
                <div className="jhp-stat">
                  <span className="jhp-stat-value">
                    {journey.photos?.length || 0}
                  </span>
                  <span className="jhp-stat-label">photos</span>
                </div>
              </div>

              {/* Feeling Timeline (compact) */}
              {journey.weeklyEntries?.length > 0 && (
                <div className="jhp-card-timeline">
                  <FeelingTimeline
                    weeklyEntries={journey.weeklyEntries}
                    compact={true}
                  />
                </div>
              )}

              {/* Final Feeling */}
              {finalFeeling && (
                <div className="jhp-card-final-feeling">
                  <span className="jhp-final-emoji">
                    {getFeelingEmoji(finalFeeling)}
                  </span>
                  <span className="jhp-final-text">
                    Ended feeling {getHairWord(finalFeeling).toLowerCase()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Card Actions */}
        {!isEditing && (
          <footer className="jhp-card-actions">
            <button
              className="jhp-action-btn jhp-action-primary"
              onClick={() => navigate(`/visitor/toolkit/goals/history/${journey.id}`)}
            >
              Open Memory Book
            </button>
            <button
              className="jhp-action-btn jhp-action-ghost"
              onClick={() => compareToCurrent(journey)}
            >
              Compare
            </button>
          </footer>
        )}
      </article>
    );
  };

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title="My Past Journeys"
          subtitle="Every chapter of your hair story, preserved"
          onBack={() => navigate("/visitor/toolkit/goals")}
        />

        <div className="hg-wrapper">
          {history.length === 0 ? (
            // Empty State
            <div className="jhp-empty">
              <div className="jhp-empty-icon">📚</div>
              <h2 className="jhp-empty-title">No journeys archived yet</h2>
              <p className="jhp-empty-text">
                When you restart a goal, your progress gets saved here as a
                memory book you can revisit anytime.
              </p>
              <button
                className="jhp-empty-btn"
                onClick={() => navigate("/visitor/toolkit/goals")}
              >
                Start Your Journey
              </button>
            </div>
          ) : (
            // Journey Grid
            <div className="jhp-grid">
              {history.map(renderJourneyCard)}
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="jhp-toast">
              <span>{toast}</span>
            </div>
          )}
        </div>

        {/* Compare Modal */}
        {compareData && (
          <PhotoCompareModal
            before={compareData.before}
            after={compareData.after}
            onClose={() => setCompareData(null)}
          />
        )}
      </PageShell>
    </HairGoalsErrorBoundary>
  );
}

export default function HairGoalsJourneyHistoryPage() {
  return (
    <HairGoalsProvider>
      <JourneyHistoryContent />
    </HairGoalsProvider>
  );
}
