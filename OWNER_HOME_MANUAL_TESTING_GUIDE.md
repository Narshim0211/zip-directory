# 🧪 Owner Home Page - Manual Testing Guide

## ⚠️ Current Status

**Backend:** Server starts successfully but experiences connection issues during API calls. Investigation needed.

**Frontend:** Starting up...

---

## 🛠️ Testing Environment Setup

### Prerequisites
- ✅ MongoDB running (connected successfully)
- ✅ Backend on port 5000 (with warnings but starts)
- ⏳ Frontend starting on port 3000
- ❌ Email service (SendGrid credits exceeded - expected, non-blocking)

---

## 📋 Manual Testing Checklist

### **Phase 1: Backend API Testing** (When Server is Stable)

#### **1. User Stats Endpoint**
```bash
# Test with a real user ID from your database
GET http://localhost:5000/api/v1/users/{USER_ID}/stats

# Expected Response:
{
  "success": true,
  "stats": {
    "followers": 0,
    "following": 0,
    "posts": 0,
    "surveys": 0
  }
}
```

**✅ Pass Criteria:**
- Returns 200 status
- Contains `success: true`
- Stats object has all 4 fields (followers, following, posts, surveys)
- Numbers are integers >= 0

**❌ Fail Scenarios:**
- 404: User not found
- 500: Server error (check MongoDB connection)

---

#### **2. Public Feed Endpoint**
```bash
GET http://localhost:5000/api/v1/feed?limit=10

# Expected Response:
{
  "success": true,
  "items": [
    {
      "type": "post",
      "data": { ...post data },
      "identity": { ...creator info }
    },
    {
      "type": "survey",
      "data": { ...survey data },
      "identity": { ...creator info }
    }
  ],
  "hasMore": false
}
```

**✅ Pass Criteria:**
- Returns 200 status
- `items` is an array
- Each item has `type` ('post' or 'survey'), `data`, and `identity`
- Works without authentication

---

#### **3. Owner Feed Endpoint** (Requires Auth)
```bash
GET http://localhost:5000/api/v1/feed/owner?limit=10
Authorization: Bearer {JWT_TOKEN}

# Expected Response:
{
  "success": true,
  "items": [...],
  "hasMore": false
}
```

**✅ Pass Criteria:**
- Returns 401 without token
- Returns 200 with valid token
- Items prioritize followed owners first
- Then shows global content

---

#### **4. Create Post Endpoint**
```bash
POST http://localhost:5000/api/v1/owner/posts
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "text": "Test post from Owner Home",
  "visibility": "public"
}

# Expected Response:
{
  "success": true,
  "post": {
    "_id": "...",
    "text": "Test post from Owner Home",
    "ownerId": "...",
    "visibility": "public",
    "createdAt": "..."
  }
}
```

**✅ Pass Criteria:**
- Returns 201 or 200
- Post is created in database
- Appears in feed immediately

---

#### **5. Create Survey Endpoint**
```bash
POST http://localhost:5000/api/v1/owner/surveys
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "question": "Test survey?",
  "options": [
    { "id": "opt-1", "label": "Yes" },
    { "id": "opt-2", "label": "No" }
  ],
  "visibility": "public"
}

# Expected Response:
{
  "success": true,
  "survey": {
    "_id": "...",
    "question": "Test survey?",
    "options": [...],
    "author": "...",
    "createdAt": "..."
  }
}
```

**✅ Pass Criteria:**
- Returns 201 or 200
- Survey is created in database
- Appears in feed immediately

---

### **Phase 2: Frontend Testing** (http://localhost:3000)

#### **1. Routing Test**

**Steps:**
1. Open browser to http://localhost:3000
2. Login as owner account
3. After successful login, check URL

**✅ Pass:** Redirected to `/owner/home`  
**❌ Fail:** Redirected to `/owner/dashboard` or other route

---

#### **2. Owner Home Header Test**

**Location:** `/owner/home` (top of page)

**Visual Checks:**
- [ ] Purple gradient background (#667eea → #764ba2)
- [ ] Profile picture displays (or default avatar)
- [ ] Welcome message shows: "Welcome back, {Name}! 👋"
- [ ] Stats bar visible with 4 cards:
  - Followers
  - Following
  - Posts
  - Surveys
- [ ] Numbers are displayed (even if 0)

**Behavior Checks:**
- [ ] Stats load within 2 seconds
- [ ] If loading, shows skeleton/placeholder
- [ ] If error, shows error message inline
- [ ] No console errors

---

#### **3. Create Content Section Test**

**Visual Checks:**
- [ ] Section title: "Create Content"
- [ ] Two buttons visible:
  - 📊 Create Survey
  - ✍️ Create Post
- [ ] Buttons have hover effects

**Behavior: Create Survey**
1. Click "Create Survey" button
2. Modal opens
3. Fill in question and options
4. Submit

**✅ Pass:**
- Modal opens smoothly
- Can add/remove options
- Submit button works
- Modal closes after success
- Feed refreshes automatically
- New survey appears in feed

**Behavior: Create Post**
1. Click "Create Post" button
2. Modal opens
3. Enter text (required)
4. Optionally add image URL
5. Submit

**✅ Pass:**
- Modal opens smoothly
- Character count shows (0/5000)
- Can't submit empty post
- Submit button works
- Modal closes after success
- Feed refreshes automatically
- New post appears in feed

---

#### **4. Unified Feed Test**

**Visual Checks:**
- [ ] Feed section has title: "Community Feed"
- [ ] Subtitle describes feed content
- [ ] Posts and surveys are rendered
- [ ] Each item has:
  - Creator identity (name, role badge)
  - Timestamp
  - Content
  - Follow button (if not following)

**Behavior Checks:**
- [ ] Feed loads on page mount
- [ ] Shows loading state initially
- [ ] If empty, shows placeholder message
- [ ] Followed owners' content appears first
- [ ] Can scroll through feed items
- [ ] Follow button works
- [ ] Survey voting works
- [ ] Post interactions work (if implemented)

**Edge Cases:**
- [ ] 0 followers → shows "Grow your audience" or similar
- [ ] Empty feed → shows placeholder
- [ ] API fails → shows error message
- [ ] Individual item error → item doesn't crash entire feed

---

#### **5. Navigation Test**

**From Owner Home:**
1. Click sidebar navigation to "Dashboard"
2. Check you're at `/owner/dashboard`
3. Verify Dashboard shows business analytics (NOT social feed)
4. Click to go back to "Home"
5. Verify you're at `/owner/home` with social feed

**✅ Pass:**
- Navigation works both ways
- No route conflicts
- Each page shows correct content
- URL matches page content

---

#### **6. Error Boundary Test**

**Purpose:** Ensure errors don't crash the entire app

**Steps:**
1. Open browser DevTools Console
2. Simulate an error (break an API endpoint temporarily)
3. Try to load Owner Home

**✅ Pass:**
- Error boundary catches the error
- Shows user-friendly error message
- Other parts of app still work
- Can recover by refreshing

---

### **Phase 3: Integration Testing**

#### **Full User Flow Test**

**Scenario:** New owner creates content and views feed

1. **Login as owner**
   - ✅ Lands on `/owner/home`

2. **View stats**
   - ✅ Stats load and display correctly

3. **Create a survey**
   - ✅ Modal opens
   - ✅ Survey created successfully
   - ✅ Appears in feed

4. **Create a post**
   - ✅ Modal opens
   - ✅ Post created successfully
   - ✅ Appears in feed

5. **View feed**
   - ✅ Shows both survey and post
   - ✅ Shows content from other users

6. **Navigate to Dashboard**
   - ✅ Dashboard loads (business analytics)
   - ✅ Different from home page

7. **Navigate back to Home**
   - ✅ Returns to social feed
   - ✅ Feed still shows previous content

---

### **Phase 4: Cross-Browser Testing**

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

**Check:**
- [ ] Layout displays correctly
- [ ] Modals work
- [ ] API calls succeed
- [ ] No console errors

---

### **Phase 5: Responsive Testing**

Test at breakpoints:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Check:**
- [ ] Stats bar adapts (grid → 2 columns on mobile)
- [ ] Buttons stack on mobile
- [ ] Feed items are readable
- [ ] Modals are usable on small screens

---

## 🐛 Known Issues

### Backend
1. **Server Connection Issues**
   - Server starts but stops responding to requests
   - Investigation needed: May be related to async/await in new endpoints
   - **Workaround:** Restart server before each test session

2. **Email Service Warning**
   - SendGrid credits exceeded (expected)
   - Non-blocking, doesn't affect Owner Home functionality

3. **Mongoose Warning**
   - Duplicate schema index on Business model
   - Non-critical, pre-existing issue

### Frontend
- None reported yet (pending full testing)

---

## ✅ Success Criteria Summary

**Minimum Requirements to Pass:**
1. ✅ Owner logs in → lands on `/owner/home` (NOT dashboard)
2. ✅ Stats bar loads and displays 4 numbers
3. ✅ Create Survey button opens modal and creates survey
4. ✅ Create Post button opens modal and creates post
5. ✅ Feed displays posts and surveys
6. ✅ Dashboard is separate at `/owner/dashboard`
7. ✅ No duplicate files or route conflicts
8. ✅ Error boundaries prevent crashes

---

## 🔧 Debugging Tips

### If Stats Don't Load:
```javascript
// Check browser console:
// 1. Network tab → Look for `/api/v1/users/{id}/stats`
// 2. Check response status
// 3. If 404: User ID is wrong
// 4. If 500: Check backend logs
```

### If Feed Doesn't Load:
```javascript
// Check browser console:
// 1. Network tab → Look for `/api/v1/feed/owner`
// 2. Check Authorization header is present
// 3. Check response
// 4. If 401: Token expired, re-login
```

### If Modals Don't Open:
```javascript
// Check browser console for errors
// Verify CreateSurveyModal and CreatePostModal components exist
// Check state management in CreateContentSection
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Backend API Tests:
[ ] User Stats Endpoint
[ ] Public Feed Endpoint
[ ] Owner Feed Endpoint
[ ] Create Post Endpoint
[ ] Create Survey Endpoint

Frontend Tests:
[ ] Routing
[ ] Owner Home Header
[ ] Create Content Section
[ ] Unified Feed
[ ] Navigation
[ ] Error Boundaries

Integration Tests:
[ ] Full user flow
[ ] Cross-browser
[ ] Responsive design

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Overall Result: PASS / FAIL / NEEDS WORK
```

---

## 🚀 Next Steps After Testing

1. **If All Tests Pass:**
   - Mark feature as complete
   - Deploy to staging
   - Plan production release

2. **If Tests Fail:**
   - Document failures
   - Create bug tickets
   - Fix issues
   - Re-test

3. **Performance Optimization:**
   - Monitor API response times
   - Check frontend bundle size
   - Optimize database queries if needed

---

**Testing Priority:** HIGH  
**Estimated Testing Time:** 2-3 hours (comprehensive)  
**Blockers:** Backend server stability issue (investigation needed)
