import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { getReportById } from "../../../api/hairGoalsReportsApi";
import "../styles/hairGoalsDiary.css";

function ProgressBar({ percentage }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage || 0)));
  return (
    <div className="hg-progress-bar-bg">
      <div className="hg-progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function WeeklyReportPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getReportById(reportId)
      .then((data) => {
        if (mounted) setReport(data);
      })
      .catch((err) => {
        console.error("Failed to load report", err);
        if (mounted) setError("We couldn't load this report. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [reportId]);

  const consistencyPercent = useMemo(() => {
    if (!report?.consistency) return 0;
    return Math.round(report.consistency * 100);
  }, [report]);

  const renderPhotos = () => {
    if (!report?.photos || report.photos.length === 0) return null;
    return (
      <div className="hg-report-photos card">
        <div className="hg-photo-grid">
          {report.photos.map((photo, idx) => (
            <div key={`${photo.url}-${idx}`} className="hg-photo-card">
              <img src={photo.url} alt={photo.type || "progress"} />
              <div className="hg-photo-label">{photo.type || "progress"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSteps = () => {
    if (!report?.steps || report.steps.length === 0) return null;
    return (
      <div className="card">
        <h2>Routine · {consistencyPercent}%</h2>
        <ProgressBar percentage={consistencyPercent} />
        <p className="hg-routine-line">
          {report.steps
            .map((step) => `${step.label || step.id}: ${step.done || 0}/${step.target || 0}`)
            .join(" · ")}
        </p>
      </div>
    );
  };

  const renderNavigation = () => {
    if (!report) return null;
    return (
      <div className="card hg-nav-card">
        <button
          className="hg-btn ghost"
          disabled={!report.prevId}
          onClick={() => report.prevId && navigate(`/visitor/toolkit/goals/report/${report.prevId}`)}
        >
          ← Prev
        </button>
        <button
          className="hg-btn ghost"
          disabled={!report.nextId}
          onClick={() => report.nextId && navigate(`/visitor/toolkit/goals/report/${report.nextId}`)}
        >
          Next →
        </button>
      </div>
    );
  };

  const renderBody = () => {
    if (loading) {
      return <div className="card">Loading report…</div>;
    }
    if (error) {
      return <div className="card error">{error}</div>;
    }
    if (!report) {
      return <div className="card">Report not found.</div>;
    }

    return (
      <>
        {renderPhotos()}

        <div className="card">
          <h2>
            {report.emoji || "📅"} Felt {report.feeling || "—"}
          </h2>
          {report.note && <p className="hg-quote">“{report.note}”</p>}
        </div>

        {renderSteps()}

        {report.highlightProduct?.name && (
          <div className="card">
            <h2>🌟 {report.highlightProduct.name}</h2>
            {report.highlightProduct.uses ? (
              <p>Used {report.highlightProduct.uses}× this week</p>
            ) : null}
          </div>
        )}

        {renderNavigation()}
      </>
    );
  };

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title={`Week ${report?.week || ""}`}
          subtitle={report?.dates ? `${report.dates.start || ""} – ${report.dates.end || ""}` : ""}
          onBack={() => navigate("/visitor/toolkit/goals")}
        />
        <div className="hg-report-page">{renderBody()}</div>
      </PageShell>
    </HairGoalsErrorBoundary>
  );
}
