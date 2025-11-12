import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const FollowButton = ({ targetId, targetType, initialFollowing = false, onChange }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        // call v1 profile endpoints when targetType provided
        if (targetType === 'owner') {
          await api.delete(`/v1/owner-profiles/${targetId}/follow`);
        } else if (targetType === 'visitor') {
          await api.delete(`/v1/visitor-profiles/${targetId}/follow`);
        } else {
          await api.delete(`/follow/unfollow/${targetId}`);
        }
        setFollowing(false);
        onChange?.(targetId, false);
      } else {
        if (targetType === 'owner') {
          await api.post(`/v1/owner-profiles/${targetId}/follow`);
        } else if (targetType === 'visitor') {
          await api.post(`/v1/visitor-profiles/${targetId}/follow`);
        } else {
          await api.post(`/follow/follow/${targetId}`);
        }
        setFollowing(true);
        onChange?.(targetId, true);
      }
    } catch (error) {
      console.error('Follow error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={`btn ${following ? 'outline' : ''}`} type="button" onClick={toggle} disabled={loading}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
