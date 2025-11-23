import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import './FeedbackInbox.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FeedbackInbox = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [counts, setCounts] = useState({
    total: 0,
    visitor: 0,
    owner: 0,
    open: 0,
    inReview: 0,
    resolved: 0
  });
  const [filters, setFilters] = useState({
    userType: '',
    status: '',
    page: 1,
    limit: 20,
    search: ''
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    internalNotes: ''
  });

  useEffect(() => {
    fetchFeedback();
  }, [filters]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters.userType) params.append('userType', filters.userType);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await axios.get(
        `${API_BASE}/api/admin/feedback?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFeedbackList(response.data.data);
      setCounts(response.data.counts);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setSelectedFeedback(null);
  };

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setUpdateForm({
      status: feedback.status,
      internalNotes: feedback.internalNotes || ''
    });
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_BASE}/api/admin/feedback/${selectedFeedback._id}`,
        updateForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update the feedback in the list
      setFeedbackList(prev =>
        prev.map(item =>
          item._id === selectedFeedback._id
            ? { ...item, ...response.data.data }
            : item
        )
      );

      setSelectedFeedback(prev => ({ ...prev, ...response.data.data }));
      
      // Refresh to update counts
      fetchFeedback();
    } catch (err) {
      console.error('Failed to update feedback:', err);
      alert(err.response?.data?.message || 'Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: '#dbeafe', color: '#1e40af', label: 'Open' },
      IN_REVIEW: { bg: '#fef3c7', color: '#92400e', label: 'In Review' },
      RESOLVED: { bg: '#d1fae5', color: '#065f46', label: 'Resolved' }
    };
    const style = styles[status] || styles.OPEN;
    return (
      <span
        className="status-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.label}
      </span>
    );
  };

  const getUserTypeBadge = (userType) => {
    return (
      <span className={`user-type-badge user-type-badge--${userType.toLowerCase()}`}>
        {userType === 'visitor' ? '👤 Visitor' : '💼 Owner'}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    if (!urgency) return null;
    const styles = {
      LOW: { bg: '#d1fae5', color: '#065f46' },
      MEDIUM: { bg: '#fef3c7', color: '#92400e' },
      HIGH: { bg: '#fee2e2', color: '#991b1b' }
    };
    const style = styles[urgency] || styles.MEDIUM;
    return (
      <span
        className="urgency-badge"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {urgency}
      </span>
    );
  };

  return (
    <Layout>
      <div className="feedback-inbox">
        <div className="inbox-header">
          <h1>Feedback Inbox</h1>
          <p>Manage visitor and owner feedback from a unified dashboard</p>
        </div>

      {/* Filters */}
      <div className="inbox-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${!filters.userType ? 'filter-tab-active' : ''}`}
            onClick={() => handleFilterChange('userType', '')}
          >
            All <span className="count-badge">{counts.total}</span>
          </button>
          <button
            className={`filter-tab ${filters.userType === 'visitor' ? 'filter-tab-active' : ''}`}
            onClick={() => handleFilterChange('userType', 'visitor')}
          >
            👤 Visitors <span className="count-badge">{counts.visitor}</span>
          </button>
          <button
            className={`filter-tab ${filters.userType === 'owner' ? 'filter-tab-active' : ''}`}
            onClick={() => handleFilterChange('userType', 'owner')}
          >
            💼 Owners <span className="count-badge">{counts.owner}</span>
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open ({counts.open})</option>
            <option value="IN_REVIEW">In Review ({counts.inReview})</option>
            <option value="RESOLVED">Resolved ({counts.resolved})</option>
          </select>

          <input
            type="text"
            placeholder="Search feedback..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && fetchFeedback()}
            className="filter-search"
          />
        </div>
      </div>

      <div className="inbox-content">
        {/* Feedback List */}
        <div className="feedback-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading feedback...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={fetchFeedback} className="btn-retry">
                Retry
              </button>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="empty-state">
              <p>📭 No feedback found</p>
            </div>
          ) : (
            <>
              {feedbackList.map((item) => (
                <div
                  key={item._id}
                  className={`feedback-item ${selectedFeedback?._id === item._id ? 'feedback-item-active' : ''}`}
                  onClick={() => handleSelectFeedback(item)}
                >
                  <div className="feedback-item-header">
                    {getUserTypeBadge(item.userType)}
                    {getStatusBadge(item.status)}
                    {item.urgency && getUrgencyBadge(item.urgency)}
                  </div>
                  <h3 className="feedback-item-title">{item.title}</h3>
                  
                  {/* User Contact Info */}
                  {item.user && (
                    <div className="feedback-item-contact">
                      <span className="contact-name">👤 {item.user.name}</span>
                      <a href={`mailto:${item.user.email}`} className="contact-email" onClick={(e) => e.stopPropagation()}>
                        📧 {item.user.email}
                      </a>
                    </div>
                  )}
                  
                  <div className="feedback-item-meta">
                    <span className="meta-category">{item.category}</span>
                    <span className="meta-date">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="feedback-item-preview">
                    {item.description.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page === pagination.pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="feedback-detail">
          {selectedFeedback ? (
            <>
              <div className="detail-header">
                <div className="detail-badges">
                  {getUserTypeBadge(selectedFeedback.userType)}
                  {selectedFeedback.urgency && getUrgencyBadge(selectedFeedback.urgency)}
                </div>
                <h2>{selectedFeedback.title}</h2>
                
                {/* User Contact Information */}
                {selectedFeedback.user && (
                  <div className="detail-contact">
                    <h3 className="contact-heading">Contact Information</h3>
                    <div className="contact-details">
                      <div className="contact-item">
                        <span className="contact-label">👤 Name:</span>
                        <span className="contact-value">{selectedFeedback.user.name}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-label">📧 Email:</span>
                        <a href={`mailto:${selectedFeedback.user.email}`} className="contact-link">
                          {selectedFeedback.user.email}
                        </a>
                      </div>
                      <div className="contact-item">
                        <span className="contact-label">🏷️ Role:</span>
                        <span className="contact-value">{selectedFeedback.userType === 'visitor' ? 'Visitor' : 'Business Owner'}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="detail-meta">
                  <span>📁 {selectedFeedback.category}</span>
                  <span>📅 {formatDate(selectedFeedback.createdAt)}</span>
                </div>
              </div>

              <div className="detail-content">
                <h3>Description</h3>
                <p className="detail-description">{selectedFeedback.description}</p>
              </div>

              <div className="detail-actions">
                <h3>Update Status</h3>
                <div className="action-form">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                      className="action-select"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Internal Notes</label>
                    <textarea
                      value={updateForm.internalNotes}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                      placeholder="Add internal notes (not visible to user)"
                      rows={4}
                      className="action-textarea"
                      maxLength={5000}
                    />
                  </div>

                  <button
                    onClick={handleUpdateFeedback}
                    disabled={updating}
                    className="btn-update"
                  >
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>

                {selectedFeedback.resolvedAt && (
                  <div className="resolved-info">
                    ✅ Resolved on {formatDate(selectedFeedback.resolvedAt)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <p>Select a feedback item to view details</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default FeedbackInbox;
