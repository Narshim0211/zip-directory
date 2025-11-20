# 👁️ Impression Tracking System - Social Media Standards

## Overview
Implementation of **impression/view tracking** following Instagram, TikTok, X (Twitter), and YouTube standards.

---

## 🎯 What is an Impression?

An **impression** is counted when content (post, survey, video, etc.) is **displayed on a user's screen**.

### Key Characteristics:
- ✅ **Multiple impressions per user** allowed (like X/Twitter)
- ✅ **No login required** (public content tracking)
- ✅ **Viewport-based** (content must be visible, not just loaded)
- ✅ **Throttled** (prevent spam from rapid re-renders)
- ✅ **Real-time** (updates immediately)

---

## 📊 How Major Platforms Track Impressions

### X (Twitter)
```
✔ Impression = Tweet visible in viewport
✔ Multiple impressions per user: YES
✔ Counts: Feed scrolls, profile views, search results, embeds
✘ Does NOT require: Click, like, retweet, comment
```

**Example**: Same user sees tweet 10 times = **10 impressions**

### Instagram
```
✔ Impression = Post appears on screen (feed, explore, profile)
✔ Multiple impressions per user: YES
✔ Counts: Feed scrolls, explore page, profile visits, story views
```

### TikTok
```
✔ Impression = Video starts playing OR appears in feed
✔ Multiple impressions per user: YES
✔ Counts: For You Page, Following, Profile, Search
```

### YouTube Shorts
```
✔ Impression = Thumbnail visible OR video autoplays
✔ Multiple impressions per user: YES
✔ Counts: Shorts feed, subscriptions, search results
```

---

## 🏗️ Our Implementation

### Design Principles:
1. **Viewport Detection** - Use IntersectionObserver for accurate detection
2. **Throttling** - 5-second minimum between impressions from same session
3. **Session Tracking** - Prevent double-counting on same component mount
4. **Anonymous Support** - Works for logged-out users
5. **Aggregated Storage** - Single counter per content (not individual events)

---

## 🔧 Backend Implementation

### Current Endpoints:

#### Record Impression (Survey)
```
POST /api/v1/analytics/survey/view/:surveyId
Headers: Authorization (optional)

Response:
{
  "success": true,
  "data": {
    "views": 42,
    "responses": 5,
    "reactions": { "like": 10, "love": 3 }
  }
}
```

#### Record Impression (Post)
```
POST /api/v1/analytics/post/view/:postId
Headers: Authorization (optional)

Response:
{
  "success": true,
  "data": {
    "views": 128,
    "reactions": { "like": 25, "love": 8 }
  }
}
```

### Backend Logic:

**File**: `backend/modules/analytics/survey/surveyEngagement.model.js`

```javascript
surveyEngagementSchema.statics.incrementViews = async function(surveyId, userId = null) {
  const engagement = await this.findOneAndUpdate(
    { surveyId },
    {
      $inc: { views: 1 }, // Increment by 1 every time
      $setOnInsert: {
        responses: 0,
        reactions: { like: 0, love: 0 },
        reactedBy: []
      }
    },
    { upsert: true, new: true }
  );

  return engagement;
};
```

**Key Point**: `$inc: { views: 1 }` increments the counter **every time**, allowing multiple impressions.

---

## 🎨 Frontend Implementation

### Current Status:
❌ **NOT IMPLEMENTED** - Frontend never calls impression endpoints

The engagement bars show:
```
👁️ 0  💬 0 responses  👍 0  ❤️ 0
```

But the view count (👁️) never increases because frontend doesn't track when content enters viewport.

### Required Implementation:

#### 1. IntersectionObserver Hook

**File**: `frontend/src/hooks/useImpressionTracking.js` (NEW)

```javascript
import { useEffect, useRef } from 'react';

export const useImpressionTracking = (contentId, contentType, sendImpression) => {
  const elementRef = useRef(null);
  const hasBeenSeen = useRef(false);
  const lastImpressionTime = useRef(0);

  useEffect(() => {
    if (!elementRef.current || !contentId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Content is visible in viewport
          if (entry.isIntersecting) {
            const now = Date.now();
            const timeSinceLastImpression = now - lastImpressionTime.current;

            // Throttle: Only send if 5 seconds have passed since last impression
            if (timeSinceLastImpression > 5000 || lastImpressionTime.current === 0) {
              console.log(`👁️ [Impression] ${contentType} ${contentId} visible`);
              sendImpression(contentId, contentType);
              lastImpressionTime.current = now;
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
  }, [contentId, contentType, sendImpression]);

  return elementRef;
};
```

#### 2. Update Engagement Bars to Track Impressions

**File**: `frontend/src/components/engagement/SurveyEngagementBar.jsx`

```javascript
import { useEffect, useRef } from 'react';
import { incrementSurveyView } from '../../api/engagementApi';

const SurveyEngagementBar = ({ surveyId, onReact }) => {
  const cardRef = useRef(null);
  const impressionSent = useRef(false);

  // Track impression when component enters viewport
  useEffect(() => {
    if (!surveyId || !cardRef.current || impressionSent.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionSent.current) {
            console.log('👁️ [Impression] Survey visible:', surveyId);
            incrementSurveyView(surveyId).catch(err => {
              console.error('Failed to record impression:', err);
            });
            impressionSent.current = true; // Only send once per mount
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [surveyId]);

  return (
    <div ref={cardRef} className="engagement-bar survey">
      {/* ... existing UI ... */}
    </div>
  );
};
```

**Same for**: `PostEngagementBar.jsx`

---

## 🔐 Privacy & Performance

### Privacy Considerations:
- ✅ Anonymous users can trigger impressions (no login required)
- ✅ No personal data stored (just counters)
- ✅ Optional userId tracking for unique viewer analytics (future feature)

### Performance:
- ✅ **Throttling** prevents spam (5-second minimum)
- ✅ **Session flag** prevents double-counting on same mount
- ✅ **Lazy loading** - Only track when visible in viewport
- ✅ **Fire-and-forget** - No UI blocking, error doesn't break page
- ✅ **Aggregated counters** - Single document per content (not millions of rows)

---

## 📈 Analytics Insights

### Current Metrics:
```
👁️ Views (Impressions)
💬 Responses (Surveys only)
👍 Likes
❤️ Loves
```

### Future Enhancements:
- **Unique viewers** (distinct userId count)
- **View duration** (how long content was visible)
- **Scroll depth** (how much of content was seen)
- **Engagement rate** = (reactions + responses) / views
- **Viral coefficient** = impressions / followers

---

## 🧪 Testing Checklist

### Impression Counting:
- [ ] Open feed → scroll to survey/post → view count increases
- [ ] Same user scrolls back → view count increases again ✅
- [ ] Rapid scroll (spam) → throttle prevents excessive counting
- [ ] Refresh page → new impression counted
- [ ] Multiple tabs → each tab counts separately
- [ ] Anonymous user → impressions still work
- [ ] Logged-in user → impressions work + optional tracking

### Throttling:
- [ ] Scroll to content → wait 3 seconds → scroll away → scroll back → NO new impression (5-second throttle)
- [ ] Scroll to content → wait 6 seconds → scroll away → scroll back → NEW impression counted ✅

### Session Tracking:
- [ ] Component mounts → impression sent
- [ ] Component stays in viewport → NO additional impressions
- [ ] Component unmounts → remounts → NEW impression counted ✅

---

## 🚀 Implementation Status

### ✅ Backend:
- [x] `POST /api/v1/analytics/survey/view/:surveyId` endpoint exists
- [x] `POST /api/v1/analytics/post/view/:postId` endpoint exists
- [x] Increment logic working (`$inc: { views: 1 }`)
- [x] Returns updated counts in response
- [x] Anonymous users supported (userId optional)

### ❌ Frontend:
- [ ] **NOT IMPLEMENTED** - No IntersectionObserver tracking
- [ ] Engagement bars never call `incrementSurveyView()` or `incrementPostView()`
- [ ] View counts always show 0
- [ ] Need to add `useImpressionTracking` hook
- [ ] Need to add `ref` to card containers
- [ ] Need to call impression API on viewport enter

---

## 🎯 Implementation Plan

### Step 1: Create Impression Hook
Create `frontend/src/hooks/useImpressionTracking.js` with IntersectionObserver logic

### Step 2: Update Survey Cards
Add impression tracking to survey card components:
- `FeedSurveyCard.jsx`
- `SurveyEngagementBar.jsx`

### Step 3: Update Post Cards
Add impression tracking to post card components:
- `FeedPostCard.jsx`
- `PostEngagementBar.jsx`

### Step 4: Test Thoroughly
- Multiple impressions per user
- Throttling behavior
- Anonymous vs authenticated users
- Console logging for debugging

### Step 5: Monitor Analytics
- Check backend logs for impression requests
- Verify MongoDB counters incrementing
- Watch for any performance issues

---

## 📝 Code Examples

### Before (Current - Broken):
```javascript
// NO impression tracking at all
<div className="engagement-bar">
  <span>👁️ {engagement.views}</span>  {/* Always 0! */}
</div>
```

### After (Fixed):
```javascript
import { useImpressionTracking } from '../../hooks/useImpressionTracking';

const SurveyCard = ({ surveyId }) => {
  const cardRef = useImpressionTracking(surveyId, 'survey', incrementSurveyView);

  return (
    <div ref={cardRef} className="survey-card">
      <span>👁️ {engagement.views}</span>  {/* Updates in real-time! */}
    </div>
  );
};
```

---

## 🔍 Debugging

### Console Logs to Add:
```javascript
console.log('👁️ [Impression] Content entered viewport:', contentId);
console.log('⏱️ [Throttle] Skipped - too soon since last impression');
console.log('✅ [Impression] API call successful, new count:', response.views);
console.log('❌ [Impression] API call failed:', error);
```

### Backend Logs:
```
[INFO] Survey view recorded: 507f1f77bcf86cd799439011
[INFO] Post view recorded: 507f191e810c19729de860ea
```

---

## 📊 Expected Behavior

### Scenario 1: First View
```
User scrolls → Content enters viewport → IntersectionObserver triggers
→ API call: POST /api/v1/analytics/survey/view/123
→ Backend: views++ (0 → 1)
→ Response: { views: 1 }
→ UI updates: 👁️ 1
```

### Scenario 2: Scroll Back
```
Same user scrolls down → scrolls back up → Content enters viewport again
→ 5+ seconds have passed → IntersectionObserver triggers
→ API call: POST /api/v1/analytics/survey/view/123
→ Backend: views++ (1 → 2)
→ Response: { views: 2 }
→ UI updates: 👁️ 2
```

### Scenario 3: Rapid Scroll (Throttled)
```
User rapidly scrolls up/down → Content enters viewport multiple times
→ Only 2 seconds have passed → Throttle blocks API call
→ NO new impression counted
→ Console: "⏱️ Throttled"
```

---

## ✅ Success Criteria

Implementation is complete when:
1. ✅ View count increases when content enters viewport
2. ✅ Same user can generate multiple impressions (like X/Twitter)
3. ✅ Throttling prevents spam (5-second minimum)
4. ✅ Works for anonymous users
5. ✅ No performance issues (lazy loading, fire-and-forget)
6. ✅ Console logs show impression tracking working
7. ✅ Backend logs show API requests
8. ✅ MongoDB documents show incrementing view counts

---

**Status**: ❌ **NOT IMPLEMENTED**
**Next Step**: Implement IntersectionObserver tracking in frontend
**Priority**: HIGH (core analytics feature)
**Estimated Effort**: 2-3 hours

---

**Document Date**: November 20, 2025
**Last Updated**: After reaction system bug fix
