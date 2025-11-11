import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalBusinesses: 0, approved: 0, pending: 0, rejected: 0 });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [article, setArticle] = useState({ title: "", summary: "", body: "", coverImage: "", tags: "", published: true });
  const [articleMessage, setArticleMessage] = useState("");
  const [articleLoading, setArticleLoading] = useState(false);
  const [newsRefreshLoading, setNewsRefreshLoading] = useState(false);
  const [newsRefreshMessage, setNewsRefreshMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes, reportsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/businesses?status=pending"),
          api.get("/comments/reports/pending"),
        ]);
        setStats(statsRes.data || {});
        setPending(pendingRes.data.businesses || []);
        setReports(reportsRes.data || []);
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

  const handleReportResolve = async (reportId) => {
    try {
      await api.post(`/comments/reports/${reportId}/handle`);
      setReports((list) => list.filter((r) => r._id !== reportId));
    } catch (e) {
      console.error(e);
      alert('Failed to mark handled');
    }
  };

  const removeComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setReports((list) => list.filter((r) => String(r.comment?._id) !== String(commentId)));
    } catch (e) {
      console.error(e);
      alert('Deleting comment failed');
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    setArticleLoading(true);
    setArticleMessage("");
    try {
      await api.post("/articles", {
        title: article.title,
        summary: article.summary,
        body: article.body,
        coverImage: article.coverImage,
        tags: article.tags.split(",").map((t) => t.trim()).filter(Boolean),
        published: Boolean(article.published),
      });
      setArticleMessage("Article published successfully.");
      setArticle({ title: "", summary: "", body: "", coverImage: "", tags: "", published: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to publish article";
      setArticleMessage(msg);
    } finally {
      setArticleLoading(false);
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

      {/* Maintenance */}
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Maintenance</div>
            <div className="panel-sub">Geocoding and data utilities</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn outline" onClick={async()=>{
              if (!window.confirm('Backfill geocoding for existing businesses?')) return;
              try {
                const { data } = await api.post('/admin/maintenance/backfill-geo');
                alert(`Backfill complete. Updated: ${data.updated}, Skipped: ${data.skipped}, Failed: ${data.failed}`);
              } catch (e) {
                console.error(e);
                alert('Backfill failed. See console for details.');
              }
            }}>Backfill Geocoding</button>
            <button
              className="btn outline"
              onClick={async () => {
                setNewsRefreshLoading(true);
                setNewsRefreshMessage("");
                try {
                  const { data } = await api.post("/news/refresh");
                  setNewsRefreshMessage(`Refresh added ${data.added} articles, rotated ${data.rotated}.`);
                } catch (refreshError) {
                  const msg = refreshError?.response?.data?.message || "Refresh failed";
                  setNewsRefreshMessage(msg);
                } finally {
                  setNewsRefreshLoading(false);
                }
              }}
            >
              {newsRefreshLoading ? "Refreshing..." : "Refresh News Cache"}
            </button>
          </div>
          {newsRefreshMessage && (
            <p style={{ margin: 0, fontSize: 12, color: "#475569" }}>{newsRefreshMessage}</p>
          )}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Publish Article</div>
            <div className="panel-sub">Add tips, trends, or beauty news for visitors</div>
          </div>
        </div>
        <form className="review-form" onSubmit={handleArticleSubmit} style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
          <input
            placeholder="Title"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            required
          />
          <input
            placeholder="Summary"
            value={article.summary}
            onChange={(e) => setArticle({ ...article, summary: e.target.value })}
          />
          <input
            placeholder="Cover image URL"
            value={article.coverImage}
            onChange={(e) => setArticle({ ...article, coverImage: e.target.value })}
          />
          <input
            placeholder="Tags (comma separated)"
            value={article.tags}
            onChange={(e) => setArticle({ ...article, tags: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Body"
            value={article.body}
            onChange={(e) => setArticle({ ...article, body: e.target.value })}
            style={{ gridColumn: '1 / -1' }}
          />
          <label style={{ gridColumn: '1 / -1' }}>
            <input
              type="checkbox"
              checked={article.published}
              onChange={(e) => setArticle({ ...article, published: e.target.checked })}
            />{' '}
            Publish immediately
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn" type="submit" disabled={articleLoading}>
              {articleLoading ? 'Publishing…' : 'Publish Article'}
            </button>
            {articleMessage && <span style={{ color: '#0f172a' }}>{articleMessage}</span>}
          </div>
        </form>
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

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Comment Reports</div>
            <div className="panel-sub">Review & moderate flagged comments</div>
          </div>
        </div>
        {reports.length === 0 ? (
          <div className="empty">
            <div className="empty-illustration" />
            <p>No reports</p>
          </div>
        ) : (
          <div className="cards">
            {reports.map((report) => (
              <div key={report._id} className="card">
                <div className="card-head">
                  <div>
                    <div className="card-title">{report.reason}</div>
                    <div className="card-sub">
                      <strong>{report.reporter?.name}</strong> reported on{' '}
                      {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div style={{ fontWeight: 600 }}>{report.comment?.text}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>
                    Content type: {report.comment?.contentType}
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn outline" onClick={() => removeComment(report.comment?._id)}>
                    Delete comment
                  </button>
                  <button className="btn" onClick={() => handleReportResolve(report._id)}>
                    Mark handled
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
