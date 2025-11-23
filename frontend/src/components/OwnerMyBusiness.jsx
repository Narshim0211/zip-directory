import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ownerApi from "../api/owner";
import VerificationProgress from "./VerificationProgress";
import VerificationStatusBanner from "./VerificationStatusBanner";
import InboxPreviewCard from "./InboxPreviewCard";
import PremiumComparisonTable from "./PremiumComparisonTable";
import VisibilityRankMeter from "./VisibilityRankMeter";
import "../styles/ownerMyBusiness.css";

const OwnerMyBusiness = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    zip: "",
    description: "",
    businessType: "salon",
  });
  const [businessId, setBusinessId] = useState(null);
  const [businessStatus, setBusinessStatus] = useState(null);
  const [listingType, setListingType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(null); // 'free' or 'premium' for preview toggle

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const { data } = await ownerApi.get("/business");
      if (data && data._id) {
        setBusinessId(data._id);
        setListingType(data.listingType || null);
        setForm({
          name: data.name || "",
          city: data.city || "",
          address: data.address || "",
          zip: data.zip || "",
          description: data.description || "",
          businessType: data.businessType || "salon",
        });
        setGallery(data.images || []);
        setBusinessStatus(data.status || "pending");
      }
    } catch (error) {
      console.error("Failed to load business", error);
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
      await loadBusiness();
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

  const isFree = listingType === 'free';
  const isPremium = listingType === 'premium';

  // Determine which view to show (actual listing type or preview mode)
  const currentView = previewMode || listingType;
  const showingFreeView = currentView === 'free';
  const showingPremiumView = currentView === 'premium';

  // Free Listing Owner Page - Ultra-Lean 5-Section Layout
  return (
    <section className="owner-business-page" style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '100px' }}>
      {/* Back Button - Top of page */}
      <button
        onClick={() => navigate('/owner/plan-selection')}
        style={{
          margin: '20px 0 0 20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#4b5563',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <span style={{ fontSize: '18px' }}>←</span>
        <span>Back to Plan Selection</span>
      </button>

      {/* Header */}
      <header className="owner-business-page__header" style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '0',
        marginTop: '16px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Top Row - Title and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                {showingPremiumView ? '💎 Premium Dashboard' : 'My Free Listing'}
                {previewMode && <span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '400', marginLeft: '12px' }}>(Preview)</span>}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#6b7280' }}>
                {showingPremiumView ? 'Manage your premium features and subscription' : 'Complete your profile to appear in the directory'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Subscription Management (Premium Only) */}
              {isPremium && !previewMode && (
                <a
                  href="/owner/subscription"
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    color: '#6b7280',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '2px solid #e5e7eb',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  ⚙️ Manage Subscription
                </a>
              )}
              {/* Upgrade Button (Free Only) */}
              {isFree && !previewMode && (
                <a
                  href="#upgrade"
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                  }}
                >
                  Go Premium →
                </a>
              )}
            </div>
          </div>

          {/* Preview Toggle Buttons (Free Users Only) */}
          {isFree && (
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                Preview:
              </div>
              <button
                onClick={() => setPreviewMode(null)}
                style={{
                  padding: '8px 16px',
                  background: !previewMode ? 'white' : 'transparent',
                  color: !previewMode ? '#111827' : '#6b7280',
                  border: !previewMode ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🆓 Free View (Current)
              </button>
              <button
                onClick={() => setPreviewMode('premium')}
                style={{
                  padding: '8px 16px',
                  background: previewMode === 'premium' ? 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)' : 'transparent',
                  color: previewMode === 'premium' ? '#E91E63' : '#6b7280',
                  border: previewMode === 'premium' ? '2px solid #E91E63' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                💎 Premium Preview
              </button>
            </div>
          )}

          {/* Preview Banner (When in preview mode) */}
          {previewMode === 'premium' && isFree && (
            <div style={{
              marginTop: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
              border: '2px solid #E91E63',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#E91E63', marginBottom: '8px' }}>
                💎 Premium Preview Mode
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                This is what your dashboard will look like after upgrading to Premium. Click "Free View" above to go back.
              </p>
              <a
                href="#upgrade"
                onClick={() => setPreviewMode(null)}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)'
                }}
              >
                Subscribe to Premium - $49/mo
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* SECTION 1: Verification Bar */}
        {businessId && (
          <div style={{ marginBottom: '24px' }}>
            <VerificationStatusBanner businessId={businessId} />
          </div>
        )}

        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <VerificationProgress businessId={businessId} />
          </div>
        )}

        {/* SECTION 2: Public Preview (Your Listing Card) */}
        {businessId && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              📄 Your Public Listing
            </h2>
            <div style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #e5e7eb',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '20px', color: '#111827' }}>{form.name || 'Your Business Name'}</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                📍 {form.city || 'City'} • {form.businessType || 'salon'}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {form.description || 'Add a description to help clients find you...'}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {gallery.slice(0, 3).map((url, idx) => (
                  <div key={idx} style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                {gallery.length === 0 && (
                  <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No photos yet</div>
                )}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              ℹ️ This is how your business appears to visitors in the directory
            </div>
            <details style={{ marginTop: '16px' }}>
              <summary style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#4b5563',
                cursor: 'pointer',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                ✏️ Edit Business Info
              </summary>
              <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '14px' }}>
                  <strong>Name</strong>
                  <input name="name" value={form.name} onChange={handleChange} required style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    marginTop: '4px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }} />
                </label>
                <label style={{ fontSize: '14px' }}>
                  <strong>City</strong>
                  <input name="city" value={form.city} onChange={handleChange} required style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    marginTop: '4px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }} />
                </label>
                <label style={{ fontSize: '14px' }}>
                  <strong>Description</strong>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      marginTop: '4px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </label>
                <label style={{ fontSize: '14px' }}>
                  <strong>Gallery</strong>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleGalleryUpload}
                    disabled={galleryLoading}
                    style={{ marginTop: '8px' }}
                  />
                  {gallery.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {gallery.map((url) => (
                        <div key={url} style={{ position: 'relative' }}>
                          <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                          <button
                            type="button"
                            onClick={() => handleGalleryRemove(url)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              padding: '2px 6px',
                              cursor: 'pointer'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </label>
                <button type="submit" disabled={loading} style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                {message && <div style={{ color: '#10b981', fontSize: '14px' }}>{message}</div>}
              </form>
            </details>
          </div>
        )}

        {/* SECTION 3: Messages (FOMO Killer) */}
        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <InboxPreviewCard businessId={businessId} listingType={currentView} />
          </div>
        )}

        {/* SECTION 4: Rank & Visibility */}
        {businessId && (
          <div style={{ marginBottom: '32px' }}>
            <VisibilityRankMeter
              businessId={businessId}
              listingType={currentView}
              businessStatus={businessStatus}
            />
          </div>
        )}

        {/* SECTION 5: Premium Comparison Table (Free View Only) */}
        {businessId && showingFreeView && (
          <div id="upgrade" style={{ marginBottom: '32px' }}>
            <PremiumComparisonTable />
          </div>
        )}

        {/* Premium Features Preview (When in Premium Preview Mode) */}
        {businessId && showingPremiumView && previewMode && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>
                Premium Features Unlocked
              </h2>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
                With Premium, you'll have access to:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Reply to Messages</div>
                  <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '4px' }}>Unlimited client chats</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Top Placement</div>
                  <div style={{ fontSize: '13px', color: '#f59e0b', marginTop: '4px' }}>Appear first in search</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>Booking Deposits</div>
                  <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px' }}>Reduce no-shows</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#fdf2f8', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#9f1239' }}>Analytics Dashboard</div>
                  <div style={{ fontSize: '13px', color: '#E91E63', marginTop: '4px' }}>Track your growth</div>
                </div>
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 100%)',
                borderRadius: '12px',
                border: '2px solid #E91E63',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '48px', fontWeight: '800', color: '#E91E63', marginBottom: '8px' }}>
                  $49<span style={{ fontSize: '20px', color: '#6b7280' }}>/month</span>
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Cancel anytime • No long-term contracts</div>
              </div>
              <button
                onClick={() => setPreviewMode(null)}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(233, 30, 99, 0.3)',
                  marginRight: '12px'
                }}
              >
                Subscribe to Premium Now
              </button>
              <button
                onClick={() => setPreviewMode(null)}
                style={{
                  padding: '14px 32px',
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Free View
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Sticky Upgrade Bar (Free View Only) */}
      {isFree && !previewMode && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '2px solid #e5e7eb',
          padding: '16px 24px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          zIndex: 50
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                Upgrade to Premium
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Top placement • Chat • Deposits • Analytics
              </div>
            </div>
            <a
              href="#upgrade"
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                boxShadow: '0 8px 16px rgba(233, 30, 99, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              Unlock Everything – $49/mo
            </a>
          </div>
        </div>
      )}

    </section>
  );
};

export default OwnerMyBusiness;
