# 🧪 Verification System Testing Guide

**Status:** Phase 1-3 Complete (Backend Foundation)
**Date:** November 21, 2025

---

## 📋 What We've Built So Far

### ✅ Phase 1: Database Schema
- Extended `Business` model with verification fields
- Added `verificationStatus`, `verificationSteps`, `stripeAccountId`

### ✅ Phase 2: Business Logic
- `calculateVerificationTier()` - Auto-calculates tier based on steps
- `calculateProfileCompletion()` - Returns 0-100% completion
- `updateVerificationStep()` - Updates step and recalculates tier

### ✅ Phase 3: API Endpoints
- **GET** `/api/v1/verification/status/:businessId`
- **PATCH** `/api/v1/verification/step/:businessId`
- **POST** `/api/v1/verification/recalculate/:businessId`
- **GET** `/api/v1/verification/progress/:businessId`

---

## 🚀 How to Test

### **Prerequisites**

1. **Backend running:**
   ```bash
   cd backend
   npm start
   # Server should be running on http://localhost:5000
   ```

2. **Get a Business ID:**
   - Option A: Use existing business from your database
   - Option B: Create test business (see below)

---

## 📝 Test Plan

### **Test 1: Get Verification Status**

**Purpose:** Check current verification state of a business

```bash
# Replace YOUR_BUSINESS_ID with actual ID
GET http://localhost:5000/api/v1/verification/status/YOUR_BUSINESS_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "verificationStatus": "unverified",
    "verificationSteps": {
      "emailVerified": false,
      "phoneVerified": false,
      "addressVerified": false,
      "photosUploaded": 0,
      "stripeConnected": false,
      "documentsUploaded": false,
      "profileCompleted": 40
    },
    "profileCompletion": 40,
    "tier": "unverified",
    "nextSteps": [
      {
        "priority": "high",
        "action": "verify_email",
        "title": "Verify Your Email",
        "description": "Click the verification link sent to your email"
      },
      // ... more steps
    ]
  }
}
```

---

### **Test 2: Update Email Verification**

**Purpose:** Simulate email verification completion

```bash
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "emailVerified",
  "value": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification step \"emailVerified\" updated successfully",
  "data": {
    "verificationStatus": "unverified",
    "verificationSteps": {
      "emailVerified": true,
      "phoneVerified": false,
      // ... other steps
    },
    "profileCompletion": 40
  }
}
```

**Note:** Status is still "unverified" because we need 3+ steps for "basic" tier.

---

### **Test 3: Update Phone Verification**

```bash
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "phoneVerified",
  "value": true
}
```

**Expected:** Status should still be "unverified" (need 3+ steps)

---

### **Test 4: Update Photos (Trigger Basic Tier)**

```bash
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "photosUploaded",
  "value": 2
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification step \"photosUploaded\" updated successfully",
  "data": {
    "verificationStatus": "basic",  // ← UPGRADED!
    "verificationSteps": {
      "emailVerified": true,
      "phoneVerified": true,
      "addressVerified": false,
      "photosUploaded": 2,
      "stripeConnected": false,
      "documentsUploaded": false,
      "profileCompleted": 50
    },
    "profileCompletion": 50
  }
}
```

**✅ Success!** Business is now **"basic"** verified (email + phone + 2 photos)

---

### **Test 5: Connect Stripe (Trigger Fully Verified)**

First, let's add more steps to meet the 6+ requirement:

```bash
# Step 1: Verify address
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "addressVerified",
  "value": true
}
```

```bash
# Step 2: Upload documents
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "documentsUploaded",
  "value": true
}
```

```bash
# Step 3: Connect Stripe (final step!)
PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "step": "stripeConnected",
  "value": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification step \"stripeConnected\" updated successfully",
  "data": {
    "verificationStatus": "fully_verified",  // ← FULLY VERIFIED!
    "verificationSteps": {
      "emailVerified": true,
      "phoneVerified": true,
      "addressVerified": true,
      "photosUploaded": 2,
      "stripeConnected": true,
      "documentsUploaded": true,
      "profileCompleted": 70
    },
    "profileCompletion": 70
  }
}
```

**✅ Success!** Business is now **"fully_verified"**!

---

### **Test 6: Get Detailed Progress**

```bash
GET http://localhost:5000/api/v1/verification/progress/YOUR_BUSINESS_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "currentTier": "fully_verified",
    "profileCompletion": 70,
    "steps": {
      "emailVerified": {
        "completed": true,
        "title": "Verify Email Address",
        "description": "Confirm your business email with OTP code"
      },
      "phoneVerified": {
        "completed": true,
        "title": "Verify Phone Number",
        "description": "Confirm your business phone with OTP code"
      },
      "addressVerified": {
        "completed": true,
        "title": "Confirm Business Address",
        "description": "Verify your physical business location"
      },
      "photosUploaded": {
        "completed": true,
        "current": 2,
        "required": 2,
        "title": "Upload Business Photos",
        "description": "Add at least 2 high-quality photos of your business"
      },
      "stripeConnected": {
        "completed": true,
        "title": "Connect Stripe Account",
        "description": "Set up payment processing to accept online bookings"
      },
      "profileCompleted": {
        "completed": false,
        "current": 70,
        "required": 80,
        "title": "Complete Business Profile",
        "description": "Fill out all business details (hours, services, description)"
      }
    },
    "nextSteps": [
      {
        "priority": "low",
        "action": "complete_profile",
        "title": "Complete Your Profile",
        "description": "Your profile is 70% complete"
      }
    ],
    "benefits": [
      "Premium verified badge",
      "Top position in search results",
      "Accept online payments",
      "Access to booking system",
      "Recommended to visitors",
      "Stripe-verified payments"
    ]
  }
}
```

---

### **Test 7: Recalculate Tier**

**Purpose:** Manually trigger recalculation (useful for debugging)

```bash
POST http://localhost:5000/api/v1/verification/recalculate/YOUR_BUSINESS_ID
Content-Type: application/json

{
  "previousTier": "basic"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification tier recalculated",
  "data": {
    "previousTier": "basic",
    "newTier": "fully_verified",
    "verificationSteps": { ... },
    "profileCompletion": 70
  }
}
```

---

## 🧪 Using Postman/Thunder Client

### **Option 1: Postman**

1. Create new collection: "SalonHub Verification"
2. Add requests for each test above
3. Set base URL: `http://localhost:5000`
4. Create environment variable: `businessId`

### **Option 2: VS Code Thunder Client**

1. Install Thunder Client extension
2. Create new request
3. Method: `GET`, `PATCH`, or `POST`
4. URL: `http://localhost:5000/api/v1/verification/status/{{businessId}}`
5. For PATCH/POST, add JSON body

---

## 🧪 Using cURL (Command Line)

```bash
# Test 1: Get Status
curl http://localhost:5000/api/v1/verification/status/YOUR_BUSINESS_ID

# Test 2: Update Email Verification
curl -X PATCH http://localhost:5000/api/v1/verification/step/YOUR_BUSINESS_ID \
  -H "Content-Type: application/json" \
  -d '{"step":"emailVerified","value":true}'

# Test 3: Get Progress
curl http://localhost:5000/api/v1/verification/progress/YOUR_BUSINESS_ID
```

---

## 📊 Verification Tier Rules

| Tier | Requirements | Score |
|------|-------------|-------|
| **Unverified** | Default state | 0-2 steps |
| **Basic** | Email + Phone verified, 2+ photos | 3-5 steps |
| **Fully Verified** | All basic steps + Stripe connected | 6+ steps |

**Scoring System:**
- Email verified: +1
- Phone verified: +1
- Address verified: +1
- 2+ photos uploaded: +1
- Stripe connected: +1
- Documents uploaded: +1
- Profile 80%+ complete: +1

---

## 🐛 Troubleshooting

### **Error: "Business not found"**
- Make sure you're using a valid MongoDB ObjectId
- Check if business exists in database

### **Error: "Invalid verification step"**
- Valid steps: `emailVerified`, `phoneVerified`, `addressVerified`, `photosUploaded`, `stripeConnected`, `documentsUploaded`
- Check spelling and case sensitivity

### **Status not updating**
- Make sure you're passing correct value type (Boolean for most, Number for `photosUploaded`)
- Check server logs for errors

### **Server not responding**
```bash
# Check if backend is running
curl http://localhost:5000/api/test

# Should return: {"success":true,"message":"SalonHub API is working"}
```

---

## ✅ Success Criteria

**You've successfully tested the verification system if:**

1. ✅ Can retrieve verification status for a business
2. ✅ Can update individual verification steps
3. ✅ Tier automatically upgrades from "unverified" → "basic" → "fully_verified"
4. ✅ Profile completion percentage calculates correctly
5. ✅ Next steps recommendations appear based on current state
6. ✅ Recalculation endpoint works

---

## 📝 Next Steps After Testing

Once testing is complete, we'll proceed with:

**Phase 4:** OTP Integration (email + phone verification)
**Phase 5:** Stripe Connect Integration
**Phase 6-7:** Badge UI Components
**Phase 8:** Cleanup duplicates
**Phase 9:** Health endpoints
**Phase 10:** Final testing & deployment

---

## 💡 Quick Test Script

Create a file `test-verification.sh`:

```bash
#!/bin/bash

# Replace with your actual business ID
BUSINESS_ID="YOUR_BUSINESS_ID"
BASE_URL="http://localhost:5000/api/v1/verification"

echo "=== Test 1: Get Status ==="
curl -s "$BASE_URL/status/$BUSINESS_ID" | json_pp

echo "\n=== Test 2: Verify Email ==="
curl -s -X PATCH "$BASE_URL/step/$BUSINESS_ID" \
  -H "Content-Type: application/json" \
  -d '{"step":"emailVerified","value":true}' | json_pp

echo "\n=== Test 3: Verify Phone ==="
curl -s -X PATCH "$BASE_URL/step/$BUSINESS_ID" \
  -H "Content-Type: application/json" \
  -d '{"step":"phoneVerified","value":true}' | json_pp

echo "\n=== Test 4: Add Photos ==="
curl -s -X PATCH "$BASE_URL/step/$BUSINESS_ID" \
  -H "Content-Type: application/json" \
  -d '{"step":"photosUploaded","value":2}' | json_pp

echo "\n=== Test 5: Get Progress ==="
curl -s "$BASE_URL/progress/$BUSINESS_ID" | json_pp
```

Run with: `bash test-verification.sh`

---

**Ready to test!** Let me know the results and we'll continue with Phase 4. 🚀
