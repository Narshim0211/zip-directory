import React, { useState } from "react";
import "../pages/hairGoals.css";

export default function PhotoCompareModal({ before, after, onClose }) {
  const [sliderValue, setSliderValue] = useState(50);
  const [viewMode, setViewMode] = useState("side-by-side"); // "side-by-side" | "slider"

  if (!before || !after) return null;

  const renderSideBySide = () => (
    <div className="hg-side-by-side">
      <div className="hg-side-image">
        <img src={before.dataUrl} alt={`Week ${before.weekNumber}`} />
        <p className="hg-compare-meta"><strong>Before:</strong> Week {before.weekNumber}</p>
      </div>
      <div className="hg-side-image">
        <img src={after.dataUrl} alt={`Week ${after.weekNumber}`} />
        <p className="hg-compare-meta"><strong>After:</strong> Week {after.weekNumber}</p>
      </div>
    </div>
  );

  const renderSlider = () => (
    <>
      <div className="hg-slider-images">
        <img
          src={before.dataUrl}
          alt={`Week ${before.weekNumber}`}
          className="hg-slider-image hg-slider-before"
        />
        <div
          className="hg-slider-after-wrapper"
          style={{ width: `${sliderValue}%` }}
        >
          <img
            src={after.dataUrl}
            alt={`Week ${after.weekNumber}`}
            className="hg-slider-image hg-slider-after"
          />
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
          <strong>Before:</strong> Week {before.weekNumber}
        </span>
        <span>
          <strong>After:</strong> Week {after.weekNumber}
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

          {viewMode === "side-by-side" ? renderSideBySide() : renderSlider()}

          <button className="hg-slider-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
