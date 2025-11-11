import React from "react";
import FollowButton from "./FollowButton";

export default function FeedPostCard({ post, followingOwners = [] }) {
  const isFollowing = Boolean(followingOwners.find((owner) => String(owner._id) === String(post.author?._id)));

  return (
    <article className="feed-card">
      <header className="feed-card__header">
        <div>
          <h3>{post.author?.name || "Salon"} </h3>
          <p>{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        <FollowButton targetId={post.author?._id} type="owner" initialFollowing={isFollowing} />
      </header>
      <p className="feed-card__content">{post.content}</p>
      {post.media?.length > 0 && (
        <div className="feed-card__media">
          <img src={post.media[0]} alt="post media" />
        </div>
      )}
    </article>
  );
}
