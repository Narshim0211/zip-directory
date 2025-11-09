import React, { useEffect, useState } from "react";
import api from "../api/axios";

// Shared News Feed component used across Home, Visitor, and Owner dashboards
const NewsFeed = ({ limit = 10, className = "" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/news/latest?limit=${encodeURIComponent(limit)}`);
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError("Failed to load News Feed");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [limit]);

  return (
    <section className={className} style={{ maxWidth: 1100, margin: "32px auto", padding: "0 16px" }}>
      <h2 style={{ margin: 0, textAlign: "center" }}>📰 News Feed</h2>
      <p style={{ color: "#5b6470", marginTop: 6, textAlign: "center" }}>Beauty tips, trends, and platform updates</p>
      {loading ? (
        <div style={{ height: 140, background: "linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)", backgroundSize: "200% 100%", borderRadius: 12, animation: "sh 1.2s linear infinite" }} />
      ) : error ? (
        <div style={{ color: "#b91c1c", textAlign: "center" }}>{error}</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#5b6470", textAlign: "center" }}>No news yet.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {items.map((n) => (
            <a key={n._id} href={`/news/${n._id}`} style={{ textDecoration: "none", color: "#0f172a" }}>
              <div style={{ border: "1px solid #c7d2fe", borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg,#eef2ff,#ffffff)", boxShadow: "0 10px 24px rgba(20,40,80,.10)" }}>
                {n.imageUrl && (
                  <div style={{ height: 140, backgroundImage: `url(${n.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" }} />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>{n.summary || ""}</div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>{new Date(n.createdAt || n.updatedAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsFeed;

