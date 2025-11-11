import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const categories = [
  { value: 'length', label: 'Hair length' },
  { value: 'color', label: 'Color' },
  { value: 'style', label: 'Style' },
  { value: 'beard', label: 'Beard' },
  { value: 'skin', label: 'Skin' },
  { value: 'nails', label: 'Nails' },
  { value: 'other', label: 'Other' },
];

export default function HairGoalsCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'other', targetDate: '', notes: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/goals/my');
      setItems(data || []);
    } catch (e) {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', form);
      setForm({ title: '', category: 'other', targetDate: '', notes: '' });
      setShowAdd(false);
      await load();
    } catch (e) {
      alert((e && e.response && e.response.data && e.response.data.message) || 'Failed to add goal');
    }
  };

  const update = async (id, patch) => {
    try {
      await api.put(`/goals/${id}`, patch);
      await load();
    } catch (e) {
      alert('Failed to update');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); await load(); } catch (e) { alert('Failed to delete'); }
  };

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">My Hair Goals</div>
          <div className="panel-sub">Track progress and keep notes</div>
        </div>
        <button className="btn outline" onClick={()=>setShowAdd(v=>!v)}>{showAdd ? 'Close' : 'Add Goal'}</button>
      </div>

      {showAdd && (
        <form onSubmit={add} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, marginBottom:12 }}>
          <input placeholder="Goal title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} required />
          <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})}>
            {categories.map(c=> <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input type="date" value={form.targetDate} onChange={(e)=>setForm({...form, targetDate:e.target.value})} />
          <button className="btn" type="submit">Save</button>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} style={{ gridColumn:'1 / -1', minHeight:60 }} />
        </form>
      )}

      {loading ? (
        <div className="shimmer" style={{ height: 100 }} />
      ) : error ? (
        <div className="empty">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty">No goals yet. Add your first goal!</div>
      ) : (
        <div className="cards">
          {items.map((g)=> (
            <div key={g._id} className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">{g.title}</div>
                  <div className="card-sub">{g.category} {g.targetDate ? `· target ${new Date(g.targetDate).toLocaleDateString()}` : ''}</div>
                </div>
                <span className="chip">{g.status}</span>
              </div>
              {g.notes && <div className="card-body">{g.notes}</div>}
              <div className="card-actions">
                {g.status !== 'completed' ? (
                  <button className="btn" onClick={()=>update(g._id, { status:'completed' })}>Mark complete</button>
                ) : (
                  <button className="btn outline" onClick={()=>update(g._id, { status:'active' })}>Mark active</button>
                )}
                <button className="btn outline" onClick={()=>{
                  const note = window.prompt('Update notes', g.notes || '');
                  if (note !== null) update(g._id, { notes: note });
                }}>Edit</button>
                <button className="btn outline" onClick={()=>remove(g._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
