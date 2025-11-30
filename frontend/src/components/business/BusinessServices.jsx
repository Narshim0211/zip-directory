import React, { useState } from 'react';

/**
 * BusinessServices Component
 *
 * Services list with name, duration, price, and "Book" button.
 * Groups services by category if available.
 *
 * @param {Array} services - Array of service objects
 * @param {Function} onBookService - Callback when book button is clicked for a service
 * @param {boolean} bookingEnabled - Whether booking is enabled for this business
 */
const BusinessServices = ({ services = [], onBookService, bookingEnabled = false }) => {
  const [showAll, setShowAll] = useState(false);

  if (!services || services.length === 0) {
    return (
      <div className="bp-services bp-services--empty">
        <div className="bp-services__empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <p>No services listed yet</p>
        </div>
      </div>
    );
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  const categories = Object.keys(groupedServices);
  const displayLimit = 5;
  const totalServices = services.length;
  const hasMore = totalServices > displayLimit;

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Price varies';
    return `$${price.toFixed(2)}`;
  };

  // Flatten for display limit
  let displayServices = [];
  let count = 0;
  for (const category of categories) {
    for (const service of groupedServices[category]) {
      if (showAll || count < displayLimit) {
        displayServices.push({ ...service, _category: category });
        count++;
      }
    }
  }

  // Re-group displayed services
  const displayGrouped = displayServices.reduce((acc, service) => {
    const category = service._category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="bp-services">
      {Object.entries(displayGrouped).map(([category, categoryServices]) => (
        <div key={category} className="bp-services__category">
          {categories.length > 1 && (
            <h4 className="bp-services__category-title">{category}</h4>
          )}
          <div className="bp-services__list">
            {categoryServices.map((service, index) => (
              <div key={service._id || index} className="bp-services__item">
                <div className="bp-services__info">
                  <div className="bp-services__name">{service.name}</div>
                  {service.description && (
                    <div className="bp-services__description">{service.description}</div>
                  )}
                  <div className="bp-services__meta">
                    {service.duration && (
                      <span className="bp-services__duration">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {formatDuration(service.duration)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bp-services__action">
                  <div className="bp-services__price">{formatPrice(service.price)}</div>
                  {bookingEnabled ? (
                    <button
                      className="bp-services__book-btn bp-services__book-btn--active"
                      onClick={() => onBookService && onBookService(service)}
                      title="Book this service"
                    >
                      Book
                    </button>
                  ) : (
                    <button
                      className="bp-services__book-btn"
                      disabled
                      title="Online booking coming soon!"
                    >
                      Book
                      <span className="bp-services__coming-soon">Coming Soon</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          className="bp-services__toggle"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `View all ${totalServices} services`}
        </button>
      )}
    </div>
  );
};

export default BusinessServices;
