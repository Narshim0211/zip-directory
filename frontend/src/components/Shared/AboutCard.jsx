import React from 'react';
import { Link } from 'react-router-dom';
import './AboutCard.css';

const AboutCard = ({ profile, role = 'owner', businesses = [] }) => {
  const { bio, socialLinks = {}, counts = {}, createdAt } = profile;

  const joinDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : null;

  const hasSocialLinks = socialLinks && (socialLinks.twitter || socialLinks.instagram || socialLinks.website);
  const hasFeaturedBusinesses = role === 'owner' && businesses && businesses.length > 0;

  return (
    <div className="about-card">
      {bio && (
        <section className="about-card__section">
          <h3 className="about-card__heading">Bio</h3>
          <p className="about-card__bio">{bio}</p>
        </section>
      )}

      {hasSocialLinks && (
        <section className="about-card__section">
          <h3 className="about-card__heading">Links</h3>
          <div className="about-card__links">
            {socialLinks.website && (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="about-card__link"
              >
                <span className="about-card__link-icon">🌐</span>
                {socialLinks.website}
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={`https://twitter.com/${socialLinks.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="about-card__link"
              >
                <span className="about-card__link-icon">🐦</span>
                @{socialLinks.twitter.replace('@', '')}
              </a>
            )}
            {socialLinks.instagram && (
              <a
                href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="about-card__link"
              >
                <span className="about-card__link-icon">📷</span>
                @{socialLinks.instagram.replace('@', '')}
              </a>
            )}
          </div>
        </section>
      )}

      <section className="about-card__section">
        <h3 className="about-card__heading">Stats</h3>
        <div className="about-card__stats">
          <div className="about-card__stat">
            <span className="about-card__stat-value">{counts.followers || 0}</span>
            <span className="about-card__stat-label">Followers</span>
          </div>
          <div className="about-card__stat">
            <span className="about-card__stat-value">{counts.following || 0}</span>
            <span className="about-card__stat-label">Following</span>
          </div>
          {role === 'owner' && (
            <>
              <div className="about-card__stat">
                <span className="about-card__stat-value">{counts.posts || 0}</span>
                <span className="about-card__stat-label">Posts</span>
              </div>
              <div className="about-card__stat">
                <span className="about-card__stat-value">{counts.surveys || 0}</span>
                <span className="about-card__stat-label">Surveys</span>
              </div>
            </>
          )}
          {role === 'visitor' && (
            <div className="about-card__stat">
              <span className="about-card__stat-value">{counts.surveys || 0}</span>
              <span className="about-card__stat-label">Surveys</span>
            </div>
          )}
        </div>
      </section>

      {joinDate && (
        <section className="about-card__section">
          <h3 className="about-card__heading">Member Since</h3>
          <p className="about-card__join-date">📅 Joined {joinDate}</p>
        </section>
      )}

      {hasFeaturedBusinesses && (
        <section className="about-card__section">
          <h3 className="about-card__heading">Featured Businesses</h3>
          <div className="about-card__businesses">
            {businesses.map(business => (
              <Link
                key={business._id}
                to={`/business/${business._id}`}
                className="about-card__business"
              >
                <div className="about-card__business-name">{business.name}</div>
                {business.address && (
                  <div className="about-card__business-address">{business.address}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutCard;
