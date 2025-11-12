# 🚀 Quick Start Checklist

## ✅ Pre-Flight Checklist (5 minutes)

### Step 1: Get Your NewsAPI Key
1. Visit: https://newsapi.org/register
2. Sign up (it's free!)
3. Copy your API key
4. Save it somewhere safe

### Step 2: Configure Backend
```bash
cd zip-directory/backend

# Copy the template
cp .env.template .env

# Edit .env and add your NewsAPI key
# Replace "your_newsapi_key_here" with your actual key
```

Your `.env` should look like:
```env
MONGO_URI=mongodb://localhost:27017/salonhub
JWT_SECRET=change_this_to_a_random_secret
NEWS_API_KEY=abc123yourrealapikey456def  👈 ADD THIS
WEB_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:3001
PORT=5000
NODE_ENV=development
```

### Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# macOS/Linux
mongod

# Windows (in PowerShell as Administrator)
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

---

## 🏃 Launch (2 minutes)

### Terminal 1: Backend
```bash
cd zip-directory/backend
npm install
npm start
```

**Expected output:**
```
✓ MongoDB connected
✓ Server running on http://localhost:5000
🕒 [newsCron] Refreshing beauty news...
📰 newsCron added 20 items, rotated 0 items.
```

### Terminal 2: Frontend
```bash
cd zip-directory/frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
The app is running at:
  http://localhost:3000
```

---

## 🧪 Verify It Works (1 minute)

### Test 1: Backend API
Open in browser or use curl:
```bash
http://localhost:5000/api/news/trending
```

**Should see:** JSON array of news articles

### Test 2: Frontend Layout
1. Navigate to: `http://localhost:3000`
2. Log in as a visitor
3. Check for:
   - ✅ Left sidebar with navigation
   - ✅ Center feed with search bar
   - ✅ Right sidebar with trending news

---

## 🎉 Success!

If you see all three columns and news articles, you're done! 🎊

### What You Have Now:
- ✅ X-style 3-column layout
- ✅ Trending beauty news (refreshes every 3 hours)
- ✅ Search bar for salons
- ✅ Unified feed of posts & surveys
- ✅ Fully modular backend

---

## 🐛 Quick Troubleshooting

### "News not loading"
```bash
# Check backend logs
cd zip-directory/backend
npm start

# Look for errors in the output
```

### "MongoDB connection failed"
```bash
# Make sure MongoDB is running
mongod  # or check your MongoDB service
```

### "NewsAPI error"
- Verify your API key is correct in `.env`
- Check you haven't exceeded 100 requests/day (unlikely with 3-hour cron)

### Still stuck?
See detailed troubleshooting in `SETUP_INSTRUCTIONS.md`

---

## 📚 Learn More

- **Full setup guide:** `SETUP_INSTRUCTIONS.md`
- **What changed:** `IMPLEMENTATION_SUMMARY.md`
- **API documentation:** `SETUP_INSTRUCTIONS.md` → API Endpoints section

---

## 🎨 Optional Customizations

### Change news refresh time
Edit `backend/cron/newsCron.js`:
```javascript
// Every hour instead of 3 hours:
cron.schedule("0 * * * *", async () => {
```

### Show more news in sidebar
Edit `frontend/src/visitor/components/TrendingNewsSidebar.jsx`:
```javascript
.get("/news/trending?limit=20")  // Show 20 instead of 10
```

### Customize news topics
Edit `backend/services/newsService.js`:
```javascript
q: "hair OR nails OR spa OR your-custom-topics"
```

---

## 💡 Tips

1. **Free NewsAPI limits:** 100 requests/day
   - Our cron runs 8 times/day = well within limit ✅

2. **MongoDB storage:** Max 250 articles cached
   - Auto-rotates old articles ✅

3. **Performance:** News is cached, not fetched live
   - Frontend is fast ✅

---

**That's it! Enjoy your new X-style SalonHub! 🎊**

Questions? Check `SETUP_INSTRUCTIONS.md` or `IMPLEMENTATION_SUMMARY.md`
