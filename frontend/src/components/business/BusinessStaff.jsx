import React from 'react';

/**
 * BusinessStaff Component
 *
 * Team member grid with avatars, names, and roles.
 * Clean marketplace-style staff display.
 *
 * @param {Array} staff - Array of staff member objects
 */
const BusinessStaff = ({ staff = [] }) => {
  // Filter to active staff only
  const activeStaff = staff.filter((member) => member.isActive !== false);

  if (!activeStaff || activeStaff.length === 0) {
    return null; // Don't show section if no staff
  }

  // Generate initials for placeholder avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate consistent background color from name
  const getAvatarColor = (name) => {
    if (!name) return '#9333ea';
    const colors = [
      '#9333ea', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ef4444', // red
      '#06b6d4', // cyan
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="bp-staff">
      <div className="bp-staff__grid">
        {activeStaff.map((member, index) => (
          <div key={member._id || index} className="bp-staff__card">
            {/* Avatar */}
            <div className="bp-staff__avatar">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="bp-staff__avatar-placeholder"
                style={{
                  backgroundColor: getAvatarColor(member.name),
                  display: member.photoUrl ? 'none' : 'flex'
                }}
              >
                {getInitials(member.name)}
              </div>
            </div>

            {/* Info */}
            <div className="bp-staff__info">
              <h4 className="bp-staff__name">{member.name}</h4>
              {member.role && (
                <p className="bp-staff__role">{member.role}</p>
              )}
            </div>

            {/* Optional: Specialties/Services Badge */}
            {member.specialties && member.specialties.length > 0 && (
              <div className="bp-staff__specialties">
                {member.specialties.slice(0, 2).map((specialty, i) => (
                  <span key={i} className="bp-staff__specialty-badge">
                    {specialty}
                  </span>
                ))}
                {member.specialties.length > 2 && (
                  <span className="bp-staff__specialty-more">
                    +{member.specialties.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessStaff;
