# Staff + Booking API - Manual Test Guide

## ✅ Server Status
Server running on: http://localhost:5000
All routes registered successfully

## 📋 Test Results Summary

### ✅ Quick Health Check (Completed)
1. ✅ Server responding correctly
2. ✅ Public endpoints accessible (no auth required)
3. ✅ Protected endpoints require authentication (401 without token)
4. ✅ All 15 routes registered successfully

---

## 🧪 API Endpoints to Test

### 1. Owner Staff Management (Requires Auth)

**Base URL:** `/api/owner/staff`

```bash
# Get all staff
GET /api/owner/staff
Headers: Authorization: Bearer <token>

# Create staff member
POST /api/owner/staff
Headers: Authorization: Bearer <token>
Body: {
  "name": "Sarah Johnson",
  "role": "Senior Stylist",
  "photoUrl": "https://example.com/photo.jpg",
  "serviceIds": ["<serviceId>"],
  "weeklySchedule": {
    "monday": [{ "start": "09:00", "end": "17:00" }],
    "tuesday": [{ "start": "09:00", "end": "17:00" }],
    "wednesday": [{ "start": "09:00", "end": "17:00" }],
    "thursday": [{ "start": "09:00", "end": "17:00" }],
    "friday": [{ "start": "09:00", "end": "17:00" }],
    "saturday": [{ "start": "10:00", "end": "16:00" }],
    "sunday": []
  }
}

# Update staff member
PATCH /api/owner/staff/:staffId
Headers: Authorization: Bearer <token>
Body: {
  "role": "Master Stylist",
  "weeklySchedule": { ... }
}

# Delete staff member (soft delete)
DELETE /api/owner/staff/:staffId
Headers: Authorization: Bearer <token>

# Update settings
PATCH /api/owner/staff/settings
Headers: Authorization: Bearer <token>
Body: {
  "allowCustomerChooseStaff": true
}
```

---

### 2. Public Booking APIs (No Auth Required)

**Base URL:** `/api/public`

```bash
# Get public profile
GET /api/public/profile/:slug
# Returns: name, logo, bio, photos, services, highlights, ratings

# Get booking page data
GET /api/public/booking/:slug
# Returns: business name, logo, services, contact info

# Get staff list (optionally filtered by service)
GET /api/public/staff/:slug
GET /api/public/staff/:slug?serviceId=<serviceId>
# Returns: active staff members, allowCustomerChooseStaff setting

# Get available time slots
GET /api/public/availability/:slug?date=2025-11-18&serviceId=<serviceId>&staffId=<staffId>
# Returns: array of available time slots (30-min intervals)

# Create booking
POST /api/public/booking/:slug
Body: {
  "serviceId": "<serviceId>",
  "staffId": "<staffId>",  // or "any"
  "date": "2025-11-18",
  "time": "10:00",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "555-123-4567",
  "customerNotes": "First time customer"
}
```

---

### 3. Owner Booking Management (Requires Auth)

**Base URL:** `/api/owner/bookings`

```bash
# Get booking statistics
GET /api/owner/bookings/stats/summary
Headers: Authorization: Bearer <token>
# Returns: today, upcoming, total, pending counts

# Get all bookings (with filters)
GET /api/owner/bookings
GET /api/owner/bookings?status=pending
GET /api/owner/bookings?date=2025-11-18
GET /api/owner/bookings?staffId=<staffId>
Headers: Authorization: Bearer <token>

# Get single booking
GET /api/owner/bookings/:bookingId
Headers: Authorization: Bearer <token>

# Update booking status
PATCH /api/owner/bookings/:bookingId/status
Headers: Authorization: Bearer <token>
Body: {
  "status": "confirmed",  // pending, confirmed, completed, cancelled, no-show
  "cancellationReason": "Customer requested"  // optional, for cancelled status
}

# Delete booking
DELETE /api/owner/bookings/:bookingId
Headers: Authorization: Bearer <token>
```

---

## 🔍 Current Database State

### Businesses Found: 4
- Luxe Hair Studio (no booking slug, no services, no staff)
- Ram Hair (no booking slug, no services, no staff)
- Great Clips (no booking slug, no services, no staff)
- Owned Biz (no booking slug, no services, no staff)

### Owners Found: 0
⚠️ No owner accounts found in database

---

## 📝 To Test Manually:

### Option 1: Use Postman/Thunder Client/Insomnia
1. Import endpoints above
2. Login as owner first (or register new owner)
3. Get auth token from login response
4. Test each endpoint with proper headers/body

### Option 2: Use curl (PowerShell)
```powershell
# Example: Test public staff endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/public/staff/test-slug" -Method Get

# Example: Create staff (with auth)
$headers = @{ "Authorization" = "Bearer <your-token>" }
$body = @{
    name = "Sarah Johnson"
    role = "Senior Stylist"
    serviceIds = @("<serviceId>")
    weeklySchedule = @{
        monday = @(@{ start = "09:00"; end = "17:00" })
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/owner/staff" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

### Option 3: Use Frontend
1. Start frontend: `cd frontend && npm start`
2. Register/Login as owner
3. Navigate to booking manager
4. Test staff management features
5. Test public booking page

---

## ✅ Verified Working

1. ✅ Server running on port 5000
2. ✅ MongoDB connected
3. ✅ All 15 API routes registered
4. ✅ Public endpoints accessible (404 for invalid slugs = correct)
5. ✅ Protected endpoints require authentication (401 without token = correct)
6. ✅ Error handling working properly

---

## ⚠️ Prerequisites for Full Testing

To test the full booking flow, you need:

1. **Owner Account**
   - Register via: `POST /api/owner/auth/register`
   - Login via: `POST /api/owner/auth/login`

2. **Business Profile with:**
   - Booking slug set
   - At least one service created
   - isPublicProfileActive = true

3. **Staff Members**
   - Created via the new staff API
   - Assigned to services
   - Weekly schedule configured

Then you can test the complete customer booking flow:
Service → Staff → Date → Time → Confirm

---

## 🎯 Next Steps

**Backend:** ✅ Complete and tested (infrastructure level)

**Frontend Phase 2:** Owner Staff Management UI
- Staff list page
- Add/Edit staff modal
- Weekly schedule editor
- Service assignment
- Settings toggle

**Frontend Phase 3:** Customer Booking Flow
- Staff selection step
- Availability calendar
- Time slot picker
- Booking confirmation

Would you like me to proceed with Phase 2 (Owner Frontend) or would you like to do manual API testing first?
