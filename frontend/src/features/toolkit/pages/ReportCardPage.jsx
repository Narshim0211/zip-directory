import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReportCard,
  recomputeReportCard,
  archiveReportCard,
  seedReportCardData
} from "../../../api/hairGoalsReportsApi";
import {
  TrendChart,
  HabitRankList,
  HolyGrailProducts,
  WinsCarousel,
  RedFlagsList,
  PrescriptionBox,
  ResetReportModal
} from "../components/reportCard";
import "../styles/reportCard.css";

/**
 * ReportCardPage
 *
 * Main Report Card dashboard showing lifetime hair journey insights.
 * Displays 6 sections: Trend, What Works, Holy Grail Products, Wins, Red Flags, Prescription
 */
export default function ReportCardPage() {
  const navigate = useNavigate();
  const [reportCard, setReportCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch report card data
  const fetchReportCard = useCallback(async () => {
    try {
      setError(null);
      const response = await getReportCard();
      setReportCard(response.data);
    } catch (err) {
      console.error("Failed to fetch report card:", err);
      setError(err.response?.data?.message || "Failed to load your report card");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportCard();
  }, [fetchReportCard]);

  // Handle refresh/recompute
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await recomputeReportCard();
      setReportCard(response.data);
    } catch (err) {
      console.error("Failed to refresh report card:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle archive and reset
  const handleArchive = async (title) => {
    await archiveReportCard(title);
    // Refetch to get fresh empty state
    await fetchReportCard();
  };

  // Handle seeding demo data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const response = await seedReportCardData(12);
      setReportCard(response.data);
    } catch (err) {
      console.error("Failed to seed data:", err);
      setError(err.response?.data?.message || "Failed to load demo data");
    } finally {
      setIsSeeding(false);
    }
  };

  // Navigate to archives
  const handleViewArchives = () => {
    navigate("/visitor/toolkit/hair-goals/archives");
  };

  // Navigate back
  const handleBack = () => {
    navigate("/visitor/toolkit/goals");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rc-page">
        <div className="rc-loading">
          <div className="rc-loading-spinner" />
          <p className="rc-loading-text">Loading your report card...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rc-page">
        <div className="rc-empty-state">
          <div className="rc-empty-icon">😔</div>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="rc-btn rc-btn-primary" onClick={fetchReportCard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no report card yet
  if (!reportCard) {
    return (
      <div className="rc-page">
        <div className="rc-page-header">
          <div className="rc-page-title">
            <span className="rc-page-title-icon">📊</span>
            <h1>My Hair Report Card</h1>
          </div>
          <button className="rc-btn rc-btn-ghost rc-btn-small" onClick={handleBack}>
            ← Back
          </button>
        </div>

        <div className="rc-empty-state">
          <div className="rc-empty-icon">📋</div>
          <h2>Your Report Card is Empty</h2>
          <p>
            Complete your first weekly check-in to start building your personalized
            hair intelligence dashboard. Each week's data helps us understand what
            works best for your hair!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <button className="rc-btn rc-btn-primary" onClick={handleBack}>
              Start Tracking
            </button>
            <button
              className="rc-btn rc-btn-ghost"
              onClick={handleSeedData}
              disabled={isSeeding}
              style={{ fontSize: "14px" }}
            >
              {isSeeding ? "Loading Demo Data..." : "Load Demo Data (12 weeks)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    weeksTracked = 0,
    avgFeeling = 0,
    currentStreak = 0,
    trendData = [],
    topHabits = [],
    topProducts = [],
    wins = [],
    redFlags = [],
    prescription = {}
  } = reportCard;

  return (
    <div className="rc-page">
      {/* Header */}
      <div className="rc-page-header">
        <div className="rc-page-title">
          <span className="rc-page-title-icon">📊</span>
          <h1>My Hair Report Card</h1>
        </div>
        <div className="rc-page-actions">
          <button
            className="rc-btn rc-btn-ghost rc-btn-small"
            onClick={handleViewArchives}
          >
            Past Journeys
          </button>
          <button className="rc-btn rc-btn-ghost rc-btn-small" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="rc-stats-row">
        <div className="rc-stat-card highlight">
          <div className="rc-stat-value">{weeksTracked}</div>
          <div className="rc-stat-label">Weeks Tracked</div>
        </div>
        <div className="rc-stat-card">
          <div className="rc-stat-value">{avgFeeling.toFixed(1)}</div>
          <div className="rc-stat-label">Avg Feeling (1-5)</div>
        </div>
        <div className="rc-stat-card">
          <div className="rc-stat-value">{currentStreak} 🔥</div>
          <div className="rc-stat-label">Week Streak</div>
        </div>
        <div className="rc-stat-card">
          <div className="rc-stat-value">{topHabits.length}</div>
          <div className="rc-stat-label">Habits Tested</div>
        </div>
      </div>

      {/* Section 1: Trend */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">📈</span>
            Hair Trend
          </h3>
          <button
            className="rc-btn rc-btn-ghost rc-btn-small"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <TrendChart trendData={trendData} weeksTracked={weeksTracked} />
      </div>

      {/* Section 2: What Works */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">✅</span>
            What Works for You
          </h3>
        </div>
        <HabitRankList habits={topHabits} />
      </div>

      {/* Section 3: Holy Grail Products */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">✨</span>
            Holy Grail Products
          </h3>
        </div>
        <HolyGrailProducts products={topProducts} />
      </div>

      {/* Section 4: Wins */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">🏆</span>
            Your Wins
          </h3>
        </div>
        <WinsCarousel wins={wins} />
      </div>

      {/* Section 5: Red Flags */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">🚩</span>
            Red Flags
          </h3>
        </div>
        <RedFlagsList redFlags={redFlags} />
      </div>

      {/* Section 6: Prescription */}
      <div className="rc-section">
        <div className="rc-section-header">
          <h3>
            <span className="rc-section-icon">💊</span>
            Your Hair Rx
          </h3>
        </div>
        <PrescriptionBox prescription={prescription} avgFeeling={avgFeeling} />
      </div>

      {/* Reset Button */}
      {weeksTracked >= 4 && (
        <div className="rc-section" style={{ textAlign: "center" }}>
          <button
            className="rc-btn rc-btn-ghost"
            onClick={() => setShowResetModal(true)}
          >
            📦 Archive & Start Fresh
          </button>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
            Save this journey and begin a new chapter
          </p>
        </div>
      )}

      {/* Reset Modal */}
      <ResetReportModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleArchive}
        weeksTracked={weeksTracked}
      />
    </div>
  );
}
