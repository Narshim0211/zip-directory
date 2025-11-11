import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const TrendingNews = ({ className = "" }) => {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/news?page=${pageNumber}&limit=15`);
        const items = Array.isArray(data.items) ? data.items : [];
        setNews((prev) => (pageNumber === 1 ? items : [...prev, ...items]));
        setHasMore(items.length === 15);
      } catch (err) {
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNews(1);
  }, [fetchNews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  return (
    <section className={className} style={{ background: "#fff", borderRadius: 14, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Trending Beauty News 💄</h2>
        <p style={{ margin: "6px 0", color: "#4b5563", fontSize: 13 }}>Fresh gloss, hair, makeup, and spa stories.</p>
      </div>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div className="owner-business__feed-grid">
        {news.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="owner-business__feed-card"
            style={{ boxShadow: "none", background: "#0f172a" }}
          >
            <div className="owner-business__feed-badge">{item.category}</div>
            <h3 style={{ fontSize: 16 }}>{item.title}</h3>
            <p style={{ color: "#dbeafe" }}>{item.description}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: "auto" }}>
              {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          style={{
            marginTop: 16,
            background: "#eef2ff",
            borderRadius: 10,
            border: "1px solid #c7d2fe",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Load more news ↓"}
        </button>
      )}

      {loading && !hasMore && <p style={{ marginTop: 12, color: "#94a3b8" }}>Loading...</p>}
    </section>
  );
};

export default TrendingNews;
