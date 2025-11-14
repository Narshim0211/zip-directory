import React, { useEffect, useState } from "react";
import { API } from "../api";
import api from "../api/axios";
import HairGoalsCard from "./HairGoalsCard";
import StyleBoardCard from "./StyleBoardCard";
import PersonalizedNewsFeed from "./PersonalizedNewsFeed";
import "../styles/visitorProfile.css";

const VisitorProfile = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: user } = await API.get("/auth/me");
        setMe(user);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return null;
  if (!me) return <div className="visitor-profile-page__fallback">Failed to load profile.</div>;

  return (
    <div className="visitor-profile-page">
      <header className="visitor-profile-page__header">
        <h1>Profile</h1>
        <p>{`${me.name} - ${me.email} - ${me.role}`}</p>
      </header>

      <HairGoalsCard />

      <StyleBoardCard />

      <PersonalizedNewsFeed />

      <UserReviews userId={me._id} />
    </div>
  );
};

export default VisitorProfile;

// Inline child component to render user's reviews
const UserReviews = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await api.get(`/reviews/by-user/${userId}`);
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (userId) run();
  }, [userId]);

  return (
    <section className="panel visitor-profile-page__reviews">
      <div className="panel-head">
        <div>
          <div className="panel-title">Saved Reviews</div>
          <div className="panel-sub">Your feedback history</div>
        </div>
      </div>
      {loading ? (
        <div className="shimmer" style={{ height: 120 }} />
      ) : items.length === 0 ? (
        <div className="empty">You haven't written any reviews yet.</div>
      ) : (
        <div className="visitor-profile-page__reviews-grid">
          {items.map((r) => (
            <div key={r._id} className="card visitor-profile-page__review-card">
              <div className="visitor-profile-page__review-title">{r.business?.name || "Business"}</div>
              <div className="visitor-profile-page__review-meta">
                {r.business?.city} - {r.business?.category}
              </div>
              <div className="visitor-profile-page__review-rating">
                {"*".repeat(Math.max(1, Math.round(r.rating || 0)))}
              </div>
              <p className="visitor-profile-page__review-comment">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
