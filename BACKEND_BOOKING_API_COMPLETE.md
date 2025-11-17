# 🎯 Backend Booking Profile API - Testing Guide

## ✅ **BACKEND IMPLEMENTATION COMPLETE**

All backend APIs for the Owner Public Profile + Booking System are now ready.

---

## 📋 **What Was Created**

### **1. Database Model Updated**
- ✅ `backend/models/Business.js` - Added booking profile fields

### **2. Controllers Created**
- ✅ `backend/controllers/publicBookingController.js` - Public profile/booking endpoints
- ✅ `backend/controllers/ownerBookingProfileController.js` - Owner management endpoints

### **3. Routes Created**
- ✅ `backend/routes/publicBookingRoutes.js` - Public routes
- ✅ `backend/routes/owner/bookingProfileRoutes.js` - Owner routes

### **4. Utilities Created**
- ✅ `backend/utils/errorHandler.js` - Global error handler with error codes

### **5. Server.js Updated**
- ✅ Registered all new routes
- ✅ Added global error handler

---

## 🧪 **API ENDPOINTS**

### **PUBLIC ENDPOINTS (No Auth Required)**

#### 1. Get Public Profile
```
GET /api/public/profile/:slug
```
**Example:** `GET /api/public/profile/glowstudio`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Glow Studio",
    "slug": "glowstudio",
    "logo": "https://...",
    "coverPhoto": "https://...",
    "bio": "Your beauty destination",
    "photos": [...],
    "videos": [...],
    "services": [...],
    "contact": {
      "phone": "+1234567890",
      "email": "info@glowstudio.com",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY"
    },
    "category": "Salon",
    "rating": {
      "average": 4.5,
      "count": 120
    }
  }
}
```

#### 2. Get Booking Page
```
GET /api/public/booking/:slug
```
**Example:** `GET /api/public/booking/glowstudio`

**Response:**
```json
{
  "success": true,
  "data": {
    "businessId": "...",
    "name": "Glow Studio",
    "logo": "https://...",
    "services": [...],
    "contact": {...}
  }
}
```

---

### **OWNER ENDPOINTS (Requires Owner Auth)**

#### 1. Get Owner's Booking Profile
```
GET /api/owner/booking-profile
Headers: Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "businessId": "...",
    "name": "...",
    "bookingSlug": "glowstudio",
    "logoUrl": "...",
    "coverPhotoUrl": "...",
    "bio": "...",
    "photos": [...],
    "videos": [...],
    "services": [...],
    "isPublicProfileActive": false
  }
}
```

#### 2. Update Booking Profile
```
PATCH /api/owner/booking-profile
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "logoUrl": "https://...",
  "coverPhotoUrl": "https://...",
  "bio": "Your beauty destination",
  "photos": [
    { "url": "https://...", "caption": "..." }
  ],
  "videos": [...],
  "phone": "+1234567890",
  "email": "info@salon.com"
}
```

#### 3. Update Booking Slug
```
PATCH /api/owner/booking-slug
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "slug": "glowstudio"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking slug updated successfully.",
  "data": {
    "bookingSlug": "glowstudio",
    "publicUrl": "http://localhost:3000/profile/glowstudio"
  }
}
```

#### 4. Toggle Service Visibility
```
PATCH /api/owner/booking-profile/services
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "serviceIds": ["serviceId1", "serviceId2"]
}
```

#### 5. Activate/Deactivate Public Profile
```
PATCH /api/owner/booking-profile/activate
Headers: Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "isActive": true
}
```

---

## 🚨 **ERROR CODES**

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Error Codes:
- `PROFILE_NOT_FOUND` - Profile doesn't exist or inactive (404)
- `SALON_NOT_FOUND` - Booking link not active (404)
- `BUSINESS_NOT_FOUND` - No business for owner (404)
- `INVALID_SLUG` - Invalid slug format (400)
- `SLUG_TAKEN` - Handle already taken (409)
- `INCOMPLETE_PROFILE` - Missing required fields (400)
- `VALIDATION_ERROR` - Validation failed (400)
- `INTERNAL_ERROR` - Server error (500)

---

## 🧪 **MANUAL TESTING WITH POSTMAN/CURL**

### Test 1: Create Booking Slug (as Owner)
```bash
curl -X PATCH http://localhost:5000/api/owner/booking-slug \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "mystudio"}'
```

### Test 2: Get Public Profile
```bash
curl http://localhost:5000/api/public/profile/mystudio
```

### Test 3: Update Profile
```bash
curl -X PATCH http://localhost:5000/api/owner/booking-profile \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Welcome to our salon",
    "phone": "+1234567890",
    "logoUrl": "https://example.com/logo.png"
  }'
```

---

## ✅ **NEXT STEPS**

Backend is **100% complete**. Now ready for frontend:

1. ✅ Owner Dashboard - "My Public Profile" page
2. ✅ Public Profile Page (`/profile/:slug`)
3. ✅ Public Booking Page (`/book/:slug`)

**Ready to start frontend implementation!** 🚀

