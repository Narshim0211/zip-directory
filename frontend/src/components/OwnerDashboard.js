import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import NewsFeed from './NewsFeed';
import './ownerDashboard.css';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({ views: 0, weekly: [], avgRating: 0, reviewsCount: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Owner stats
        const { data: s } = await api.get('/owner/stats');
        const safeStats = {
          views: s?.weeklyViews || 0,
          weekly: Array.isArray(s?.weekly) ? s.weekly : [],
          avgRating: Number(s?.avgRating || 0),
          reviewsCount: Number(s?.reviewsCount || 0),
        };
        setStats(safeStats);
        // Keep placeholder recent reviews for now (endpoint not specified yet)
        setRecentReviews([
          { _id: '1', user: { name: 'Ava' }, rating: 5, comment: 'Amazing service!', createdAt: new Date().toISOString() },
          { _id: '2', user: { name: 'Liam' }, rating: 4, comment: 'Great haircut and friendly staff.', createdAt: new Date().toISOString() },
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="owner-admin">
      <header className="owner-admin__head">
        <h1>Owner Admin Dashboard</h1>
        <p className="sub">Welcome back — manage your listing and see performance at a glance.</p>
      </header>

      <section className="owner-admin__kpis">
        <div className="kpi tone-blue">
          <div className="kpi-title">Views (this week)</div>
          <div className="kpi-value">{stats.views.toLocaleString()}</div>
        </div>
        <div className="kpi tone-purple">
          <div className="kpi-title">Reviews</div>
          <div className="kpi-value">{stats.reviewsCount}</div>
        </div>
        <div className="kpi tone-gold">
          <div className="kpi-title">Avg Rating</div>
          <div className="kpi-value">{Number(stats.avgRating || 0).toFixed(1)}</div>
        </div>
        <div className="kpi tone-green">
          <div className="kpi-title">Returning Visitors</div>
          <div className="kpi-value">62%</div>
        </div>
      </section>

      <section className="owner-admin__grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent Reviews</div>
          </div>
          {loading ? (
            <div className="shimmer" style={{ height: 140 }} />
          ) : recentReviews.length === 0 ? (
            <div className="empty">No reviews yet</div>
          ) : (
            <div className="reviews">
              {recentReviews.map((r) => (
                <div key={r._id} className="review">
                  <div className="who">
                    <div className="avatar" />
                    <div>
                      <div className="name">{r.user?.name || 'User'}</div>
                      <div className="meta">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="stars">{'*'.repeat(Math.max(1, Math.round(r.rating || 0)))}</div>
                  <div className="comment">{r.comment}</div>
                  <button className="btn small">Reply</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Quick Actions</div>
          </div>
          <div className="quick-actions">
            <a className="qa" href="/owner">Edit Business Info</a>
            <a className="qa" href="/owner">Manage Services</a>
            <a className="qa" href="/owner">Upload Photos</a>
          </div>
        </div>
      </section>
      {/* News Feed (footer section) */}
      <NewsFeed limit={6} />
    </div>
  );
};

export default OwnerDashboard;
