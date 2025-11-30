import React, { useState } from "react";
import "../../styles/reportCard.css";

/**
 * WinsCarousel Component
 *
 * Displays proud moments from weekly check-ins in a carousel.
 */
export default function WinsCarousel({ wins = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!wins.length) {
    return (
      <div className="rc-wins-empty">
        <div className="rc-wins-empty-icon">🏆</div>
        <p>Your proud moments will appear here!</p>
        <span className="rc-wins-empty-hint">Share wins in your weekly check-ins</span>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : wins.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < wins.length - 1 ? prev + 1 : 0));
  };

  const currentWin = wins[currentIndex];
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="rc-wins-container">
      <div className="rc-wins-header">
        <h4>Your Biggest Wins</h4>
        <span className="rc-wins-count">{wins.length} moments captured</span>
      </div>

      <div className="rc-wins-carousel">
        {wins.length > 1 && (
          <button
            className="rc-wins-nav rc-wins-nav-prev"
            onClick={handlePrev}
            aria-label="Previous win"
          >
            ‹
          </button>
        )}

        <div className="rc-wins-card">
          {currentWin.photo && (
            <div className="rc-wins-photo">
              <img src={currentWin.photo} alt="Win moment" />
            </div>
          )}

          <div className="rc-wins-content">
            <div className="rc-wins-badge">
              <span className="rc-wins-emoji">✨</span>
              <span className="rc-wins-week">Week {currentWin.week}</span>
            </div>

            <p className="rc-wins-text">"{currentWin.text}"</p>

            {currentWin.date && (
              <span className="rc-wins-date">{formatDate(currentWin.date)}</span>
            )}
          </div>
        </div>

        {wins.length > 1 && (
          <button
            className="rc-wins-nav rc-wins-nav-next"
            onClick={handleNext}
            aria-label="Next win"
          >
            ›
          </button>
        )}
      </div>

      {wins.length > 1 && (
        <div className="rc-wins-dots">
          {wins.slice(0, 10).map((_, index) => (
            <button
              key={index}
              className={`rc-wins-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to win ${index + 1}`}
            />
          ))}
          {wins.length > 10 && <span className="rc-wins-more-dots">...</span>}
        </div>
      )}
    </div>
  );
}
