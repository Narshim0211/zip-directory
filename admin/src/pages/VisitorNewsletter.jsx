import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsletterComposer from '../components/NewsletterComposer';
import Layout from '../components/layout/Layout';
import {
  createCampaign,
  sendTestEmail,
  scheduleCampaign,
} from '../api/newsletter';

const VisitorNewsletter = () => {
  const navigate = useNavigate();
  const [campaignId, setCampaignId] = useState(null);

  const handleSave = async (data) => {
    try {
      if (campaignId) {
        // Update existing campaign
        const response = await createCampaign(data);
        return response.data;
      } else {
        // Create new campaign
        const response = await createCampaign(data);
        setCampaignId(response.data._id);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSendTest = async (email) => {
    if (!campaignId) {
      // Save draft first
      throw new Error('Please save the draft first before sending a test email');
    }
    
    try {
      const response = await sendTestEmail(campaignId, email);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSchedule = async (scheduledAt) => {
    if (!campaignId) {
      throw new Error('Please save the draft first before scheduling');
    }

    try {
      const response = await scheduleCampaign(campaignId, scheduledAt);
      // Redirect to newsletter hub after scheduling
      setTimeout(() => navigate('/newsletter'), 1500);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSendNow = async () => {
    if (!campaignId) {
      throw new Error('Please save the draft first before sending');
    }

    try {
      const response = await scheduleCampaign(campaignId, null);
      // Redirect to newsletter hub after sending
      setTimeout(() => navigate('/newsletter'), 1500);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <Layout>
      <NewsletterComposer
        audience="VISITOR"
        audienceLabel="Visitor"
        audienceDescription="Create and send hair care tips, product recommendations, and glow-up guides to your visitor subscribers."
        onSave={handleSave}
        onSendTest={handleSendTest}
        onSchedule={handleSchedule}
        onSendNow={handleSendNow}
      />
    </Layout>
  );
};

export default VisitorNewsletter;
