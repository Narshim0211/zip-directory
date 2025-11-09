import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBusinesses: 0, approved: 0, pending: 0, rejected: 0 });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  // Admin quick-post forms
  const [news, setNews] = useState({ title: "", summary: "", imageUrl: "", category: "Hair" });
  const [announce, setAnnounce] = useState({ title: "", description: "", link: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/businesses?status=pending"),
        ]);
        setStats(statsRes.data || {});
        setPending(pendingRes.data.businesses || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter((b) => `${b.name} ${b.city} ${b.category}`.toLowerCase().includes(q));
  }, [pending, query]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/admin/businesses/${id}/${action}`);
      setPending((list) => list.filter((b) => b._id !== id));
      setStats((s) => ({
        ...s,
        pending: Math.max((s.pending || 0) - 1, 0),
        approved: action === "approve" ? (s.approved || 0) + 1 : s.approved,
        rejected: action === "reject" ? (s.rejected || 0) + 1 : s.rejected,
      }));
    } catch (err) {
      console.error(err);
      alert("Action failed. Check console.");
    }
  };

  return (
    <div className="admin-shell">
      {/* KPI cards */}
      <section className="kpi-grid">
        <div className="kpi-card tone-blue">
          <div className="kpi-title">Total Businesses</div>
          <div className="kpi-value">{stats.totalBusinesses ?? 0}</div>
        </div>
        <div className="kpi-card tone-green">
          <div className="kpi-title">Approved</div>
          <div className="kpi-value">{stats.approved ?? 0}</div>
        </div>
        <div className="kpi-card tone-amber">
          <div className="kpi-title">Pending</div>
          <div className="kpi-value">{stats.pending ?? 0}</div>
        </div>
        <div className="kpi-card tone-rose">
          <div className="kpi-title">Rejected</div>
          <div className="kpi-value">{stats.rejected ?? 0}</div>
        </div>
      </section>

      {/* Pending approvals */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Pending Approvals</div>
            <div className="panel-sub">{loading ? "Loadingâ€¦" : `${filtered.length} pending`}</div>
          </div>
          <input
            className="search"
            placeholder="Search businessesâ€¦"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="cards">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card shimmer" style={{ height: 140 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-illustration" />
            <p>No pending businesses</p>
          </div>
        ) : (
          <div className="cards">
            {filtered.map((b) => (
              <div key={b._id} className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">{b.name}</div>
                    <div className="card-sub">{b.city}</div>
                  </div>
                  <span className="chip">{b.category}</span>
                </div>
                <div className="card-body">{b.description}</div>
                <div className="card-actions">
                  <button className="btn solid green" onClick={() => handleAction(b._id, "approve")}>
                    Approve
                  </button>
                  <button className="btn outline" onClick={() => handleAction(b._id, "reject")}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;




