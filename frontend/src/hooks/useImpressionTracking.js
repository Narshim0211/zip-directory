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
  const hasBeenSeen = useRef(false);
  const lastImpressionTime = useRef(0);

  useEffect(() => {
    if (!elementRef.current || !contentId || hasBeenSeen.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Content is visible in viewport
          if (entry.isIntersecting) {
            const now = Date.now();
            const timeSinceLastImpression = now - lastImpressionTime.current;

            // Throttle: Only send if 5 seconds have passed since last impression
            // OR this is the first impression (lastImpressionTime === 0)
            if (timeSinceLastImpression > 5000 || lastImpressionTime.current === 0) {
              console.log(`👁️ [Impression] ${contentType} ${contentId} visible`);

              // Call the callback function (should send API request)
              if (onVisible) {
                onVisible(contentType, contentId);
              }

              lastImpressionTime.current = now;
              hasBeenSeen.current = true; // Only send once per mount

            } else {
              console.log(`⏱️ [Throttle] Skipped impression for ${contentType} ${contentId} - too soon`);
            }
          }
        });
      },
      {
        threshold: 0.5, // At least 50% of content must be visible
        rootMargin: '0px'
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [contentId, contentType, onVisible]);

  return elementRef;
};

export default useImpressionTracking;
