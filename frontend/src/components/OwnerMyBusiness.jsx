import React, { useEffect, useState } from "react";
import ownerApi from "../api/owner";
import VerificationProgress from "./VerificationProgress";
import VerificationStatusBanner from "./VerificationStatusBanner";
import PremiumSubscription from "./PremiumSubscription";
import StripeConnectCard from "./StripeConnectCard";
import BookingURLPreview from "./BookingURLPreview";
import PlanSelectionCard from "./PlanSelectionCard";
import "../styles/ownerMyBusiness.css";

const emojiOptions = ["👍", "❤️", "🔥", "💅", "🎉"];

const OwnerMyBusiness = () => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    zip: "",
    description: "",
    businessType: "salon",
  });
  const [businessId, setBusinessId] = useState(null); // Business ID for verification
  const [businessSlug, setBusinessSlug] = useState(null); // Business slug for booking URL
  const [stripeConnected, setStripeConnected] = useState(false); // Stripe Connect status
  const [businessStatus, setBusinessStatus] = useState(null); // Track admin approval status
  const [listingType, setListingType] = useState(null); // Track listing type from database (free/premium/null)
  const [selectedPlan, setSelectedPlan] = useState(null); // Track temporary plan selection before saving
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [insights, setInsights] = useState({ insights: [], reactionSummary: [] });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [postInput, setPostInput] = useState({ content: "", tags: "" });
  const [postLoading, setPostLoading] = useState(false);
  const [postMessage, setPostMessage] = useState("");

  useEffect(() => {
    loadBusiness();
    loadPosts();
    loadFeed();
    loadInsights();
    loadNotifications();
  }, []);

  const loadBusiness = async () => {
    try {
      const { data } = await ownerApi.get("/business");
      if (data && data._id) {
        setBusinessId(data._id); // Store business ID for verification
        setBusinessSlug(data.slug || data.bookingSlug); // Store booking slug
        setStripeConnected(data.verificationSteps?.stripeConnected || false); // Store Stripe status
        setListingType(data.listingType || null); // Load listing type from database
        setForm({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          zip: data.zip || "",
          description: data.description || "",
          businessType: data.businessType || "salon",
        });
        setGallery(data.images || []);
        setBusinessStatus(data.status || "pending"); // Set admin approval status
      }
    } catch (error) {
      console.error("Failed to load business", error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await ownerApi.get("/posts");
      setPosts(response.data || []);
    } catch (error) {
      console.error("Failed to load posts", error);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await ownerApi.get("/feed");
      setFeed(response.data || []);
    } catch (error) {
      console.error("Failed to load feed", error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await ownerApi.get("/feed/insights");
      setInsights(response.data || { insights: [], reactionSummary: [] });
    } catch (error) {
      console.error("Failed to load insights", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Include selectedPlan as listingType when saving
      const payload = {
        ...form,
        listingType: selectedPlan || listingType, // Save selected plan or existing listingType
      };
      await ownerApi.put("/business", payload);
      setMessage("Business saved.");
      await loadBusiness(); // Reload business to get updated data including businessId and listingType
    } catch (error) {
      setMessage("Unable to save business.");
    } finally {
      setLoading(false);
    }
  };

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryLoading(true);
    try {
      const base64 = await readFileAsBase64(file);
      const { data } = await ownerApi.post("/business/gallery", {
        base64,
        fileName: file.name,
      });
      setGallery(data?.business?.images || []);
    } catch (error) {
      console.error("Gallery upload failed", error);
    } finally {
      setGalleryLoading(false);
      e.target.value = "";
    }
  };

  const handleGalleryRemove = async (url) => {
    try {
      const { data } = await ownerApi.del("/business/gallery", {
        data: { url },
      });
      setGallery(data?.business?.images || []);
    } catch (error) {
      console.error("Gallery remove failed", error);
    }
  };

  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setPostInput((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postInput.content.trim()) return;
    setPostLoading(true);
    setPostMessage("");
    try {
      await ownerApi.post("/posts", {
        content: postInput.content.trim(),
        tags: postInput.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      setPostInput({ content: "", tags: "" });
      setPostMessage("Post published!");
      await loadPosts();
      await loadInsights();
    } catch (error) {
      setPostMessage("Failed to publish post.");
    } finally {
      setPostLoading(false);
    }
  };

  const handleReaction = async (postId, emoji) => {
    try {
      await ownerApi.post(`/posts/${postId}/react`, { emoji });
      await loadPosts();
      await loadInsights();
    } catch (error) {
      console.error("Reaction failed", error);
    }
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    // Auto-scroll to form after selection
    setTimeout(() => {
      const formElement = document.querySelector('.owner-business-page__card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const renderFeedItem = (item) => {
    const subtitle = (() => {
      switch (item.type) {
        case "post":
          return item.data?.content?.slice(0, 60);
        case "survey":
          return item.data?.title;
        case "news":
          return item.data?.title;
        case "review":
          return `${item.data?.business?.name || "Review"} · ${item.data?.createdAt?.slice(0, 10)}`;
        default:
          return "";
      }
    })();

    return (
      <article key={item.id} className="owner-business__feed-card">
        <div className="owner-business__feed-badge">{item.type}</div>
        <h3>{item.data?.author?.name || item.data?.title || "Update"}</h3>
        <p>{subtitle}</p>
      </article>
    );
  };

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await ownerApi.get("/notifications");
      setNotifications(response.data?.items || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await ownerApi.post(`/notifications/${notificationId}/read`);
      await loadNotifications();
    } catch (error) {
      console.error("Unable to mark notification read", error);
    }
  };

  return (
    <section className="owner-business-page">
      <header className="owner-business-page__header">
        <h1>My Business + Social Feed</h1>
        <p>Keep your listing polished and publish engaging content in one place.</p>
      </header>

      {/* Plan Selection - Show for ALL users where listingType is null */}
      {listingType === null && !selectedPlan && (
        <PlanSelectionCard onSelectPlan={handlePlanSelection} currentPlan={selectedPlan} />
      )}

      {/* Confirmation Message + Back Button after plan selection */}
      {listingType === null && selectedPlan && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setSelectedPlan(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '16px',
              background: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            ← Back to Listing Options
          </button>

          {/* Confirmation Banner */}
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '12px',
            backgroundColor: selectedPlan === 'free' ? '#f0f9ff' : '#fdf2f8',
            border: `2px solid ${selectedPlan === 'free' ? '#3b82f6' : '#E91E63'}`,
            color: '#0f172a'
          }}>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              {selectedPlan === 'free' ? '🆓' : '💎'} You selected <strong>{selectedPlan === 'free' ? 'Free Listing' : 'Premium Listing'}</strong>
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              {selectedPlan === 'free'
                ? 'Complete basic business information to get listed in the directory'
                : 'Complete your business info, then subscribe to premium for top placement'
              }
            </p>
          </div>
        </div>
      )}

      {/* Main Content - Show if user selected a plan OR has a listing type */}
      {(selectedPlan || listingType) && (
        <>
      {/* Business Status Banner */}
      {businessStatus && (
        <div
          style={{
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '8px',
            backgroundColor:
              businessStatus === 'approved'
                ? '#d1fae5'
                : businessStatus === 'rejected'
                ? '#fee2e2'
                : '#fef3c7',
            border: `2px solid ${
              businessStatus === 'approved'
                ? '#10b981'
                : businessStatus === 'rejected'
                ? '#ef4444'
                : '#f59e0b'
            }`,
            color: '#1f2937',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '16px' }}>
            {businessStatus === 'approved'
              ? '✅ Business Approved'
              : businessStatus === 'rejected'
              ? '❌ Business Not Approved'
              : '⏳ Pending Admin Approval'}
          </strong>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {businessStatus === 'approved'
              ? 'Your business is live and visible to all visitors in the directory.'
              : businessStatus === 'rejected'
              ? 'Your business was not approved. Please contact support for details.'
              : 'Your business is under review. You can edit your information, but it won\'t be visible to visitors until an admin approves it.'}
          </p>
        </div>
      )}

      {/* Enhanced 3-Tier Verification Status Banner */}
      {businessId && (
        <div style={{ marginBottom: '32px' }}>
          <VerificationStatusBanner businessId={businessId} />
        </div>
      )}

      {/* Verification Progress Checklist */}
      {businessId && (
        <div style={{ marginBottom: '32px' }}>
          <VerificationProgress businessId={businessId} />
        </div>
      )}

      {/* PREMIUM-ONLY SECTION - Show ONLY for Premium listing */}
      {businessId && (listingType === 'premium' || selectedPlan === 'premium') && (
        <>
          {/* Premium Features Section Header */}
          {listingType === null && selectedPlan === 'premium' && (
            <div style={{
              padding: '24px',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
              borderRadius: '16px',
              border: '2px solid #E91E63'
            }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                💎 Premium Features
              </h2>
              <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>
                Complete these steps to unlock premium benefits: top placement, verified badge, and online payments
              </p>
            </div>
          )}

          {/* Premium Subscription Card */}
          <div style={{ marginBottom: '32px' }}>
            <PremiumSubscription businessId={businessId} />
          </div>

          {/* Stripe Connect Card */}
          <div style={{ marginBottom: '32px' }}>
            <StripeConnectCard businessId={businessId} />
          </div>

          {/* Booking URL Preview */}
          <div style={{ marginBottom: '32px' }}>
            <BookingURLPreview
              businessId={businessId}
              businessSlug={businessSlug}
              stripeConnected={stripeConnected}
            />
          </div>
        </>
      )}

      {/* FREE LISTING INFO - Show ONLY for Free listing users */}
      {(listingType === 'free' || selectedPlan === 'free') && businessId && (
        <div style={{
          padding: '20px',
          marginBottom: '32px',
          background: '#f0f9ff',
          borderRadius: '12px',
          border: '2px solid #3b82f6'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            🆓 Free Listing Active
          </h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b' }}>
            Your business will appear in the directory. Want to stand out more?
          </p>
          <button
            onClick={() => setSelectedPlan('premium')}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      <div className="owner-business-page__grid">
        <div className="owner-business-page__card">
          <h2>Business Info</h2>
          <form onSubmit={handleSubmit} className="owner-business__form">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              Business Type
              <select name="businessType" value={form.businessType} onChange={handleChange}>
                <option value="salon">Salon</option>
                <option value="spa">Spa</option>
                <option value="freelance">Freelance Hair Stylist</option>
              </select>
            </label>
            <label>
              Address
              <input name="address" value={form.address} onChange={handleChange} />
            </label>
            <label>
              ZIP
              <input name="zip" value={form.zip} onChange={handleChange} />
            </label>
            <label className="owner-business__description">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Business"}
            </button>
            {message && <div className="owner-business__message">{message}</div>}
          </form>
        </div>

        <div className="owner-business-page__card">
          <h2>Gallery</h2>
          <div className="owner-business__gallery-control">
            <label className="owner-business__gallery-upload">
              <input type="file" accept="image/*,video/*" onChange={handleGalleryUpload} />
              {galleryLoading ? "Uploading..." : "Upload media"}
            </label>
            <div className="owner-business__gallery-preview">
              {gallery.map((url) => (
                <div key={url} className="owner-business__gallery-item">
                  <img src={url} alt="gallery" />
                  <button type="button" onClick={() => handleGalleryRemove(url)}>
                    Remove
                  </button>
                </div>
              ))}
              {!gallery.length && <p>No gallery media yet.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="owner-business-page__grid owner-business-page__grid--stacked">
        <div className="owner-business-page__card owner-business-page__post-card">
          <h2>Create Post</h2>
          <form onSubmit={handlePostSubmit} className="owner-business__post-form">
            <textarea
              name="content"
              value={postInput.content}
              onChange={handlePostChange}
              placeholder="Share an update, story, or promotion"
              rows={4}
            />
            <input
              name="tags"
              value={postInput.tags}
              onChange={handlePostChange}
              placeholder="Tags (comma separated)"
            />
            <div className="owner-business__post-actions">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="owner-business__emoji-btn"
                  onClick={() => setPostInput((prev) => ({ ...prev, content: prev.content + emoji }))}
                >
                  {emoji}
                </button>
              ))}
              <button type="submit" disabled={postLoading}>
                {postLoading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
            {postMessage && <p className="owner-business__message">{postMessage}</p>}
          </form>
          <div className="owner-business__post-list">
            {posts.map((post) => (
              <article key={post._id} className="owner-business__post-card">
                <div className="owner-business__post-date">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
                <p>{post.content}</p>
                <div className="owner-business__post-tags">
                  {(post.tags || []).map((tag) => (
                    <span key={tag} className="owner-business__tag">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="owner-business__post-actions">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={`${post._id}-${emoji}`}
                      type="button"
                      onClick={() => handleReaction(post._id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {!posts.length && <p>No owner posts yet.</p>}
          </div>
        </div>

        <div className="owner-business-page__card owner-business-page__insights-card">
          <h2>Insights</h2>
        <div className="owner-business__insights-grid">
          {insights.insights?.map((item) => (
            <div key={item.id} className="owner-business__insight">
              <p className="owner-business__insight-title">
                {item.content?.slice(0, 40) || "Post"}
              </p>
              <p className="owner-business__insight-meta">
                Likes: {item.engagement?.likes || 0} · Comments: {item.engagement?.comments || 0}
              </p>
            </div>
          ))}
          {!insights.insights?.length && <p>No insights yet.</p>}
        </div>
        <h3>Favorite Reactions</h3>
        <div className="owner-business__reaction-summary">
          {insights.reactionSummary?.map((reaction) => (
            <span key={reaction.emoji} className="owner-business__reaction-pill">
              {reaction.emoji} {reaction.count}
            </span>
          ))}
          {!insights.reactionSummary?.length && <p>No reactions yet.</p>}
        </div>
        <div className="owner-business__notifications">
          <h3>Notifications</h3>
          {notificationsLoading ? (
            <p>Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p>No new activity yet.</p>
          ) : (
            notifications.slice(0, 4).map((item) => (
              <article key={item._id} className={`notification-card${item.read ? "" : " unread"}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message || "Tap to see more details"}</p>
                </div>
                {!item.read && (
                  <button type="button" onClick={() => markNotificationRead(item._id)}>
                    Mark read
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>

      <div className="owner-business-page__card owner-business-page__feed-card">
        <h2>Unified Feed</h2>
        <div className="owner-business__feed-grid">
          {feed.map((item) => renderFeedItem(item))}
          {!feed.length && <p>No feed items available.</p>}
        </div>
      </div>
        </>
      )}
    </section>
  );
};

export default OwnerMyBusiness;
