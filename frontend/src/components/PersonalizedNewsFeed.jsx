import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import CommentsThread from './CommentsThread';

const filters = ['All', 'Hair', 'Men', 'Women', 'Color', 'Skin', 'Nails'];

export default function PersonalizedNewsFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [openArticleId, setOpenArticleId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/articles/feed');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((item) => {
    if (activeFilter === 'All') return true;
    return (item.tags || []).some((tag) => tag?.toLowerCase().includes(activeFilter.toLowerCase()));
  });

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">For You</div>
          <div className="panel-sub">Beauty feed tailored to your goals</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button key={f} className={activeFilter === f ? 'btn' : 'btn outline'} onClick={() => setActiveFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="shimmer" style={{ height: 140 }} />
      ) : error ? (
        <div className="empty">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No personalized articles yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
          {filtered.map((article) => (
            <div key={article._id} className="card">
              {article.coverImage && (
                <div
                  style={{
                    height: 140,
                    backgroundImage: `url(${article.coverImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{article.title}</div>
                <p style={{ color: '#475569', fontSize: 14 }}>{article.summary}</p>
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(article.tags || []).map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <a className="btn outline" href={`/news/${article._id}`}>
                    Read more
                  </a>
                  <button className="btn" type="button" onClick={() => setOpenArticleId((prev) => prev === article._id ? null : article._id)}>
                    {openArticleId === article._id ? 'Hide discussion' : 'View discussion'}
                  </button>
                </div>
                {openArticleId === article._id && <CommentsThread articleId={article._id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
