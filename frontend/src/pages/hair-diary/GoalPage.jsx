import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressStepper from './components/ProgressStepper';
import GoalCard from './components/GoalCard';
import { getGoal, setGoal, getGoalNote, setGoalNote, isJourneyStarted } from './hairDiaryStorage';
import './hairDiary.css';

const GOALS = [
  {
    id: 'length',
    emoji: '📏',
    title: 'Grow Length',
    description: 'Reach your dream length with patience and care',
  },
  {
    id: 'volume',
    emoji: '💨',
    title: 'Add Volume',
    description: 'Get fuller, thicker-looking hair',
  },
  {
    id: 'repair',
    emoji: '💪',
    title: 'Repair Damage',
    description: 'Heal breakage and restore strength',
  },
  {
    id: 'curls',
    emoji: '🌀',
    title: 'Define Curls',
    description: 'Enhance your natural curl pattern',
  },
  {
    id: 'scalp',
    emoji: '🌱',
    title: 'Scalp Health',
    description: 'Nourish from the roots up',
  },
  {
    id: 'color',
    emoji: '🎨',
    title: 'Maintain Color',
    description: 'Keep color vibrant and healthy',
  },
];

/**
 * GoalPage - Step 1: Choose Your Hair Goal
 */
const GoalPage = () => {
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [note, setNote] = useState('');

  // Load existing data
  useEffect(() => {
    const savedGoal = getGoal();
    const savedNote = getGoalNote();

    if (savedGoal) {
      setSelectedGoal(savedGoal);
    }
    if (savedNote) {
      setNote(savedNote);
    }

    // If journey already started, redirect to dashboard
    if (isJourneyStarted()) {
      navigate('/hair-diary/dashboard');
    }
  }, [navigate]);

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handleContinue = () => {
    if (!selectedGoal) return;

    // Save to localStorage
    setGoal(selectedGoal);
    setGoalNote(note);

    // Navigate to routine builder
    navigate('/hair-diary/routine');
  };

  return (
    <div className="hair-diary">
      <div className="hair-diary__container">
        <ProgressStepper currentStep={1} totalSteps={3} />

        <div className="hair-diary__header">
          <h1 className="hair-diary__title">Choose Your Hair Goal</h1>
          <p className="hair-diary__subtitle">
            Every big transformation starts with one brave decision.
          </p>
        </div>

        <div className="goal-cards">
          {GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isSelected={selectedGoal?.id === goal.id}
              onClick={() => handleGoalSelect(goal)}
            />
          ))}
        </div>

        {selectedGoal && (
          <div className="hair-diary__input-group">
            <label className="hair-diary__label">
              Why does this matter to you? (optional)
            </label>
            <textarea
              className="hair-diary__textarea"
              placeholder="E.g., For my wedding in June... or just because I deserve to glow!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>
        )}

        <div className="hair-diary__button-container">
          <button
            className="hair-diary__button"
            onClick={handleContinue}
            disabled={!selectedGoal}
          >
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalPage;
