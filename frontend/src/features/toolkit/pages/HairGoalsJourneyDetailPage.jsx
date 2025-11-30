import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider } from "../context/HairGoalsContext";
import FeelingTimeline from "../components/FeelingTimeline";
import {
  loadJourneyHistory,
  updateJourneyDetails,
  sanitizeText
} from "../utils/hairGoalsStorage";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

/**
 * Format date as "Mar 15"
 */
function formatShort(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

/**
 * Format date as "March 15, 2025"
 */
function formatFull(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Get journey duration in days
 */
function getDurationDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Memory Book Section - Emotional, scrapbook-style section
 */
function MemorySection({ icon, title, subtitle, children, className = "" }) {
  return (
    <section className={`mb-section ${className}`}>
      <header className="mb-section-header">
        <span className="mb-section-icon">{icon}</span>
        <div className="mb-section-titles">
          <h3 className="mb-section-title">{title}</h3>
          {subtitle && <p className="mb-section-subtitle">{subtitle}</p>}
        </div>
      </header>
      <div className="mb-section-content">{children}</div>
    </section>
  );
}

/**
 * JourneyDetailContent - Memory Book Experience
 */
function JourneyDetailContent() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");

  useEffect(() => {
    const history = loadJourneyHistory();
    const match = history.find((entry) => entry.id === journeyId);
    setJourney(match || null);
    if (match) {
      setEditName(match.name || "");
      setEditTagline(match.tagline || "");
    }
  }, [journeyId]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Save edited name/tagline
  const saveEdit = () => {
    if (!journey) return;

    const result = updateJourneyDetails(journey.id, {
      name: sanitizeText(editName, 100),
      tagline: sanitizeText(editTagline, 200)
    });

    if (result.success) {
      setJourney((prev) => ({
        ...prev,
        name: editName.trim(),
        tagline: editTagline.trim()
      }));
      setToast("Updated!");
    } else {
      setToast("Failed to save");
    }

    setIsEditing(false);
  };

  // Sorted weekly entries
  const sortedEntries = useMemo(() => {
    if (!journey?.weeklyEntries) return [];
    return [...journey.weeklyEntries].sort((a, b) => a.weekNumber - b.weekNumber);
  }, [journey]);

  // Sorted photos
  const sortedPhotos = useMemo(() => {
    if (!journey?.photos) return [];
    return [...journey.photos].sort((a, b) => a.weekNumber - b.weekNumber);
  }, [journey]);

  // Summary stats
  const stats = useMemo(() => {
    if (!journey) return {};
    const durationDays = getDurationDays(journey.startDate, journey.endDate);
    const durationWeeks = Math.max(1, Math.ceil(durationDays / 7));
    const weeksLogged = sortedEntries.length;
    const photosCount = sortedPhotos.length;
    const productsCount = journey.products?.length || 0;

    // Calculate average feeling
    const feelings = sortedEntries
      .map((e) => e.hairFeeling)
      .filter((f) => f !== null && f !== undefined);
    const avgFeeling =
      feelings.length > 0
        ? Math.round(feelings.reduce((a, b) => a + b, 0) / feelings.length)
        : null;

    // Get first and last feeling
    const firstFeeling = sortedEntries[0]?.hairFeeling;
    const lastFeeling = sortedEntries[sortedEntries.length - 1]?.hairFeeling;

    return {
      durationDays,
      durationWeeks,
      weeksLogged,
      photosCount,
      productsCount,
      avgFeeling,
      firstFeeling,
      lastFeeling
    };
  }, [journey, sortedEntries, sortedPhotos]);

  // Not found state
  if (!journey) {
    return (
      <HairGoalsErrorBoundary>
        <PageShell fullWidth>
          <div className="mb-not-found">
            <span className="mb-not-found-icon">📖</span>
            <h2>Journey Not Found</h2>
            <p>This memory book may have been removed.</p>
            <button
              className="mb-back-btn"
              onClick={() => navigate("/visitor/toolkit/goals/history")}
            >
              Back to Journeys
            </button>
          </div>
        </PageShell>
      </HairGoalsErrorBoundary>
    );
  }

  // Display name
  const displayName = journey.name || journey.goal?.title || "Hair Journey";

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title="Memory Book"
          subtitle="Your hair story, beautifully preserved"
          onBack={() => navigate("/visitor/toolkit/goals/history")}
        />

        <div className="hg-wrapper">
          {/* Hero Section */}
          <div className="mb-hero">
            {/* Cover Photo or Gradient */}
            <div className="mb-hero-cover">
              {sortedPhotos.length > 0 ? (
                <img
                  src={sortedPhotos[sortedPhotos.length - 1]?.data}
                  alt="Journey cover"
                  className="mb-hero-cover-img"
                />
              ) : (
                <div className="mb-hero-cover-gradient">
                  <span className="mb-hero-emoji">{journey.goal?.emoji || "💇"}</span>
                </div>
              )}
            </div>

            {/* Title Section */}
            <div className="mb-hero-content">
              {isEditing ? (
                <div className="mb-hero-edit">
                  <input
                    type="text"
                    className="mb-edit-input mb-edit-title"
                    placeholder="Journey name..."
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={100}
                    autoFocus
                  />
                  <input
                    type="text"
                    className="mb-edit-input mb-edit-tagline"
                    placeholder="Add a tagline..."
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    maxLength={200}
                  />
                  <div className="mb-edit-actions">
                    <button
                      className="mb-edit-btn mb-edit-cancel"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button className="mb-edit-btn mb-edit-save" onClick={saveEdit}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-hero-title-row">
                    <h1 className="mb-hero-title">{displayName}</h1>
                    <button
                      className="mb-hero-edit-btn"
                      onClick={() => setIsEditing(true)}
                      title="Edit name"
                      aria-label="Edit journey name"
                    >
                      ✏️
                    </button>
                  </div>
                  {journey.tagline && (
                    <p className="mb-hero-tagline">"{journey.tagline}"</p>
                  )}
                  <p className="mb-hero-dates">
                    {formatFull(journey.startDate)} — {formatFull(journey.endDate)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mb-stats">
            <div className="mb-stat-item">
              <span className="mb-stat-value">{stats.durationWeeks}</span>
              <span className="mb-stat-label">weeks</span>
            </div>
            <div className="mb-stat-item">
              <span className="mb-stat-value">{stats.weeksLogged}</span>
              <span className="mb-stat-label">logged</span>
            </div>
            <div className="mb-stat-item">
              <span className="mb-stat-value">{stats.photosCount}</span>
              <span className="mb-stat-label">photos</span>
            </div>
            <div className="mb-stat-item">
              <span className="mb-stat-value">{stats.productsCount}</span>
              <span className="mb-stat-label">products</span>
            </div>
          </div>

          {/* Feeling Timeline - Full Version */}
          {sortedEntries.length > 0 && (
            <MemorySection
              icon="💫"
              title="The Emotional Journey"
              subtitle="How you felt along the way"
            >
              <FeelingTimeline weeklyEntries={sortedEntries} compact={false} />
            </MemorySection>
          )}

          {/* Photo Gallery */}
          {sortedPhotos.length > 0 && (
            <MemorySection
              icon="📸"
              title="Captured Moments"
              subtitle={`${sortedPhotos.length} progress photos`}
            >
              <div className="mb-photo-grid">
                {sortedPhotos.map((photo, idx) => (
                  <div key={photo.weekNumber || idx} className="mb-photo-item">
                    <img
                      src={photo.data || photo.dataUrl}
                      alt={`Week ${photo.weekNumber}`}
                      className="mb-photo-img"
                    />
                    <span className="mb-photo-week">W{photo.weekNumber}</span>
                  </div>
                ))}
              </div>
            </MemorySection>
          )}

          {/* Weekly Notes */}
          {sortedEntries.length > 0 && (
            <MemorySection
              icon="📝"
              title="Week by Week"
              subtitle="Your notes and reflections"
            >
              <div className="mb-weeks">
                {sortedEntries.map((entry) => (
                  <div key={entry.weekNumber} className="mb-week-card">
                    <div className="mb-week-header">
                      <span className="mb-week-number">Week {entry.weekNumber}</span>
                      {entry.date && (
                        <span className="mb-week-date">{formatShort(entry.date)}</span>
                      )}
                    </div>

                    {entry.hairFeeling !== null && entry.hairFeeling !== undefined && (
                      <div className="mb-week-feeling">
                        <span className="mb-feeling-emoji">
                          {getFeelingEmoji(entry.hairFeeling)}
                        </span>
                        <span className="mb-feeling-word">
                          {getHairWord(entry.hairFeeling)}
                        </span>
                      </div>
                    )}

                    {entry.progressNote && (
                      <p className="mb-week-note">"{entry.progressNote}"</p>
                    )}

                    {entry.completedSteps?.length > 0 && (
                      <p className="mb-week-steps">
                        {entry.completedSteps.length} task
                        {entry.completedSteps.length !== 1 ? "s" : ""} completed
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </MemorySection>
          )}

          {/* Products */}
          {journey.products?.length > 0 && (
            <MemorySection
              icon="🧴"
              title="Products I Loved"
              subtitle="The heroes of this journey"
            >
              <div className="mb-products">
                {journey.products.map((product, idx) => (
                  <div key={product.id || idx} className="mb-product-card">
                    <div className="mb-product-info">
                      <span className="mb-product-name">
                        {product.name || product.productName || "Unknown Product"}
                      </span>
                      {product.category && (
                        <span className="mb-product-category">{product.category}</span>
                      )}
                    </div>
                    {product.note && (
                      <p className="mb-product-note">"{product.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </MemorySection>
          )}

          {/* Routine */}
          {journey.routineSteps?.length > 0 && (
            <MemorySection
              icon="📋"
              title="The Routine"
              subtitle="What I committed to"
            >
              <div className="mb-routine">
                {journey.routineSteps.map((step, idx) => (
                  <div key={step.id || idx} className="mb-routine-item">
                    <span className="mb-routine-day">{step.day || "Day"}</span>
                    <span className="mb-routine-type">{step.type || step.step}</span>
                    {step.product && (
                      <span className="mb-routine-product">{step.product}</span>
                    )}
                  </div>
                ))}
              </div>
            </MemorySection>
          )}

          {/* Goal Section */}
          <MemorySection
            icon="🎯"
            title="The Goal"
            subtitle="What I was working toward"
            className="mb-section-goal"
          >
            <div className="mb-goal">
              <div className="mb-goal-main">
                <span className="mb-goal-emoji">{journey.goal?.emoji || "💇"}</span>
                <span className="mb-goal-title">
                  {journey.goal?.title || journey.goal?.goalType || "Hair Care"}
                </span>
              </div>
              {journey.goal?.description && (
                <p className="mb-goal-description">{journey.goal.description}</p>
              )}
              {(journey.goal?.goalNote || journey.goalNote) && (
                <p className="mb-goal-note">
                  "{journey.goal?.goalNote || journey.goalNote}"
                </p>
              )}
            </div>
          </MemorySection>

          {/* Footer Actions */}
          <div className="mb-footer">
            <button
              className="mb-footer-btn"
              onClick={() => navigate("/visitor/toolkit/goals/history")}
            >
              Back to All Journeys
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div className="mb-toast">
              <span>{toast}</span>
            </div>
          )}
        </div>
      </PageShell>
    </HairGoalsErrorBoundary>
  );
}

export default function HairGoalsJourneyDetailPage() {
  return (
    <HairGoalsProvider>
      <JourneyDetailContent />
    </HairGoalsProvider>
  );
}
