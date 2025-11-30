import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoSlider from './components/PhotoSlider';
import { getPhotos, getCurrentWeekNumber, isJourneyStarted } from './hairDiaryStorage';
import './hairDiary.css';

/**
 * ComparePage - Magical Before & After Comparison
 */
const ComparePage = () => {
  const navigate = useNavigate();
  const [photos, setPhotosData] = useState([]);
  const [beforeWeek, setBeforeWeek] = useState(1);
  const [afterWeek, setAfterWeek] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  // Load photos
  useEffect(() => {
    if (!isJourneyStarted()) {
      navigate('/hair-diary/goal');
      return;
    }

    const savedPhotos = getPhotos();
    const week = getCurrentWeekNumber();

    setPhotosData(savedPhotos);
    setCurrentWeek(week);

    // Set default selections
    if (savedPhotos.length > 0) {
      const weeks = savedPhotos.map((p) => p.week).sort((a, b) => a - b);
      setBeforeWeek(weeks[0]);
      setAfterWeek(weeks[weeks.length - 1]);
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/hair-diary/dashboard');
  };

  const handleSlideComplete = () => {
    // Show confetti when user reveals the "after" photo
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getPhotoByWeek = (weekNum) => {
    const photo = photos.find((p) => p.week === weekNum);
    return photo?.data || null;
  };

  // Get available weeks that have photos
  const availableWeeks = [...new Set(photos.map((p) => p.week))].sort((a, b) => a - b);

  // Generate confetti pieces
  const confettiColors = ['#E91E63', '#9C27B0', '#FF4081', '#7C4DFF', '#FF9800', '#4CAF50'];
  const confettiPieces = showConfetti
    ? Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      }))
    : [];

  return (
    <div className="hair-diary">
      <div className="hair-diary__container">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>

        <div className="hair-diary__header">
          <h1 className="hair-diary__title">Your Transformation</h1>
          <p className="hair-diary__subtitle">
            Look at you growing... literally.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="compare-container">
            <div className="empty-state">
              <span className="empty-state__icon">📷</span>
              <h3 className="empty-state__title">No photos yet</h3>
              <p className="empty-state__text">
                Add your first photo from the dashboard to start tracking your transformation!
              </p>
            </div>
          </div>
        ) : photos.length === 1 ? (
          <div className="compare-container">
            <div className="compare-image" style={{ aspectRatio: '3/4', marginBottom: '20px' }}>
              <img src={photos[0].data} alt="Week 1" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
            </div>
            <div className="compare-message">
              <p className="compare-message__text">
                Great start! Add more weekly photos to see your transformation.
              </p>
            </div>
          </div>
        ) : (
          <div className="compare-container">
            {/* Week Selectors */}
            <div className="compare-header">
              <div className="compare-selector">
                <span className="compare-selector__label">Before</span>
                <select
                  className="compare-selector__select"
                  value={beforeWeek}
                  onChange={(e) => setBeforeWeek(Number(e.target.value))}
                >
                  {availableWeeks.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>

              <div className="compare-selector">
                <span className="compare-selector__label">After</span>
                <select
                  className="compare-selector__select"
                  value={afterWeek}
                  onChange={(e) => setAfterWeek(Number(e.target.value))}
                >
                  {availableWeeks.map((week) => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo Slider */}
            <PhotoSlider
              beforePhoto={getPhotoByWeek(beforeWeek)}
              afterPhoto={getPhotoByWeek(afterWeek)}
              onSlideComplete={handleSlideComplete}
            />

            {/* Motivational Message */}
            <div className="compare-message">
              <p className="compare-message__text">
                {afterWeek - beforeWeek > 4
                  ? "Incredible progress! You're glowing! ✨"
                  : afterWeek - beforeWeek > 2
                  ? "Amazing consistency! Keep it up! 💪"
                  : "Every step counts. You're doing great! 🌟"}
              </p>
            </div>
          </div>
        )}

        {/* Confetti */}
        {showConfetti && (
          <div className="confetti">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="confetti__piece"
                style={{
                  left: piece.left,
                  animationDelay: piece.delay,
                  backgroundColor: piece.color,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
