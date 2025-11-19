import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

/**
 * Login Modal
 * Shows when unauthenticated user tries to view full business profile
 * Stores redirect URL for post-login navigation
 * NO duplication - single modal for login gates
 */
const LoginModal = ({ onClose, redirectUrl }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Store redirect URL in sessionStorage
    if (redirectUrl) {
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
    }
    
    // Navigate to login page
    navigate('/login');
  };

  const handleSignup = () => {
    // Store redirect URL in sessionStorage
    if (redirectUrl) {
      sessionStorage.setItem('redirectAfterLogin', redirectUrl);
    }
    
    // Navigate to register page
    navigate('/register');
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="login-modal__icon">🔐</div>

        <h2 className="login-modal__title">Sign in to view full details</h2>
        <p className="login-modal__message">
          Create a free account to access business contact information, services, pricing, and more.
        </p>

        <div className="login-modal__actions">
          <button className="login-modal__button login-modal__button--primary" onClick={handleLogin}>
            Log In
          </button>
          <button className="login-modal__button login-modal__button--secondary" onClick={handleSignup}>
            Sign Up
          </button>
        </div>

        <p className="login-modal__footer">
          Already have an account? <button onClick={handleLogin}>Log in</button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
