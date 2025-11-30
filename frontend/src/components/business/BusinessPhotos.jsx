import React, { useState } from 'react';

/**
 * BusinessPhotos Component
 *
 * Photo gallery with grid layout and fullscreen lightbox preview.
 * Shows up to 6 photos initially with "View all X photos" button.
 *
 * @param {Array} photos - Array of photo objects with url property
 * @param {string} businessName - Business name for alt text
 */
const BusinessPhotos = ({ photos = [], businessName = 'Business' }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="bp-photos bp-photos--empty">
        <div className="bp-photos__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>No photos yet</p>
        </div>
      </div>
    );
  }

  const displayPhotos = showAll ? photos : photos.slice(0, 6);
  const hasMore = photos.length > 6;

  // Open lightbox at specific index
  const openLightbox = (index) => {
    setActiveIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  // Navigate lightbox
  const navigateLightbox = (direction) => {
    setActiveIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return photos.length - 1;
      if (newIndex >= photos.length) return 0;
      return newIndex;
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  return (
    <div className="bp-photos">
      {/* Photo Grid */}
      <div className={`bp-photos__grid bp-photos__grid--${Math.min(displayPhotos.length, 6)}`}>
        {displayPhotos.map((photo, index) => (
          <div
            key={photo._id || index}
            className="bp-photos__item"
            onClick={() => openLightbox(showAll ? index : index)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && openLightbox(index)}
          >
            <img
              src={photo.url}
              alt={`${businessName} photo ${index + 1}`}
              loading="lazy"
            />
            {/* Show "+X more" overlay on last visible photo */}
            {!showAll && hasMore && index === 5 && (
              <div className="bp-photos__more-overlay">
                <span>+{photos.length - 6} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Button */}
      {hasMore && !showAll && (
        <button
          className="bp-photos__view-all"
          onClick={() => setShowAll(true)}
        >
          View all {photos.length} photos
        </button>
      )}

      {/* Collapse Button */}
      {showAll && hasMore && (
        <button
          className="bp-photos__view-all"
          onClick={() => setShowAll(false)}
        >
          Show less
        </button>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="bp-lightbox" onClick={closeLightbox}>
          <div className="bp-lightbox__content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="bp-lightbox__close" onClick={closeLightbox} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Navigation - Previous */}
            <button
              className="bp-lightbox__nav bp-lightbox__nav--prev"
              onClick={() => navigateLightbox(-1)}
              aria-label="Previous photo"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            {/* Main Image */}
            <div className="bp-lightbox__image-container">
              <img
                src={photos[activeIndex]?.url}
                alt={`${businessName} photo ${activeIndex + 1}`}
              />
            </div>

            {/* Navigation - Next */}
            <button
              className="bp-lightbox__nav bp-lightbox__nav--next"
              onClick={() => navigateLightbox(1)}
              aria-label="Next photo"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            {/* Counter */}
            <div className="bp-lightbox__counter">
              {activeIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPhotos;
