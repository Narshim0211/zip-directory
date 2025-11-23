import React, { useState } from "react";
import followService from "../services/followService";

export default function FollowButton({ targetId, type, initialFollowing = false }) {
  const [following, setFollowing] = useState(initialFollowing);

  const handleClick = async () => {
    try {
      if (following) {
        await followService.unfollow(targetId, type);
      } else {
        await followService.follow(targetId, type);
      }
      setFollowing(!following);
    } catch (error) {
      console.error("follow toggle failed:", error);
    }
  };

  return (
    <button className={`follow-button ${following ? "follow-button--active" : ""}`} onClick={handleClick}>
      {following ? "Following" : "Follow"}
    </button>
  );
}
