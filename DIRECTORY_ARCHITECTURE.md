# 🏗️ Directory System Architecture

## **🌍 Universal Behavior Principle (CRITICAL)**

> **The soft-profile browsing and login-gated full-profile access apply universally to ALL business profiles in the directory. Every business uses the same public soft-profile endpoint and the same authenticated full-profile endpoint, unless explicitly flagged with custom access rules in future versions.**

This architectural decision ensures:
- ✅ **Consistent user experience** across all businesses
- ✅ **Predictable security model** (no per-business exceptions)
- ✅ **Clear separation** of public vs authenticated data
- ✅ **No routing conflicts** or data leakage
- ✅ **Simplified maintenance** (one code path for all businesses)

**Applies to:**
- Salons
- Spas
- Barbershops
- Freelance Stylists
- All future business categories

---

## **Overview**

This document describes the architecture of the **Directory Soft-Profile Browsing + Login-Gated Business Profiles** system. The architecture follows world-class engineering principles with **zero duplication**, **clear routing**, and **role-based access control**.

---

## **1. Core Design Principles**

### ✅ **Strict Layer Separation**
- **Public Layer**: Unauthenticated users, soft profiles only
- **Visitor Auth Layer**: Logged-in visitors, full profile access
- **Owner Auth Layer**: Business owners, management access (existing system)

### ✅ **Zero Duplication**
- Single `Business` model
- No duplicate routes or controllers
- Shared components in `/components/shared/`

### ✅ **Prefix-Based Routing**
- `/api/public/*` - No auth required
- `/api/visitor/*` - Visitor JWT required
- `/api/owner/*` - Owner JWT required

### ✅ **Global Error Boundaries**
- Backend: `catchAsync` wrapper + centralized error handler
- Frontend: `ErrorBoundary` components at page level

---

## **2. Backend Architecture**

### **API Endpoints**

#### **Public Directory Routes** (No Auth)
```
GET /api/public/directory/search
  - Query: city (required), zip (optional), category (optional)
  - Returns: Soft profiles (name, city, category, heroImage, distance)
  - Security: NO sensitive data exposed

GET /api/public/directory/business/:id/soft
  - Returns: Single soft profile
  - Security: Status must be 'approved', NO contact info
```

#### **Visitor Business Routes** (JWT Required)
```
GET /api/visitor/business/:id/full
  - Auth: protectVisitor middleware
  - Returns: Complete profile (address, phone, email, services, hours, pricing)
  - Security: Excludes owner-only fields (privateNotes, analytics)

GET /api/visitor/business/nearby
  - Auth: protectVisitor middleware
  - Query: lat, lng, radius, category
  - Returns: Array of full profiles within radius
```

### **Folder Structure**

```
backend/
├── routes/
│   └── directory/
│       ├── publicDirectory.routes.js   (Public soft search)
│       └── visitorBusiness.routes.js   (Visitor full profiles)
│
├── controllers/
│   └── directory/
│       ├── publicDirectory.controller.js
│       └── visitorBusiness.controller.js
│
├── models/
│   └── Business.js   (SINGLE source of truth)
│
├── middleWare/
│   ├── authMiddleware.js       (protect, adminOnly, visitorOnly, ownerOnly)
│   ├── authVisitorMiddleware.js (protectVisitor)
│   └── authOwnerMiddleware.js  (protectOwner)
│
├── utils/
│   └── calculateDistance.js  (Haversine formula)
│
└── core/
    └── errors/
        └── globalErrorHandler.js  (AppError class, catchAsync, errorHandler)
```

### **Data Exposure Levels**

| Field | Public Soft | Visitor Full | Owner Manage |
|-------|-------------|--------------|--------------|
| name | ✅ | ✅ | ✅ |
| city | ✅ | ✅ | ✅ |
| category | ✅ | ✅ | ✅ |
| heroImage | ✅ | ✅ | ✅ |
| location | ✅ | ✅ | ✅ |
| address | ❌ | ✅ | ✅ |
| phone | ❌ | ✅ | ✅ |
| email | ❌ | ✅ | ✅ |
| services | ❌ | ✅ | ✅ |
| pricing | ❌ | ✅ | ✅ |
| hours | ❌ | ✅ | ✅ |
| privateNotes | ❌ | ❌ | ✅ |
| analytics | ❌ | ❌ | ✅ |

---

## **3. Frontend Architecture**

### **Routes**

#### **Public Routes** (No Auth)
```
/directory                → DirectoryLanding (search form)
/directory/search         → DirectorySearchResults (soft profile grid)
```

#### **Visitor Routes** (JWT Required)
```
/visitor/business/:id     → BusinessProfile (full details)
```

#### **Owner Routes** (JWT Required, Existing)
```
/owner/business-manager   → OwnerBusinessManager
/owner/my-business        → MyBusiness
```

### **Folder Structure**

```
frontend/src/
├── pages/
│   ├── public/
│   │   ├── DirectoryLanding.jsx           (Public search form)
│   │   ├── DirectoryLanding.css
│   │   ├── DirectorySearchResults.jsx      (Soft profile grid)
│   │   └── DirectorySearchResults.css
│   │
│   ├── visitor/
│   │   ├── BusinessProfile.jsx             (Full profile view)
│   │   └── BusinessProfile.css
│   │
│   └── owner/
│       └── (existing owner pages)
│
├── components/
│   └── shared/
│       ├── BusinessCardSoft.jsx             (Soft profile card)
│       ├── BusinessCardSoft.css
│       ├── LoginModal.jsx                   (Auth gate modal)
│       └── LoginModal.css
│
├── utils/
│   └── redirectAfterLogin.js   (Redirect helpers)
│
└── App.js  (Route definitions with ErrorBoundaries)
```

### **Component Hierarchy**

```
App.js (ErrorBoundary)
├── PublicLayout
│   ├── DirectoryLanding
│   └── DirectorySearchResults
│       └── BusinessCardSoft (×N)
│           └── LoginModal (conditional)
│
└── VisitorLayout (ProtectedRoute)
    └── BusinessProfile
```

---

## **4. User Flows**

### **Flow 1: Anonymous Visitor**
```
1. Visit /directory
2. Enter city, optional ZIP, select category
3. Click "Search"
4. Redirected to /directory/search?city=X&zip=Y&category=Z
5. See grid of soft profiles (name, city, image, distance)
6. Click "View Profile" button
7. Login modal appears ("Sign in to view full details")
8. Click "Log In" or "Sign Up"
9. Redirected to /login (redirect URL stored in sessionStorage)
10. After successful login, auto-redirected to /visitor/business/:id
11. See full profile (address, phone, services, pricing, hours)
```

### **Flow 2: Logged-In Visitor**
```
1. Visit /directory
2. Search for businesses
3. See soft profiles in results
4. Click "View Profile" button
5. Immediately navigate to /visitor/business/:id (no login modal)
6. See full profile details
```

### **Flow 3: Owner**
```
(Owners don't use directory - they manage their own business)
Separate routes: /owner/my-business, /owner/business-manager
```

---

## **5. Security Model**

### **Authentication Middleware**

```javascript
// Public routes - NO middleware
app.use('/api/public/directory', publicDirectoryRoutes);

// Visitor routes - protectVisitor middleware
router.use(protectVisitor);  // Applied at router level
app.use('/api/visitor/business', visitorBusinessRoutes);

// Owner routes - protectOwner middleware
router.use(protectOwner);  // Applied at router level
app.use('/api/owner/business', ownerBusinessRoutes);
```

### **Data Filtering**

**Public Controller:**
```javascript
const businesses = await Business.find(query)
  .select('name city zip category logoUrl coverPhotoUrl location')
  .lean();
```

**Visitor Controller:**
```javascript
const business = await Business.findById(id)
  .select('-__v -privateNotes -analyticsData')
  .lean();
```

**Owner Controller:**
```javascript
const business = await Business.findById(id);  // All fields
```

---

## **6. Error Handling**

### **Backend**

**Controller Pattern:**
```javascript
exports.searchBusinesses = catchAsync(async (req, res, next) => {
  // Business logic
  if (error) {
    return next(new AppError('Error message', 400));
  }
  res.json({ success: true, data });
});
```

**Error Handler:**
```javascript
app.use(globalErrorHandler);  // Last middleware in server.js
```

### **Frontend**

**Route-Level Error Boundaries:**
```jsx
<Route path="/directory" element={
  <ErrorBoundary>
    <DirectoryLanding />
  </ErrorBoundary>
} />
```

**Component-Level:**
```jsx
try {
  const { data } = await axios.get('/api/public/directory/search');
  setBusinesses(data.data);
} catch (err) {
  setError('Unable to load businesses');
}
```

---

## **7. No Duplicate Files**

### **Single Business Model**
- Location: `backend/models/Business.js`
- Used by: publicDirectory.controller, visitorBusiness.controller, ownerBusiness.controller

### **No Duplicate Routes**
- `/api/public/directory/*` - Public only
- `/api/visitor/business/*` - Visitor only
- `/api/owner/business/*` - Owner only
- Old `/business/:id` route still exists for legacy compatibility

### **No Duplicate Components**
- `BusinessCardSoft.jsx` - Used only in DirectorySearchResults
- `LoginModal.jsx` - Reusable auth gate
- No duplication between visitor/owner explore pages

---

## **8. Distance Calculation**

**Algorithm:** Haversine Formula

```javascript
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'mi') {
  // Returns distance in miles or kilometers
  // Accuracy: ~0.5% error for most distances
}
```

**ZIP Lookup:** Simplified hardcoded database (production should use Google Maps Geocoding API or similar)

---

## **9. Testing Strategy**

### **Backend Tests**
```bash
# Test public endpoint (no auth)
curl http://localhost:5002/api/public/directory/search?city=NewYork

# Test visitor endpoint (requires auth)
curl http://localhost:5002/api/visitor/business/ABC123/full \
  -H "Authorization: Bearer JWT_TOKEN"

# Verify no sensitive data in public response
# Verify full data in visitor response
```

### **Frontend Tests**
1. Visit `/directory` - search form loads
2. Search with city only - results appear
3. Click "View Profile" while logged out - login modal shows
4. Login - redirected to business profile
5. Full profile shows address, phone, email

---

## **10. Deployment Checklist**

- [ ] Backend routes registered in `server.js`
- [ ] Frontend routes added to `App.js`
- [ ] Environment variables set (`JWT_SECRET`, `MONGODB_URI`)
- [ ] Rate limiting configured for public endpoints
- [ ] CORS settings updated for production domain
- [ ] Database indexes created (`city`, `category`, `location:2dsphere`)
- [ ] Error logging configured (Sentry, LogRocket, etc.)
- [ ] SSL certificates installed
- [ ] API documentation published

---

## **11. Future Enhancements**

- **Reviews System**: Add review model and endpoints
- **Favorites/Bookmarks**: Allow visitors to save businesses
- **Advanced Filters**: Price range, ratings, specialties
- **Map View**: Interactive map with business markers
- **Real-time Availability**: Show open/closed status
- **Booking Integration**: Direct appointment booking from profile
- **Social Sharing**: Share business profiles
- **Analytics Dashboard**: Owner insights on profile views

---

**Last Updated:** November 19, 2025  
**Status:** Production-Ready  
**Version:** 1.0
