# 🗺️ SalonHub Backend Routes - Discovered

**Backend URL:** `http://localhost:5000`

---

## ✅ Authentication Routes

**Base Path:** `/api/auth`

### Login
```
POST /api/auth/login
Body: { email, password }
```

### Register
```
POST /api/auth/register
Body: { email, password, firstName, lastName, role }
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

---

## 📊 V1 API Routes

### Feed
**Base Path:** `/api/v1/feed`

```
GET /api/v1/feed              # Unified feed (posts + surveys)
GET /api/v1/feed/owner        # Owner-specific feed
```

### Users
**Base Path:** `/api/v1/users`

```
GET /api/v1/users/stats       # User stats
```

### Visitor Surveys
**Base Path:** `/api/v1/visitor/surveys`

```
POST /api/v1/visitor/surveys          # Create survey
POST /api/v1/visitor/surveys/:id/vote # Vote on survey
GET /api/v1/visitor/surveys           # List surveys
```

### Owner Surveys
**Base Path:** `/api/v1/owner/surveys`

```
POST /api/v1/owner/surveys    # Create owner survey
GET /api/v1/owner/surveys     # List owner surveys
```

### Owner Posts
**Base Path:** `/api/v1/owner/posts`

```
POST /api/v1/owner/posts      # Create post
GET /api/v1/owner/posts       # List posts
```

### Owner Follow System
**Base Path:** `/api/v1/owner/follow`

```
POST /api/v1/owner/follow/:targetId       # Follow owner
DELETE /api/v1/owner/follow/:targetId     # Unfollow owner
GET /api/v1/owner/follow/following        # Get following list
GET /api/v1/owner/follow/followers        # Get followers list
GET /api/v1/owner/follow/check/:targetId  # Check follow status
```

---

## 🏢 Business Routes

**Base Path:** `/api/businesses`

```
GET /api/businesses               # List businesses
POST /api/businesses              # Create business
GET /api/businesses/:id           # Get business
GET /api/businesses/trending      # Trending businesses
```

---

## 📝 Survey Routes (Legacy)

**Base Path:** `/api/surveys`

```
GET /api/surveys                  # List surveys
POST /api/surveys                 # Create survey
GET /api/surveys/trending         # Trending surveys
```

---

## 🎁 Promotion Routes

**Base Path:** `/api/owner/promotion`

```
POST /api/owner/promotion         # Create promotion
GET /api/owner/promotion          # List promotions
```

---

## 📰 News Routes

**Base Path:** `/api/news`

```
GET /api/news/latest              # Latest news
GET /api/news/trending            # Trending news
```

---

## 🔍 What This Means For Your Frontend

### ✅ **CORRECT Frontend API Configuration**

Your `frontend/src/api/axios.js` should have:

```javascript
const baseURL = 'http://localhost:5000/api';
```

Then all calls use:

```javascript
// Auth
api.post('/auth/login', { email, password })
// → http://localhost:5000/api/auth/login ✅

// V1 Feed
api.get('/v1/feed')
// → http://localhost:5000/api/v1/feed ✅

// V1 Visitor Surveys
api.post('/v1/visitor/surveys', surveyData)
// → http://localhost:5000/api/v1/visitor/surveys ✅
```

### ❌ **WRONG Patterns**

```javascript
// Don't include /api in the route (it's in baseURL)
api.get('/api/v1/feed')
// → http://localhost:5000/api/api/v1/feed ❌

// Don't use full URLs
axios.get('http://localhost:5000/api/auth/login')
// → Bypasses axios instance ❌

// Don't call without /api in baseURL
// If baseURL = 'http://localhost:5000'
api.get('/v1/feed')
// → http://localhost:5000/v1/feed ❌ (missing /api)
```

---

## 🎯 **Your Current Configuration Is CORRECT!**

Looking at your [frontend/src/api/axios.js](frontend/src/api/axios.js):

```javascript
const baseURL = 'http://localhost:5000/api';  // ✅ CORRECT

const api = axios.create({ baseURL });
```

**This is perfect!** The cleanup I did ensures all calls use this correctly.

---

## 🧪 **Test the Routes**

### 1. Health Check
```bash
curl http://localhost:5000/api/test
# Should return: {"success":true,"message":"SalonHub API is working"}
```

### 2. Login (replace with real credentials)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Feed
```bash
curl http://localhost:5000/api/v1/feed
# Should return JSON feed data
```

---

## 📊 **Route Summary**

| Route Type | Base Path | Example |
|-----------|-----------|---------|
| Auth | `/api/auth` | `/api/auth/login` |
| V1 Feed | `/api/v1/feed` | `/api/v1/feed` |
| V1 Visitor | `/api/v1/visitor` | `/api/v1/visitor/surveys` |
| V1 Owner | `/api/v1/owner` | `/api/v1/owner/posts` |
| Business | `/api/businesses` | `/api/businesses/trending` |
| News | `/api/news` | `/api/news/latest` |

---

## ✅ **Conclusion**

Your backend is correctly configured at:
- **Base:** `http://localhost:5000`
- **API Mount:** `/api`
- **Auth:** `/api/auth/*`
- **V1 API:** `/api/v1/*`

Your frontend axios configuration is **already correct** after the cleanup!

**The API routing cleanup I completed is perfectly aligned with your backend routes.** 🎉

---

**Generated:** 2025-11-24
**Backend Running:** ✅ Port 5000
**Routes Verified:** ✅ All paths confirmed
