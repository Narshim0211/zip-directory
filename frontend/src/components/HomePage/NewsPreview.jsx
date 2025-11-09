import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const NewsPreview = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/news/latest?limit=4');
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <section className="news-preview" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ margin: 0 }}>Latest in Beauty & Style</h2>
      <p style={{ color: '#5b6470', marginTop: 6 }}>Stay inspired with trending hairstyles, salon ideas, and beauty hacks.</p>
      {loading ? (
        <div style={{ height: 140, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {items.map((n) => (
            <a key={n._id} href={`/news/${n._id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg,#eef2ff,#ffffff)' }}>
                {n.imageUrl && (
                  <div style={{ height: 140, background: `url(${n.imageUrl}) center/cover` }} />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>{n.summary || ''}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default NewsPreview;




