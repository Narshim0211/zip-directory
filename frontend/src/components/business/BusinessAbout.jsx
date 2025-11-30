import React, { useState } from 'react';

/**
 * BusinessAbout Component
 *
 * About section with description, business hours, address, and social links.
 * Expandable description with "Read more" for long text.
 *
 * @param {Object} business - Business data object
 */
const BusinessAbout = ({ business }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!business) return null;

  const {
    description,
    hours = {},
    address,
    city,
    state,
    zipCode,
    phone,
    email,
    website,
    socialMedia = {}
  } = business;

  // Format hours for display
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  // Get current day to highlight
  const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Check if currently open
  const isOpenNow = () => {
    const todayHours = hours[today];
    if (!todayHours || todayHours.closed) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const [time, period] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 100 + (m || 0);
    };

    const openTime = parseTime(todayHours.open);
    const closeTime = parseTime(todayHours.close);

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const openStatus = isOpenNow();

  // Truncate description
  const maxLength = 200;
  const shouldTruncate = description && description.length > maxLength;
  const displayDescription = shouldTruncate && !isExpanded
    ? description.substring(0, maxLength) + '...'
    : description;

  // Build full address
  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bp-about">
      {/* Description */}
      {description && (
        <div className="bp-about__section">
          <h3 className="bp-about__title">About</h3>
          <p className="bp-about__description">{displayDescription}</p>
          {shouldTruncate && (
            <button
              className="bp-about__read-more"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Business Hours */}
      {Object.keys(hours).length > 0 && (
        <div className="bp-about__section">
          <div className="bp-about__title-row">
            <h3 className="bp-about__title">Hours</h3>
            <span className={`bp-about__status ${openStatus ? 'bp-about__status--open' : 'bp-about__status--closed'}`}>
              {openStatus ? 'Open Now' : 'Closed'}
            </span>
          </div>
          <div className="bp-about__hours">
            {daysOfWeek.map((day) => {
              const dayHours = hours[day];
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`bp-about__hours-row ${isToday ? 'bp-about__hours-row--today' : ''}`}
                >
                  <span className="bp-about__day">{dayLabels[day]}</span>
                  <span className="bp-about__time">
                    {dayHours?.closed
                      ? 'Closed'
                      : dayHours?.open && dayHours?.close
                      ? `${dayHours.open} - ${dayHours.close}`
                      : 'Not set'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Location & Contact */}
      <div className="bp-about__section">
        <h3 className="bp-about__title">Location & Contact</h3>
        <div className="bp-about__contact-list">
          {/* Address */}
          {fullAddress && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-about__contact-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{fullAddress}</span>
            </a>
          )}

          {/* Phone */}
          {phone && (
            <a href={`tel:${phone}`} className="bp-about__contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{phone}</span>
            </a>
          )}

          {/* Email */}
          {email && (
            <a href={`mailto:${email}`} className="bp-about__contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{email}</span>
            </a>
          )}

          {/* Website */}
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-about__contact-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </div>

      {/* Social Media */}
      {(socialMedia.instagram || socialMedia.facebook || socialMedia.twitter || socialMedia.tiktok) && (
        <div className="bp-about__section">
          <h3 className="bp-about__title">Follow Us</h3>
          <div className="bp-about__social">
            {socialMedia.instagram && (
              <a
                href={`https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-about__social-link"
                aria-label="Instagram"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {socialMedia.facebook && (
              <a
                href={`https://facebook.com/${socialMedia.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-about__social-link"
                aria-label="Facebook"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {socialMedia.twitter && (
              <a
                href={`https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-about__social-link"
                aria-label="Twitter/X"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {socialMedia.tiktok && (
              <a
                href={`https://tiktok.com/@${socialMedia.tiktok.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-about__social-link"
                aria-label="TikTok"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessAbout;
