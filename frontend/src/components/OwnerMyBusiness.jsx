import React, { useEffect, useState } from "react";
import ownerApi from "../api/owner";
import "../styles/ownerMyBusiness.css";

const emojiOptions = ["👍", "❤️", "🔥", "💅", "🎉"];

const OwnerMyBusiness = () => {
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    zip: "",
    description: "",
  });
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
      if (data) {
        setForm({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          zip: data.zip || "",
          description: data.description || "",
        });
        setGallery(data.images || []);
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
      await ownerApi.put("/business", form);
      setMessage("Business saved.");
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
    </section>
  );
};

export default OwnerMyBusiness;
