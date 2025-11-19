# 🎯 Owner Home Page - Quick Reference

## 🚀 **Start Development**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Owner Home: http://localhost:3000/owner/home

---

## 📍 **Key Routes**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/owner/home` | OwnerHome | Social feed (DEFAULT after login) |
| `/owner/dashboard` | Dashboard | Business analytics |
| `/owner/my-business` | MyBusiness | Business management |

---

## 🔗 **API Endpoints**

### User Stats
```http
GET /api/v1/users/:userId/stats
Authorization: Bearer <token>
```

### Owner Feed
```http
GET /api/v1/feed/owner?limit=30
Authorization: Bearer <token>
```

### Create Post
```http
POST /api/v1/owner/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Post content",
  "mediaUrl": "https://...",
  "visibility": "public"
}
```

### Create Survey
```http
POST /api/v1/owner/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Survey question?",
  "options": [
    { "id": "opt-1", "label": "Option 1" },
    { "id": "opt-2", "label": "Option 2" }
  ],
  "visibility": "public"
}
```

---

## 📂 **File Locations**

### Backend
```
backend/
├── controllers/v1/
│   ├── userStatsController.js    → GET /api/v1/users/:userId/stats
│   └── feedController.js          → GET /api/v1/feed/owner
├── routes/v1/
│   ├── userRoutes.js              → /api/v1/users
│   └── feedRoutes.js              → /api/v1/feed
├── services/
│   └── feedService.js             → buildOwnerFeed()
└── server.js                      → Routes registration
```

### Frontend
```
frontend/src/
├── pages/owner/
│   ├── OwnerHome.jsx              → Main page
│   └── OwnerHome.css
├── components/owner/
│   ├── OwnerHomeHeader.jsx        → Stats + welcome
│   ├── CreateContentSection.jsx   → Create buttons
│   └── CreatePostModal.jsx        → Post creation
├── components/shared/
│   └── UnifiedFeed.jsx            → Feed renderer
├── api/v1/
│   └── index.js                   → API client
└── App.js                         → Routing
```

---

## 🧪 **Testing Checklist**

- [ ] Owner login → lands on `/owner/home`
- [ ] Stats display correctly (followers, following, posts, surveys)
- [ ] Feed loads with followed content first
- [ ] Create Survey opens modal and works
- [ ] Create Post opens modal and works
- [ ] Feed refreshes after creating content
- [ ] Dashboard still accessible at `/owner/dashboard`
- [ ] No errors in browser console
- [ ] Error boundaries work (test by breaking API)

---

## 🐛 **Troubleshooting**

### Stats not loading?
- Check: Is backend running?
- Check: Is user authenticated? (JWT token)
- Check: Browser console for errors
- Endpoint: `GET /api/v1/users/:userId/stats`

### Feed not loading?
- Check: Is `/api/v1/feed/owner` endpoint working?
- Check: Authentication header present
- Check: Database has Survey/OwnerPost data
- Check: Follow relationships exist

### Redirect not working?
- Check: `App.js` line 62 → should redirect to `/owner/home`
- Clear browser cache
- Check user role in localStorage

### Create Post/Survey not working?
- Check: Modal opens?
- Check: API endpoints working? (`/api/v1/owner/posts`, `/api/v1/owner/surveys`)
- Check: Browser console for errors
- Check: Validation errors in modal

---

## 🎨 **Component Props**

### UnifiedFeed
```jsx
<UnifiedFeed
  feedItems={[]}           // Array of { type, data, identity }
  loading={false}          // Boolean
  error={null}             // String or null
  followingList={[]}       // Array of followed users
  role="owner"             // 'owner' or 'visitor'
  emptyMessage="..."       // Custom empty message
/>
```

### OwnerHomeHeader
```jsx
<OwnerHomeHeader />
// No props - reads from AuthContext
```

### CreateContentSection
```jsx
<CreateContentSection
  onContentCreated={(type) => {}}  // Callback after creation
/>
```

---

## 🔐 **Authentication**

All owner routes require:
```javascript
Authorization: Bearer <JWT_TOKEN>
```

Token contains:
- User ID
- Role: 'owner'
- Expiration

Get from: `localStorage.getItem('token')`

---

## 📊 **Data Flow**

```
1. User Login (owner role)
   ↓
2. Redirect to /owner/home
   ↓
3. OwnerHome component mounts
   ↓
4. Parallel API calls:
   - GET /api/v1/users/:userId/stats  (for header stats)
   - GET /api/v1/feed/owner           (for feed)
   - GET /api/v1/owner/follow/following (for follow states)
   ↓
5. Render:
   - OwnerHomeHeader (with stats)
   - CreateContentSection (buttons)
   - UnifiedFeed (posts + surveys)
```

---

## 🎯 **Key Differences: Home vs Dashboard**

| Feature | Owner Home | Owner Dashboard |
|---------|-----------|----------------|
| Route | `/owner/home` | `/owner/dashboard` |
| Purpose | Social feed | Business analytics |
| Content | Posts, surveys, community | Views, ratings, bookings |
| APIs | Feed, stats, social | Analytics, business data |
| Redirect | ✅ Default after login | ❌ Manual navigation |

---

## 🚨 **Common Errors**

### "Cannot read property '_id' of undefined"
- **Cause:** User not loaded from AuthContext
- **Fix:** Ensure `useAuth()` returns valid user

### "404 Not Found: /api/v1/users/:userId/stats"
- **Cause:** Backend route not registered
- **Fix:** Check `server.js` has `app.use('/api/v1/users', v1UserRoutes)`

### "Feed items not rendering"
- **Cause:** Feed data structure mismatch
- **Fix:** Ensure `{ type: 'post'|'survey', data: {...} }` format

### "Error boundary triggered"
- **Cause:** Component error (good! Working as designed)
- **Fix:** Check browser console for actual error

---

## 💡 **Tips**

1. **Development:** Use React DevTools to inspect component state
2. **API Testing:** Use Postman or cURL to test endpoints
3. **Database:** Use MongoDB Compass to check Follow/OwnerPost/Survey data
4. **Debugging:** Enable verbose logging in `feedService.js`
5. **Performance:** Monitor Network tab for slow API calls

---

## 📝 **Related Documentation**

- Full implementation: `OWNER_HOME_IMPLEMENTATION_COMPLETE.md`
- Original PRD: (provided by user)
- API docs: See "API Endpoints" section above

---

**Quick Start:** Run backend + frontend → Login as owner → Should land on `/owner/home` with stats + feed.
