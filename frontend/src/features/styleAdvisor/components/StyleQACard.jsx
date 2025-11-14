import React, { useState } from "react";
import { askQuestion } from "../../../api/styleAdvisorApi";

export default function StyleQACard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    try {
      setLoading(true);
      setError("");
      setAnswer("");
      const { data } = await askQuestion({ question: question.trim() });
      setAnswer(data.answer);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message || "Our AI stylist is busy right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="style-card">
      <div>
        <h3>AI Style Q&A</h3>
        <p>Ask anything—cuts, colors, outfit pairings—and get human-sounding advice.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          rows={4}
          placeholder="Example: Will a bob flatter my face shape? What nail shade matches olive skin?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <div className="style-card__actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Thinking..." : "Ask Stylist"}
          </button>
        </div>
      </form>

      {error && <div className="style-card__error">{error}</div>}
      {answer && <div className="style-card__success">{answer}</div>}
    </section>
  );
}
