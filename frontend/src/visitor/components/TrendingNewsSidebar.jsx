import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function TrendingNewsSidebar() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/news")
      .then((response) => {
        if (!mounted) return;
        setNews(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch news:", err.message);
        if (!mounted) return;
        setError("Unable to load news");
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="trending-news-panel">
      <h2>Trending News 📰</h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading news...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : news.length === 0 ? (
        <p className="text-gray-400 text-sm">No trending news available.</p>
      ) : (
        <div className="trending-news-panel__list">
          {news.map((article, index) => (
            <a
              key={article.url || index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="trending-news-panel__item"
            >
              <img
                src={article.imageUrl || "/placeholder.jpg"}
                alt={article.title || "Trending news"}
                className="trending-news-panel__thumb"
              />
              <div>
                <h3 className="trending-news-panel__title">{article.title}</h3>
                <p className="trending-news-panel__meta">
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
