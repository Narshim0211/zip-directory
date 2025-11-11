import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from './AuthForm';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      // Role-based redirect to dashboards
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'owner') navigate('/owner/dashboard');
      else if (data.role === 'visitor') navigate('/visitor/home');
      else navigate('/visitor/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Log in securely and start growing"
      onSubmit={onSubmit}
      loading={loading}
      ctaText="Login"
      footer={
        <>
          <div className="auth-links">
            <Link to="/reset-password">Forgot password?</Link>
          </div>
          <div className="auth-switch">No account? <Link to="/register">Create one</Link></div>
          {error && <div className="auth-error">{error}</div>}
        </>
      }
    >
      <div className="auth-field">
        <label>Email</label>
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="auth-field">
        <label>Password</label>
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>

      <div className="auth-row">
        <label className="auth-check">
          <input type="checkbox" /> Remember me
        </label>
      </div>
    </AuthForm>
  );
};

export default Login;
