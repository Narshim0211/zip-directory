import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import './ownerDashboard.css';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({ views: 0, weekly: [], avgRating: 0, reviewsCount: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Placeholder calls; replace with real endpoints when available
        // const { data: s } = await api.get(`/businesses/:id/stats`);
        // const { data: r } = await api.get(`/businesses/:id/reviews?limit=5`);
        // setStats(s);
        // setRecentReviews(r.items || r);

        // Temporary demo data to render the UI until endpoints are ready
        setStats({ views: 3420, weekly: [420,510,390,600,560,620,820], avgRating: 4.7, reviewsCount: 128 });
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
          <div className="kpi-value">{stats.avgRating.toFixed(1)}</div>
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
                  <div className="stars">{'⭐'.repeat(Math.max(1, Math.round(r.rating || 0)))}</div>
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
    </div>
  );
};

export default OwnerDashboard;

