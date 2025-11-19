# Newsletter System - Quick Start & Testing Guide

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm start
```

### Frontend Setup (Visitor/Owner)
```bash
cd frontend
npm start
```

### Admin Dashboard Setup
```bash
cd admin
npm start
```

---

## 🧪 Testing the Newsletter System

### Test 1: Visitor Registration with Newsletter Opt-in

1. **Navigate to Registration Page**
   - URL: `http://localhost:3000/register`

2. **Fill Registration Form**
   - First Name: Jane
   - Last Name: Doe
   - Email: jane@test.com
   - Password: test123
   - Role: **Visitor**

3. **Check Newsletter Opt-in Checkbox**
   - Look for: "Stay Inspired - Hair care tips and glow-up guides"
   - ✅ Check the box

4. **Submit Registration**
   - Click "Create account"
   - Should redirect to `/visitor/home`

5. **Verify in Database**
   ```javascript
   // In MongoDB
   db.users.findOne({ email: "jane@test.com" })
   // Should show: newsletter.hairTips: true
   ```

---

### Test 2: Owner Registration with Newsletter Opt-in

1. **Navigate to Registration Page**
   - URL: `http://localhost:3000/register`

2. **Fill Registration Form**
   - First Name: John
   - Last Name: Smith
   - Email: john@salonowner.com
   - Password: test123
   - Role: **Owner**

3. **Check Newsletter Opt-in Checkbox**
   - Look for: "Grow Your Salon - Business growth tips"
   - ✅ Check the box

4. **Submit Registration**
   - Should create owner account with newsletter enabled

5. **Verify in Database**
   ```javascript
   db.users.findOne({ email: "john@salonowner.com" })
   // Should show: newsletter.businessGrowth: true
   ```

---

### Test 3: Visitor Newsletter Settings Toggle

1. **Login as Visitor**
   - Email: jane@test.com
   - Password: test123

2. **Navigate to Newsletter Settings**
   - URL: `http://localhost:3000/visitor/settings/newsletter`
   - Or add link to profile navigation

3. **Test Toggle Switch**
   - Should show: "Hair Tips & Glow-Up Newsletter"
   - Toggle should be **ON** (if opted in during registration)
   - Click toggle to **OFF** → Success message appears
   - Click toggle to **ON** → Success message appears

4. **Check API Calls**
   - Open DevTools → Network tab
   - Watch for:
     - `POST /api/visitor/newsletter/subscribe`
     - `POST /api/visitor/newsletter/unsubscribe`

5. **Verify in Database**
   ```javascript
   db.users.findOne({ email: "jane@test.com" }, { newsletter: 1 })
   // hairTips should change based on toggle
   ```

---

### Test 4: Owner Newsletter Settings Toggle

1. **Login as Owner**
   - Email: john@salonowner.com
   - Password: test123

2. **Navigate to Newsletter Settings**
   - URL: `http://localhost:3000/owner/settings/newsletter`

3. **Test Toggle Switch**
   - Should show: "Business Growth Newsletter"
   - Toggle ON/OFF and verify success messages

4. **Check API Calls**
   - `POST /api/owner/newsletter/subscribe`
   - `POST /api/owner/newsletter/unsubscribe`

---

### Test 5: Admin Newsletter Hub

1. **Login as Admin**
   - URL: `http://localhost:5173` (Vite admin)
   - Or `http://localhost:3001` (if using different port)

2. **Navigate to Newsletter Hub**
   - Click "Newsletters" in sidebar
   - Should see Newsletter Hub page

3. **Check Overview Metrics**
   - **Visitor Subscribers**: Should show count of users with `newsletter.hairTips: true`
   - **Owner Subscribers**: Should show count of users with `newsletter.businessGrowth: true`
   - **Total Subscribers**: Sum of both

4. **View Recent Campaigns**
   - Should show empty state if no campaigns exist
   - Message: "No campaigns yet. Create your first newsletter above!"

5. **Test Navigation Buttons**
   - "Create Visitor Newsletter" button (will be implemented in Phase 9)
   - "Create Owner Newsletter" button (will be implemented in Phase 9)

---

## 🔍 API Testing with cURL

### Get Visitor Newsletter Status
```bash
curl -X GET http://localhost:5000/api/visitor/newsletter/status \
  -H "Authorization: Bearer YOUR_VISITOR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "subscribed": true
}
```

### Subscribe Visitor to Newsletter
```bash
curl -X POST http://localhost:5000/api/visitor/newsletter/subscribe \
  -H "Authorization: Bearer YOUR_VISITOR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to hair tips newsletter",
  "subscribed": true
}
```

### Unsubscribe Visitor from Newsletter
```bash
curl -X POST http://localhost:5000/api/visitor/newsletter/unsubscribe \
  -H "Authorization: Bearer YOUR_VISITOR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from hair tips newsletter",
  "subscribed": false
}
```

### Admin - Get Newsletter Overview
```bash
curl -X GET http://localhost:5000/api/admin/newsletters/overview \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "subscriberCounts": {
    "visitors": 5,
    "owners": 3,
    "total": 8
  },
  "recentCampaigns": []
}
```

### Admin - Get Visitor Subscribers
```bash
curl -X GET "http://localhost:5000/api/admin/newsletters/subscribers/visitor?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "subscribers": [
    {
      "_id": "...",
      "name": "Jane Doe",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@test.com",
      "newsletter": {
        "hairTips": true,
        "businessGrowth": false
      },
      "createdAt": "2025-11-19T..."
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### Admin - Create Campaign (Draft)
```bash
curl -X POST http://localhost:5000/api/admin/newsletters/campaigns \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audience": "VISITOR",
    "subject": "Your November Hair Glow-Up Guide ✨",
    "preheader": "3 routines + product picks just for you",
    "contentHtml": "<h1>Hello!</h1><p>Here are your hair tips...</p>",
    "contentText": "Hello! Here are your hair tips..."
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "audience": "VISITOR",
  "subject": "Your November Hair Glow-Up Guide ✨",
  "preheader": "3 routines + product picks just for you",
  "contentHtml": "<h1>Hello!</h1><p>Here are your hair tips...</p>",
  "contentText": "Hello! Here are your hair tips...",
  "status": "DRAFT",
  "createdByAdminId": "...",
  "stats": {
    "totalRecipients": 0,
    "sentCount": 0,
    "failedCount": 0
  },
  "createdAt": "2025-11-19T...",
  "updatedAt": "2025-11-19T..."
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Not authorized, invalid token"
**Solution:**
- Make sure you're logged in
- Check that JWT token is in Authorization header
- Token format: `Bearer <token>`

### Issue 2: "Access denied: Visitors only"
**Solution:**
- You're trying to access visitor endpoint with owner/admin token
- Use correct role account

### Issue 3: Newsletter toggle not appearing
**Solution:**
- Check route is registered in App.js
- Verify component import path
- Check browser console for errors

### Issue 4: Subscriber count shows 0 in admin
**Solution:**
- Register new users with newsletter opt-in checked
- Or manually update existing users in database:
  ```javascript
  db.users.updateOne(
    { email: "test@test.com" },
    { $set: { "newsletter.hairTips": true } }
  )
  ```

### Issue 5: "visitorOnly is not a function"
**Solution:**
- Make sure you've updated `backend/middleWare/authMiddleware.js`
- Restart backend server

---

## ✅ Checklist for Complete Testing

- [ ] Visitor registration with opt-in works
- [ ] Owner registration with opt-in works
- [ ] Visitor newsletter settings page loads
- [ ] Owner newsletter settings page loads
- [ ] Toggle switch updates database
- [ ] API returns correct subscription status
- [ ] Admin newsletter hub loads
- [ ] Admin can see subscriber counts
- [ ] Sidebar newsletter link works
- [ ] All API endpoints return proper responses
- [ ] Error messages display correctly
- [ ] Success messages disappear after 3 seconds
- [ ] Mobile responsive design works
- [ ] Database indexes created

---

## 📊 Monitoring Subscriber Growth

### Query Active Subscribers
```javascript
// Visitor subscribers
db.users.countDocuments({
  role: "visitor",
  "newsletter.hairTips": true
})

// Owner subscribers
db.users.countDocuments({
  role: "owner",
  "newsletter.businessGrowth": true
})

// Total
db.users.countDocuments({
  $or: [
    { "newsletter.hairTips": true },
    { "newsletter.businessGrowth": true }
  ]
})
```

### Find All Subscribed Users
```javascript
// All visitor subscribers
db.users.find(
  { role: "visitor", "newsletter.hairTips": true },
  { name: 1, email: 1, newsletter: 1 }
)

// All owner subscribers
db.users.find(
  { role: "owner", "newsletter.businessGrowth": true },
  { name: 1, email: 1, newsletter: 1 }
)
```

---

## 🎯 Next Phase Preview

Once you're ready for **Phase 9-11** (Newsletter Composer & Email Sending):

1. **Choose Email Provider**
   - SendGrid (recommended for scale)
   - Mailchimp (full-featured)
   - Resend (developer-friendly)

2. **Get API Keys**
   - Sign up for chosen provider
   - Add keys to `.env`

3. **Test Email Delivery**
   - Send test emails to yourself
   - Check spam folder
   - Verify unsubscribe links

4. **Build Composer UI**
   - Rich text editor
   - Live preview
   - Subject/preheader fields

Let me know when you're ready to implement email sending! 🚀
