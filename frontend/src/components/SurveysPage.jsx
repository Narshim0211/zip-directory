import React, { useCallback, useEffect, useMemo, useState } from "react";
import SurveyCard from "./SurveyCard";
import CreateSurveyModal from "./CreateSurveyModal";
import ErrorBoundary from "./SharedComponents/ErrorBoundary";
import { fetchSurveysFeed } from "../api/surveys";
import v1Client from "../api/v1";
import "../styles/surveysPagePremium.css";

const FILTERS = [
  { id: "all", label: "All", icon: "✨" },
  { id: "trending", label: "Trending", icon: "🔥" },
  { id: "hair", label: "Hair", icon: "✂️" },
  { id: "skin", label: "Skin", icon: "🌿" },
  { id: "makeup", label: "Makeup", icon: "💄" },
  { id: "nails", label: "Nails", icon: "💅" },
  { id: "spa", label: "Spa", icon: "🧖" },
];

const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchSurveysFeed({ limit: 24 });
      setSurveys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load surveys", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleVoteUpdate = useCallback(
    (updated) => {
      setSurveys((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    },
    [setSurveys]
  );

  const handleCreated = useCallback(() => {
    loadSurveys();
    setShowCreate(false);
  }, [loadSurveys]);

  // Handle modal submission
  const handleModalSubmit = async (surveyData) => {
    try {
      await v1Client.visitor.surveys.create(surveyData);
      loadSurveys();
    } catch (error) {
      console.error("Failed to create survey:", error);
      throw error; // Re-throw so modal can show error
    }
  };

  const trendingItems = useMemo(() => {
    return [...surveys]
      .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
      .slice(0, 3);
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    if (filter === "all") return surveys;
    if (filter === "trending") return trendingItems;
    return surveys.filter(
      (item) => (item.category || "General").toLowerCase() === filter.toLowerCase()
    );
  }, [filter, surveys, trendingItems]);

  return (
    <section className="surveys-page">
      <header className="surveys-page__header">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Surveys & Polls</h1>
          <p className="surveys-page__subtitle">
            Vote, comment, and see how the SalonHub community feels.
          </p>
        </div>
        <div className="surveys-page__header-actions">
          <button
            type="button"
            className="surveys-page__create-btn"
            onClick={() => setShowCreate(true)}
          >
            + Create Survey
          </button>
        </div>
      </header>

      {/* Create Survey Modal - Enhanced with Love-Only support */}
      <CreateSurveyModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleModalSubmit}
        role="visitor"
      />

        <div className="surveys-page__filters">
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`surveys-page__filter${filter === item.id ? " active" : ""}`}
              onClick={() => setFilter(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <ErrorBoundary>
          <div className="surveys-page__grid">
            <div className="surveys-page__feed">
              {loading ? (
                <div className="surveys-page__empty">Loading surveys…</div>
              ) : filteredSurveys.length === 0 ? (
                <div className="surveys-page__empty">
                  No surveys match this filter yet. Start one or try another category.
                </div>
              ) : (
                filteredSurveys.map((survey) => (
                  <SurveyCard key={survey._id} survey={survey} onVote={handleVoteUpdate} />
                ))
              )}
            </div>

            <aside className="surveys-page__panel">
              <div className="surveys-page__panel-card">
                <h3>Survey of the Day</h3>
                <p className="surveys-page__panel-subtitle">
                  Highlighted poll with the highest engagement.
                </p>
                {trendingItems[0] ? (
                  <SurveyCard
                    survey={trendingItems[0]}
                    onVote={handleVoteUpdate}
                    showFollow={false}
                  />
                ) : (
                  <p>No trending polls yet.</p>
                )}
              </div>

              <div className="surveys-page__panel-card">
                <h4>Trending this week</h4>
                <ul>
                  {trendingItems.length === 0 && <li>No trending surveys yet.</li>}
                  {trendingItems.map((survey) => (
                    <li key={`trend-${survey._id}`}>
                      <strong>{survey.question}</strong>
                      <span>{survey.totalVotes || 0} votes</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </ErrorBoundary>
      </section>
  );
};

export default SurveysPage;

