// BusinessProfilePage.jsx
// Renders business profile and engagement insights
import React from 'react';
import ProfileInsightBar from '../components/engagement/ProfileInsightBar';

const BusinessProfilePage = ({ ownerId }) => (
  <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
    {/* ...existing business profile content... */}
    <ProfileInsightBar ownerId={ownerId} />
  </div>
);

export default BusinessProfilePage;
