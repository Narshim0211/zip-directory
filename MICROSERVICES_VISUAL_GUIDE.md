# Microservices Visual Guide

## 🗺️ System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                │
│                      http://localhost:3000                            │
│                                                                        │
│  Navigation: /microservices → Dashboard                               │
│             /microservices/profile → ProfileManager                   │
│             /microservices/services → ServiceManager                  │
│             /microservices/bookings → BookingManager                  │
│             /microservices/payments → PaymentManager                  │
└────────────────────────────┬──────────────────────────────────────────┘
                             │
                             │ HTTP Requests (axios)
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    FRONTEND API SERVICES                              │
│                                                                        │
│  profileService.js  │  bookingService.js  │  paymentService.js       │
│                                                                        │
│  Base URL: http://localhost:5000/api                                 │
│  Headers: Authorization: Bearer <JWT>                                │
└────────────────────────────┬──────────────────────────────────────────┘
                             │
                             │ Proxied Requests
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    MAIN BACKEND (Port 5000)                           │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────┐         │
│  │              AUTHENTICATION LAYER                        │         │
│  │  • JWT token validation                                  │         │
│  │  • User role verification                                │         │
│  │  • Token attached to req.user                            │         │
│  └─────────────────────────────────────────────────────────┘         │
│                             │                                          │
│  ┌─────────────────────────┴──────────────────────────────┐         │
│  │              PROXY GATEWAY                               │         │
│  │                                                          │         │
│  │  /api/profiles-service/*  → Forward to Port 6001        │         │
│  │  /api/booking-service/*   → Forward to Port 6002        │         │
│  │  /api/payment-service/*   → Forward to Port 6003        │         │
│  │                                                          │         │
│  │  Headers forwarded:                                      │         │
│  │  ✓ authorization (JWT token)                            │         │
│  │  ✓ content-type                                         │         │
│  │  ✓ accept                                               │         │
│  └──────────────────────────────────────────────────────────┘         │
└────────────┬─────────────────┬──────────────────┬────────────────────┘
             │                 │                  │
             ▼                 ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  PROFILE SERVICE │ │  BOOKING SERVICE │ │  PAYMENT SERVICE │
│    Port 6001     │ │    Port 6002     │ │    Port 6003     │
│                  │ │                  │ │                  │
│  11 Endpoints    │ │  27 Endpoints    │ │  20 Endpoints    │
│                  │ │                  │ │                  │
│  • GET /me       │ │  • GET /services │ │  • GET /txns     │
│  • PATCH /me     │ │  • POST /services│ │  • GET /subs     │
│  • POST /posts   │ │  • GET /bookings │ │  • GET /stripe   │
│  • GET /timeline │ │  • POST /bookings│ │  • POST /stripe  │
│  • GET /business │ │  • PATCH /status │ │  • POST /payment │
│  • ...           │ │  • ...           │ │  • ...           │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        MongoDB Atlas                                  │
│                                                                        │
│  Database: salonhub-profiles     Database: salonhub-booking           │
│  Collections:                    Collections:                         │
│  • profiles                      • services                           │
│  • timelinePosts                 • staff                              │
│  • follows                       • bookings                           │
│  • analytics                     • availability                       │
│                                                                        │
│  Database: salonhub-payment                                           │
│  Collections:                                                         │
│  • payments                                                           │
│  • subscriptions                                                      │
│  • stripeAccounts                                                     │
│  • transactions                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure

```
zip-directory/
│
├── backend/                              # Main Backend (Port 5000)
│   ├── server.js                         # Entry point
│   ├── routes/
│   │   ├── profileProxyRoutes.js        # Proxy to Profile Service
│   │   ├── bookingProxyRoutes.js        # Proxy to Booking Service
│   │   └── paymentProxyRoutes.js        # Proxy to Payment Service
│   └── middleware/
│       └── authMiddleware.js            # JWT validation
│
├── services/
│   ├── profile-service/                 # Profile Microservice (Port 6001)
│   │   ├── server.js
│   │   ├── models/
│   │   │   ├── Profile.js
│   │   │   └── TimelinePost.js
│   │   ├── controllers/
│   │   │   └── profileController.js
│   │   └── routes/
│   │       └── profileRoutes.js
│   │
│   ├── booking-service/                 # Booking Microservice (Port 6002)
│   │   ├── server.js
│   │   ├── models/
│   │   │   ├── Service.js
│   │   │   ├── Booking.js
│   │   │   └── Staff.js
│   │   ├── controllers/
│   │   │   ├── serviceController.js
│   │   │   └── bookingController.js
│   │   └── routes/
│   │       └── bookingRoutes.js
│   │
│   └── payment-service/                 # Payment Microservice (Port 6003)
│       ├── server.js
│       ├── models/
│       │   ├── Payment.js
│       │   ├── Subscription.js
│       │   └── StripeAccount.js
│       ├── controllers/
│       │   ├── paymentController.js
│       │   └── stripeController.js
│       └── routes/
│           └── paymentRoutes.js
│
├── frontend/                            # React Frontend (Port 3000)
│   ├── src/
│   │   ├── App.js                      # ✅ UPDATED - Added microservices routes
│   │   │
│   │   ├── api/                        # API Service Layer
│   │   │   ├── axios.js                # Axios instance
│   │   │   ├── profileService.js       # Profile API calls
│   │   │   ├── bookingService.js       # Booking API calls
│   │   │   └── paymentService.js       # Payment API calls
│   │   │
│   │   ├── components/
│   │   │   └── microservices/          # ✅ NEW - Microservices Components
│   │   │       ├── ProfileManager.jsx      # Profile management
│   │   │       ├── ServiceManager.jsx      # Service management
│   │   │       ├── BookingManager.jsx      # Booking management
│   │   │       ├── PaymentManager.jsx      # Payment management
│   │   │       ├── MicroservicesDashboard.jsx  # Unified dashboard
│   │   │       └── MicroservicesNav.jsx    # Navigation component
│   │   │
│   │   └── routes/                     # ✅ NEW - Route Configuration
│   │       └── MicroservicesRoutes.jsx # Microservices routes
│   │
│   └── package.json
│
├── e2e-test.ps1                        # E2E test script (11 tests)
├── test-services.ps1                   # Service status checker
│
└── Documentation/                      # ✅ NEW - Comprehensive Docs
    ├── E2E_TEST_RESULTS.md            # Backend test results
    ├── FINAL_SUCCESS_REPORT.md        # System success report
    ├── FRONTEND_INTEGRATION_GUIDE.md  # Integration patterns
    ├── FRONTEND_QUICK_START.md        # Quick start guide
    ├── FRONTEND_TESTING_CHECKLIST.md  # Test checklist
    ├── MICROSERVICES_COMPONENTS_README.md  # Component overview
    ├── COMPLETE_IMPLEMENTATION_SUMMARY.md  # This summary
    └── MICROSERVICES_VISUAL_GUIDE.md  # This file
```

---

## 🔄 Request Flow Example

### Example: User Updates Profile

```
1. USER ACTION
   User navigates to: http://localhost:3000/microservices/profile
   Updates bio: "Professional stylist"
   Clicks "Update Profile"

2. REACT COMPONENT (ProfileManager.jsx)
   handleUpdateProfile() triggered
   ↓
   Calls: profileService.upsertProfile({ bio: "Professional stylist" })

3. API SERVICE (profileService.js)
   Method: upsertProfile(data)
   ↓
   Makes request:
   PATCH http://localhost:5000/api/profiles-service/me
   Headers: { Authorization: "Bearer eyJ..." }
   Body: { bio: "Professional stylist" }

4. MAIN BACKEND (Port 5000)
   Request arrives at: /api/profiles-service/me
   ↓
   authMiddleware validates JWT token
   ↓
   Extracts user info: { id: "123", role: "owner", email: "..." }
   ↓
   Attaches to req.user
   ↓
   profileProxyRoutes forwards to Profile Service
   ↓
   Forwards to: http://localhost:6001/api/me
   Headers: { authorization: "Bearer eyJ...", content-type: "application/json" }

5. PROFILE SERVICE (Port 6001)
   Request arrives at: /api/me
   ↓
   authMiddleware validates token (again for security)
   ↓
   profileController.updateProfile() executes
   ↓
   Updates MongoDB:
   db.salonhub-profiles.profiles.updateOne(
     { user: "123" },
     { $set: { bio: "Professional stylist" } }
   )
   ↓
   Returns: { success: true, data: { ...profileData } }

6. RESPONSE CHAIN
   Profile Service (6001) → Main Backend (5000) → Frontend (3000)
   ↓
   profileService.js receives response
   ↓
   ProfileManager.jsx processes response
   ↓
   Updates state: setProfile(response.data)
   ↓
   Shows success message: "Profile updated successfully!"
   ↓
   UI updates to show new bio

7. USER SEES
   ✓ Success message appears
   ✓ Bio updated on screen
   ✓ Data persisted to database
```

---

## 🎨 Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                  MicroservicesDashboard                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Profile  │  │ Service  │  │ Booking  │  │ Payment  │      │
│  │   Card   │  │   Card   │  │   Card   │  │   Card   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │              │
│       └─────────────┴─────────────┴─────────────┘              │
│                     │                                           │
│                     ▼                                           │
│           Renders Active Component                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ProfileManager                                │
│                                                                  │
│  State:                        Methods:                          │
│  • profile (object)            • loadProfile()                   │
│  • loading (boolean)           • handleUpdateProfile()           │
│  • error (string)              • handleCreatePost()              │
│  • success (string)                                              │
│                                                                  │
│  API Calls:                                                      │
│  • profileService.getMyProfile()                                │
│  • profileService.upsertProfile(data)                           │
│  • profileService.createTimelinePost(data)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ServiceManager                                │
│                                                                  │
│  State:                        Methods:                          │
│  • services (array)            • loadServices()                  │
│  • showForm (boolean)          • handleCreateService()           │
│  • formData (object)           • handleDeleteService()           │
│                                • handleInputChange()             │
│                                                                  │
│  API Calls:                                                      │
│  • bookingService.getMyServices()                               │
│  • bookingService.createService(data)                           │
│  • bookingService.deleteService(id)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BookingManager                                │
│                                                                  │
│  State:                        Methods:                          │
│  • bookings (array)            • loadBookings()                  │
│  • services (array)            • loadServices()                  │
│  • showForm (boolean)          • handleCreateBooking()           │
│  • formData (object)           • handleUpdateBookingStatus()     │
│                                                                  │
│  API Calls:                                                      │
│  • bookingService.getMyBookings()                               │
│  • bookingService.getMyServices()                               │
│  • bookingService.createBooking(data)                           │
│  • bookingService.updateBookingStatus(id, status)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PaymentManager                                │
│                                                                  │
│  State:                        Methods:                          │
│  • transactions (array)        • loadTransactions()              │
│  • subscriptions (array)       • loadSubscriptions()             │
│  • stripeAccount (object)      • loadStripeAccount()             │
│  • activeTab (string)          • handleConnectStripe()           │
│                                                                  │
│  API Calls:                                                      │
│  • paymentService.getMyTransactions()                           │
│  • paymentService.getMySubscriptions()                          │
│  • paymentService.getStripeAccount()                            │
│  • paymentService.createConnectAccount()                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌───────────────────────────────────────────────────────────────┐
│                    USER LOGS IN                                │
│  Email: user@example.com                                       │
│  Password: ********                                            │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│            Main Backend - Auth Controller                      │
│  POST /api/auth/login                                          │
│  • Validates credentials                                       │
│  • Generates JWT token                                         │
│  • Returns: { token: "eyJ...", user: {...} }                  │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│              Frontend - AuthContext                            │
│  • Stores token in localStorage                                │
│  • Sets user in context                                        │
│  • Updates UI to show logged-in state                          │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│           Subsequent API Requests                              │
│  ALL requests include:                                         │
│  Headers: {                                                    │
│    Authorization: "Bearer eyJ..."                              │
│  }                                                             │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│         Main Backend - Auth Middleware                         │
│  • Extracts token from header                                  │
│  • Verifies JWT signature                                      │
│  • Decodes payload: { id, email, role }                        │
│  • Attaches to req.user                                        │
└───────────────┬───────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│        Microservice - Auth Middleware                          │
│  • Re-validates token (security layer)                         │
│  • Extracts user info                                          │
│  • Attaches to req.user                                        │
│  • Proceeds to controller                                      │
└───────────────────────────────────────────────────────────────┘
```

---

## 📱 User Interface Flow

```
Login Page
    │
    ├─► Visitor Dashboard (/visitor/home)
    │       │
    │       └─► Microservices (/microservices)
    │               │
    │               ├─► Profile Manager
    │               ├─► Service Manager
    │               ├─► Booking Manager
    │               └─► Payment Manager
    │
    └─► Owner Dashboard (/owner/dashboard)
            │
            └─► Microservices (/microservices)
                    │
                    ├─► Profile Manager
                    ├─► Service Manager
                    ├─► Booking Manager
                    └─► Payment Manager
```

---

## 🎯 Data Flow Patterns

### Pattern 1: Load Data on Mount
```javascript
// Component mounts
useEffect(() => {
  loadData();
}, []);

// Load function
const loadData = async () => {
  try {
    setLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Create New Record
```javascript
// User submits form
const handleCreate = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    setError(null);
    await apiService.create(formData);
    setSuccess("Created successfully!");
    loadData(); // Refresh list
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 3: Update Status
```javascript
// User clicks action button
const handleUpdate = async (id, status) => {
  try {
    setLoading(true);
    await apiService.updateStatus(id, status);
    setSuccess("Updated successfully!");
    loadData(); // Refresh list
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🎨 Styling System

```
Tailwind CSS Utility Classes

┌──────────────────────────────────────────────────────────┐
│                   COMPONENT STYLES                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Buttons:                                                 │
│  • Primary: bg-blue-600 text-white hover:bg-blue-700     │
│  • Success: bg-green-600 text-white hover:bg-green-700   │
│  • Danger: bg-red-600 text-white hover:bg-red-700        │
│  • Disabled: bg-gray-400 cursor-not-allowed              │
│                                                           │
│  Cards:                                                   │
│  • Container: border rounded-lg p-4 shadow               │
│  • Hover: hover:shadow-md transition                     │
│                                                           │
│  Forms:                                                   │
│  • Input: px-3 py-2 border rounded focus:ring-2          │
│  • Label: text-sm font-medium text-gray-700 mb-2         │
│                                                           │
│  Status Badges:                                           │
│  • Pending: bg-yellow-100 text-yellow-800                │
│  • Success: bg-green-100 text-green-800                  │
│  • Error: bg-red-100 text-red-800                        │
│                                                           │
│  Layout:                                                  │
│  • Container: max-w-6xl mx-auto p-6                      │
│  • Grid: grid grid-cols-1 md:grid-cols-2 gap-4          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Overview

```
MongoDB Atlas - salonhub-profiles
┌──────────────────────────────────┐
│         profiles                  │
├──────────────────────────────────┤
│ _id: ObjectId                     │
│ user: ObjectId (ref: User)        │
│ bio: String                       │
│ socialLinks: {                    │
│   instagram: String               │
│   facebook: String                │
│   twitter: String                 │
│   website: String                 │
│ }                                 │
│ createdAt: Date                   │
│ updatedAt: Date                   │
└──────────────────────────────────┘

MongoDB Atlas - salonhub-booking
┌──────────────────────────────────┐
│         services                  │
├──────────────────────────────────┤
│ _id: ObjectId                     │
│ business: ObjectId                │
│ name: String                      │
│ category: Enum                    │
│ price: Number                     │
│ duration: Number                  │
│ deposit: Number                   │
│ description: String               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         bookings                  │
├──────────────────────────────────┤
│ _id: ObjectId                     │
│ service: ObjectId (ref: Service)  │
│ customer: ObjectId (ref: User)    │
│ business: ObjectId                │
│ date: Date                        │
│ status: Enum                      │
│ notes: String                     │
└──────────────────────────────────┘

MongoDB Atlas - salonhub-payment
┌──────────────────────────────────┐
│       transactions                │
├──────────────────────────────────┤
│ _id: ObjectId                     │
│ user: ObjectId                    │
│ amount: Number                    │
│ type: Enum (payment/refund)       │
│ status: Enum                      │
│ stripePaymentIntentId: String     │
│ createdAt: Date                   │
└──────────────────────────────────┘
```

---

## ✅ Quick Reference

### Start All Services
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd services/profile-service
npm run dev

# Terminal 3
cd services/booking-service
npm run dev

# Terminal 4
cd services/payment-service
npm run dev

# Terminal 5
cd frontend
npm run dev
```

### Check Status
```powershell
.\test-services.ps1
```

### Run Tests
```powershell
.\e2e-test.ps1
```

### Access Frontend
```
http://localhost:3000/microservices
```

---

**Visual Guide Complete! 🎉**

Use this guide to understand how all components connect and interact.

