import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/hairGoalsDiary.css";

const FEELING_OPTIONS = [
  { value: 1, label: "Dry", emoji: "😞" },
  { value: 2, label: "Okay", emoji: "🙂" },
  { value: 3, label: "Soft", emoji: "😊" },
  { value: 4, label: "Healthier", emoji: "😍" },
  { value: 5, label: "Amazing", emoji: "🔥" }
];

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
  existingEntry
}) {
  const [hairFeeling, setHairFeeling] = useState(3);
  const [note, setNote] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [highlightProductId, setHighlightProductId] = useState("");
  const [photoUri, setPhotoUri] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setHairFeeling(existingEntry?.hairFeeling || 3);
    setNote(existingEntry?.progressNote || "");
    setCompletedSteps(ensureArray(existingEntry?.completedSteps));
    setHighlightProductId(existingEntry?.highlightProductId || "");
    setPhotoUri(defaultPhoto || existingEntry?.photoUri || null);
    setError(null);
  }, [isOpen, existingEntry, defaultPhoto]);

  const routineOptions = useMemo(
    () =>
      routineSteps.map((step) => ({
        id: step.id || step.step,
        label: step.step,
        frequency: step.frequency,
        productName: step.productName
      })),
    [routineSteps]
  );

  if (!isOpen) return null;

  const toggleStep = (id) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hairFeeling) {
      setError("Select how your hair felt this week.");
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
        hairFeeling,
        progressNote: note.trim(),
        completedSteps,
        highlightProductId: highlightProductId || null,
        highlightProductName: productMatch?.name || null,
        photoUri: photoUri || null,
        date: new Date().toISOString()
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

  return (
    <div className="hgd-modal-overlay" onClick={onClose}>
      <div
        className="hgd-modal-content progress"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hgd-modal-header">
          <div>
            <p className="hgd-modal-eyebrow">Week {weekNumber || "—"}</p>
            <h3>Weekly Progress Check-In</h3>
            <p>Quick reflection to capture how your glow-up felt this week.</p>
          </div>
          <button className="hg-btn icon" onClick={onClose} aria-label="Close progress modal">
            ✕
          </button>
        </header>

        <form className="hg-progress-form" onSubmit={handleSubmit}>
          <section className="hg-progress-section">
            <label>How did your hair feel?</label>
            <div className="hg-feeling-options">
              {FEELING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  className={`hg-feeling-chip${hairFeeling === option.value ? " selected" : ""}`}
                  onClick={() => setHairFeeling(option.value)}
                >
                  <span>{option.emoji}</span>
                  <small>{option.label}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="hg-progress-section">
            <label>What changed or improved?</label>
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
              {!routineOptions.length && <span className="hg-hint">Add steps inside Routine card.</span>}
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
            <label>Any product that worked especially well?</label>
            <select
              value={highlightProductId || ""}
              onChange={(event) => setHighlightProductId(event.target.value)}
            >
              <option value="">Select a product (optional)</option>
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
              <button type="button" className="hg-btn ghost" onClick={() => photoInputRef.current?.click()}>
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

          {error && <p className="hg-form-error">{error}</p>}

          <footer className="hg-progress-actions">
            <button type="button" className="hg-btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="hg-btn primary" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Weekly Progress"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
