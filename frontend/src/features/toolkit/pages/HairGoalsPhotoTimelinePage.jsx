import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider, useHairGoals } from "../context/HairGoalsContext";
import PhotoCompareModal from "../components/PhotoCompareModal";
import WeeklyProgressModal from "../components/WeeklyProgressModal";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";
import { loadPhotos, savePhotos, loadRoutineSteps, loadProducts, loadField } from "../utils/hairGoalsStorage";

function HairGoalsPhotoTimelineContent() {
  const navigate = useNavigate();
  const { getCurrentWeekNumber, addOrUpdateWeeklyEntry, getEntryByWeek } = useHairGoals();
  const [photos, setPhotos] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressDefaults, setProgressDefaults] = useState({});
  const [routineSteps, setRoutineSteps] = useState([]);
  const [products, setProducts] = useState([]);
  const [goalData, setGoalData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const stored = loadPhotos();
      if (Array.isArray(stored)) {
        setPhotos(stored);
      }
      setRoutineSteps(loadRoutineSteps());
      setProducts(loadProducts());
      setGoalData(loadField("GOAL"));
    } catch (error) {
      console.error("Failed to load hair photos:", error);
    }
  }, []);

  const persistPhotos = (next) => {
    setPhotos(next);
    try {
      savePhotos(next);
    } catch (error) {
      console.error("Failed to save photos:", error);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const currentWeek = getCurrentWeekNumber();
      const newPhoto = {
        id: Date.now(),
        dataUrl: e.target.result,
        date: new Date().toISOString(),
        weekNumber: currentWeek
      };
      const updated = [...photos, newPhoto];
      persistPhotos(updated);

      addOrUpdateWeeklyEntry({
        weekNumber: currentWeek,
        photoUri: e.target.result
      });
      setProgressDefaults({
        weekNumber: currentWeek,
        defaultPhoto: e.target.result,
        existingEntry: getEntryByWeek(currentWeek)
      });
      setProgressModalOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openCompare = () => {
    if (photos.length < 2) return;
    const sorted = [...photos].sort((a, b) => a.weekNumber - b.weekNumber);
    setCompareData({
      before: sorted[0],
      after: sorted[sorted.length - 1]
    });
  };

  return (
    <HairGoalsErrorBoundary>
      <PageShell fullWidth>
        <HeaderBar
          title="Photo Timeline"
          subtitle="Upload weekly photos and watch your glow-up unfold."
          onBack={() => navigate("/visitor/toolkit/goals")}
        />

        <div className="hg-wrapper">
          <div className="hg-card">
            <div className="hg-card-header">
              <div>
                <h3 className="hg-card-title">📸 Weekly Hair Diary</h3>
                <p className="hg-card-subtitle">
                  Upload fresh photos, keep your timeline updated, and compare progress anytime.
                </p>
              </div>
              <button className="hg-btn primary" onClick={() => fileInputRef.current?.click()}>
                Upload Photo
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />

            <div className="hg-reminder-hint">
              Tip: take photos in the same lighting each week for the most dramatic before/after.
            </div>

            <div className="hg-timeline-header">
              <h3>Your Timeline</h3>
            </div>

            <div className="hg-timeline-section">
              {photos.length === 0 ? (
                <div className="hg-empty-state">
                  <p className="hg-empty-title">No photos yet</p>
                  <p className="hg-empty-copy">
                    Upload your first hair photo to start tracking visual progress.
                  </p>
                  <button className="hg-btn primary" onClick={() => fileInputRef.current?.click()}>
                    Add Your First Photo
                  </button>
                </div>
              ) : (
                <div className="hg-timeline-grid">
                  {[...photos]
                    .sort((a, b) => a.weekNumber - b.weekNumber)
                    .map((photo) => (
                      <div key={photo.id} className="hg-photo-card">
                        <img
                          src={photo.dataUrl}
                          alt={`Week ${photo.weekNumber}`}
                          className="hg-photo-img"
                        />
                        <div className="hg-photo-label">Week {photo.weekNumber}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {photos.length >= 2 && (
              <button className="hg-compare-btn" onClick={openCompare}>
                Compare Progress
              </button>
            )}
          </div>
        </div>

        {compareData && (
          <PhotoCompareModal
            before={compareData.before}
            after={compareData.after}
            onClose={() => setCompareData(null)}
          />
        )}

        {progressModalOpen && (
          <WeeklyProgressModal
            isOpen={progressModalOpen}
            onClose={() => setProgressModalOpen(false)}
            onSave={(entry) =>
              addOrUpdateWeeklyEntry({
                ...entry,
                goal: goalData?.goalType || null
              })
            }
            weekNumber={progressDefaults.weekNumber}
            defaultPhoto={progressDefaults.defaultPhoto}
            existingEntry={progressDefaults.existingEntry}
            routineSteps={routineSteps}
            products={products}
          />
        )}
      </PageShell>
    </HairGoalsErrorBoundary>
  );
}

export default function HairGoalsPhotoTimelinePage() {
  return (
    <HairGoalsProvider>
      <HairGoalsPhotoTimelineContent />
    </HairGoalsProvider>
  );
}
