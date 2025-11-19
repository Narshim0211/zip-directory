# 🧪 Social Feed System - Manual Testing Guide

## ✅ System Status

**Backend:** Running on http://localhost:5000 ✓  
**Frontend:** Running on http://localhost:3000 ✓  
**Database:** Connected (13 users, 4 posts, 4 surveys) ✓

---

## 📋 Test Checklist

### 1. **Public Feed (No Login Required)**
- [ ] Open http://localhost:3000/visitor/home
- [ ] You should see a feed with posts and surveys
- [ ] Feed should show 4 posts + 4 surveys mixed together
- [ ] Each item should display author information

**Expected Result:** Feed loads without errors, showing all content sorted by date

---

### 2. **Owner Authentication & Dashboard**
- [ ] Navigate to http://localhost:3000/owner/login
- [ ] Login with any owner account:
  - Email: `admin@glocapai.com` (or any owner from database)
  - Password: (your password)
- [ ] After login, you should be redirected to `/owner/dashboard`
- [ ] Dashboard should show:
  - Purple gradient background
  - Stats bar with: Following count | Followers count | Surveys count
  - Feed with posts and surveys
  - Search section at top

**Expected Result:** Beautiful owner dashboard with feed and stats

---

### 3. **Owner Follow System (Backend API)**

#### Test via Browser Console
Open browser console (F12) and run these commands:

```javascript
// Get your auth token (after logging in as owner)
const token = localStorage.getItem('token');

// Test 1: Get your following list
fetch('http://localhost:5000/api/v1/owner/follow/following', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Following:', d));

// Test 2: Get your followers list
fetch('http://localhost:5000/api/v1/owner/follow/followers', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Followers:', d));

// Test 3: Follow another owner (replace TARGET_OWNER_ID)
// First, get list of owners to find an ID
fetch('http://localhost:5000/api/v1/feed?limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Feed items:', d.items.map(i => ({
    type: i.type,
    authorId: i.identity?.userId,
    authorName: i.identity?.displayName
  }))));

// Then follow (replace with actual owner ID)
const targetOwnerId = 'PASTE_OWNER_ID_HERE';
fetch(`http://localhost:5000/api/v1/owner/follow/${targetOwnerId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Follow result:', d));

// Test 4: Check follow status
fetch(`http://localhost:5000/api/v1/owner/follow/check/${targetOwnerId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Follow status:', d));

// Test 5: Unfollow
fetch(`http://localhost:5000/api/v1/owner/follow/${targetOwnerId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Unfollow result:', d));
```

**Expected Results:**
- Following/Followers lists return with pagination
- Follow creates relationship (201 status)
- Check status returns `{ isFollowing: true }`
- Unfollow removes relationship (200 status)

---

### 4. **Feed Ranking Algorithm**

#### Test Scenario:
1. Login as Owner A
2. Follow Owner B (via console commands above)
3. Refresh the dashboard
4. **Expected:** Owner B's posts/surveys should appear FIRST in feed
5. Other content should appear after

#### Verification:
```javascript
// After following someone, check feed order
fetch('http://localhost:5000/api/v1/feed?limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => {
    console.log('Feed order:');
    d.items.forEach((item, i) => {
      console.log(`${i + 1}. ${item.identity?.displayName} - ${item.type}`);
    });
  });
```

**Expected:** Followed users' content appears at the top

---

### 5. **Role-Based Access Control**

#### Test: Owner Cannot Follow Visitor
```javascript
// Get a visitor ID from the feed
const visitorId = 'PASTE_VISITOR_ID_HERE';

// Try to follow (should fail)
fetch(`http://localhost:5000/api/v1/owner/follow/${visitorId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Should be error:', d));
```

**Expected Result:** Error message: "Owners can only follow other owners"

---

### 6. **Visitor Feed**
- [ ] Logout if logged in
- [ ] Login as a visitor
  - Email: `visitor@example.com`
  - Password: (your password)
- [ ] Navigate to http://localhost:3000/visitor/home
- [ ] Feed should load with all posts/surveys
- [ ] If visitor has follows, their content should be prioritized

**Expected Result:** Visitor sees unified feed (same algorithm as owner)

---

## 🎨 UI/UX Checklist

### Owner Dashboard
- [ ] Purple gradient background (667eea → 764ba2)
- [ ] Stats cards display correctly (3 cards in row)
- [ ] Feed cards have white background with shadows
- [ ] Responsive on mobile (cards stack vertically)
- [ ] Loading states work properly
- [ ] Search section displays

### Feed Cards
- [ ] Post cards show title, content, author
- [ ] Survey cards show question, options
- [ ] Avatar images load (or show placeholder)
- [ ] Timestamps display correctly
- [ ] Hover effects work

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:** Check backend is running: `cd backend && npm start`

### Issue: "Feed returns empty array"
**Solution:** Database has content (verified: 4 posts, 4 surveys). Check browser console for errors.

### Issue: "Token expired" or "Not authorized"
**Solution:** Re-login to get fresh token

### Issue: "Owner dashboard shows 0 following/followers"
**Solution:** No follows exist yet - use console commands to create test follows

### Issue: "Feed order doesn't prioritize followed users"
**Solution:** 
1. Make sure you're logged in
2. Follow someone first
3. Refresh the page
4. Verify backend logs show userId being passed

---

## 📊 Current Database State

```
Users: 13 (3 owners, 3 visitors shown)
Posts: 4
Surveys: 4
Owner Follows: 1 (one relationship already exists!)
Visitor Follows: 0

Sample Owners:
  - admin@glocapai.com
  - niteshdeltabyte2030@gmail.com
  - nsiwakoti351@gmail.com

Sample Visitors:
  - narshim413@gmail.com
  - visitor@example.com
  - deltabyte950@gmail.com
```

---

## ✅ Success Criteria

All tests pass if:
1. ✓ Public feed loads without login
2. ✓ Owner dashboard displays with stats and feed
3. ✓ Follow/unfollow API calls succeed
4. ✓ Feed prioritizes followed users' content
5. ✓ Owners cannot follow visitors (403 error)
6. ✓ UI looks polished (purple gradient, white cards)
7. ✓ No console errors
8. ✓ Responsive design works

---

## 🚀 Next Phase (After Testing)

Once current features are verified:
- [ ] Add FollowButton to profile pages
- [ ] Create survey creation modal
- [ ] Add "Surveys" tab to profiles
- [ ] Floating "+" button for quick survey creation

---

## 📝 Notes

- **Backend Port:** 5000
- **Frontend Port:** 3000
- **API Base:** http://localhost:5000/api/v1
- **Auth:** JWT tokens in localStorage
- **Database:** MongoDB Atlas (MoodTrackerapp cluster)

**Implementation Status:** 70% Complete
**Core Features:** ✅ Operational
**UI Polish:** ✅ Complete
**Remaining:** Profile integration, survey creation UI
