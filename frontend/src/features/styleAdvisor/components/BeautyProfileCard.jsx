import React, { useEffect, useMemo, useState } from "react";
import { getProfile, saveProfile } from "../../../api/styleAdvisorApi";

const FIELDS = [
  { name: "hairType", label: "Hair Type", type: "select", options: ["Straight", "Wavy", "Curly", "Coily"] },
  { name: "hairLength", label: "Hair Length", type: "select", options: ["Pixie", "Bob", "Shoulder", "Long"] },
  { name: "skinTone", label: "Skin Tone", type: "select", options: ["Fair", "Medium", "Olive", "Deep"] },
  { name: "styleGoal", label: "Style Goal", type: "select", options: ["Low Maintenance", "High Glam", "Protective", "Grow Out"] },
  { name: "budget", label: "Monthly Beauty Budget", type: "select", options: ["<$100", "$100-$200", "$200-$400", "$400+"] },
  { name: "maintenance", label: "Minutes per day", type: "select", options: ["<10", "10-20", "20-40", "40+"] },
];

export default function BeautyProfileCard() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await getProfile();
        if (data.profile) {
          setForm(data.profile);
        }
        setError("");
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(message || "We couldn't load your style profile, but you can still use the tools.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const disabled = useMemo(() => saving, [saving]);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setSuccess("");
      setError("");
      const payload = {};
      FIELDS.forEach(({ name }) => {
        payload[name] = form[name] || "";
      });
      const { data } = await saveProfile(payload);
      setForm(data.profile || payload);
      setSuccess("Profile saved. Your chats now feel more personal.");
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="style-card">
      <div>
        <h3>Beauty Profile</h3>
        <p>Save lightweight preferences so every AI response feels personal.</p>
      </div>

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <form onSubmit={handleSubmit} className="style-profile-form">
          <div className="style-profile-grid">
            {FIELDS.map((field) => (
              <label key={field.name} className="form-label">
                {field.label}
                <select
                  value={form[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">Select</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="style-card__actions">
            <button type="submit" className="btn btn-primary" disabled={disabled}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="style-card__error">{error}</div>}
      {success && <div className="style-card__success">{success}</div>}
    </section>
  );
}
