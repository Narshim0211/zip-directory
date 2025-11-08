import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from './AuthForm';
import { API } from '../api';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setMessage('If the email exists, we sent a reset link.');
    } catch (err) {
      // Intentionally generic to avoid enumeration
      setMessage('If the email exists, we sent a reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Reset your password"
      subtitle="Enter your email to receive a reset link"
      onSubmit={onSubmit}
      loading={loading}
      ctaText="Send reset link"
      footer={
        <>
          <div className="auth-switch">Remembered it? <Link to="/login">Back to login</Link></div>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
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
    </AuthForm>
  );
};

export default ResetPassword;

