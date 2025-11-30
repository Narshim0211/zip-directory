import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressStepper from './components/ProgressStepper';
import RoutineStep from './components/RoutineStep';
import { getRoutine, setRoutine, getGoal, startJourney, isJourneyStarted } from './hairDiaryStorage';
import './hairDiary.css';

/**
 * RoutinePage - Step 2: Build Your Weekly Routine
 */
const RoutinePage = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [goal, setGoalData] = useState(null);

  // Load existing data
  useEffect(() => {
    const savedGoal = getGoal();
    const savedRoutine = getRoutine();

    if (!savedGoal) {
      // No goal set, redirect to goal page
      navigate('/hair-diary/goal');
      return;
    }

    setGoalData(savedGoal);

    if (savedRoutine.length > 0) {
      setSteps(savedRoutine);
    } else {
      // Add one empty step by default
      setSteps([{ id: Date.now(), day: '', type: '', product: '' }]);
    }

    // If journey already started, redirect to dashboard
    if (isJourneyStarted()) {
      navigate('/hair-diary/dashboard');
    }
  }, [navigate]);

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now(), day: '', type: '', product: '' }]);
  };

  const handleUpdateStep = (index, updatedStep) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };

  const handleDeleteStep = (index) => {
    if (steps.length <= 1) {
      // Keep at least one step
      setSteps([{ id: Date.now(), day: '', type: '', product: '' }]);
      return;
    }
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleBack = () => {
    // Save progress before going back
    setRoutine(steps);
    navigate('/hair-diary/goal');
  };

  const handleStartJourney = () => {
    // Validate that at least one step has data
    const validSteps = steps.filter((s) => s.day && s.type);

    if (validSteps.length === 0) {
      alert('Please add at least one routine step with a day and activity.');
      return;
    }

    // Save routine
    setRoutine(validSteps);

    // Mark journey as started
    startJourney();

    // Navigate to dashboard
    navigate('/hair-diary/dashboard');
  };

  return (
    <div className="hair-diary">
      <div className="hair-diary__container">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <ProgressStepper currentStep={2} totalSteps={3} />

        <div className="hair-diary__header">
          <h1 className="hair-diary__title">Build Your Weekly Routine</h1>
          <p className="hair-diary__subtitle">
            {goal ? (
              <>Your goal: <strong>{goal.title}</strong> {goal.emoji}</>
            ) : (
              'Create a simple routine you can stick to'
            )}
          </p>
        </div>

        <div className="routine-steps">
          {steps.map((step, index) => (
            <RoutineStep
              key={step.id}
              step={step}
              index={index}
              onChange={handleUpdateStep}
              onDelete={handleDeleteStep}
            />
          ))}

          <button className="add-step-button" onClick={handleAddStep}>
            <span>+</span> Add Another Step
          </button>
        </div>

        <div className="hair-diary__button-container">
          <button
            className="hair-diary__button"
            onClick={handleStartJourney}
          >
            Start My Journey →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutinePage;
