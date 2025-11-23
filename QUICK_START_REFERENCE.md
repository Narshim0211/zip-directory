# ⚡ QUICK START REFERENCE — Visitor Profile Feature

**Last Updated:** November 23, 2025
**Read Time:** 5 minutes
**Use Case:** Quick reference during development

---

## 📚 YOUR DOCUMENTATION FILES

| File | Purpose | When to Use |
|------|---------|-------------|
| **VISITOR_PROFILE_SUMMARY.md** | Project overview | Start here - understand the big picture |
| **WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md** | Complete technical architecture | Deep dive into code structure |
| **TESTING_STRATEGY.md** | All test examples | Writing tests, QA verification |
| **IMPLEMENTATION_EXECUTION_PLAN.md** | Day-by-day tasks | Daily work planning |
| **QUICK_START_REFERENCE.md** | This file | Quick answers during coding |

---

## 🎯 CORE PRINCIPLES (Never Forget These)

1. **Single Source of Truth:** What owner saves = What visitor sees (ZERO transformation at visitor page)
2. **Zero Duplication:** Reuse 76% existing code, add only 24% new
3. **Service Layer Pattern:** Controllers handle HTTP, Services handle business logic
4. **Hook-Based Frontend:** Custom hooks for data fetching and state management
5. **Permission SSOT:** All entitlements logic in `entitlements.service.js` ONLY

---

## 🗂️ FILE LOCATIONS (Quick Access)

### **Backend - New Files to Create:**
```
backend/
├── models/
│   └── VisitorChatSubscription.js ❌ CREATE
├── services/ ❌ CREATE DIRECTORY
│   ├── README.md
│   ├── entitlements.service.js ❌ CREATE (permission logic)
│   └── profileBuilder.service.js ❌ CREATE (profile builder)
└── routes/
    └── publicRoutes.js ✅ ENHANCE (add 2 endpoints)
```

### **Frontend - New Files to Create:**
```
frontend/src/
├── hooks/ ❌ CREATE DIRECTORY
│   ├── usePublicProfile.js ❌ CREATE
│   ├── useEntitlements.js ❌ CREATE
│   └── useChatSubscription.js ❌ CREATE
├── components/
│   ├── shared/ ❌ CREATE DIRECTORY (move existing components here)
│   │   ├── MessageButton.jsx ✅ MOVE + ENHANCE
│   │   ├── PromotionBanner.jsx ✅ MOVE (no changes)
│   │   └── ReviewList.jsx ✅ MOVE (no changes)
│   └── visitor/ ❌ CREATE DIRECTORY
│       ├── MasonryGallery.jsx ❌ CREATE
│       ├── StickyCTA.jsx ❌ CREATE
│       ├── RatingSummaryBanner.jsx ❌ CREATE
│       ├── ChatSubscriptionPaywall.jsx ❌ CREATE
│       └── FreeListingNotice.jsx ❌ CREATE
└── pages/
    └── PublicProfile.jsx ✅ ENHANCE (integrate all components)
```

---

## 🔗 KEY API ENDPOINTS

### **Public Profile API**
```javascript
// GET public business profile
GET /api/v1/public/profile/:slug

// Example:
fetch('/api/v1/public/profile/sunset-salon-dallas')
  .then(res => res.json())
  .then(data => console.log(data));

// Response:
{
  "success": true,
  "data": {
    "name": "Sunset Hair Salon",
    "slug": "sunset-salon-dallas",
    "isPremium": true,
    "services": [...],
    "team": [...],
    "rating": { "average": 4.8, "count": 25 }
  }
}
```

### **Chat Entitlements API**
```javascript
// Check visitor chat permissions
GET /api/v1/public/chat/entitlements/:businessId
Headers: { Authorization: "Bearer YOUR_JWT_TOKEN" }

// Example:
fetch('/api/v1/public/chat/entitlements/business123', {
  headers: { 'Authorization': 'Bearer ' + token }
})

// Response (allowed - first message):
{
  "success": true,
  "data": {
    "allowed": true,
    "reason": "FIRST_MESSAGE_FREE",
    "requiresSubscription": false
  }
}

// Response (blocked - needs subscription):
{
  "success": true,
  "data": {
    "allowed": false,
    "reason": "SUBSCRIPTION_REQUIRED",
    "requiresSubscription": true,
    "message": "Unlock unlimited messaging for $9.99/month",
    "pricing": { "monthly": 9.99 }
  }
}
```

---

## 🧩 COMPONENT USAGE

### **usePublicProfile Hook**
```javascript
import { usePublicProfile } from '../hooks/usePublicProfile';

function MyComponent() {
  const { slug } = useParams();
  const { profile, loading, error, refetch } = usePublicProfile(slug);

  if (loading) return <Spinner />;
  if (error) return <ErrorPage message={error.message} />;

  return <div>{profile.name}</div>;
}
```

### **useEntitlements Hook**
```javascript
import { useEntitlements } from '../hooks/useEntitlements';

function MessageButton({ businessId }) {
  const { canSendMessage, requiresSubscription, message } = useEntitlements(businessId);

  if (!canSendMessage && requiresSubscription) {
    return <ChatPaywall message={message} />;
  }

  return <button onClick={handleSendMessage}>Send Message</button>;
}
```

### **MasonryGallery Component**
```javascript
import MasonryGallery from '../components/visitor/MasonryGallery';

function ProfilePage({ profile }) {
  return (
    <MasonryGallery
      photos={profile.photos}
      isPremium={profile.isPremium}
      freeLimit={3}
      onPhotoClick={openLightbox}
    />
  );
}
```

---

## 🔐 ENTITLEMENTS RULES (Quick Reference)

| Scenario | Visitor Can Message? | Why |
|----------|---------------------|-----|
| Free business | ❌ NO | Business can't reply anyway |
| Premium business + first message | ✅ YES (FREE) | Hook visitor with free taste |
| Premium business + second message (no sub) | ❌ BLOCKED | Show $9.99/mo paywall |
| Premium business + has subscription | ✅ YES | Unlimited messaging |
| Owner replies + no subscription | 🔒 BLURRED | Show paywall to read |
| Owner replies + has subscription | ✅ VISIBLE | Full access |

**Code Check:**
```javascript
// Check in backend:
const result = await EntitlementsService.canSendMessage(visitorId, businessId);

// Check in frontend:
const { canSendMessage } = useEntitlements(businessId);
```

---

## 🎨 FREE VS PREMIUM DISPLAY

### **Hero Section**
```javascript
// Premium
<div className="premium-badge">💎 Premium</div>

// Free
<div className="free-badge">Free Listing</div>
```

### **Gallery**
```javascript
// Premium: Show all photos
<MasonryGallery photos={profile.photos} isPremium={true} />

// Free: Limit to 3 photos
<MasonryGallery photos={profile.photos} isPremium={false} freeLimit={3} />
// Shows "🔒 +7 more photos - Upgrade to Premium" overlay
```

### **Messaging**
```javascript
// Premium: Show message button
{profile.isPremium && <MessageButton businessId={profile._id} />}

// Free: Show notice
{!profile.isPremium && <FreeListingNotice />}
// "This business has a free listing and cannot reply to messages"
```

---

## ⚡ COMMON COMMANDS

### **Backend Development**
```bash
# Start backend server
cd backend
npm run dev

# Run backend tests
npm test

# Run with coverage
npm test -- --coverage

# Test specific file
npm test -- entitlements.service.test.js
```

### **Frontend Development**
```bash
# Start frontend server
cd frontend
npm start

# Run frontend tests
npm test

# Build for production
npm run build

# Analyze bundle size
npm run build -- --stats
```

### **Database**
```bash
# Connect to MongoDB
mongo

# Use SalonHub database
use salonhub

# Check business
db.businesses.findOne({ slug: 'sunset-salon-dallas' })

# Check subscriptions
db.visitorchatsubscriptions.find()
```

---

## 🐛 DEBUGGING TIPS

### **Issue: Profile not loading**
```javascript
// Check:
1. Is backend running? → curl http://localhost:5000/api/v1/public/profile/test-slug
2. Is slug correct? → Check URL in browser
3. Is business active? → db.businesses.findOne({ slug: 'your-slug', status: 'active' })
4. Check browser console for errors
```

### **Issue: Entitlements not working**
```javascript
// Check:
1. Is user logged in? → console.log(user) in AuthContext
2. Is businessId correct? → console.log(businessId)
3. Is backend entitlements service running? → Check backend logs
4. Check JWT token → localStorage.getItem('token')
```

### **Issue: Free vs Premium not showing correctly**
```javascript
// Check:
1. profile.listingType value → console.log(profile.listingType)
2. profile.isPremium value → console.log(profile.isPremium)
3. Business in DB → db.businesses.findOne({ _id: ObjectId('...') })
4. Premium subscription active → premiumSubscription.active === true
```

---

## 📊 TESTING QUICK COMMANDS

```bash
# Run all tests
npm test

# Run specific test file
npm test -- usePublicProfile.test.js

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

---

## ✅ DAILY CHECKLIST

**Before Starting Work:**
- [ ] Pull latest code: `git pull origin main`
- [ ] Backend running: `cd backend && npm run dev`
- [ ] Frontend running: `cd frontend && npm start`
- [ ] Check today's tasks in `IMPLEMENTATION_EXECUTION_PLAN.md`

**During Work:**
- [ ] Write tests as you code (TDD)
- [ ] Commit frequently (meaningful messages)
- [ ] Test manually in browser
- [ ] Check for console errors

**Before Ending Day:**
- [ ] Run test suite: `npm test`
- [ ] Commit final changes
- [ ] Update progress in execution plan
- [ ] Note any blockers for tomorrow

---

## 🚨 EMERGENCY CONTACTS

**Code Not Working?**
1. Check implementation guide: `WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md`
2. Review code examples with line numbers
3. Compare your code to provided examples

**Tests Failing?**
1. Check testing strategy: `TESTING_STRATEGY.md`
2. Review test examples
3. Run single test to isolate issue

**Forgot Architecture?**
1. Check summary: `VISITOR_PROFILE_SUMMARY.md`
2. Review data flow diagram
3. Understand backend → frontend flow

---

## 💡 PRO TIPS

1. **Always check existing code first** - Don't rebuild what exists
2. **Use JSDoc comments** - Future you will thank present you
3. **Test as you code** - Don't wait until the end
4. **Commit small changes** - Easier to debug and revert
5. **Read error messages carefully** - They usually tell you exactly what's wrong

---

**Last Updated:** November 23, 2025
**Version:** 1.0
**Status:** ✅ Ready to Use

**Quick Links:**
- [Summary](VISITOR_PROFILE_SUMMARY.md)
- [Implementation Guide](WORLD_CLASS_VISITOR_PROFILE_IMPLEMENTATION.md)
- [Testing Strategy](TESTING_STRATEGY.md)
- [Execution Plan](IMPLEMENTATION_EXECUTION_PLAN.md)
