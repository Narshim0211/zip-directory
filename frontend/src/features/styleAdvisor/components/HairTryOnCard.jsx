import React, { useMemo, useState } from "react";
import { hairTryOn } from "../../../api/styleAdvisorApi";

const STYLES = [
  { id: "long-layers", label: "Long Layers" },
  { id: "bob-cut", label: "Modern Bob" },
  { id: "curtain-bangs", label: "Curtain Bangs" },
  { id: "balayage", label: "Soft Balayage" },
  { id: "pixie", label: "Textured Pixie" },
];

export default function HairTryOnCard() {
  const [photo, setPhoto] = useState(null);
  const [styleId, setStyleId] = useState(STYLES[0].id);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disableSubmit = useMemo(() => !photo || !styleId || loading, [photo, styleId, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disableSubmit) return;
    const formData = new FormData();
    formData.append("styleId", styleId);
    formData.append("photo", photo);
    try {
      setLoading(true);
      setError("");
      const { data } = await hairTryOn(formData);
      setPreviewUrl(data.imageUrl);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.code || err.message;
      setError(message || "We couldn't generate this hair look. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="style-card">
      <div>
        <h3>AI Hair Try-On</h3>
        <p>Upload a selfie and preview curated hairstyles instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="style-form">
        <label className="form-label">
          Choose a style
          <select value={styleId} onChange={(e) => setStyleId(e.target.value)}>
            {STYLES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Upload selfie
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </label>

        <div className="style-card__actions">
          <button type="submit" className="btn btn-primary" disabled={disableSubmit}>
            {loading ? "Generating..." : "Generate Look"}
          </button>
        </div>
      </form>

      {error && <div className="style-card__error">{error}</div>}

      <div className="style-card__result">
        {previewUrl ? (
          <img src={previewUrl} alt="Hair try-on result" className="style-card__preview" />
        ) : (
          <p>Results will appear here. Clear, well-lit photos work best.</p>
        )}
      </div>
    </section>
  );
}
