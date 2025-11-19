/**
 * Redirect After Login Utility
 * Handles post-authentication navigation
 * Reads stored redirect URL from sessionStorage
 * NO duplication - single source of truth for redirects
 */

/**
 * Get the stored redirect URL
 * @returns {string|null} Redirect URL or null if not set
 */
export const getRedirectUrl = () => {
  return sessionStorage.getItem('redirectAfterLogin');
};

/**
 * Set the redirect URL
 * @param {string} url - URL to redirect to after login
 */
export const setRedirectUrl = (url) => {
  sessionStorage.setItem('redirectAfterLogin', url);
};

/**
 * Clear the stored redirect URL
 */
export const clearRedirectUrl = () => {
  sessionStorage.removeItem('redirectAfterLogin');
};

/**
 * Perform redirect after login
 * Redirects to stored URL or default fallback
 * @param {Object} navigate - React Router navigate function
 * @param {string} defaultPath - Default path if no redirect stored
 */
export const redirectAfterLogin = (navigate, defaultPath = '/visitor/home') => {
  const redirectUrl = getRedirectUrl();
  
  if (redirectUrl) {
    clearRedirectUrl();
    navigate(redirectUrl);
  } else {
    navigate(defaultPath);
  }
};

/**
 * Check if there's a pending redirect
 * @returns {boolean} True if redirect is stored
 */
export const hasPendingRedirect = () => {
  return !!getRedirectUrl();
};

export default {
  getRedirectUrl,
  setRedirectUrl,
  clearRedirectUrl,
  redirectAfterLogin,
  hasPendingRedirect,
};
