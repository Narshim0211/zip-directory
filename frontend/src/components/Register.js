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
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
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
      console.log('Register submit payload', { firstName, lastName, email, role, newsletterOptIn });
      // eslint-disable-next-line no-console
      console.log('useAuth.register type', typeof register);
      const data = await register({ firstName, lastName, email, password, role, newsletterOptIn });

      // Check for redirect URL stored in sessionStorage (e.g., from business profile)
      const redirectAfterAuth = sessionStorage.getItem('redirectAfterAuth');
      if (redirectAfterAuth) {
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectAfterAuth);
        return;
      }

      // Role-based redirect to dashboards (default behavior)
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

      <div className="auth-field" style={{ marginTop: '1rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 'normal'
        }}>
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={(e) => setNewsletterOptIn(e.target.checked)}
            style={{ 
              marginRight: '0.75rem', 
              marginTop: '0.25rem',
              cursor: 'pointer',
              width: '18px',
              height: '18px'
            }}
          />
          <span>
            {role === 'visitor' ? (
              <>
                <strong>Stay Inspired</strong>
                <br />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                  Send me hair care tips and glow-up guides (1–2 emails per month)
                </span>
              </>
            ) : (
              <>
                <strong>Grow Your Salon</strong>
                <br />
                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                  Send me business growth tips and platform updates (1–2 emails per month)
                </span>
              </>
            )}
            <br />
            <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
              No spam. Unsubscribe anytime from your profile.
            </span>
          </span>
        </label>
      </div>
    </AuthForm>
  );
};

export default Register;
