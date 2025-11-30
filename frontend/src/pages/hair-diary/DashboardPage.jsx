import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WeekThumbnail from './components/WeekThumbnail';
import {
  getGoal,
  getGoalNote,
  getRoutine,
  getPhotos,
  addPhoto,
  getCurrentWeekNumber,
  getStreak,
  isStepCompleted,
  toggleChecklistItem,
  getDailyQuote,
  isJourneyStarted,
} from './hairDiaryStorage';
import './hairDiary.css';

/**
 * DashboardPage - Step 3: Your Journey Home (Main Hub)
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [goal, setGoalData] = useState(null);
  const [goalNote, setGoalNoteData] = useState('');
  const [routine, setRoutineData] = useState([]);
  const [photos, setPhotosData] = useState([]);
  const [streak, setStreakData] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [quote, setQuote] = useState('');
  const [checkedItems, setCheckedItems] = useState({});

  // Load all data
  useEffect(() => {
    if (!isJourneyStarted()) {
      navigate('/hair-diary/goal');
      return;
    }

    setGoalData(getGoal());
    setGoalNoteData(getGoalNote() || '');
    setRoutineData(getRoutine());
    setPhotosData(getPhotos());
    setStreakData(getStreak());
    setCurrentWeek(getCurrentWeekNumber());
    setQuote(getDailyQuote());

    // Load checked items for current week
    const routineItems = getRoutine();
    const checkedState = {};
    routineItems.forEach((item) => {
      checkedState[item.id] = isStepCompleted(item.id);
    });
    setCheckedItems(checkedState);
  }, [navigate]);

  const handleCheckItem = (stepId) => {
    toggleChecklistItem(stepId);
    setCheckedItems((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
    // Update streak
    setStreakData(getStreak());
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const photoData = {
        week: currentWeek,
        data: reader.result,
      };
      const updatedPhotos = addPhoto(photoData);
      setPhotosData(updatedPhotos);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleViewProgress = () => {
    navigate('/hair-diary/compare');
  };

  // Generate week thumbnails (show last 8 weeks or current week, whichever is larger)
  const weekCount = Math.max(currentWeek, 8);
  const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

  // Get completion count for this week
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalSteps = routine.length;

  return (
    <div className="hair-diary">
      <div className="hair-diary__container">
        {/* Hero Section */}
        <div className="dashboard-hero">
          <p className="dashboard-hero__goal">
            {goal?.emoji} {goal?.title}
          </p>
          <h1 className="dashboard-hero__title">
            Week {currentWeek} of Your Glow-Up
          </h1>
          <p className="dashboard-hero__quote">
            "{quote}"
          </p>
        </div>

        {/* Streak Counter */}
        <div className="streak-counter">
          <span className="streak-counter__number">
            {streak} 🔥
          </span>
          <span className="streak-counter__label">
            {streak === 1 ? 'Week Streak' : 'Weeks Streak'}
          </span>
        </div>

        {/* Weekly Checklist */}
        <div className="weekly-checklist">
          <h2 className="weekly-checklist__title">
            📋 This Week's Routine
            {totalSteps > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: '600', color: completedCount === totalSteps ? '#10b981' : '#6b7280' }}>
                {completedCount}/{totalSteps}
              </span>
            )}
          </h2>

          {routine.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p className="empty-state__text">No routine steps yet</p>
            </div>
          ) : (
            routine.map((step) => (
              <div
                key={step.id}
                className="checklist-item"
                onClick={() => handleCheckItem(step.id)}
              >
                <div className={`checklist-item__checkbox ${checkedItems[step.id] ? 'checklist-item__checkbox--checked' : ''}`}>
                  {checkedItems[step.id] && '✓'}
                </div>
                <span className={`checklist-item__text ${checkedItems[step.id] ? 'checklist-item__text--checked' : ''}`}>
                  {step.type}
                  {step.product && <span style={{ color: '#9ca3af' }}> • {step.product}</span>}
                </span>
                <span className="checklist-item__day">{step.day}</span>
              </div>
            ))
          )}
        </div>

        {/* Photo Timeline */}
        <div className="photo-timeline">
          <h2 className="photo-timeline__title">📸 Your Progress Photos</h2>
          <div className="photo-timeline__scroll">
            {weeks.map((weekNum) => {
              const photo = photos.find((p) => p.week === weekNum);
              return (
                <WeekThumbnail
                  key={weekNum}
                  week={weekNum}
                  photo={photo?.data}
                  onClick={() => {}}
                />
              );
            })}
          </div>
        </div>

        {/* See Progress Button */}
        <button
          className="hair-diary__button"
          onClick={handleViewProgress}
          style={{ marginBottom: '100px' }}
        >
          See My Progress →
        </button>

        {/* Floating Photo Upload Button */}
        <button
          className="fab"
          onClick={handlePhotoUpload}
          aria-label="Add today's photo"
        >
          📷
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
