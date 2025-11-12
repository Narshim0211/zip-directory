# SalonHub Setup Instructions

## 🎯 Quick Start Guide

Your SalonHub application is now configured with an X-like visitor home page featuring:
- **3-column layout** (Sidebar → Feed → Trending News)
- **Automated news caching** (refreshes every 3 hours)
- **Search functionality** for salons
- **Unified feed** of posts and surveys

---

## ✅ What's Already Implemented

### Backend
- ✅ News model with MongoDB schema
- ✅ NewsAPI integration service
- ✅ Trending news endpoints
- ✅ Cron job for 3-hour news refresh
- ✅ All routes properly configured

### Frontend
- ✅ 3-column visitor layout (X-style)
- ✅ Trending news sidebar component
- ✅ Visitor home page with feed
- ✅ Search bar for salons
- ✅ Responsive CSS styling

---

## 🔧 Required Setup Steps

### 1. Backend Environment Variables

Create a `.env` file in the `backend/` directory with these variables:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/salonhub
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/salonhub

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# News API (Get your free key at https://newsapi.org)
NEWS_API_KEY=your_newsapi_key_here

# CORS Origins (adjust for your deployment)
WEB_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001

# Server
PORT=5000
NODE_ENV=development
```

### 2. Get Your NewsAPI Key

1. Visit [https://newsapi.org/register](https://newsapi.org/register)
2. Sign up for a **free account**
3. Copy your API key
4. Paste it in the backend `.env` file as `NEWS_API_KEY`

**Note:** Free tier allows 100 requests/day, which is enough for the 3-hour cron job (8 requests/day).

---

## 🚀 Running the Application

### Backend

```bash
cd zip-directory/backend
npm install
npm start
```

The backend will:
- Start on `http://localhost:5000`
- Connect to MongoDB
- Initialize the news cron job (runs every 3 hours)
- Fetch initial news articles

### Frontend

```bash
cd zip-directory/frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

---

## 🧪 Testing the News Feature

### 1. Test Backend Endpoints

**Get Trending News:**
```bash
curl http://localhost:5000/api/news/trending?limit=10
```

**Manual Refresh (Admin only):**
```bash
curl -X POST http://localhost:5000/api/news/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get Paginated News:**
```bash
curl http://localhost:5000/api/news?page=1&limit=15
```

### 2. Test Frontend

1. Navigate to `http://localhost:3000`
2. Log in as a visitor
3. You should see:
   - Left sidebar with navigation
   - Middle feed with search bar
   - Right sidebar with trending news

---

## 📁 File Structure

```
zip-directory/
├── backend/
│   ├── models/News.js              ✅ News schema
│   ├── services/newsService.js     ✅ NewsAPI integration
│   ├── controllers/newsController.js ✅ Request handlers
│   ├── routes/newsRoutes.js        ✅ API endpoints
│   ├── cron/newsCron.js            ✅ 3-hour refresh job
│   └── server.js                   ✅ Cron loaded on line 77
│
└── frontend/
    ├── src/
    │   ├── visitor/
    │   │   ├── layouts/VisitorLayout.jsx       ✅ 3-column layout
    │   │   └── components/
    │   │       └── TrendingNewsSidebar.jsx     ✅ News widget
    │   ├── components/VisitorHome.jsx          ✅ Main feed + search
    │   └── styles/
    │       ├── visitorLayout.css               ✅ Layout styling
    │       └── visitorHomePage.css             ✅ Feed styling
```

---

## 🐛 Troubleshooting

### News not loading?

1. **Check backend logs:**
   ```bash
   cd zip-directory/backend
   npm start
   # Look for: "🕒 [newsCron] Refreshing beauty news..."
   ```

2. **Verify NewsAPI key:**
   ```bash
   echo $NEWS_API_KEY  # Should output your key
   ```

3. **Check MongoDB connection:**
   - Ensure MongoDB is running
   - Check `MONGO_URI` in `.env`

4. **Test the endpoint directly:**
   ```bash
   curl http://localhost:5000/api/news/trending
   ```

### Frontend not showing news?

1. **Check browser console** for errors
2. **Verify API endpoint** in TrendingNewsSidebar.jsx (line 13):
   ```javascript
   api.get("/news/trending?limit=10")
   ```
3. **Check CORS settings** in backend `server.js`

### Cron job not running?

The cron runs every 3 hours starting when the server starts. To test immediately:

```bash
# Use the manual refresh endpoint (requires admin JWT)
curl -X POST http://localhost:5000/api/news/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_JWT"
```

---

## 🎨 Customization

### Change news refresh interval

Edit `backend/cron/newsCron.js`:

```javascript
// Current: Every 3 hours
cron.schedule("0 */3 * * *", async () => {

// Change to every hour:
cron.schedule("0 * * * *", async () => {

// Change to every 30 minutes:
cron.schedule("*/30 * * * *", async () => {
```

### Change news categories

Edit `backend/services/newsService.js` (line 9):

```javascript
q: "hair salon OR beauty OR skincare OR spa OR fashion OR makeup OR cosmetics OR stylist OR nails"
```

### Adjust news sidebar limit

Edit `frontend/src/visitor/components/TrendingNewsSidebar.jsx` (line 13):

```javascript
.get("/news/trending?limit=20")  // Show more news
```

---

## 📊 Database Schema

The News model stores:

```javascript
{
  title: String,
  description: String,
  url: String,              // Unique index
  imageUrl: String,
  source: String,
  publishedAt: Date,        // Indexed for sorting
  category: String,         // Default: "beauty"
  fetchedAt: Date,
  createdAt: Date,          // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

---

## 🚀 Deployment Notes

### Environment Variables for Production

Update your `.env` for production:

```bash
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
WEB_ORIGIN=https://your-domain.com
ADMIN_ORIGIN=https://admin.your-domain.com
JWT_SECRET=generate_a_strong_random_secret
NEWS_API_KEY=your_newsapi_key
```

### Vercel Deployment

The backend is already configured for Vercel (see `vercel.json`). For cron jobs on Vercel:

1. Add a Vercel Cron (in `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/news/refresh",
    "schedule": "0 */3 * * *"
  }]
}
```

2. Make sure `/api/news/refresh` is protected with admin middleware

---

## 📝 API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/news/trending` | GET | Public | Get trending news (default limit: 6) |
| `/api/news?page=1&limit=15` | GET | Public | Paginated news feed |
| `/api/news/latest?limit=5` | GET | Public | Latest beauty news |
| `/api/news/refresh` | POST | Admin | Manually trigger news refresh |
| `/api/news` | POST | Admin | Create custom news item |

---

## ✨ Features Implemented

### Backend Features
- ✅ NewsAPI integration with beauty-focused queries
- ✅ Automatic deduplication (URL-based)
- ✅ Cache rotation (max 250 articles)
- ✅ 3-hour auto-refresh via cron
- ✅ Error handling and logging
- ✅ Modular architecture (routes/controllers/services/models)

### Frontend Features
- ✅ X-like 3-column layout
- ✅ Sticky sidebar and news panel
- ✅ Search bar with Enter-to-search
- ✅ Unified feed (posts + surveys)
- ✅ Responsive design
- ✅ Loading and error states
- ✅ News thumbnails with metadata

---

## 🎉 You're All Set!

Your SalonHub application now has:
1. ✅ X-style visitor home layout
2. ✅ Trending beauty news sidebar
3. ✅ Automated news caching
4. ✅ Search functionality
5. ✅ Unified content feed

**Next Steps:**
1. Set up your `.env` file with NewsAPI key
2. Start the backend and frontend
3. Navigate to the visitor home page
4. Enjoy your new layout!

For issues or questions, check the troubleshooting section above.
