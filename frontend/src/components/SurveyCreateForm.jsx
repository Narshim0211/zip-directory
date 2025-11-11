import React, { useState } from 'react';
import api from '../api/axios';

const INITIAL_OPTIONS = ['', '', ''];
const CATEGORIES = ['Hair', 'Skin', 'Makeup', 'Nails', 'Spa', 'General'];

const SurveyCreateForm = ({ onCreated, apiClient = api, endpoint = '/surveys' }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [expiresAt, setExpiresAt] = useState('');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('');

  const handleOptionChange = (index, value) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? value : opt)));
  };

  const addOption = () => setOptions((prev) => [...prev, '']);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving...');
    try {
      const payload = {
        question,
        options,
        expiresAt: expiresAt || undefined,
        category,
      };
      await apiClient.post(endpoint, payload);
      setQuestion('');
      setOptions([...INITIAL_OPTIONS]);
      setExpiresAt('');
      setStatus('Survey created!');
      onCreated?.();
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Failed to create survey');
    }
  };

  return (
    <form className="survey-create" onSubmit={handleSubmit}>
      <h3>Create a survey</h3>
      <label>
        Question
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} required rows={2} />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>
      <div className="survey-create__options">
        {options.map((option, index) => (
          <label key={index}>
            Option {index + 1}
            <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} required />
          </label>
        ))}
      </div>
      <button type="button" className="btn outline" onClick={addOption} disabled={options.length >= 6}>
        Add option
      </button>
      <label>
        Expires at
        <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </label>
      <button className="btn" type="submit">
        Post survey
      </button>
      {status && <p className="survey-create__status">{status}</p>}
    </form>
  );
};

export default SurveyCreateForm;
