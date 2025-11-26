import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage and validate token with /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    // Check for referral invite ID in URL (?ref=INVITE_ID)
    const urlParams = new URLSearchParams(window.location.search);
    const referralInviteId = urlParams.get('ref');

    // Include referral ID in registration payload if present
    const registrationData = {
      ...payload,
      ...(referralInviteId && { referralInviteId })
    };

    const { data } = await api.post('/auth/register', registrationData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);

    // Clear referral param from URL after successful registration
    if (referralInviteId) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user data (e.g., after avatar upload or profile edit)
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, updateUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
