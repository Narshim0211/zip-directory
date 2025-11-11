import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/BusinessDetails.css";

const BusinessDetails = () => {
  const { id } = useParams(); // get :id from route
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  const getMe = () => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, revRes] = await Promise.all([
          api.get(`/businesses/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setBusiness(bizRes.data);
        setReviews(revRes.data);
      } catch (error) {
        console.error("Error loading business:", error);
      }
    };
    fetchData();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}`, { rating, comment: text });
      setMessage("Review submitted successfully!");
      setText("");
      setRating(0);
      const { data } = await api.get(`/reviews/${id}`);
      setReviews(data || []);
    } catch (err) {
      const msg = (err && err.response && err.response.data && err.response.data.message) || 'Failed to submit review.';
      setMessage(msg);
      console.error('Review submit failed:', err);
    }
  };

  if (!business) return <p className="loading">Loading business details...</p>;

  const average =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "No ratings yet";

  return (
    <div className="business-page">
      {/* Business Header */}
      <section className="business-hero">
        <h1>{business.name}</h1>
        <p className="category">{business.category}</p>
        <p className="city">{business.city}</p>
        <p className="desc">{business.description}</p>
        <div style={{ marginTop: 8, color:'#475569' }}>
          {Number(business.ratingsCount || 0) > 0 ? (
            <>★ {Number(business.ratingAverage || 0).toFixed(1)} · {business.ratingsCount} {business.ratingsCount === 1 ? 'review' : 'reviews'}</>
          ) : (
            'No ratings yet'
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Reviews</h2>
        <div id="averageRating">Average: {average}</div>

        {/* Review Form */}
        <form className="review-form" onSubmit={submitReview}>
          <h3>Leave a Review</h3>
          {!token && (
            <div style={{ color:'#475569', marginBottom: 8 }}>Sign in to leave a review.</div>
          )}
          <div className="stars">
            {[1, 2, 3, 4, 5].map((v) => (
              <span
                key={v}
                className={rating >= v ? "selected" : ""}
                onClick={() => setRating(v)}
              >
                *
              </span>
            ))}
          </div>
          <textarea
            placeholder="Share your experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="primary-btn" disabled={!token || rating < 1 || text.trim().length < 5}>
            Submit Review
          </button>
        </form>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to write one!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="review-card">
                <p className="rating">* {r.rating}</p>
                <p className="comment">{r.comment}</p>
                {/* Edit my review */}
                {(() => { const me = getMe(); return me && r.user && String(r.user._id || r.user) === String(me._id); })() && (
                  <EditMyReview review={r} onSaved={async()=>{
                    const [bizRes, revRes] = await Promise.all([
                      api.get(`/businesses/${id}`),
                      api.get(`/reviews/${id}`),
                    ]);
                    setBusiness(bizRes.data);
                    setReviews(revRes.data || []);
                  }} />
                )}
                {r.reply?.text ? (
                  <div className="owner-reply" style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius: 8, padding: 8, marginTop: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Owner reply</div>
                    <div style={{ color:'#334155' }}>{r.reply.text}</div>
                  </div>
                ) : null}
                {business && (()=>{ const me = getMe(); return me && (me.role === 'admin' || String(business.owner) === String(me._id)) && !r.reply?.text; })() && (
                  <ReviewReply reviewId={r._id} onReplied={async()=>{
                    const { data } = await api.get(`/reviews/${id}`);
                    setReviews(data || []);
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <footer>© 2025 SalonHub · All Rights Reserved</footer>
      {message && <div className="toast">{message}</div>}
    </div>
  );
};

export default BusinessDetails;

const ReviewReply = ({ reviewId, onReplied }) => {
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        placeholder="Write a public reply..."
        value={val}
        onChange={(e)=>setVal(e.target.value)}
        style={{ width:'100%', minHeight:70 }}
      />
      <button disabled={busy || !val.trim()} className="primary-btn" onClick={async()=>{
        try {
          setBusy(true);
          await api.patch(`/reviews/${reviewId}/reply`, { text: val });
          setVal('');
          if (typeof onReplied === 'function') onReplied();
        } catch (e) {
          console.error(e);
          alert('Failed to post reply');
        } finally { setBusy(false); }
      }}>Post Reply</button>
    </div>
  );
};

const EditMyReview = ({ review, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(review.comment || '');
  const [stars, setStars] = useState(review.rating || 5);
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      {!open ? (
        <button className="btn outline" onClick={()=>setOpen(true)}>Edit my review</button>
      ) : (
        <div style={{ border:'1px solid #e2e8f0', borderRadius: 8, padding: 8 }}>
          <div className="stars" style={{ marginBottom: 6 }}>
            {[1,2,3,4,5].map(v=> (
              <span key={v} className={stars>=v? 'selected':''} onClick={()=>setStars(v)}>*</span>
            ))}
          </div>
          <textarea value={val} onChange={(e)=>setVal(e.target.value)} style={{ width:'100%', minHeight:70 }} />
          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            <button className="primary-btn" disabled={busy || !val.trim() || stars<1} onClick={async()=>{
              try{
                setBusy(true);
                await api.patch(`/reviews/${review._id}`, { rating: stars, comment: val });
                setOpen(false);
                if (typeof onSaved === 'function') onSaved();
              }catch(e){ console.error(e); alert('Failed to update review'); }
              finally{ setBusy(false); }
            }}>Save</button>
            <button className="btn outline" onClick={()=>setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

