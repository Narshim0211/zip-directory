import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/hairGoalsDiary.css";
import {
  FEELING_OPTIONS,
  HARM_OPTIONS,
  getProgressOptions,
  getHabitOptions,
  getGoalInfo
} from "../../../config/goalQuestions";

function ensureArray(next) {
  if (!next) return [];
  return Array.isArray(next) ? next : [next];
}

export default function WeeklyProgressModal({
  isOpen,
  onClose,
  onSave,
  weekNumber,
  routineSteps = [],
  products = [],
  defaultPhoto,
  existingEntry,
  userGoal = "repair" // User's hair goal for dynamic questions
}) {
  // Form state
  const [hairFeeling, setHairFeeling] = useState(3);
  const [note, setNote] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highlightProductId, setHighlightProductId] = useState("");
  const [photoUri, setPhotoUri] = useState(null);

  // Report Card check-in state (Q1-Q5)
  const [healthRating, setHealthRating] = useState(3);
  const [goalProgress, setGoalProgress] = useState("");
  const [whatHelped, setWhatHelped] = useState([]);
  const [whatHarmed, setWhatHarmed] = useState([]);
  const [proudMoment, setProudMoment] = useState("");

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const photoInputRef = useRef(null);

  // Get goal-specific options
  const goalInfo = getGoalInfo(userGoal);
  const progressOptions = getProgressOptions(userGoal);
  const habitOptions = getHabitOptions(userGoal);

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setHairFeeling(existingEntry?.hairFeeling || 3);
    setNote(existingEntry?.progressNote || "");
    setCompletedSteps(ensureArray(existingEntry?.completedSteps));
    setHighlightProductId(existingEntry?.highlightProductId || "");
    setPhotoUri(defaultPhoto || existingEntry?.photoUri || null);

    // Reset check-in data
    setHealthRating(existingEntry?.checkIn?.healthRating || 3);
    setGoalProgress(existingEntry?.checkIn?.goalProgress || "");
    setWhatHelped(existingEntry?.checkIn?.whatHelped || []);
    setWhatHarmed(existingEntry?.checkIn?.whatHarmed || []);
    setProudMoment(existingEntry?.checkIn?.proudMoment || "");

    setCurrentStep(1);
    setError(null);
  }, [isOpen, existingEntry, defaultPhoto]);

  const routineOptions = useMemo(
    () =>
      routineSteps.map((step) => ({
        id: step.id || step.step || step.type,
        label: step.step || step.type,
        frequency: step.frequency || step.day,
        productName: step.productName || step.product
      })),
    [routineSteps]
  );

  if (!isOpen) return null;

  const toggleStep = (id) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  };

  const toggleHabit = (value) => {
    setWhatHelped((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= 2) {
        return prev; // Max 2 selections
      }
      return [...prev, value];
    });
  };

  const toggleHarm = (value) => {
    setWhatHarmed((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= 2) {
        return prev; // Max 2 selections
      }
      return [...prev, value];
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoUri(e.target.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Validate current step before proceeding
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!healthRating) {
          setError("Please rate how your hair felt this week");
          return false;
        }
        break;
      case 2:
        if (!goalProgress) {
          setError("Please select your progress towards your goal");
          return false;
        }
        break;
      case 3:
        // whatHelped can be empty
        break;
      case 4:
        // whatHarmed can be empty
        break;
      case 5:
        // proudMoment can be empty
        break;
      default:
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate all required fields
    if (!healthRating) {
      setError("Please rate how your hair felt this week");
      setCurrentStep(1);
      return;
    }
    if (!goalProgress) {
      setError("Please select your progress towards your goal");
      setCurrentStep(2);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const productMatch = highlightProductId
        ? products.find((product) => String(product.id) === String(highlightProductId))
        : null;

      const payload = {
        weekNumber,
        hairFeeling: healthRating, // Map to existing field
        progressNote: note.trim(),
        completedSteps,
        highlightProductId: highlightProductId || null,
        highlightProductName: productMatch?.name || null,
        photoUri: photoUri || null,
        date: new Date().toISOString(),
        goal: userGoal,
        // Report Card check-in data
        checkIn: {
          healthRating,
          goalProgress,
          whatHelped,
          whatHarmed,
          proudMoment: proudMoment.trim()
        }
      };

      const result = await Promise.resolve(onSave(payload));
      if (result !== false) {
        onClose();
      }
    } catch (err) {
      console.error("Failed to save weekly progress", err);
      setError("Something went wrong while saving. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step indicators
  const totalSteps = 6;
  const stepLabels = ["Feeling", "Progress", "Helped", "Harmed", "Win", "Details"];

  return (
    <div className="hgd-modal-overlay" onClick={onClose}>
      <div
        className="hgd-modal-content progress"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hgd-modal-header">
          <div>
            <p className="hgd-modal-eyebrow">
              Week {weekNumber || "—"} • {goalInfo.icon} {goalInfo.label}
            </p>
            <h3>Weekly Check-In</h3>
            <p>Quick questions to track your hair journey progress.</p>
          </div>
          <button className="hg-btn icon" onClick={onClose} aria-label="Close progress modal">
            ✕
          </button>
        </header>

        {/* Progress indicator */}
        <div className="rc-step-indicator">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={`rc-step-dot ${index + 1 === currentStep ? "active" : ""} ${
                index + 1 < currentStep ? "completed" : ""
              }`}
              onClick={() => index + 1 < currentStep && setCurrentStep(index + 1)}
            >
              <span className="rc-step-number">{index + 1}</span>
              <span className="rc-step-label">{label}</span>
            </div>
          ))}
        </div>

        <form className="hg-progress-form" onSubmit={handleSubmit}>
          {/* Step 1: Health Rating (Q1) */}
          {currentStep === 1 && (
            <section className="hg-progress-section rc-question">
              <label className="rc-question-label">
                <span className="rc-q-number">Q1</span>
                How did your hair feel this week?
              </label>
              <div className="rc-feeling-scale">
                {FEELING_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`rc-feeling-btn ${healthRating === option.value ? "selected" : ""}`}
                    style={{
                      "--feeling-color": option.color,
                      borderColor: healthRating === option.value ? option.color : "transparent"
                    }}
                    onClick={() => setHealthRating(option.value)}
                  >
                    <span className="rc-feeling-emoji">{option.emoji}</span>
                    <span className="rc-feeling-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 2: Goal Progress (Q2) */}
          {currentStep === 2 && (
            <section className="hg-progress-section rc-question">
              <label className="rc-question-label">
                <span className="rc-q-number">Q2</span>
                Did you notice any progress toward {goalInfo.label.toLowerCase()}?
              </label>
              <div className="rc-progress-options">
                {progressOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`rc-progress-btn ${goalProgress === option.value ? "selected" : ""}`}
                    onClick={() => setGoalProgress(option.value)}
                  >
                    <span className="rc-progress-emoji">{option.emoji}</span>
                    <span className="rc-progress-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: What Helped (Q3) */}
          {currentStep === 3 && (
            <section className="hg-progress-section rc-question">
              <label className="rc-question-label">
                <span className="rc-q-number">Q3</span>
                What helped your hair this week? (Pick up to 2)
              </label>
              <p className="rc-question-hint">
                Select the habits that made a positive difference
              </p>
              <div className="rc-habit-grid">
                {habitOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`rc-habit-btn ${whatHelped.includes(option.value) ? "selected" : ""}`}
                    onClick={() => toggleHabit(option.value)}
                    disabled={whatHelped.length >= 2 && !whatHelped.includes(option.value)}
                  >
                    <span className="rc-habit-emoji">{option.emoji}</span>
                    <span className="rc-habit-label">{option.label}</span>
                  </button>
                ))}
              </div>
              {whatHelped.length === 2 && (
                <p className="rc-selection-hint">Maximum 2 selected</p>
              )}
            </section>
          )}

          {/* Step 4: What Harmed (Q4) */}
          {currentStep === 4 && (
            <section className="hg-progress-section rc-question">
              <label className="rc-question-label">
                <span className="rc-q-number">Q4</span>
                Anything that set you back? (Pick up to 2)
              </label>
              <p className="rc-question-hint">
                Identifying setbacks helps you avoid them next week
              </p>
              <div className="rc-habit-grid">
                {HARM_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`rc-harm-btn ${whatHarmed.includes(option.value) ? "selected" : ""}`}
                    onClick={() => toggleHarm(option.value)}
                    disabled={whatHarmed.length >= 2 && !whatHarmed.includes(option.value)}
                  >
                    <span className="rc-harm-emoji">{option.emoji}</span>
                    <span className="rc-harm-label">{option.label}</span>
                  </button>
                ))}
              </div>
              {whatHarmed.length === 2 && (
                <p className="rc-selection-hint">Maximum 2 selected</p>
              )}
            </section>
          )}

          {/* Step 5: Proud Moment (Q5) */}
          {currentStep === 5 && (
            <section className="hg-progress-section rc-question">
              <label className="rc-question-label">
                <span className="rc-q-number">Q5</span>
                What's one thing you're proud of this week?
              </label>
              <p className="rc-question-hint">
                Celebrating small wins keeps you motivated!
              </p>
              <div className="rc-proud-input">
                <textarea
                  placeholder="e.g., Skipped heat styling all week!"
                  value={proudMoment}
                  onChange={(e) => setProudMoment(e.target.value)}
                  maxLength={60}
                  rows={2}
                />
                <span className="rc-char-count">{proudMoment.length}/60</span>
              </div>
            </section>
          )}

          {/* Step 6: Additional Details (Original form fields) */}
          {currentStep === 6 && (
            <>
              <section className="hg-progress-section">
                <label>Additional notes (optional)</label>
                <textarea
                  placeholder="Less frizz, curls held longer, shine looked better…"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={160}
                />
              </section>

              <section className="hg-progress-section">
                <div className="hg-progress-section-header">
                  <label>Which routine steps did you complete?</label>
                  {!routineOptions.length && (
                    <span className="hg-hint">Add steps inside Routine card.</span>
                  )}
                </div>
                {routineOptions.length ? (
                  <div className="hg-routine-checklist">
                    {routineOptions.map((step) => (
                      <label key={step.id} className="hg-checkbox">
                        <input
                          type="checkbox"
                          checked={completedSteps.includes(step.id)}
                          onChange={() => toggleStep(step.id)}
                        />
                        <span>
                          {step.label}
                          {step.frequency ? ` • ${step.frequency}` : ""}
                          {step.productName ? ` • ${step.productName}` : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="hg-empty-copy">No routine steps yet.</p>
                )}
              </section>

              <section className="hg-progress-section">
                <label>Highlight product of the week (optional)</label>
                <select
                  value={highlightProductId || ""}
                  onChange={(event) => setHighlightProductId(event.target.value)}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} • {product.category}
                    </option>
                  ))}
                </select>
              </section>

              <section className="hg-progress-section">
                <label>Attach this week's photo (optional)</label>
                {photoUri ? (
                  <div className="hg-photo-preview">
                    <img src={photoUri} alt="Weekly hair" />
                    <button type="button" className="hg-btn ghost" onClick={() => setPhotoUri(null)}>
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="hg-btn ghost"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    Upload or Capture Photo
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </section>
            </>
          )}

          {error && <p className="hg-form-error">{error}</p>}

          <footer className="hg-progress-actions">
            {currentStep > 1 ? (
              <button type="button" className="hg-btn ghost" onClick={handleBack}>
                Back
              </button>
            ) : (
              <button type="button" className="hg-btn ghost" onClick={onClose}>
                Cancel
              </button>
            )}

            {currentStep < totalSteps ? (
              <button type="button" className="hg-btn primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="submit" className="hg-btn primary" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Check-In"}
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
