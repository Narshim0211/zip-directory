import React, { useState } from 'react';
import '../styles/createSurveyModal.css';

const CreateSurveyModal = ({ isOpen, onClose, onSubmit, role }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        question: question.trim(),
        options: validOptions.map(opt => ({ text: opt.trim() }))
      });
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setQuestion('');
      setOptions(['', '']);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Survey</h2>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">Question</label>
            <input
              id="question"
              type="text"
              className="form-input"
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              disabled={loading}
            />
            <span className="char-count">{question.length}/200</span>
          </div>

          <div className="form-group">
            <label>Options (2-6)</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  maxLength={100}
                  disabled={loading}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn-remove-option"
                    onClick={() => handleRemoveOption(index)}
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 6 && (
              <button
                type="button"
                className="btn-add-option"
                onClick={handleAddOption}
                disabled={loading}
              >
                + Add Option
              </button>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSurveyModal;
