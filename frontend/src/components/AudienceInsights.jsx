import React from 'react';

const AudienceInsights = ({ cities = [] }) => {
  return (
    <div className="audience-insights">
      <div className="audience-insights__header">
        <span>Top cities</span>
      </div>
      {cities.length === 0 ? (
        <div className="audience-insights__empty">Visits will appear here.</div>
      ) : (
        <ul>
          {cities.map((city) => (
            <li key={city.city}>
              <span>{city.city}</span>
              <strong>{city.visits}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AudienceInsights;
