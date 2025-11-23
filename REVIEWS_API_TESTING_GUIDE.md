# 🧪 Reviews API - Complete Testing Guide

**Purpose:** Test the Reviews System backend APIs before frontend integration

---

## 🚀 Prerequisites

### 1. Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
MongoDB connected
Reminder schedulers started
Smart Search cron jobs started
Server running on http://localhost:5000
```

---

### 2. Get Test Data IDs

You'll need these for testing:

- **BUSINESS_ID:** A valid business ID from your database
- **USER_ID:** A valid user ID (yours)
- **BOOKING_ID:** A completed booking ID that belongs to USER_ID
- **JWT_TOKEN:** Your authentication token

**How to get JWT token:**
1. Login via your frontend or Postman
2. Copy the token from the response
3. Or check browser DevTools → Application → LocalStorage

---

## 📋 Test Cases (Run in Order)

### **Test 1: GET Reviews (Empty State)**

**Purpose:** Verify endpoint works and returns empty array for business with no reviews

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "reviews": [],
  "avgRating": "0.0",
  "totalReviews": 0,
  "photoReviewCount": 0,
  "distribution": {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0
  },
  "pagination": {
    "page": 0,
    "limit": 10,
    "hasMore": false
  }
}
```

✅ **Pass Criteria:** Returns 200 OK with empty reviews array

---

### **Test 2: POST Review (No Authentication)**

**Purpose:** Verify authentication is required

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"BOOKING_ID\", \"rating\": 5, \"message\": \"Great service!\"}"
```

**Expected Response:**
```json
{
  "message": "Authentication required"
}
```

✅ **Pass Criteria:** Returns 401 Unauthorized

---

### **Test 3: POST Review (Invalid Rating)**

**Purpose:** Verify rating validation (must be 1-5)

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"BOOKING_ID\", \"rating\": 6, \"message\": \"Great service with professional staff!\"}"
```

**Expected Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Rating must be between 1 and 5"
  }
}
```

✅ **Pass Criteria:** Returns 400 Bad Request

---

### **Test 4: POST Review (Message Too Short)**

**Purpose:** Verify message length validation (min 10 characters)

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"BOOKING_ID\", \"rating\": 5, \"message\": \"Great\"}"
```

**Expected Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Review message must be at least 10 characters"
  }
}
```

✅ **Pass Criteria:** Returns 400 Bad Request

---

### **Test 5: POST Review (Valid - Without Photo)**

**Purpose:** Create a valid review without photo

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"BOOKING_ID\", \"rating\": 5, \"message\": \"Amazing service! My braids look perfect. The stylist was professional and the vibe was great!\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "reviewId": "673fc50e40bd2c39c9ad88de",
  "status": "APPROVED",
  "message": "Review submitted successfully!"
}
```

✅ **Pass Criteria:** Returns 201 Created

**Verification Steps:**
1. Check database - review should exist with status='APPROVED'
2. GET business reviews - should return 1 review
3. Check business.ratingAverage = 5.0
4. Check business.ratingsCount = 1
5. Check business.photoReviewCount = 0 (no photo)

---

### **Test 6: POST Review (Valid - With Photo)**

**Purpose:** Create review with photo and verify photoReviewCount increments

**Prerequisites:** Use a DIFFERENT booking ID than Test 5

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"ANOTHER_BOOKING_ID\", \"rating\": 4, \"message\": \"Great experience! Loved the results and will come back again!\", \"photoUrl\": \"https://res.cloudinary.com/demo/image/upload/sample.jpg\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "reviewId": "673fc60e40bd2c39c9ad88df",
  "status": "APPROVED",
  "message": "Review submitted successfully!"
}
```

✅ **Pass Criteria:** Returns 201 Created

**Verification Steps:**
1. Check database - review should have photoUrl
2. Check business.photoReviewCount = 1 (incremented)
3. Check business.ratingAverage = 4.5 (average of 5 and 4)
4. Check business.ratingsCount = 2

---

### **Test 7: POST Review (Duplicate - Same Booking)**

**Purpose:** Verify unique constraint on bookingId (FIX #1)

**Use the SAME booking ID from Test 5**

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"BOOKING_ID\", \"rating\": 3, \"message\": \"Trying to submit another review for same booking\"}"
```

**Expected Response:**
```json
{
  "error": {
    "code": "DUPLICATE_REVIEW",
    "message": "You have already reviewed this booking"
  }
}
```

✅ **Pass Criteria:** Returns 409 Conflict

**This confirms FIX #1 is working!** 🎉

---

### **Test 8: GET Reviews (With Data)**

**Purpose:** Verify reviews are returned with stats

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "673fc60e40bd2c39c9ad88df",
      "rating": 4,
      "message": "Great experience! Loved the results and will come back again!",
      "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "createdAt": "2025-11-22T15:30:00.000Z",
      "userId": {
        "name": "Sarah Johnson",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    },
    {
      "_id": "673fc50e40bd2c39c9ad88de",
      "rating": 5,
      "message": "Amazing service! My braids look perfect...",
      "photoUrl": null,
      "createdAt": "2025-11-22T15:25:00.000Z",
      "userId": {
        "name": "Sarah Johnson",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  ],
  "avgRating": "4.5",
  "totalReviews": 2,
  "photoReviewCount": 1,
  "distribution": {
    "5": 1,
    "4": 1,
    "3": 0,
    "2": 0,
    "1": 0
  },
  "pagination": {
    "page": 0,
    "limit": 10,
    "hasMore": false
  }
}
```

✅ **Pass Criteria:**
- Returns 2 reviews
- avgRating = "4.5"
- photoReviewCount = 1 (for FIX #2 badge)
- Reviews sorted by createdAt DESC (most recent first)

---

### **Test 9: GET Reviews (Sort by Highest)**

**Purpose:** Verify sorting works

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID?sort=highest"
```

✅ **Pass Criteria:** 5-star review comes first (before 4-star)

---

### **Test 10: GET Reviews (Sort by Lowest)**

**Purpose:** Verify reverse sorting works

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID?sort=lowest"
```

✅ **Pass Criteria:** 4-star review comes first (before 5-star)

---

### **Test 11: POST Review (Non-Completed Booking)**

**Purpose:** Verify only completed bookings can be reviewed

**Prerequisites:** Use a booking with status = "pending" or "confirmed"

```bash
curl -X POST "http://localhost:5000/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{\"businessId\": \"BUSINESS_ID\", \"bookingId\": \"PENDING_BOOKING_ID\", \"rating\": 5, \"message\": \"Trying to review non-completed booking\"}"
```

**Expected Response:**
```json
{
  "error": {
    "code": "BOOKING_NOT_COMPLETED",
    "message": "Reviews are only allowed for completed bookings"
  }
}
```

✅ **Pass Criteria:** Returns 400 Bad Request

---

### **Test 12: GET Reviews (Pagination)**

**Purpose:** Verify pagination works

**Prerequisites:** Create at least 15 reviews for testing

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID?page=0&limit=10"
```

✅ **Pass Criteria:**
- Returns max 10 reviews
- `hasMore: true` if more than 10 total reviews exist

```bash
curl -X GET "http://localhost:5000/api/reviews/business/BUSINESS_ID?page=1&limit=10"
```

✅ **Pass Criteria:** Returns next 10 reviews (or remaining)

---

## 🎯 Success Criteria Summary

All tests should pass:

- [x] Empty state returns correct structure
- [x] Authentication required for POST
- [x] Rating validation (1-5)
- [x] Message validation (10-500 chars)
- [x] Valid review creation
- [x] Photo review increments photoReviewCount (FIX #2)
- [x] Duplicate review prevention (FIX #1) 🎉
- [x] Reviews returned with stats
- [x] Sorting works (recent/highest/lowest)
- [x] Only completed bookings can be reviewed
- [x] Pagination works

---

## 🐛 Common Issues & Solutions

### Issue 1: 503 Booking Service Error

**Cause:** Booking microservice not running on port 6002

**Solution:**
```bash
# Terminal 2 - Start booking service
cd booking-service
npm start
```

---

### Issue 2: 401 Unauthorized

**Cause:** JWT token expired or invalid

**Solution:** Login again and get fresh token

---

### Issue 3: Review Not Found in Database

**Cause:** MongoDB not connected

**Solution:** Check backend logs for MongoDB connection success

---

### Issue 4: photoReviewCount Not Incrementing

**Cause:** Photo URL not provided or null

**Solution:** Ensure `photoUrl` field has valid URL string

---

## 📊 Database Verification Queries

After running tests, verify data in MongoDB:

```javascript
// Check reviews
db.reviews.find({ businessId: ObjectId("BUSINESS_ID") })

// Check business stats
db.businesses.findOne(
  { _id: ObjectId("BUSINESS_ID") },
  { ratingAverage: 1, ratingsCount: 1, photoReviewCount: 1 }
)

// Verify unique constraint
db.reviews.getIndexes()
// Should show: { bookingId: 1 } with unique: true
```

---

## ✅ Next Steps After Testing

Once all tests pass:

1. ✅ Backend APIs confirmed working
2. 🎨 Move to frontend implementation:
   - ReviewModal component
   - ReviewCard component
   - ReviewList component
   - Integration with PublicProfile page
3. 🧪 End-to-end testing with real user flow

---

**Happy Testing!** 🚀

If any test fails, check the backend console logs for detailed error messages.
