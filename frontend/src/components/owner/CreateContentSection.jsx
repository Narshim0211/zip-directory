import React, { useState } from 'react';
import CreateSurveyModal from '../CreateSurveyModal';
import CreatePostModal from './CreatePostModal';
import v1Client from '../../api/v1';
import './CreateContentSection.css';

/**
 * CreateContentSection Component
 * Provides UI for owners to create surveys and posts
 */
const CreateContentSection = ({ onContentCreated }) => {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  const handleSurveySubmit = async (surveyData) => {
    try {
      await v1Client.owner.surveys.create({
        question: surveyData.question,
        options: surveyData.options.map((opt, index) => ({
          id: `opt-${index}`,
          label: opt.text
        })),
        visibility: 'public'
      });
      
      setShowSurveyModal(false);
      if (onContentCreated) {
        onContentCreated('survey');
      }
    } catch (err) {
      console.error('Failed to create survey:', err);
      throw err;
    }
  };

  const handlePostCreated = () => {
    setShowPostModal(false);
    if (onContentCreated) {
      onContentCreated('post');
    }
  };

  return (
    <>
      <div className="create-content-section">
        <h2 className="create-content-section__title">Create Content</h2>
        <p className="create-content-section__subtitle">
          Share your thoughts, ask questions, or engage with the community
        </p>
        
        <div className="create-content-section__buttons">
          <button 
            className="create-btn create-btn--survey"
            onClick={() => setShowSurveyModal(true)}
          >
            <span className="create-btn__icon">📊</span>
            <div className="create-btn__text">
              <span className="create-btn__label">Create Survey</span>
              <span className="create-btn__description">Ask your community</span>
            </div>
          </button>

          <button 
            className="create-btn create-btn--post"
            onClick={() => setShowPostModal(true)}
          >
            <span className="create-btn__icon">✍️</span>
            <div className="create-btn__text">
              <span className="create-btn__label">Create Post</span>
              <span className="create-btn__description">Share an update</span>
            </div>
          </button>
        </div>
      </div>

      <CreateSurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmit={handleSurveySubmit}
        role="owner"
      />

      {showPostModal && (
        <CreatePostModal
          onClose={() => setShowPostModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default CreateContentSection;
