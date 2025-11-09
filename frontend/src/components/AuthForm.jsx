import React from 'react';
import '../styles/Auth.css';

const AuthForm = ({ title, subtitle, onSubmit, children, footer, loading, ctaText = 'Continue' }) => {
  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">SalonHub</div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        <form className="auth-form" onSubmit={onSubmit}>
          {children}
          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? 'Please wait...' : ctaText}
          </button>
        </form>
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthForm;

