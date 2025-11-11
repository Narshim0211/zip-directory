import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const FollowButton = ({ targetId, initialFollowing = false, onChange }) => {
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
        await api.delete(`/follow/unfollow/${targetId}`);
        setFollowing(false);
        onChange?.(targetId, false);
      } else {
        await api.post(`/follow/follow/${targetId}`);
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
