import React, { useMemo, useState } from "react";
import { outfitTryOn } from "../../../api/styleAdvisorApi";

const PRESETS = [
  { id: "", label: "Upload outfit" },
  { id: "evening", label: "Evening Glam" },
  { id: "streetwear", label: "Modern Streetwear" },
  { id: "business", label: "Tailored Business" },
];

export default function OutfitTryOnCard() {
  const [bodyPhoto, setBodyPhoto] = useState(null);
  const [outfitPhoto, setOutfitPhoto] = useState(null);
  const [presetId, setPresetId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disableSubmit = useMemo(
    () => !bodyPhoto || (!outfitPhoto && !presetId) || loading,
    [bodyPhoto, outfitPhoto, presetId, loading]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disableSubmit) return;
    const formData = new FormData();
    formData.append("photo", bodyPhoto);
    if (outfitPhoto) {
      formData.append("outfit", outfitPhoto);
    }
    if (presetId) {
      formData.append("presetId", presetId);
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await outfitTryOn(formData);
      setPreviewUrl(data.imageUrl);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.code || err.message;
      setError(message || "We couldn't render this outfit. Try another photo or preset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="style-card">
      <div>
        <h3>AI Outfit Try-On</h3>
        <p>Preview statement looks, from glam to casual, before committing.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label">
          Upload your photo
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setBodyPhoto(e.target.files?.[0] || null)}
          />
        </label>

        <label className="form-label">
          Outfit preset
          <select
            value={presetId}
            onChange={(e) => {
              setPresetId(e.target.value);
              if (e.target.value) {
                setOutfitPhoto(null);
              }
            }}
          >
            {PRESETS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {!presetId && (
          <label className="form-label">
            Or upload outfit image
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setOutfitPhoto(e.target.files?.[0] || null)}
            />
          </label>
        )}

        <div className="style-card__actions">
          <button type="submit" className="btn btn-primary" disabled={disableSubmit}>
            {loading ? "Rendering..." : "Render Outfit"}
          </button>
        </div>
      </form>

      {error && <div className="style-card__error">{error}</div>}

      <div className="style-card__result">
        {previewUrl ? (
          <img src={previewUrl} alt="Outfit try-on result" className="style-card__preview" />
        ) : (
          <p>Results appear here. Make sure your photo has good lighting.</p>
        )}
      </div>
    </section>
  );
}
