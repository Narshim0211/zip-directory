import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider } from "../context/HairGoalsContext";
import { loadJourneyHistory, loadPhotos } from "../utils/hairGoalsStorage";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";
import PhotoCompareModal from "../components/PhotoCompareModal";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function JourneyHistoryContent() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [currentPhotos, setCurrentPhotos] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [toast, setToast] = useState(null);

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

  const renderHistoryCard = (journey, index) => {
    const weeks = journey.weeklyEntries?.length || 0;
    const lastEntry = journey.weeklyEntries
      ?.slice()
      ?.sort((a, b) => b.weekNumber - a.weekNumber)?.[0];
    const feeling = lastEntry?.hairFeeling;
    const feelingEmoji = feeling ? getFeelingEmoji(feeling) : "";
    const feelingWord = feeling ? getHairWord(feeling) : null;

    return (
      <div key={journey.id} className="hg-history-card">
        <header>
          <p className="hg-history-label">Journey #{history.length - index}</p>
          <h3>{journey.goal?.goalType || "Untitled hair goal"}</h3>
          <p className="hg-history-dates">
            {formatDate(journey.startDate)} – {formatDate(journey.endDate)}
          </p>
        </header>
        <div className="hg-history-meta">
          <div>
            <span className="hg-history-meta-label">Duration</span>
            <p className="hg-history-meta-value">{weeks} weeks logged</p>
          </div>
          <div>
            <span className="hg-history-meta-label">Final feeling</span>
            <p className="hg-history-meta-value">
              {feeling ? (
                <>
                  <span>{feelingEmoji}</span> {feelingWord}
                </>
              ) : (
                "No data"
              )}
            </p>
          </div>
          <div>
            <span className="hg-history-meta-label">Products used</span>
            <p className="hg-history-meta-value">{journey.products?.length || 0}</p>
          </div>
        </div>
        <footer>
          <button
            className="hg-btn primary"
            onClick={() => navigate(`/visitor/toolkit/goals/history/${journey.id}`)}
          >
            View Journey →
          </button>
          <button className="hg-btn ghost" onClick={() => compareToCurrent(journey)}>
            Compare to Current
          </button>
        </footer>
      </div>
    );
  };

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title="Past Glow-Up Journeys"
          subtitle="Every restart is saved here so you can revisit the progress you made."
          onBack={() => navigate("/visitor/toolkit/goals")}
        />

        <div className="hg-wrapper">
          <div className="hg-card">
            {history.length === 0 ? (
              <div className="hg-empty-state">
                <p className="hg-empty-title">No past journeys yet</p>
                <p className="hg-empty-copy">
                  Restarting your goal will archive your full history here automatically.
                </p>
                <button className="hg-btn ghost" onClick={() => navigate("/visitor/toolkit/goals")}>
                  Back to Hair Goals
                </button>
              </div>
            ) : (
              <div className="hg-history-grid">{history.map(renderHistoryCard)}</div>
            )}
          </div>
          {toast && (
            <div className="hg-coming-soon-banner">
              <span>{toast}</span>
              <button type="button" onClick={() => setToast(null)}>
                Close
              </button>
            </div>
          )}
        </div>
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
