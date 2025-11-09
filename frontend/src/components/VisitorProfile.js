import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../api';
import api from '../api/axios';
import NewsFeed from './NewsFeed';

const VisitorProfile = () => {
  const [me, setMe] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: user }, { data: all }] = await Promise.all([
          API.get('/auth/me'),
          api.get('/businesses'),
        ]);
        setMe(user);
        setBusinesses(all || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const favorites = useMemo(() => {
    if (!me?.favorites?.length) return [];
    const favSet = new Set(me.favorites.map(String));
    return businesses.filter((b) => favSet.has(String(b._id)));
  }, [me, businesses]);

  if (loading) return null;
  if (!me) return <div style={{ padding: 24 }}>Failed to load profile.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Profile</h1>
        <p style={{ color: '#5b6470', marginTop: 6 }}>{me.name} · {me.email} · {me.role}</p>
      </header>
      {/* Discovery search */}
      <section style={{
        border: '1px solid #c7d2fe',
        borderRadius: 16,
        background: 'linear-gradient(180deg,#eef2ff,#ffffff)',
        boxShadow: '0 16px 36px rgba(20,40,80,.10)',
        padding: 16,
        marginBottom: 20,
        textAlign: 'center'
      }}>
        <h2 style={{ marginTop: 0 }}>Find Your Perfect Salon or Stylist ✂️️</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 140px', gap: 10 }}>
          <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Enter your city" className="auth-input" />
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="auth-input">
            <option value="">All</option>
            <option value="Salon">Salon</option>
            <option value="Freelance Stylist">Hair Stylist</option>
            <option value="Barbershop">Barbershop</option>
            <option value="Spa">Spa</option>
          </select>
          <button className="auth-btn" onClick={async()=>{
            const params = new URLSearchParams();
            if (city) params.set('city', city);
            if (category) params.set('category', category);
            try {
              const { data } = await api.get(`/businesses/search?${params.toString()}`);
              setResults(Array.isArray(data)?data:[]);
            } catch (e) { console.error(e); setResults([]); }
          }}>Search</button>
        </div>
        {/* In-page results */}
        <div style={{ marginTop: 16 }}>
          {results.length === 0 ? (
            <div style={{ color:'#5b6470' }}>No salons found yet.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>
              {results.map((s)=>(
                <div key={s._id} style={{ border:'1px solid #c7d2fe', borderRadius:12, padding:12, background:'#fff' }}>
                  <div style={{ fontWeight:700 }}>{s.name}</div>
                  <div style={{ color:'#475569' }}>{s.city} · {s.category}</div>
                  <div style={{ color:'#f59e0b', marginTop:6 }}>⭐ {(s.ratingAverage ?? s.rating ?? 0).toFixed ? (s.ratingAverage ?? s.rating ?? 0).toFixed(1) : (s.ratingAverage ?? s.rating ?? 0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Saved Favorites</h2>
        {favorites.length === 0 ? (
          <div style={{ color: '#5b6470' }}>No favorites yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
            {favorites.map((b) => (
              <div key={b._id} style={{
                border: '1px solid #c7d2fe',
                borderRadius: 12,
                padding: 12,
                background: 'linear-gradient(180deg,#eef2ff,#ffffff)',
                boxShadow: '0 10px 24px rgba(20,40,80,.10)'
              }}>
                <div style={{ fontWeight: 700 }}>{b.name}</div>
                <div style={{ color: '#475569', fontSize: 14 }}>{b.city} · {b.category}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* News feed */}
      <NewsFeed limit={8} />
      {/* Optional: keep personal sections below discovery */}
      <UserReviews userId={me._id} />
    </div>
  );
};

export default VisitorProfile;

// Inline child component to render user's reviews
const UserReviews = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Your Reviews</h2>
      {loading ? (
        <div style={{ height: 100, background: 'linear-gradient(90deg,#f5f7ff,#eef2ff,#f5f7ff)', backgroundSize: '200% 100%', borderRadius: 12, animation: 'sh 1.2s linear infinite' }} />
      ) : items.length === 0 ? (
        <div style={{ color: '#5b6470' }}>You haven't written any reviews yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((r) => (
            <div key={r._id} style={{ border: '1px solid #c7d2fe', borderRadius: 12, padding: 12, background: 'linear-gradient(180deg,#eef2ff,#ffffff)' }}>
              <div style={{ fontWeight: 600 }}>{r.business?.name || 'Business'}</div>
              <div style={{ fontSize: 14, color: '#475569' }}>{r.business?.city} · {r.business?.category}</div>
              <div style={{ marginTop: 6 }}>{'*'.repeat(Math.max(1, Math.round(r.rating || 0)))}</div>
              <div style={{ marginTop: 6 }}>{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// Inline news preview (latest 4)
const NewsInline = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/news/latest?limit=4');
        setItems(data || []);
      } catch (e) {}
    })();
  }, []);
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Latest Beauty News</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        {items.map((n) => (
          <a key={n._id} href={`/news/${n._id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
            <div style={{ border: '1px solid #c7d2fe', borderRadius: 12, background: 'linear-gradient(180deg,#eef2ff,#ffffff)' }}>
              {n.imageUrl && (
                <div style={{ height: 120, backgroundImage: `url(${n.imageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
              )}
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{n.title}</div>
                <div style={{ color: '#475569', fontSize: 14 }}>{n.summary || ''}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

// Inline recent reviews
const RecentReviewsInline = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/reviews/recent?limit=8');
        setItems(data || []);
      } catch (e) {}
    })();
  }, []);
  return (
    <section style={{ marginTop: 22 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Activity</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((r) => (
          <div key={r._id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, background: '#fff' }}>
            <div style={{ fontWeight: 600 }}>{r.user?.name || 'User'}</div>
            <div style={{ fontSize: 14, color: '#475569' }}>{r.business?.name || 'Business'} - {'*'.repeat(Math.max(1, Math.round(r.rating || 0)))}</div>
            <div style={{ marginTop: 4 }}>{r.comment}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
