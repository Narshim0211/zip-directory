/**
 * User Utility Functions
 * Centralized functions for handling user data across the application
 */

/**
 * Get the display name for a user/profile with proper fallback chain
 * This ensures consistent name display across all components
 *
 * @param {Object} userOrProfile - User or profile object
 * @returns {string} Display name
 */
export const getDisplayName = (userOrProfile) => {
  if (!userOrProfile) return 'User';

  // Try different name field combinations in priority order

  // 1. Full name fields
  if (userOrProfile.fullName?.trim()) {
    return userOrProfile.fullName.trim();
  }

  if (userOrProfile.displayName?.trim()) {
    return userOrProfile.displayName.trim();
  }

  // 2. First + Last name
  const firstName = userOrProfile.firstName?.trim() || '';
  const lastName = userOrProfile.lastName?.trim() || '';
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim();
  }

  // 3. Identity object (for feed items)
  if (userOrProfile.identity?.fullName?.trim()) {
    return userOrProfile.identity.fullName.trim();
  }

  if (userOrProfile.identity?.name?.trim()) {
    return userOrProfile.identity.name.trim();
  }

  // 4. Username or handle
  if (userOrProfile.username?.trim()) {
    return userOrProfile.username.trim();
  }

  if (userOrProfile.handle?.trim()) {
    return `@${userOrProfile.handle.trim()}`;
  }

  // 5. Email (extract name part)
  if (userOrProfile.email) {
    const emailName = userOrProfile.email.split('@')[0];
    if (emailName) {
      return emailName;
    }
  }

  // 6. Final fallback
  return 'User';
};

/**
 * Get user initials for avatar display
 * @param {Object} userOrProfile - User or profile object
 * @returns {string} Two-letter initials
 */
export const getUserInitials = (userOrProfile) => {
  if (!userOrProfile) return 'U';

  const displayName = getDisplayName(userOrProfile);

  // If display name is "User", return "U"
  if (displayName === 'User') return 'U';

  // Split name and get first letter of first two words
  const parts = displayName.split(' ').filter(p => p.length > 0);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return 'U';
};

/**
 * Get avatar URL with fallback to UI Avatars
 * @param {Object} userOrProfile - User or profile object
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (userOrProfile) => {
  if (!userOrProfile) {
    return 'https://ui-avatars.com/api/?name=U&background=ddd&color=666';
  }

  // Return existing avatar if available
  if (userOrProfile.avatarUrl) {
    return userOrProfile.avatarUrl;
  }

  // Generate avatar from display name
  const displayName = getDisplayName(userOrProfile);
  const initials = getUserInitials(userOrProfile);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ddd&color=666`;
};
