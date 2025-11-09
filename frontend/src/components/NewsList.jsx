import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const NewsList = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, cat = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', '12');
      if (cat) params.set('category', cat);
      const { data } = await api.get(`/news?${params.toString()}`);
      setItems(data.items || []);
      setPages(data.pages || 1);
      setPage(data.page || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, category); }, [category]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>SalonHub Beauty Journal ✨</h1>
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="auth-input" style={{ maxWidth: 220 }}>
          <option value="">All</option>
          <option value="Hair">Hair</option>
          <option value="Skincare">Skincare</option>
          <option value="Men's Grooming">Men's Grooming</option>
          <option value="Trends">Trends</option>
        </select>
      </header>

      {loading ? (
        <div style={{ height: 140, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {items.map((n) => (
            <a key={n._id} href={`/news/${n._id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
              <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg,#eef2ff,#ffffff)' }}>
                {n.imageUrl && (<div style={{ height: 160, background: `url(${n.imageUrl}) center/cover` }} />)}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{n.title}</div>
                  <div style={{ color: '#475569', fontSize: 14, marginTop: 4 }}>{n.summary || ''}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="auth-btn" disabled={page<=1} onClick={()=>load(page-1, category)}>Prev</button>
        <div style={{ alignSelf: 'center' }}>Page {page} of {pages}</div>
        <button className="auth-btn" disabled={page>=pages} onClick={()=>load(page+1, category)}>Next</button>
      </div>

      <style>{`@keyframes sh { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
};

export default NewsList;