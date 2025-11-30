import React, { useState, useEffect } from "react";
import "../pages/hairGoals.css";

export default function PhotoCompareModal({ before, after, allPhotos = [], onClose }) {
  const [sliderValue, setSliderValue] = useState(50);
  const [viewMode, setViewMode] = useState("side-by-side"); // "side-by-side" | "slider"
  const [selectedBefore, setSelectedBefore] = useState(before);
  const [selectedAfter, setSelectedAfter] = useState(after);

  // Update selections when props change
  useEffect(() => {
    if (before) setSelectedBefore(before);
    if (after) setSelectedAfter(after);
  }, [before, after]);

  if (!selectedBefore && !selectedAfter && allPhotos.length === 0) return null;

  // Get photo data URL - handles both 'data' and 'dataUrl' property names
  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    return photo.data || photo.dataUrl || photo.url || null;
  };

  const handleBeforeChange = (weekNumber) => {
    const photo = allPhotos.find((p) => p.weekNumber === Number(weekNumber));
    if (photo) setSelectedBefore(photo);
  };

  const handleAfterChange = (weekNumber) => {
    const photo = allPhotos.find((p) => p.weekNumber === Number(weekNumber));
    if (photo) setSelectedAfter(photo);
  };

  const beforeUrl = getPhotoUrl(selectedBefore);
  const afterUrl = getPhotoUrl(selectedAfter);

  // If only one photo, show single view
  if (allPhotos.length === 1) {
    return (
      <div className="hgd-modal-overlay" onClick={onClose}>
        <div className="hgd-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="hg-slider-container">
            <div className="hg-compare-header">
              <h3>Your Progress Photo</h3>
            </div>
            <div className="hg-single-photo">
              <img src={getPhotoUrl(allPhotos[0])} alt={`Week ${allPhotos[0].weekNumber}`} />
              <p className="hg-compare-meta">
                <strong>Week {allPhotos[0].weekNumber}</strong>
              </p>
            </div>
            <p className="hg-compare-hint">Add more photos to compare weeks!</p>
            <button className="hg-slider-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderWeekSelectors = () => (
    <div className="hg-week-selectors">
      <div className="hg-week-selector">
        <label>Before (Week)</label>
        <select
          value={selectedBefore?.weekNumber || ""}
          onChange={(e) => handleBeforeChange(e.target.value)}
        >
          {allPhotos.map((photo) => (
            <option key={`before-${photo.weekNumber}`} value={photo.weekNumber}>
              Week {photo.weekNumber}
            </option>
          ))}
        </select>
      </div>
      <div className="hg-week-selector">
        <label>After (Week)</label>
        <select
          value={selectedAfter?.weekNumber || ""}
          onChange={(e) => handleAfterChange(e.target.value)}
        >
          {allPhotos.map((photo) => (
            <option key={`after-${photo.weekNumber}`} value={photo.weekNumber}>
              Week {photo.weekNumber}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderSideBySide = () => (
    <div className="hg-side-by-side">
      <div className="hg-side-image">
        {beforeUrl ? (
          <img src={beforeUrl} alt={`Week ${selectedBefore?.weekNumber}`} />
        ) : (
          <div className="hg-no-photo">No photo</div>
        )}
        <p className="hg-compare-meta"><strong>Before:</strong> Week {selectedBefore?.weekNumber}</p>
      </div>
      <div className="hg-side-image">
        {afterUrl ? (
          <img src={afterUrl} alt={`Week ${selectedAfter?.weekNumber}`} />
        ) : (
          <div className="hg-no-photo">No photo</div>
        )}
        <p className="hg-compare-meta"><strong>After:</strong> Week {selectedAfter?.weekNumber}</p>
      </div>
    </div>
  );

  const renderSlider = () => (
    <>
      <div className="hg-slider-images">
        {beforeUrl && (
          <img
            src={beforeUrl}
            alt={`Week ${selectedBefore?.weekNumber}`}
            className="hg-slider-image hg-slider-before"
          />
        )}
        <div
          className="hg-slider-after-wrapper"
          style={{ width: `${sliderValue}%` }}
        >
          {afterUrl && (
            <img
              src={afterUrl}
              alt={`Week ${selectedAfter?.weekNumber}`}
              className="hg-slider-image hg-slider-after"
            />
          )}
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={(e) => setSliderValue(Number(e.target.value))}
        className="hg-slider-control"
      />
      <div className="hg-compare-meta">
        <span>
          <strong>Before:</strong> Week {selectedBefore?.weekNumber}
        </span>
        <span>
          <strong>After:</strong> Week {selectedAfter?.weekNumber}
        </span>
      </div>
    </>
  );

  return (
    <div className="hgd-modal-overlay" onClick={onClose}>
      <div className="hgd-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="hg-slider-container">
          <div className="hg-compare-header">
            <h3>Before vs After</h3>
            <div className="hg-compare-toggle">
              <button
                className={`hg-btn ghost ${viewMode === "side-by-side" ? "active" : ""}`}
                onClick={() => setViewMode("side-by-side")}
              >
                Side by side
              </button>
              <button
                className={`hg-btn ghost ${viewMode === "slider" ? "active" : ""}`}
                onClick={() => setViewMode("slider")}
              >
                Slider
              </button>
            </div>
          </div>

          {allPhotos.length > 1 && renderWeekSelectors()}

          {viewMode === "side-by-side" ? renderSideBySide() : renderSlider()}

          <button className="hg-slider-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
