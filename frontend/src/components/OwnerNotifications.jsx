import React, { useEffect, useState } from "react";
import ownerApi from "../api/owner";
import "../styles/ownerNotifications.css";

const OwnerNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await ownerApi.get("/notifications");
      setItems(data.items || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await ownerApi.post(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Unable to mark read", error);
    }
  };

  return (
    <section className="owner-notifications">
      <header>
        <h1>Notifications</h1>
        <p>Track reviews, follower requests, and survey replies.</p>
      </header>
      <div className="owner-notifications__list">
        {loading ? (
          <p>Loading notifications…</p>
        ) : items.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          items.map((item) => (
            <article key={item._id} className={`notification-card${item.read ? "" : " unread"}`}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message || "Tap to open"}</p>
              </div>
              <button type="button" onClick={() => markRead(item._id)}>
                Mark read
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default OwnerNotifications;
