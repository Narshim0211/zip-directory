import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider } from "../context/HairGoalsContext";
import { loadJourneyHistory } from "../utils/hairGoalsStorage";
import { getFeelingEmoji, getHairWord } from "../utils/hairGoalsReportGenerator";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function JourneySection({ title, children }) {
  return (
    <section className="hg-history-section">
      <header>
        <h4>{title}</h4>
      </header>
      {children}
    </section>
  );
}

function JourneyDetailContent() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const [journey, setJourney] = useState(null);

  useEffect(() => {
    const history = loadJourneyHistory();
    const match = history.find((entry) => entry.id === journeyId);
    setJourney(match || null);
  }, [journeyId]);

  const sortedEntries = useMemo(() => {
    if (!journey?.weeklyEntries) return [];
    return [...journey.weeklyEntries].sort((a, b) => a.weekNumber - b.weekNumber);
  }, [journey]);

  if (!journey) {
    return (
      <HairGoalsErrorBoundary>
        <PageShell fullWidth>
          <HeaderBar
            title="Journey not found"
            subtitle="This history entry may have been removed."
            onBack={() => navigate("/visitor/toolkit/goals/history")}
          />
        </PageShell>
      </HairGoalsErrorBoundary>
    );
  }

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title={journey.goal?.goalType || "Archived Journey"}
          subtitle={`${formatDate(journey.startDate)} – ${formatDate(journey.endDate)} • ${
            sortedEntries.length
          } weeks logged`}
          onBack={() => navigate("/visitor/toolkit/goals/history")}
        />

        <div className="hg-wrapper">
          <div className="hg-card">
            <JourneySection title="Goal & Motivation">
              <div className="hg-history-detail">
                <div>
                  <p className="hg-history-label">Goal</p>
                  <p className="hg-history-value">{journey.goal?.goalType || "—"}</p>
                </div>
                {journey.goal?.goalNote && (
                  <div>
                    <p className="hg-history-label">Why it mattered</p>
                    <p className="hg-history-note">{journey.goal.goalNote}</p>
                  </div>
                )}
              </div>
            </JourneySection>

            <JourneySection title="Routine Summary">
              {journey.routineSteps?.length ? (
                <div className="hg-history-table">
                  {journey.routineSteps.map((step) => (
                    <div key={step.id} className="hg-history-row">
                      <strong>{step.step}</strong>
                      <span>{step.productName || "No product logged"}</span>
                      <span>{step.frequency}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hg-empty-copy">No routine steps captured.</p>
              )}
            </JourneySection>

            <JourneySection title="Products Loved">
              {journey.products?.length ? (
                <div className="hg-product-list">
                  {journey.products.map((product) => (
                    <div key={product.id} className="hg-product-card history">
                      <div>
                        <p className="hg-product-name">{product.name}</p>
                        <p className="hg-product-meta">
                          {product.category}
                          {product.tags?.length ? ` • ${product.tags.join(", ")}` : ""}
                        </p>
                        {product.note && <p className="hg-product-note">{product.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hg-empty-copy">No products saved.</p>
              )}
            </JourneySection>

            <JourneySection title="Weekly Notes & Feelings">
              {sortedEntries.length ? (
                <div className="hg-weekly-log">
                  {sortedEntries.map((entry) => (
                    <div key={entry.weekNumber} className="hg-weekly-log-row">
                      <div className="hg-weekly-log-meta">
                        <span className="hg-week-label">Week {entry.weekNumber}</span>
                        <small>{formatDate(entry.date)}</small>
                      </div>
                      <div className="hg-weekly-log-content">
                        <p className="hg-weekly-log-feeling">
                          {entry.hairFeeling ? (
                            <>
                              <span>{getFeelingEmoji(entry.hairFeeling)}</span>{" "}
                              {getHairWord(entry.hairFeeling)}
                            </>
                          ) : (
                            "No feeling logged"
                          )}
                        </p>
                        {entry.progressNote && (
                          <p className="hg-weekly-log-note">“{entry.progressNote}”</p>
                        )}
                        {entry.completedSteps?.length ? (
                          <p className="hg-weekly-log-steps">
                            Steps completed: {entry.completedSteps.length}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hg-empty-copy">No weekly logs were recorded.</p>
              )}
            </JourneySection>

            <JourneySection title="Saved Photos">
              {journey.photos?.length ? (
                <div className="hg-timeline-grid">
                  {journey.photos.map((photo) => (
                    <div key={photo.id} className="hg-photo-card">
                      <img src={photo.dataUrl} alt={`Week ${photo.weekNumber}`} className="hg-photo-img" />
                      <div className="hg-photo-label">
                        Week {photo.weekNumber} • {formatDate(photo.date)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hg-empty-copy">No photos were archived for this journey.</p>
              )}
            </JourneySection>
          </div>
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
