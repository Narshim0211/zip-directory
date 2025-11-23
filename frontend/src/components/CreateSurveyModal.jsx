import React, { useState } from 'react';
import '../styles/createSurveyModal.css';

const CreateSurveyModal = ({ isOpen, onClose, onSubmit, role }) => {
  const [surveyType, setSurveyType] = useState('poll'); // 'poll' or 'love-only'
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [imageUrl, setImageUrl] = useState('');
  const [authorNote, setAuthorNote] = useState('');
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

  const handleSurveyTypeChange = (type) => {
    setSurveyType(type);
    // Reset fields when switching types
    if (type === 'love-only') {
      setOptions(['', '']); // Love-only doesn't need options
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    // Build survey data based on type
    const surveyData = {
      question: question.trim(),
      surveyType
    };

    if (surveyType === 'poll') {
      // Traditional poll validation
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }
      surveyData.options = validOptions.map(opt => ({ text: opt.trim() }));
    } else {
      // Love-only survey fields
      if (imageUrl.trim()) {
        surveyData.imageUrl = imageUrl.trim();
      }
      if (authorNote.trim()) {
        surveyData.authorNote = authorNote.trim();
      }
      // Love-only surveys don't have options - they only have a Love button
      surveyData.options = []; // Empty array
    }

    setLoading(true);
    try {
      await onSubmit(surveyData);

      // Reset form
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSurveyType('poll');
    setQuestion('');
    setOptions(['', '']);
    setImageUrl('');
    setAuthorNote('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
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
          {/* Survey Type Selector */}
          <div className="form-group">
            <label>Survey Type</label>
            <div className="survey-type-selector">
              <button
                type="button"
                className={`survey-type-btn ${surveyType === 'poll' ? 'active' : ''}`}
                onClick={() => handleSurveyTypeChange('poll')}
                disabled={loading}
              >
                📊 Poll
                <span className="survey-type-desc">Multiple choice voting</span>
              </button>
              <button
                type="button"
                className={`survey-type-btn ${surveyType === 'love-only' ? 'active' : ''}`}
                onClick={() => handleSurveyTypeChange('love-only')}
                disabled={loading}
              >
                ❤️ Love-Only
                <span className="survey-type-desc">Single Love button</span>
              </button>
            </div>
          </div>

          {/* Question */}
          <div className="form-group">
            <label htmlFor="question">Question</label>
            <input
              id="question"
              type="text"
              className="form-input"
              placeholder={surveyType === 'poll' ? "What's your question?" : "What do you want people to love?"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              disabled={loading}
            />
            <span className="char-count">{question.length}/200</span>
          </div>

          {/* Poll-specific: Options */}
          {surveyType === 'poll' && (
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
          )}

          {/* Love-only specific: Image URL */}
          {surveyType === 'love-only' && (
            <>
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input
                  id="imageUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                />
                <span className="field-hint">Add a visual to your Love survey</span>
              </div>

              <div className="form-group">
                <label htmlFor="authorNote">Your Note (optional)</label>
                <textarea
                  id="authorNote"
                  className="form-textarea"
                  placeholder="Add a personal note that appears after someone Loves your survey..."
                  value={authorNote}
                  onChange={(e) => setAuthorNote(e.target.value)}
                  maxLength={280}
                  rows={3}
                  disabled={loading}
                />
                <span className="char-count">{authorNote.length}/280</span>
              </div>
            </>
          )}

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
              {loading ? 'Creating...' : `Create ${surveyType === 'poll' ? 'Poll' : 'Love Survey'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSurveyModal;
