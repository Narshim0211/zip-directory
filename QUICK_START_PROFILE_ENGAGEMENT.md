# 🚀 Quick Start - Profile & Engagement System

## Start the Application

### 1. Start Backend
```bash
cd backend
npm install
npm start
```
Backend should run on `http://localhost:5000`

### 2. Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend should run on `http://localhost:3000`

---

## ✅ Test the Features

### Test 1: Engagement Bars on Home Feed

1. **Login as Visitor or Owner**
2. **Navigate to home page** (`/visitor/home` or `/owner/home`)
3. **✅ You should see:**
   - Survey cards with engagement bar: `👁 0 views • ❤️ 0 reactions • 📝 0 responses`
   - Post cards with engagement bar: `👁 0 views • ❤️ 0 reactions`

---

### Test 2: Click Username → Profile Opens

1. **On home feed, click any username**
2. **✅ You should:**
   - Navigate to `/profile/:userId`
   - See the user's profile page with:
     - Profile header (avatar, name, role)
     - Stats (followers, following, surveys, posts)
     - Follow/Following button
     - Tabs (About, Surveys, Posts)

---

### Test 3: Follow System

1. **Navigate to another user's profile** (click username on feed)
2. **Click "Follow" button**
3. **✅ You should see:**
   - Button instantly changes to "Following"
   - Follower count increases by 1
   - Smooth animation on button

4. **Click "Following" button again**
5. **✅ You should see:**
   - Button changes back to "Follow"
   - Follower count decreases by 1

---

### Test 4: Follow Role Rules

#### As Owner:
1. **Try to follow a Visitor**
2. **✅ You should see:**
   - Error message: "Owners can follow only other owners."
   - Button disabled

3. **Try to follow another Owner**
4. **✅ Should work successfully**

#### As Visitor:
1. **Try to follow anyone (Visitor or Owner)**
2. **✅ Both should work successfully**

---

### Test 5: Engagement Metrics

1. **Create a survey or post** (if you're an owner)
2. **View it on the home feed**
3. **✅ You should see:**
   - Engagement bar with: `👁 0 views • ❤️ 0 reactions • 📝 0 responses`
   - All values start at 0 (never hidden)

---

## 🐛 Troubleshooting

### Engagement bars not showing?
- Check browser console for errors
- Verify backend analytics routes are running: `GET http://localhost:5000/api/v1/analytics/health`
- Response should be:
```json
{
  "success": true,
  "message": "Analytics module is operational"
}
```

### Follow button not working?
- Check browser console for errors
- Verify unified follow API is mounted: `GET http://localhost:5000/api/v1/follow/check/:userId`
- Make sure you're logged in (check `Authorization` header)

### Profile page not loading?
- Check the route in browser: `/profile/:userId` (userId should be valid MongoDB ObjectId)
- Verify user exists in database
- Check browser console for network errors

### Username links not working?
- Clear browser cache
- Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
- Check that IdentityBadge component has correct `profileId` or `_id` field

---

## 📊 API Endpoints Reference

### Follow System
```
POST   /api/v1/follow/:targetId        # Follow user
DELETE /api/v1/follow/:targetId        # Unfollow user
GET    /api/v1/follow/check/:targetId  # Check follow status
GET    /api/v1/follow/following        # Get following list
GET    /api/v1/follow/followers        # Get followers list
```

### User Stats
```
GET /api/v1/users/:userId/stats        # Get user stats (followers, following, surveys, posts)
```

### Analytics (Engagement)
```
GET  /api/v1/analytics/survey/:surveyId
POST /api/v1/analytics/survey/view/:surveyId
POST /api/v1/analytics/survey/react/:surveyId
POST /api/v1/analytics/survey/respond/:surveyId

GET  /api/v1/analytics/post/:postId
POST /api/v1/analytics/post/view/:postId
POST /api/v1/analytics/post/react/:postId

GET  /api/v1/analytics/profile/:ownerId
POST /api/v1/analytics/profile/view/:ownerId
```

---

## ✅ Expected Results

After implementation, you should have:

✅ Engagement bars visible on **all** survey cards (home feed + survey page)
✅ Engagement bars visible on **all** post cards (home feed)
✅ **Every username is clickable** and opens the correct profile
✅ **Follow/Following button works** with instant updates
✅ **Follower counts update** in real-time
✅ **Role-based follow rules** are enforced
✅ **Profile page** loads for any user at `/profile/:userId`
✅ **World-class UX** with smooth animations and error handling
✅ **Zero values always displayed** (metrics never hidden)

---

## 🎉 Success!

If all tests pass, the implementation is complete and working correctly.

**Enjoy your world-class profile and engagement system!** 🚀
