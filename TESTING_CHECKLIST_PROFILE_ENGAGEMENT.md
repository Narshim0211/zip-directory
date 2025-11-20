# ✅ Testing Checklist - Profile & Engagement System

## Pre-Testing Setup

### 1. Ensure Backend is Running
```bash
cd backend
npm start
```
Backend should be on: `http://localhost:5000`

### 2. Ensure Frontend is Running
```bash
cd frontend
npm start
```
Frontend should be on: `http://localhost:3000`

### 3. Clear Browser Cache
- Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Clear cached images and files
- Hard reload: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

## Test 1: Engagement Bars on Home Feed

### Steps:
1. **Login** as Visitor or Owner
2. **Navigate** to `/visitor/home` or `/owner/home`
3. **Scroll** through the feed

### ✅ Expected Result:
- Every **SurveyCard** shows: `👁 0 views • ❤️ 0 reactions • 📝 0 responses`
- Every **PostCard** shows: `👁 0 views • ❤️ 0 reactions`
- Metrics are visible even when values are 0
- Clean separator line above engagement bar

### ❌ If Failed:
- Check browser console for errors
- Verify engagement components are imported
- Check network tab for failed API calls to `/api/v1/analytics/...`

---

## Test 2: Username Click → Profile Navigation

### Steps:
1. **On home feed**, hover over any username
2. **Click** on the username

### ✅ Expected Result:
- Browser navigates to `/profile/:userId`
- Profile page loads with user's information
- URL shows user ID (e.g., `/profile/674d8a9e2f1234567890abcd`)

### ❌ If Failed:
**Check IdentityBadge component:**
```bash
grep -n "userId || slug" frontend/src/components/SharedComponents/IdentityBadge.jsx
```
Should show line 24: `{(userId || slug) ?`

**Check if route exists:**
```bash
grep "profile/:userId" frontend/src/App.js
```
Should show: `<Route path="/profile/:userId"`

**Check browser console** for routing errors.

---

## Test 3: Profile Page Loads Correctly

### Steps:
1. **Navigate** to `/profile/:userId` (replace `:userId` with actual user ID)
2. **Wait** for page to load

### ✅ Expected Result:
- Profile header shows: avatar, name, role badge
- Profile stats show: Followers, Following, Surveys, Posts
- Follow/Following button appears (if not viewing own profile)
- Tabs show: About, Surveys, Posts (owner only)
- No errors in console

### ❌ If Failed:
**Check ProfilePage exists:**
```bash
ls frontend/src/pages/ProfilePage.jsx
```

**Check ProfilePage is imported in App.js:**
```bash
grep "import ProfilePage" frontend/src/App.js
```

**Check API calls in Network tab:**
- Should call: `/api/v1/profile/id/:userId`
- Should call: `/api/v1/users/:userId/stats`

---

## Test 4: Follow Button Works

### Steps:
1. **Navigate** to another user's profile (not your own)
2. **Click** "Follow" button

### ✅ Expected Result:
- Button **instantly** changes to "Following"
- Button background changes from purple gradient to gray
- Follower count increases by 1
- No page reload

### Steps (Unfollow):
3. **Click** "Following" button

### ✅ Expected Result:
- Button changes back to "Follow"
- Button background changes from gray to purple gradient
- Follower count decreases by 1

### ❌ If Failed:
**Check API endpoints in Network tab:**
```
POST /api/v1/follow/:targetId
DELETE /api/v1/follow/:targetId
GET /api/v1/users/:userId/stats
```

**Check browser console for errors.**

**Check ProfileFollowButton.css exists:**
```bash
ls frontend/src/components/profile/ProfileFollowButton.css
```

**Check button animations work** (should see smooth transition on hover/click).

---

## Test 5: Follow Role Rules

### Test A: Owner Cannot Follow Visitor

#### Steps:
1. **Login as Owner**
2. **Navigate** to a Visitor's profile
3. **Try to click** "Follow" button

#### ✅ Expected Result:
- Button is **disabled** (grayed out)
- Error message appears: "Owners can follow only other owners."
- Error disappears after 2.5 seconds
- Follower count does NOT increase

### Test B: Owner Can Follow Owner

#### Steps:
1. **Login as Owner**
2. **Navigate** to another Owner's profile
3. **Click** "Follow" button

#### ✅ Expected Result:
- Follow works successfully
- Button changes to "Following"
- Follower count increases

### Test C: Visitor Can Follow Anyone

#### Steps:
1. **Login as Visitor**
2. **Navigate** to another Visitor's profile
3. **Click** "Follow"
4. **Navigate** to an Owner's profile
5. **Click** "Follow"

#### ✅ Expected Result:
- Both follow actions succeed
- Button changes to "Following" in both cases
- Follower counts increase

### ❌ If Failed:
**Check role restriction logic in ProfileFollowButton:**
```bash
grep -A 5 "showOwnerRestriction" frontend/src/components/profile/ProfileFollowButton.jsx
```

**Check backend enforces rules:**
```bash
grep -A 10 "owner.*visitor" backend/routes/v1/followRoutes.js
```

---

## Test 6: Real-Time Follower Count Updates

### Steps:
1. **Open two browser windows** (or use incognito)
2. **Login** as different users in each window
3. **In Window 1:** Navigate to User B's profile
4. **In Window 2:** Open User B's profile in edit mode or refresh
5. **In Window 1:** Click "Follow"

### ✅ Expected Result:
- Window 1: Follower count increases immediately
- Window 2: After refresh, follower count shows updated value

### ❌ If Failed:
- Check if `onFollowChange` callback is properly implemented
- Check if `getFollowStats` is called after follow/unfollow
- Check backend `/api/v1/users/:userId/stats` returns correct count

---

## Test 7: Engagement Metrics Always Show

### Steps:
1. **Create a new survey** (if you're allowed)
2. **View it on home feed**

### ✅ Expected Result:
- Engagement bar shows: `👁 0 views • ❤️ 0 reactions • 📝 0 responses`
- **NOT hidden** even though all values are 0

### Steps:
3. **React to the survey** (like or love)
4. **Refresh page**

### ✅ Expected Result:
- Engagement bar now shows: `👁 1 views • ❤️ 1 reactions • 📝 0 responses`
- Updated value is displayed

### ❌ If Failed:
**Check engagement API:**
```bash
curl http://localhost:5000/api/v1/analytics/survey/:surveyId
```
Should return:
```json
{
  "views": 0,
  "reactions": { "like": 0, "love": 0 },
  "responses": 0
}
```

**Check SurveyEngagementBar always renders:**
```bash
grep -A 3 "surveyId.*return null" frontend/src/components/engagement/SurveyEngagementBar.jsx
```

---

## Test 8: Profile Tabs Work

### Steps:
1. **Navigate** to any user profile
2. **Click** "About" tab
3. **Click** "Surveys" tab
4. **Click** "Posts" tab (owner only)

### ✅ Expected Result:
- Tab changes color when active (purple underline)
- Content area updates with correct information
- Smooth transition between tabs
- No content duplication

### ❌ If Failed:
**Check ProfileTabs.jsx exists:**
```bash
ls frontend/src/components/profile/ProfileTabs.jsx
```

**Check ProfileTabs.css has active state:**
```bash
grep -n "active" frontend/src/components/profile/ProfileTabs.css
```

---

## Test 9: Error Boundaries Work

### Steps:
1. **Manually cause an error** (e.g., pass invalid userId to profile)
2. **Navigate to:** `/profile/invalid-id-123`

### ✅ Expected Result:
- Error boundary catches the error
- User sees friendly error message
- Rest of the app continues to work
- No white screen of death

### ❌ If Failed:
**Check ErrorBoundary wraps components in App.js:**
```bash
grep -B 1 -A 1 "ErrorBoundary.*ProfilePage" frontend/src/App.js
```

---

## Test 10: Responsive Design

### Steps:
1. **Open browser DevTools** (F12)
2. **Toggle device toolbar** (responsive mode)
3. **Test different screen sizes:**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)

### ✅ Expected Result:
- Profile page is readable on all screen sizes
- Follow button doesn't overflow
- Engagement bars stack properly on mobile
- No horizontal scrolling

---

## Performance Test

### Steps:
1. **Open DevTools** → Performance tab
2. **Start recording**
3. **Navigate** to profile page
4. **Click** Follow button
5. **Stop recording**

### ✅ Expected Result:
- Page loads in < 1 second
- Follow button responds in < 200ms
- No layout shifts
- Smooth 60fps animations

---

## Summary: All Tests Must Pass ✅

| Test | Status |
|------|--------|
| Engagement bars on home feed | ⬜ |
| Username click → profile | ⬜ |
| Profile page loads | ⬜ |
| Follow button works | ⬜ |
| Follow role rules enforced | ⬜ |
| Follower count updates | ⬜ |
| Engagement metrics always show | ⬜ |
| Profile tabs work | ⬜ |
| Error boundaries catch errors | ⬜ |
| Responsive design works | ⬜ |

---

## Quick Debug Commands

### Check if all files exist:
```bash
ls frontend/src/pages/ProfilePage.jsx
ls frontend/src/components/profile/ProfileTabs.jsx
ls frontend/src/components/profile/ProfileFollowButton.css
ls backend/routes/v1/followRoutes.js
```

### Check if routes are registered:
```bash
grep "profile/:userId" frontend/src/App.js
grep "v1FollowRoutes" backend/server.js
```

### Check if engagement bars are added:
```bash
grep "SurveyEngagementBar" frontend/src/visitor/components/FeedSurveyCard.jsx
grep "PostEngagementBar" frontend/src/visitor/components/FeedPostCard.jsx
```

### Test backend API directly:
```bash
# Test user stats (replace :userId with actual ID)
curl http://localhost:5000/api/v1/users/:userId/stats

# Test analytics
curl http://localhost:5000/api/v1/analytics/health
```

---

## 🎉 If All Tests Pass

Congratulations! The implementation is complete and working correctly.

**Next Steps:**
- Deploy to staging environment
- Run E2E tests
- Monitor performance
- Gather user feedback

---

## 🐛 If Tests Fail

1. Check the specific test that failed
2. Review the "If Failed" section for that test
3. Check browser console for errors
4. Check network tab for failed API calls
5. Verify file paths are correct
6. Clear cache and retry

**Still stuck?**
- Review [PROFILE_ENGAGEMENT_IMPLEMENTATION_COMPLETE.md](PROFILE_ENGAGEMENT_IMPLEMENTATION_COMPLETE.md)
- Check [QUICK_START_PROFILE_ENGAGEMENT.md](QUICK_START_PROFILE_ENGAGEMENT.md)
- Look at browser console errors
- Check backend logs

---

**Happy Testing!** 🚀
