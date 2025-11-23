# 🧪 Reviews System - Frontend Testing Guide

**Purpose:** Test the Reviews System from the visitor's perspective (browser-based testing)

---

## 📋 Prerequisites

1. ✅ Backend server running on http://localhost:5000
2. ✅ Frontend server running on http://localhost:3000
3. ✅ At least one business with public profile active
4. ✅ Visitor account logged in

---

## 🎯 Test Scenarios

### Test 1: View Business Profile (No Reviews Yet)

**Steps:**
1. Log in as a **visitor** account
2. Navigate to a business profile (e.g., `/book/mystudio` or public profile page)
3. Scroll down to the **Reviews section**

**Expected Result:**
```
┌─────────────────────────────────────────┐
│ Reviews                                 │
├─────────────────────────────────────────┤
│                                         │
│         📋                              │
│    No reviews yet                       │
│ Be the first to share your experience!  │
│                                         │
│ ⭐ 0.0  (0 reviews)                     │
└─────────────────────────────────────────┘
```

✅ **PASS if:**
- Reviews section appears below Hours section
- Empty state message displays
- No errors in browser console

❌ **FAIL if:**
- Section doesn't appear
- Console shows errors (check Network tab for API errors)
- ReviewList component crashes

---

### Test 2: "Real Results Shown" Badge (FIX #2)

**Setup:**
1. Use API or database to add 3+ reviews with `photoUrl` for a business
2. Navigate to that business profile

**Expected Result:**
```
┌─────────────────────────────────────────┐
│  ⭐ 4.8  (15 reviews)                   │
│                                         │
│  ⚡ Real Results Shown  ← Badge appears │
│                                         │
│  [Most Recent ▼]                        │
└─────────────────────────────────────────┘
```

✅ **PASS if:**
- Badge appears when `photoReviewCount >= 3`
- Badge has glow animation
- Badge text is "Real Results Shown"

❌ **FAIL if:**
- Badge doesn't appear even with 3+ photo reviews
- Badge appears when less than 3 photo reviews

---

### Test 3: Review Cards Display

**Setup:** Business has at least 1 review

**Expected Result:**
```
┌─────────────────────────────────────────┐
│ 👤 Sarah J.        ⭐⭐⭐⭐⭐ 5.0        │
│ ✓ Verified Booking  •  2 days ago      │
│                                         │
│ "Amazing service! My braids look        │
│  perfect! Highly recommend!"            │
│                                         │
│ [Photo if available]                    │
└─────────────────────────────────────────┘
```

✅ **PASS if:**
- User avatar displays (or gradient placeholder)
- Star rating shows correctly
- "Verified Booking" badge appears
- Message text displays
- Photo displays if `photoUrl` exists
- Time since review (e.g., "2 days ago")

---

### Test 4: Photo Lightbox

**Setup:** Click on a review photo

**Expected Result:**
- Photo opens in fullscreen lightbox
- Black overlay background
- Close button (×) in top-right
- Clicking outside photo closes lightbox
- Clicking × button closes lightbox

✅ **PASS if:**
- Lightbox opens smoothly
- Photo is centered and scaled properly
- Close functionality works
- No scroll behind lightbox

---

### Test 5: Sorting Filters

**Setup:** Business has multiple reviews with different ratings

**Steps:**
1. Click "Highest Rated" filter
2. Verify reviews sort by rating (5★ → 1★)
3. Click "Lowest Rated" filter
4. Verify reviews sort by rating (1★ → 5★)
5. Click "Most Recent" filter
6. Verify reviews sort by date (newest first)

✅ **PASS if:**
- Active filter has purple background (#667eea)
- Reviews re-sort correctly
- No page reload (AJAX sorting)

---

### Test 6: Rating Summary

**Expected Display:**
```
┌─────────────────────────────────────────┐
│         4.8 ⭐⭐⭐⭐⭐                    │
│        124 reviews                      │
│                                         │
│  5★  ████████████████████ 98           │
│  4★  ████                 20           │
│  3★  █                     4           │
│  2★                        1           │
│  1★                        1           │
└─────────────────────────────────────────┘
```

✅ **PASS if:**
- Average rating displays correctly (1 decimal)
- Total review count matches
- Distribution bars show proportionally
- Numbers add up to total

---

### Test 7: Mobile Responsive

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone 12 Pro (390x844)
4. Test on iPad (768x1024)

✅ **PASS if:**
- Reviews section adapts to screen width
- Filter buttons wrap on mobile
- Review cards are readable
- Photos resize correctly
- No horizontal scroll

---

### Test 8: Console Errors

**Steps:**
1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Visit business profile page
4. Check for errors

✅ **PASS if:**
- No red errors in console
- API calls succeed (check Network tab)
- GET `/api/reviews/business/:id` returns 200

❌ **FAIL if:**
- 404 errors (component not found)
- 500 errors (server crash)
- CORS errors
- React warnings about keys/props

---

## 🐛 Common Issues & Fixes

### Issue 1: "Reviews" section not appearing

**Possible Causes:**
- ReviewList component not imported in PublicProfile.jsx
- `businessId` prop not passed correctly

**Debug:**
```javascript
// Check browser console for:
console.log('businessId:', profile._id);
```

**Fix:** Verify [PublicProfile.jsx:363](frontend/src/pages/PublicProfile.jsx#L363)

---

### Issue 2: API returns 404 for reviews

**Possible Causes:**
- Backend routes not registered
- Server not restarted after code changes

**Debug:**
```bash
# Check if route exists
curl http://localhost:5000/api/reviews/business/690d10a72129abc8de695549
```

**Fix:** Restart backend server

---

### Issue 3: "Real Results Shown" badge not showing

**Possible Causes:**
- Business.photoReviewCount not updated
- Badge logic checking wrong threshold

**Debug:**
```bash
# Check business photoReviewCount
curl http://localhost:5000/api/reviews/business/YOUR_BUSINESS_ID
# Look for "photoReviewCount": 3
```

**Fix:** Submit reviews with photos via API to increment count

---

### Issue 4: Photos not displaying in review cards

**Possible Causes:**
- `photoUrl` is null or invalid
- Image URL broken (Cloudinary issue)
- CSS hiding images

**Debug:**
- Right-click photo → Inspect Element
- Check if `<img src="...">` exists
- Try opening image URL directly in browser

**Fix:** Verify photoUrl in database

---

## 📊 Test Results Template

Use this checklist to track your testing:

```
Frontend Tests - Reviews System V1
Date: ___________
Tester: ___________

┌─────────────────────────────────────────┬──────┬────────┐
│ Test                                    │ Pass │ Notes  │
├─────────────────────────────────────────┼──────┼────────┤
│ 1. View profile (no reviews)            │ ☐    │        │
│ 2. "Real Results Shown" badge (FIX #2)  │ ☐    │        │
│ 3. Review cards display                 │ ☐    │        │
│ 4. Photo lightbox                       │ ☐    │        │
│ 5. Sorting filters                      │ ☐    │        │
│ 6. Rating summary                       │ ☐    │        │
│ 7. Mobile responsive                    │ ☐    │        │
│ 8. No console errors                    │ ☐    │        │
└─────────────────────────────────────────┴──────┴────────┘
```

---

## 🚀 Next: Submit a Review (Coming Soon)

To fully test the review submission flow, you'll need:
1. ✅ ReviewModal component (not yet implemented)
2. ✅ Completed booking in database
3. ✅ Integration with booking completion flow

For now, reviews can be submitted via API (see [REVIEWS_API_TESTING_GUIDE.md](REVIEWS_API_TESTING_GUIDE.md))

---

**Last Updated:** November 22, 2025
**Status:** Ready for manual testing
