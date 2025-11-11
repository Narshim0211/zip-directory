import React, { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

export default function CommentsThread({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/comments`, {
        params: { contentType: 'article', contentId: articleId },
      });
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { load(); }, [load, articleId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post('/comments', {
        contentType: 'article',
        contentId: articleId,
        text: text.trim(),
      });
      setText('');
      load();
    } catch (e) {
      alert((e.response && e.response.data && e.response.data.message) || 'Failed to submit comment');
    }
  };

  const submitReport = async (commentId) => {
    if (!reportReason.trim()) {
      alert('Add a reason');
      return;
    }
    try {
      await api.post('/comments/reports', { commentId, reason: reportReason.trim() });
      alert('Report submitted');
      setReportReason('');
      setReportTarget(null);
    } catch (e) {
      alert((e.response && e.response.data && e.response.data.message) || 'Failed to report');
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <h4 style={{ margin: '8px 0' }}>Discussion</h4>
      {loading ? (
        <div style={{ color: '#64748b' }}>Loading comments…</div>
      ) : error ? (
        <div style={{ color: '#b91c1c' }}>{error}</div>
      ) : (
        <div style={{ maxHeight: 240, overflow: 'auto', marginBottom: 8 }}>
          {comments.length === 0 ? (
            <div style={{ color: '#64748b' }}>No comments yet. Be the first!</div>
          ) : (
            comments.map((c) => (
              <div key={c._id} style={{ borderBottom: '1px solid #e2e8f0', padding: '6px 0' }}>
                <div style={{ fontWeight: 600 }}>{c.userId?.name || 'User'}</div>
                <div style={{ color: '#475569', fontSize: 13 }}>{c.text}</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(c.createdAt).toLocaleString()}</div>
                <button className="btn outline" type="button" onClick={() => setReportTarget(c._id)}>Report</button>
                {reportTarget === c._id && (
                  <div style={{ marginTop: 6 }}>
                    <textarea
                      rows={3}
                      placeholder="Why report this comment?"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <button className="btn" type="button" onClick={() => submitReport(c._id)}>Submit report</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      <form onSubmit={submit} style={{ display: 'grid', gap: 6 }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." rows={3} />
        <button className="btn" type="submit" disabled={!text.trim()}>Post comment</button>
      </form>
    </div>
  );
}
