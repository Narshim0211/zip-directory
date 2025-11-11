import React, { useState } from 'react';
import api from '../api/axios';

export default function AIAdvisorCard() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/ai/advice', { question: question.trim() });
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch (e) {
      setError('Could not generate advice right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">AI Style Advisor</div>
          <div className="panel-sub">Ask for suggestions based on your goals and saved looks</div>
        </div>
      </div>

      <form onSubmit={ask} style={{ display: 'grid', gap: 8 }}>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Tell the advisor what you want (e.g. low-maintenance curly cut)"
          required
        />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Get Suggestions'}</button>
      </form>

      {error && <div className="empty" style={{ marginTop: 8 }}>{error}</div>}
      {suggestions.length > 0 && (
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          {suggestions.map((s, idx) => (
            <li key={`${s}-${idx}`} style={{ marginBottom: 6 }}>{s}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
