import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import SurveyCard from './SurveyCard';
import NewsArticleCard from './NewsArticleCard';

const NewsFeed = ({ limit = 10, className = '' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/feed?limit=${encodeURIComponent(limit)}`);
        if (!mounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError('Failed to load feed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  const handleVoteUpdate = (updated) => {
    const updatedId = updated.id || updated._id;
    setItems((prev) =>
      prev.map((item) =>
        item.type === 'survey' && (item.id === updatedId || item._id === updatedId)
          ? { ...item, ...updated, type: 'survey', options: updated.options }
          : item
      )
    );
  };

  return (
    <section
      className={className}
      style={{
        maxWidth: 1100,
        margin: '32px auto',
        padding: '0 16px',
        display: 'grid',
        gap: 20,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>SalonHub Feed</h2>
        <p style={{ color: '#5b6470', marginTop: 6 }}>Community surveys and beauty news</p>
      </div>

      {loading ? (
        <div style={{ height: 200, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', borderRadius: 16 }} />
      ) : error ? (
        <div style={{ color: '#b91c1c', textAlign: 'center' }}>{error}</div>
      ) : items.length === 0 ? (
        <div style={{ color: '#5b6470', textAlign: 'center' }}>Nothing new yet. Check back soon!</div>
      ) : (
        <div
          className="grid-feed"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}
        >
          {items.map((item) =>
            item.type === 'survey' ? (
              <SurveyCard key={`survey-${item.id}`} survey={item} onVote={handleVoteUpdate} />
            ) : (
              <NewsArticleCard key={`news-${item.id}`} article={item} />
            )
          )}
        </div>
      )}
    </section>
  );
};

export default NewsFeed;
