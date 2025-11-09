import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const RecentActivity = () => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [newBusinesses, setNewBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recentRes, newRes] = await Promise.all([
          api.get('/reviews/recent?limit=12'),
          api.get('/businesses/recent?limit=8'),
        ]);
        setRecentReviews(recentRes.data || []);
        setNewBusinesses(newRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Recent Activity</h1>
        <p style={{ color: '#5b6470', marginTop: 6 }}>Local highlights, new and trending businesses, and the latest buzz.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <div style={{
            border: '1px solid #c7d2fe',
            borderRadius: 16,
            background: 'linear-gradient(180deg,#eef2ff,#ffffff)',
            boxShadow: '0 16px 36px rgba(20,40,80,.10)',
            padding: 16,
            minHeight: 180,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Reviews Near You</div>
            {loading ? (
              <div style={{ height: 120, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
            ) : recentReviews.length === 0 ? (
              <div style={{ color: '#5b6470' }}>No recent reviews yet. Check back soon.</div>
            ) : (
              recentReviews.map((r) => (
                <div key={r._id} style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600 }}>{r.user?.name || 'User'}</div>
                  <div style={{ fontSize: 14, color: '#475569' }}>{r.business?.name || 'Business'} · {'⭐'.repeat(r.rating || 0)}</div>
                  <div style={{ marginTop: 4 }}>{r.comment}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{
            border: '1px solid #c7d2fe',
            borderRadius: 16,
            background: 'linear-gradient(180deg,#eef2ff,#ffffff)',
            boxShadow: '0 16px 36px rgba(20,40,80,.10)',
            padding: 16,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>New & Trending</div>
            {loading ? (
              <div style={{ height: 120, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {newBusinesses.map((b) => (
                  <div key={b._id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 10,
                    background: '#fff',
                  }}>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ color: '#475569', fontSize: 14 }}>{b.city} · {b.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <style>
        {`@keyframes sh { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}
      </style>
    </div>
  );
};

export default RecentActivity;
