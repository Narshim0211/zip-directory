import React from "react";
import { Link } from "react-router-dom";
import UnifiedSearchBar from "./UnifiedSearchBar";
import "../styles/HomePage.css";

const LandingPage = () => {
  return (
    <div className="home-page">
      {/* Header with Logo */}
      <header style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '16px 5%',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            cursor: 'pointer'
          }}>
            SalonHub
          </h1>
        </div>
      </header>

      {/* Directory Search Section */}
      <div className="directory-landing__hero" style={{ padding: '60px 5%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h1 className="directory-landing__title" style={{ color: '#fff', textAlign: 'center', fontSize: '42px', marginBottom: '16px' }}>
          Find Your Perfect Salon or Spa
        </h1>
        <p className="directory-landing__subtitle" style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '18px', marginBottom: '40px' }}>
          Discover salons, spas, and stylists near you
        </p>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <UnifiedSearchBar
            size="large"
            placeholder="Braids, Dallas, 75001..."
            autoFocus={false}
          />
        </div>
      </div>

      {/* Per PRD: no News Feed on Landing */}

      {/* Feature Boxes - Left & Right with Empty Middle */}
      <section style={{
        padding: '80px 5%',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '5%',
        flexWrap: 'wrap'
      }}>
        {/* LEFT SIDE - Visitor Feature Box */}
        <div style={{
          width: '34%',
          minWidth: '320px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
          padding: '32px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.05)';
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#2563EB',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👤 For Visitors
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#6B7280',
              lineHeight: '1.6',
              margin: 0
            }}>
              Sign up to unlock free tools that help you grow, stay organized, and be part of the beauty community.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Feature 1 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              borderLeft: '4px solid #2563EB'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏰ Time Management Tool
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Plan your daily tasks (morning, afternoon, evening) to stay consistent and productive.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              borderLeft: '4px solid #2563EB'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⭐ Access to Top Rated Stylist
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Discover and connect with highly-rated stylists and beauty professionals in your area.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              borderLeft: '4px solid #2563EB'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Create & Follow Surveys
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Share opinions or participate in beauty-related surveys posted by creators.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              borderLeft: '4px solid #2563EB'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔥 Trending Feed
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                View trending posts, updates, and popular surveys happening right now.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              borderLeft: '4px solid #2563EB'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                👥 Join a Community
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Follow creators, interact with posts, and connect with like-minded users.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/register?role=visitor"
            style={{
              display: 'block',
              marginTop: '24px',
              padding: '14px 24px',
              backgroundColor: '#2563EB',
              color: 'white',
              textAlign: 'center',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1D4ED8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563EB'}
          >
            Create a Free Visitor Account →
          </Link>
        </div>

        {/* EMPTY MIDDLE SPACE - 20-25% */}
        <div style={{ width: '20%', minWidth: '0' }}></div>

        {/* RIGHT SIDE - Business Owner Feature Box */}
        <div style={{
          width: '34%',
          minWidth: '320px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.05)',
          padding: '32px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.05)';
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#16A34A',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💼 For Business Owners
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#6B7280',
              lineHeight: '1.6',
              margin: 0
            }}>
              Grow your business, engage your followers, and build your brand inside SalonHub.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Feature 1 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              borderLeft: '4px solid #16A34A'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏢 List Your Business
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Showcase services, pricing, location, and business details for customers to explore.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              borderLeft: '4px solid #16A34A'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⭐ Create Profile & Gain Followers
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Build a professional public profile that customers can follow.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              borderLeft: '4px solid #16A34A'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📢 Promote Your Business
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Post updates, photos, offers, and content that helps you stand out.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              borderLeft: '4px solid #16A34A'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📸 Create Posts for Followers
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Share tips, promotions, before/after photos to engage your audience.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#ECFDF5',
              borderRadius: '12px',
              borderLeft: '4px solid #16A34A'
            }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌟 Build Your SalonHub Community
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                lineHeight: '1.5'
              }}>
                Connect with followers who love your work and return regularly.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/register?role=owner"
            style={{
              display: 'block',
              marginTop: '24px',
              padding: '14px 24px',
              backgroundColor: '#16A34A',
              color: 'white',
              textAlign: 'center',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803D'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#16A34A'}
          >
            Join as a Business →
          </Link>
        </div>
      </section>

      {/* Responsive styles for mobile */}
      <style>
        {`
          @media (max-width: 968px) {
            section[style*="space-between"] {
              flex-direction: column !important;
              align-items: center !important;
              gap: 32px !important;
            }
            section[style*="space-between"] > div {
              width: 100% !important;
              max-width: 500px !important;
            }
            section[style*="space-between"] > div[style*="width: '20%'"] {
              display: none !important;
            }
          }
        `}
      </style>

      <section className="features">
        <h2>Why Join SalonHub?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png" alt="Search" />
            <h3>Discover Nearby Salons</h3>
            <p>Search by city or category and find the perfect stylist or spa for your needs.</p>
          </div>
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/1754/1754675.png" alt="Reviews" />
            <h3>Read & Leave Reviews</h3>
            <p>See what others say about their experience and share your own feedback.</p>
          </div>
          <div className="feature-card">
            <img src="https://cdn-icons-png.flaticon.com/512/3050/3050525.png" alt="Growth" />
            <h3>Grow Your Salon Brand</h3>
            <p>Showcase services, photos, and client reviews in one place.</p>
          </div>
        </div>
      </section>

      <footer className="footer">(c) 2025 SalonHub - Built for the Beauty Industry</footer>
    </div>
  );
};

export default LandingPage;
