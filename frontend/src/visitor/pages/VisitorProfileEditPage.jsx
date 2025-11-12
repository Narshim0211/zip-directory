import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function VisitorProfileEditPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    handle: '',
    bio: '',
    avatarUrl: '',
    bannerUrl: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      website: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/v1/visitor-profiles/me');
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          handle: data.handle || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
          bannerUrl: data.bannerUrl || '',
          socialLinks: {
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
            website: data.socialLinks?.website || ''
          }
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSocialChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      socialLinks: {
        ...f.socialLinks,
        [name]: value
      }
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/v1/visitor-profiles/me', form);
      alert('Saved');
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        handle: data.handle,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        socialLinks: data.socialLinks || { twitter: '', instagram: '', website: '' }
      });
    } catch (err) {
      console.error(err);
      alert('Save failed');
    } finally {
      setSaving(false);
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

        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={onChange} maxLength={280} />
        <div className="muted" style={{ fontSize: '12px', marginTop: '4px' }}>
          {form.bio.length}/280 characters
        </div>

        <label>Avatar URL</label>
        <input name="avatarUrl" value={form.avatarUrl} onChange={onChange} />

        <label>Banner URL</label>
        <input name="bannerUrl" value={form.bannerUrl} onChange={onChange} />

        <section style={{ marginTop: 16 }}>
          <h4>Social Links</h4>

          <label>Twitter Handle</label>
          <input
            name="twitter"
            value={form.socialLinks.twitter}
            onChange={onSocialChange}
            placeholder="@username"
          />

          <label>Instagram Handle</label>
          <input
            name="instagram"
            value={form.socialLinks.instagram}
            onChange={onSocialChange}
            placeholder="@username"
          />

          <label>Website</label>
          <input
            name="website"
            value={form.socialLinks.website}
            onChange={onSocialChange}
            placeholder="https://example.com"
          />
        </section>

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
