import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StyleBoardCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ imageUrl: '', note: '', tags: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/styles/my');
      setItems(data || []);
    } catch (e) {
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/styles', {
        imageUrl: form.imageUrl,
        note: form.note,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setForm({ imageUrl: '', note: '', tags: '' });
      await load();
    } catch (e) {
      alert((e.response && e.response.data && e.response.data.message) || 'Failed to save style');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this inspiration?')) return;
    try {
      await api.delete(`/styles/${id}`);
      await load();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Style Inspiration</div>
          <div className="panel-sub">Save looks you love</div>
        </div>
      </div>

      <form onSubmit={add} className="review-form" style={{ marginBottom: 12 }}>
        <input
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          required
        />
        <input
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <button className="btn" type="submit">Add Style</button>
      </form>

      {loading ? (
        <div className="shimmer" style={{ height: 140 }} />
      ) : error ? (
        <div className="empty">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty">No styles saved yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {items.map((item) => (
            <div key={item._id} className="card" style={{ padding: 0 }}>
              <img src={item.imageUrl} alt={item.note} style={{ width: '100%', height: 150, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 600 }}>{item.note || 'No note'}</div>
                {item.tags?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {item.tags.map((t) => (
                      <span key={t} className="chip" style={{ marginRight: 4 }}>{t}</span>
                    ))}
                  </div>
                )}
                <button className="btn outline" style={{ marginTop: 8 }} onClick={() => remove(item._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
