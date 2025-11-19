import React, { useState } from 'react';
import '../../styles/designSystem.css';

const CreateSection = ({ role, onCreatePost, onCreateSurvey }) => {
  const [content, setContent] = useState('');
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    options: ['', '']
  });
  const [mode, setMode] = useState(role === 'owner' ? 'post' : 'survey');
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onCreatePost({ content });
      setContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    if (!surveyData.title.trim()) return;

    setLoading(true);
    try {
      await onCreateSurvey(surveyData);
      setSurveyData({ title: '', description: '', options: ['', ''] });
    } catch (error) {
      console.error('Failed to create survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSurveyOption = () => {
    setSurveyData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateSurveyOption = (index, value) => {
    setSurveyData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  return (
    <div className="create-section">
      {role === 'owner' && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${mode === 'post' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('post')}
          >
            Create Post
          </button>
          <button
            className={`btn btn-sm ${mode === 'survey' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('survey')}
          >
            Create Survey
          </button>
        </div>
      )}

      {mode === 'post' ? (
        <>
          <textarea
            className="create-section__input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
          <div className="create-section__actions">
            <div />
            <button
              className="btn btn-primary"
              onClick={handleCreatePost}
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="text"
            className="create-section__input"
            placeholder="Survey question or title"
            value={surveyData.title}
            onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
            disabled={loading}
            style={{ minHeight: 'auto', marginBottom: '12px' }}
          />

          <textarea
            className="create-section__input"
            placeholder="Description (optional)"
            value={surveyData.description}
            onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
            disabled={loading}
            style={{ minHeight: '60px', marginBottom: '12px' }}
          />

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Options
            </label>
            {surveyData.options.map((option, index) => (
              <input
                key={index}
                type="text"
                className="create-section__input"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateSurveyOption(index, e.target.value)}
                disabled={loading}
                style={{ minHeight: 'auto', marginBottom: '8px' }}
              />
            ))}
            <button
              className="btn btn-secondary btn-sm"
              onClick={addSurveyOption}
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              + Add Option
            </button>
          </div>

          <div className="create-section__actions">
            <div />
            <button
              className="btn btn-primary"
              onClick={handleCreateSurvey}
              disabled={loading || !surveyData.title.trim()}
            >
              {loading ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateSection;
