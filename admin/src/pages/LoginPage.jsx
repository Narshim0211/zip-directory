import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { setError(''); }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res?.data?.user || res?.data;
      if (!user || !['admin','superadmin'].includes(user.role)) {
        setError('You are not authorized for this panel');
        return;
      }
      const token = res.data.token;
      if (remember) localStorage.setItem('token', token); else sessionStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      let msg = serverMsg || err?.message || 'Login failed';
      if (msg === 'Network Error') msg = 'Cannot reach the API. Confirm VITE_API_URL and CORS.';
      else if (status === 401) msg = 'Invalid email or password.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <div className="mt-1 flex gap-2">
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" type={showPassword? 'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} required />
              <button type="button" className="text-sm text-indigo-600" onClick={()=>setShowPassword(s=>!s)}>{showPassword? 'Hide':'Show'}</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> Keep me signed in
          </label>
          <button className="w-full rounded-md bg-[var(--brand)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--brand-strong)]" disabled={loading}>
            {loading? 'Signing in…':'Sign In'}
          </button>
          <p className="text-xs text-slate-500">Default (after seeding API): admin@example.com / admin123</p>
        </form>
      </div>
    </div>
  );
}

