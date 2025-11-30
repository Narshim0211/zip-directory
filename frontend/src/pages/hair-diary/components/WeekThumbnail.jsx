import React from 'react';

/**
 * WeekThumbnail - Single week's photo in the timeline
 */
const WeekThumbnail = ({ week, photo, onClick }) => {
  return (
    <div className="week-thumbnail" onClick={onClick}>
      {photo ? (
        <img
          src={photo}
          alt={`Week ${week}`}
          className="week-thumbnail__image"
        />
      ) : (
        <div className="week-thumbnail__image week-thumbnail__image--empty">
          📷
        </div>
      )}
      <span className="week-thumbnail__label">Week {week}</span>
    </div>
  );
};

export default WeekThumbnail;
