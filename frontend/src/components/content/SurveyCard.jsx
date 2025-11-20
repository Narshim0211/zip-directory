// SurveyCard.jsx
import React from 'react';
import SurveyEngagementBar from '../engagement/SurveyEngagementBar';

const SurveyCard = ({ survey }) => (
  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
    {/* ...existing survey content... */}
    <div style={{ fontWeight: 600 }}>{survey.title}</div>
    <div style={{ color: '#888', marginBottom: 8 }}>{survey.description}</div>
    {/* Engagement bar always visible */}
    <SurveyEngagementBar surveyId={survey._id} />
  </div>
);
export default SurveyCard;
