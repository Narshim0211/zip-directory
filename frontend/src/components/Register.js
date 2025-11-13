import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from './AuthForm';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('visitor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate first and last names
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last names');
      return;
    }

    setLoading(true);
    try {
      // Debug logs to surface why submission might fail before network
      // (Check DevTools Console for these entries)
      // eslint-disable-next-line no-console
      console.log('Register submit payload', { firstName, lastName, email, role });
      // eslint-disable-next-line no-console
      console.log('useAuth.register type', typeof register);
      const data = await register({ firstName, lastName, email, password, role });
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'owner') navigate('/dashboard/owner');
      else navigate('/visitor/home');
    } catch (err) {
      // Prefer precise backend message, fall back to generic JS/network message
      const msg =
        (err && err.response && err.response.data && err.response.data.message) ||
        err?.message ||
        'Registration failed';
      // eslint-disable-next-line no-console
      console.error('Register error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create your salon account"
      subtitle="Join the future of salon management"
      onSubmit={onSubmit}
      loading={loading}
      ctaText="Create account"
      footer={
        <>
          <div className="auth-switch">Have an account? <Link to="/login">Login</Link></div>
          {error && <div className="auth-error">{error}</div>}
        </>
      }
    >
      <div className="auth-field">
        <label>First Name</label>
        <input
          className="auth-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="Jane"
        />
      </div>

      <div className="auth-field">
        <label>Last Name</label>
        <input
          className="auth-input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Doe"
        />
      </div>

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
          minLength={6}
          placeholder="At least 6 characters"
        />
      </div>

      <div className="auth-field">
        <label>Role</label>
        <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="visitor">Visitor</option>
          <option value="owner">Owner</option>
        </select>
      </div>
    </AuthForm>
  );
};

export default Register;
