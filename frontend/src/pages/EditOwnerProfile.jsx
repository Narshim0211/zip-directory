import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function EditOwnerProfile() {
  const [form, setForm] = useState({ firstName: '', lastName: '', handle: '', bio: '', avatarUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/v1/owner-profiles/me');
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          handle: data.handle || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // load businesses for featured selection
  const [businesses, setBusinesses] = useState([]);
  const [selectedFeatured, setSelectedFeatured] = useState([]);
  useEffect(() => {
    const loadBiz = async () => {
      try {
        // Load only businesses owned by current user
        const { data } = await api.get('/businesses/my-businesses?limit=50');
        setBusinesses(data || []);
        // if user already has featured businesses, pre-select them
        try {
          const { data: me } = await api.get('/v1/owner-profiles/me');
          setSelectedFeatured((me.featuredBusinesses || []).map(b => b._id));
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadBiz();
  }, []);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/v1/owner-profiles/me', form);
      alert('Saved');
      setForm({ firstName: data.firstName, lastName: data.lastName, handle: data.handle, bio: data.bio, avatarUrl: data.avatarUrl });
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const onFileChange = async (e, type) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const dataUrl = await fileToBase64(f);
      const base64 = dataUrl.split(',')[1];
      const { data } = await api.post('/v1/owner-profiles/me/upload', { type, base64, originalName: f.name });
      if (type === 'avatar') setForm(prev => ({ ...prev, avatarUrl: data.url }));
      else setForm(prev => ({ ...prev, headerImageUrl: data.url }));
      alert('Upload saved');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      // reset input value so same file can be re-selected
      e.target.value = null;
    }
  };

  if (loading) return <div className="shimmer" />;

  return (
    <div className="panel">
      <h2>Edit Profile</h2>
      <form onSubmit={save}>
        <label>First name</label>
        <input name="firstName" value={form.firstName} onChange={onChange} required />
        <label>Last name</label>
        <input name="lastName" value={form.lastName} onChange={onChange} required />
        <label>Handle</label>
        <input name="handle" value={form.handle} onChange={onChange} />
        <label>Avatar URL</label>
        <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} />
        <div style={{ marginTop: 8 }}>
          <label style={{ display: 'inline-block' }}>
            <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'avatar')} style={{ display: 'none' }} />
            <button type="button" disabled={uploading}>Upload Avatar</button>
          </label>
          <label style={{ display: 'inline-block', marginLeft: 8 }}>
            <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'header')} style={{ display: 'none' }} />
            <button type="button" disabled={uploading}>Upload Header</button>
          </label>
        </div>
        <label>Header Image URL</label>
        <input name="headerImageUrl" value={form.headerImageUrl || ''} onChange={onChange} />
        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={onChange} />
        <section style={{ marginTop: 12 }}>
          <h4>Featured Businesses</h4>
          {businesses.length === 0 ? <div className="muted">No businesses</div> : (
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {businesses.map(b => (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={selectedFeatured.includes(b._id)} onChange={() => {
                    setSelectedFeatured(s => s.includes(b._id) ? s.filter(x => x !== b._id) : [...s, b._id]);
                  }} />
                  <div>{b.name} — {b.city}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={async () => {
              try {
                await api.put('/v1/owner-profiles/me/featured', { businessIds: selectedFeatured });
                alert('Featured businesses saved');
              } catch (e) { console.error(e); alert('Save failed'); }
            }}>Save featured</button>
          </div>
        </section>
        <button type="submit" className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}
