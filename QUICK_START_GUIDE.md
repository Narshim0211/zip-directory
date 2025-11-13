# 🚀 Quick Start Guide - Facebook-Style Profiles

## ✅ System Status

**Backend:** ✅ Running on http://localhost:5000
**MongoDB:** ✅ Connected
**Status:** ✅ Ready for testing

---

## 🎯 What You Can Do Right Now

### 1. **View Profiles**

**Owner Profile:**
```
http://localhost:3000/o/{slug}

Example: http://localhost:3000/o/testowner
```

**Visitor Profile:**
```
http://localhost:3000/v/{slug}

Example: http://localhost:3000/v/testvisitor
```

### 2. **Test Features**

#### When Viewing Your Own Profile:
- ✅ See "Edit Profile" button
- ✅ Use "Create Post" (owner) or "Create Survey" (visitor)
- ✅ Switch between tabs
- ✅ Content appears immediately after creation

#### When Viewing Someone Else's Profile:
- ✅ See "Follow" button
- ✅ View their timeline
- ✅ Click tabs to filter content
- ✅ No create section (not your profile)

---

## 📂 File Structure

### New V2 Files

```
backend/
├── controllers/v2/
│   ├── ownerProfileController.js      ← Owner logic
│   └── visitorProfileController.js    ← Visitor logic
├── routes/v2/
│   ├── ownerProfiles.routes.js        ← Owner routes
│   └── visitorProfiles.routes.js      ← Visitor routes
└── middleWare/
    └── roleMiddleware.js               ← Role protection

frontend/
├── styles/
│   └── designSystem.css                ← Design system
├── components/Shared/
│   ├── ProfileHeader.jsx               ← Header component
│   ├── ProfileFeed.jsx                 ← Feed component
│   ├── CreateSection.jsx               ← Content creation
│   └── ProfileTabs.jsx                 ← Tab navigation
└── pages/
    ├── OwnerProfilePageV2.jsx          ← Owner page
    └── VisitorProfilePageV2.jsx        ← Visitor page
```

---

## 🔧 API Endpoints

### Owner Profiles

```
GET  /api/v2/owner-profiles/:slug          Public profile
GET  /api/v2/owner-profiles/:slug/feed     Timeline (posts+surveys)
PUT  /api/v2/owner-profiles/:id            Update (owner only)
POST /api/v2/owner-profiles/:id/follow     Follow
```

### Visitor Profiles

```
GET  /api/v2/visitor-profiles/:slug        Public profile
GET  /api/v2/visitor-profiles/:slug/feed   Timeline (surveys)
PUT  /api/v2/visitor-profiles/:id          Update (visitor only)
POST /api/v2/visitor-profiles/:id/follow   Follow
```

---

## 🎨 Design System Quick Reference

```css
Colors:
--primary: #635BFF
--accent: #6C63FF
--background: #F9FAFB
--card-bg: #FFFFFF

Typography:
Font: Inter
Base: 16px
Large: 18px

Spacing:
Small: 8px
Medium: 12px
Large: 16px
XL: 24px

Components:
Avatar: 120px circle
Radius: 8-16px
Shadow: Subtle layered
```

---

## 🧩 Component Usage

### ProfileHeader

```jsx
<ProfileHeader
  profile={profileData}
  role="owner" // or "visitor"
  isOwnProfile={true}
  isFollowing={false}
  onFollow={() => {}}
  onUnfollow={() => {}}
/>
```

### ProfileTabs

```jsx
<ProfileTabs
  activeTab="posts"
  onTabChange={setActiveTab}
  role="owner" // or "visitor"
/>
```

### ProfileFeed

```jsx
<ProfileFeed
  items={feedItems}
  loading={false}
  onLoadMore={() => {}}
  hasMore={true}
/>
```

### CreateSection

```jsx
<CreateSection
  role="owner" // or "visitor"
  onCreatePost={async (data) => {}}
  onCreateSurvey={async (data) => {}}
/>
```

---

## 🐛 Troubleshooting

### Server Not Starting?

```bash
# Kill all node processes
taskkill //F //IM node.exe

# Restart backend
cd backend
npm run dev
```

### Port Already in Use?

```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill specific process
taskkill //PID {PID_NUMBER} //F
```

### Frontend Not Loading?

```bash
# Clear cache and restart
cd frontend
rm -rf node_modules/.cache
npm start
```

---

## ✨ Key Differences: Owner vs Visitor

| Feature | Owner | Visitor |
|---------|-------|---------|
| **Can Create** | Posts + Surveys | Surveys Only |
| **Tabs** | Posts \| Surveys \| About | Surveys \| About |
| **Feed Shows** | Posts + Surveys | Surveys |
| **API Base** | `/api/v2/owner-profiles` | `/api/v2/visitor-profiles` |

---

## 📝 Testing Workflow

### 1. Create Test Owner

```bash
# Login as owner
POST /api/auth/login
{
  "email": "testowner@example.com",
  "password": "password123"
}

# Get token, then navigate to:
http://localhost:3000/o/testowner
```

### 2. Test Creation

1. Go to your profile (`/o/your-slug`)
2. Click "Create Post"
3. Enter content
4. Click "Post"
5. See it appear immediately
6. Switch to "Surveys" tab
7. Click "Create Survey"
8. Create survey
9. See it in Surveys tab

### 3. Test Following

1. Open another user's profile
2. Click "Follow"
3. Button changes to "Following"
4. Follower count increases

---

## 🎯 Next Steps

1. **Test the profiles** at `/o/{slug}` and `/v/{slug}`
2. **Create content** using the create section
3. **Switch tabs** to see filtering work
4. **Follow users** and see counts update
5. **Check error boundaries** by simulating errors

---

## 📚 Documentation

- Full Implementation Details: `FACEBOOK_STYLE_PROFILES_IMPLEMENTATION.md`
- PRD Reference: Your original PRD document
- Legacy Comparison: Previous implementation docs

---

## ✅ Ready to Go!

Your Facebook-style profile system is **fully implemented and running**.

**Test it now:**
1. Navigate to http://localhost:3000
2. Login as owner or visitor
3. Go to `/o/your-handle` or `/v/your-handle`
4. Start creating and exploring!

🎉 **Happy Testing!**
