import React, { useState, useRef, useCallback } from 'react';

/**
 * PhotoSlider - Before/After comparison slider
 */
const PhotoSlider = ({ beforePhoto, afterPhoto, onSlideComplete }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current || !isDragging.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    // Trigger confetti if slider moved significantly
    if (sliderPosition > 80 && onSlideComplete) {
      onSlideComplete();
    }
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  if (!beforePhoto && !afterPhoto) {
    return (
      <div className="compare-image">
        <div className="compare-image__placeholder">
          <span className="compare-image__placeholder-icon">📷</span>
          <span className="compare-image__placeholder-text">No photos yet</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="compare-slider-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Before Image (full width, bottom layer) */}
      <div className="compare-slider__before">
        {beforePhoto ? (
          <img src={beforePhoto} alt="Before" />
        ) : (
          <div className="compare-image__placeholder">
            <span className="compare-image__placeholder-icon">📷</span>
            <span className="compare-image__placeholder-text">Week 1</span>
          </div>
        )}
      </div>

      {/* After Image (clipped, top layer) */}
      <div
        className="compare-slider__after"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {afterPhoto ? (
          <img src={afterPhoto} alt="After" />
        ) : (
          <div className="compare-image__placeholder">
            <span className="compare-image__placeholder-icon">📷</span>
            <span className="compare-image__placeholder-text">Latest</span>
          </div>
        )}
      </div>

      {/* Slider Handle */}
      <div
        className="compare-slider__handle"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />
    </div>
  );
};

export default PhotoSlider;
