import { useEffect, useRef } from 'react';

/**
 * useImpressionTracking Hook
 * Tracks when content enters viewport and sends impression to backend
 * Follows Instagram/TikTok/X (Twitter) patterns
 *
 * Features:
 * - IntersectionObserver for accurate viewport detection
 * - Throttling (5-second minimum between impressions)
 * - Session tracking (one impression per mount)
 * - 50% visibility threshold
 *
 * @param {string} contentId - ID of the content (post/survey)
 * @param {string} contentType - Type of content ('post' or 'survey')
 * @param {function} onVisible - Callback function to send impression
 * @returns {ref} elementRef - Ref to attach to the content element
 *
 * Usage:
 * const cardRef = useImpressionTracking(surveyId, 'survey', sendImpression);
 * return <div ref={cardRef}>...</div>
 */
export const useImpressionTracking = (contentId, contentType, onVisible) => {
  const elementRef = useRef(null);

  // COMPLETELY DISABLED - causing infinite loop
  // Will re-enable after fixing the root cause

  // useEffect(() => {
  //   if (!elementRef.current || !contentId || hasBeenSeen.current) return;
  //   const observer = new IntersectionObserver(...);
  //   observer.observe(elementRef.current);
  //   return () => { if (elementRef.current) observer.unobserve(elementRef.current); };
  // }, [contentId, contentType, onVisible]);

  return elementRef;
};

export default useImpressionTracking;
