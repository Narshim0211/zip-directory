import React, { useCallback, useEffect, useMemo, useState } from "react";
import SurveyCreateForm from "./SurveyCreateForm";
import SurveyCard from "./SurveyCard";
import ErrorBoundary from "./Shared/ErrorBoundary";
import ownerApi from "../api/owner";
import "../styles/ownerSurveysPage.css";

const OwnerSurveysPage = () => {
  const [ownSurveys, setOwnSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ownerApi.get("/surveys");
      setOwnSurveys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch owner surveys", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleCreated = useCallback(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleVoteUpdate = useCallback(
    (updated) => {
      setOwnSurveys((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    },
    [setOwnSurveys]
  );

  const trending = useMemo(() => [...ownSurveys]
    .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
    .slice(0, 3), [ownSurveys]);

  return (
    <section className="owner-surveys-page">
      <header className="owner-surveys-page__header">
        <div>
          <p className="eyebrow">Owner</p>
          <h1>Your survey studio</h1>
          <p className="owner-surveys-page__subtitle">
            Launch polls for your clients and monitor responses.
          </p>
        </div>
      </header>

      <ErrorBoundary>
        <div className="owner-surveys-page__creator">
          <SurveyCreateForm onCreated={handleCreated} apiClient={ownerApi} endpoint="/surveys" />
        </div>
      </ErrorBoundary>

      <div className="owner-surveys-page__layout">
        <div className="owner-surveys-page__content">
          <h3>My surveys</h3>
          {loading ? (
            <div className="surveys-page__empty">Loading your polls…</div>
          ) : ownSurveys.length === 0 ? (
            <div className="surveys-page__empty">No surveys yet.</div>
          ) : (
            ownSurveys.map((survey) => (
              <SurveyCard key={survey._id} survey={survey} onVote={handleVoteUpdate} showFollow={false} />
            ))
          )}
        </div>

        <aside className="owner-surveys-page__panel">
          <div className="owner-surveys-page__panel-card">
            <h3>Trending in your studio</h3>
            {trending.length === 0 ? (
              <p>No trending surveys yet.</p>
            ) : (
              <ul>
                {trending.map((survey) => (
                  <li key={survey._id}>
                    <strong>{survey.question}</strong>
                    <span>{survey.totalVotes || 0} votes</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default OwnerSurveysPage;
