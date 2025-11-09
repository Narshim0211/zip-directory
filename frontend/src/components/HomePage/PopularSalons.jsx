import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const PopularSalons = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        // Use trending endpoint as a proxy for popularity
        const { data } = await api.get('/businesses/trending?limit=6');
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ margin: 0 }}>Popular Near You</h2>
      <p style={{ color: '#5b6470', marginTop: 6 }}>Top rated and most reviewed salons around you.</p>
      {loading ? (
        <div style={{ height: 140, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {items.map((b) => (
            <a key={b._id} href={`/business/${b._id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, background: 'linear-gradient(180deg,#eef2ff,#ffffff)', padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: 14, color: '#475569' }}>{b.city} · {b.category}</div>
                <div style={{ marginTop: 6, fontSize: 14 }}>⭐ {Number(b.ratingAverage || 0).toFixed(1)} ({b.ratingsCount || 0})</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularSalons;

