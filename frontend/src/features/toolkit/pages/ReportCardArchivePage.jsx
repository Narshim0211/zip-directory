import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getReportCardArchives,
  getReportCardArchiveById
} from "../../../api/hairGoalsReportsApi";
import {
  TrendChart,
  HabitRankList,
  HolyGrailProducts,
  WinsCarousel,
  RedFlagsList,
  PrescriptionBox
} from "../components/reportCard";
import "../styles/reportCard.css";

/**
 * ReportCardArchivePage
 *
 * Displays archived Report Cards (past journeys).
 * Can show list of archives or single archive detail.
 */
export default function ReportCardArchivePage() {
  const navigate = useNavigate();
  const { archiveId } = useParams();
  const [archives, setArchives] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch archives list
  const fetchArchives = useCallback(async () => {
    try {
      setError(null);
      const response = await getReportCardArchives();
      setArchives(response.data || []);
    } catch (err) {
      console.error("Failed to fetch archives:", err);
      setError(err.response?.data?.message || "Failed to load archives");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single archive
  const fetchArchiveById = useCallback(async (id) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await getReportCardArchiveById(id);
      setSelectedArchive(response.data);
    } catch (err) {
      console.error("Failed to fetch archive:", err);
      setError(err.response?.data?.message || "Failed to load archive");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (archiveId) {
      fetchArchiveById(archiveId);
    } else {
      fetchArchives();
    }
  }, [archiveId, fetchArchives, fetchArchiveById]);

  // Navigate to archive detail
  const handleViewArchive = (id) => {
    navigate(`/visitor/toolkit/hair-goals/archives/${id}`);
  };

  // Navigate back to list
  const handleBackToList = () => {
    navigate("/visitor/toolkit/hair-goals/archives");
    setSelectedArchive(null);
  };

  // Navigate to current report card
  const handleViewCurrent = () => {
    navigate("/visitor/toolkit/hair-goals/report-card");
  };

  // Navigate to hair goals
  const handleBack = () => {
    navigate("/visitor/toolkit/goals");
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rc-page">
        <div className="rc-loading">
          <div className="rc-loading-spinner" />
          <p className="rc-loading-text">Loading...</p>
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
          <button
            className="rc-btn rc-btn-primary"
            onClick={archiveId ? () => fetchArchiveById(archiveId) : fetchArchives}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Single archive detail view
  if (selectedArchive) {
    const { snapshot = {}, title, startDate, endDate, goal } = selectedArchive;
    const {
      weeksTracked = 0,
      avgFeeling = 0,
      trendData = [],
      topHabits = [],
      topProducts = [],
      wins = [],
      redFlags = [],
      prescription = {}
    } = snapshot;

    return (
      <div className="rc-page">
        {/* Header */}
        <div className="rc-page-header">
          <div className="rc-page-title">
            <span className="rc-page-title-icon">📦</span>
            <h1>{title || "Past Journey"}</h1>
          </div>
          <div className="rc-page-actions">
            <button
              className="rc-btn rc-btn-ghost rc-btn-small"
              onClick={handleBackToList}
            >
              ← All Archives
            </button>
          </div>
        </div>

        {/* Journey Info */}
        <div className="rc-section">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6b7280" }}>
                Journey Period
              </p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                {formatDate(startDate)} → {formatDate(endDate)}
              </p>
            </div>
            {goal && (
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6b7280" }}>
                  Goal
                </p>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                  {goal}
                </p>
              </div>
            )}
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
            <div className="rc-stat-value">{topHabits.length}</div>
            <div className="rc-stat-label">Habits Tested</div>
          </div>
          <div className="rc-stat-card">
            <div className="rc-stat-value">{wins.length}</div>
            <div className="rc-stat-label">Wins Captured</div>
          </div>
        </div>

        {/* Section 1: Trend */}
        <div className="rc-section">
          <div className="rc-section-header">
            <h3>
              <span className="rc-section-icon">📈</span>
              Hair Trend
            </h3>
          </div>
          <TrendChart trendData={trendData} weeksTracked={weeksTracked} />
        </div>

        {/* Section 2: What Works */}
        <div className="rc-section">
          <div className="rc-section-header">
            <h3>
              <span className="rc-section-icon">✅</span>
              What Worked
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
              Wins from this Journey
            </h3>
          </div>
          <WinsCarousel wins={wins} />
        </div>

        {/* Section 5: Red Flags */}
        <div className="rc-section">
          <div className="rc-section-header">
            <h3>
              <span className="rc-section-icon">🚩</span>
              Red Flags Identified
            </h3>
          </div>
          <RedFlagsList redFlags={redFlags} />
        </div>

        {/* Section 6: Prescription */}
        <div className="rc-section">
          <div className="rc-section-header">
            <h3>
              <span className="rc-section-icon">💊</span>
              Hair Rx at the Time
            </h3>
          </div>
          <PrescriptionBox prescription={prescription} avgFeeling={avgFeeling} />
        </div>
      </div>
    );
  }

  // Archives list view
  return (
    <div className="rc-page">
      {/* Header */}
      <div className="rc-page-header">
        <div className="rc-page-title">
          <span className="rc-page-title-icon">📦</span>
          <h1>Past Journeys</h1>
        </div>
        <div className="rc-page-actions">
          <button
            className="rc-btn rc-btn-ghost rc-btn-small"
            onClick={handleViewCurrent}
          >
            Current Report Card
          </button>
          <button className="rc-btn rc-btn-ghost rc-btn-small" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>

      {/* Empty state */}
      {archives.length === 0 && (
        <div className="rc-empty-state">
          <div className="rc-empty-icon">📦</div>
          <h2>No Archived Journeys Yet</h2>
          <p>
            When you complete a hair journey and start fresh, your past Report Card
            will be saved here for you to revisit anytime.
          </p>
          <button className="rc-btn rc-btn-primary" onClick={handleViewCurrent}>
            View Current Report Card
          </button>
        </div>
      )}

      {/* Archives list */}
      {archives.length > 0 && (
        <div className="rc-archive-list">
          {archives.map((archive) => (
            <div
              key={archive._id}
              className="rc-archive-card"
              onClick={() => handleViewArchive(archive._id)}
            >
              <div className="rc-archive-header">
                <h3 className="rc-archive-title">{archive.title || "Hair Journey"}</h3>
                <span className="rc-archive-date">
                  {formatDate(archive.startDate)} - {formatDate(archive.endDate)}
                </span>
              </div>
              <div className="rc-archive-stats">
                <div className="rc-archive-stat">
                  <span className="rc-archive-stat-value">
                    {archive.snapshot?.weeksTracked || 0}
                  </span>
                  <span className="rc-archive-stat-label">Weeks</span>
                </div>
                <div className="rc-archive-stat">
                  <span className="rc-archive-stat-value">
                    {(archive.snapshot?.avgFeeling || 0).toFixed(1)}
                  </span>
                  <span className="rc-archive-stat-label">Avg Feeling</span>
                </div>
                <div className="rc-archive-stat">
                  <span className="rc-archive-stat-value">
                    {archive.snapshot?.wins?.length || 0}
                  </span>
                  <span className="rc-archive-stat-label">Wins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
