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
      await api.post(`/reviews/${id}`, {
        rating,
        comment: text,
        user: "000000000000000000000001", // temp user (replace with logged-in ID)
      });
      setMessage("Review submitted successfully!");
      setText("");
      setRating(0);
    } catch (err) {
      setMessage("Failed to submit review.");
      console.error(err);
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
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Reviews</h2>
        <div id="averageRating">Average: {average}</div>

        {/* Review Form */}
        <form className="review-form" onSubmit={submitReview}>
          <h3>Leave a Review</h3>
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
          <button type="submit" className="primary-btn">
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

