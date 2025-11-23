import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FeedbackInbox from './pages/FeedbackInbox.jsx';
import NewsletterHub from './pages/NewsletterHub.jsx';
import VisitorNewsletter from './pages/VisitorNewsletter.jsx';
import OwnerNewsletter from './pages/OwnerNewsletter.jsx';
import BlogHub from './pages/BlogHub.jsx';
import BlogEditor from './pages/BlogEditor.jsx';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute><FeedbackInbox /></PrivateRoute>} />
        <Route path="/newsletter" element={<PrivateRoute><NewsletterHub /></PrivateRoute>} />
        <Route path="/newsletter/visitor" element={<PrivateRoute><VisitorNewsletter /></PrivateRoute>} />
        <Route path="/newsletter/owner" element={<PrivateRoute><OwnerNewsletter /></PrivateRoute>} />
        <Route path="/blogs" element={<PrivateRoute><BlogHub /></PrivateRoute>} />
        <Route path="/blogs/create" element={<PrivateRoute><BlogEditor /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

