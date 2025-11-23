# 🧪 CHAT SYSTEM API ENDPOINT TESTS

**Server:** http://localhost:5001

## 📋 **Test Data (From test-chat-system.js)**

```
Visitor ID: 6922b9e52a99ae94f0fd2ecd
Free Owner ID: 6922b9e62a99ae94f0fd2edd
Premium Owner ID: 6922b9e62a99ae94f0fd2ee3
Free Business ID: 6922b9e62a99ae94f0fd2ee9
Premium Business ID: 6922b9e62a99ae94f0fd2ef0
Thread ID: 6922b9e62a99ae94f0fd2ef4
```

---

## 🔐 **STEP 1: Get JWT Tokens**

You need JWT tokens for each test user. Use one of these methods:

### Method A: Login via API

```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "test.visitor@salonhub.com",
  "password": "password123"
}

Response: { "token": "eyJhbGciOiJS...", ...user data }
```

Repeat for:
- `test.owner.free@salonhub.com`
- `test.owner.premium@salonhub.com`

### Method B: Use existing tokens from your frontend

If you have logged-in users, check localStorage for tokens.

---

## ✅ **TEST 1: Visitor Sends First Free Message**

```http
POST http://localhost:5001/api/v1/messages/visitor/send
Authorization: Bearer <VISITOR_JWT_TOKEN>
Content-Type: application/json

{
  "businessId": "6922b9e62a99ae94f0fd2ef0",
  "text": "Hello! Do you offer balayage services?"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "threadId": "...",
  "messageId": "..."
}
```

---

## ✅ **TEST 2: Visitor Tries to Send Second Message (Should Fail)**

```http
POST http://localhost:5001/api/v1/messages/visitor/send
Authorization: Bearer <VISITOR_JWT_TOKEN>
Content-Type: application/json

{
  "businessId": "6922b9e62a99ae94f0fd2ef0",
  "text": "Are you open on weekends?"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Chat pass required",
  "requiresPayment": true
}
```

---

## ✅ **TEST 3: Free Owner Tries to Reply (Should Fail)**

```http
POST http://localhost:5001/api/v1/messages/owner/reply
Authorization: Bearer <FREE_OWNER_JWT_TOKEN>
Content-Type: application/json

{
  "threadId": "6922b9e62a99ae94f0fd2ef4",
  "text": "Yes! We're open Sundays 10am-6pm."
}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Premium subscription required",
  "requiresUpgrade": true
}
```

---

## ✅ **TEST 4: Premium Owner Replies Successfully**

```http
POST http://localhost:5001/api/v1/messages/owner/reply
Authorization: Bearer <PREMIUM_OWNER_JWT_TOKEN>
Content-Type: application/json

{
  "threadId": "6922b9e62a99ae94f0fd2ef4",
  "text": "Yes! We specialize in balayage. Book online!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reply sent",
  "messageId": "...",
  "isBlurred": true
}
```

**Note:** `isBlurred: true` because visitor doesn't have chat pass yet.

---

## ✅ **TEST 5: Visitor Gets Inbox (Sees Thread with Blurred Reply)**

```http
GET http://localhost:5001/api/v1/messages/visitor/inbox
Authorization: Bearer <VISITOR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "threads": [
    {
      "_id": "6922b9e62a99ae94f0fd2ef4",
      "business": {
        "_id": "6922b9e62a99ae94f0fd2ef0",
        "name": "Premium Hair Studio",
        "logoUrl": "",
        "city": "New York"
      },
      "lastMessageAt": "2025-01-23T...",
      "status": "OPEN",
      "unreadCount": 1,
      "hasBlurredReplies": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

## ✅ **TEST 6: Visitor Opens Thread (Sees Blurred Message)**

```http
GET http://localhost:5001/api/v1/messages/thread/6922b9e62a99ae94f0fd2ef4
Authorization: Bearer <VISITOR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "...",
      "threadId": "6922b9e62a99ae94f0fd2ef4",
      "senderId": "6922b9e52a99ae94f0fd2ecd",
      "senderRole": "visitor",
      "text": "Hello! Do you offer balayage services?",
      "isBlurred": false,
      "createdAt": "2025-01-23T..."
    },
    {
      "_id": "...",
      "threadId": "6922b9e62a99ae94f0fd2ef4",
      "senderRole": "owner",
      "text": "[Message locked - Unlock with Chat Pass]",
      "isBlurred": true,
      "createdAt": "2025-01-23T..."
    }
  ],
  "pagination": { ... }
}
```

**🔒 Note:** Owner's reply is blurred with placeholder text.

---

## ✅ **TEST 7: Owner Gets Inbox**

```http
GET http://localhost:5001/api/v1/messages/owner/inbox
Authorization: Bearer <PREMIUM_OWNER_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "threads": [
    {
      "_id": "6922b9e62a99ae94f0fd2ef4",
      "visitor": {
        "_id": "6922b9e52a99ae94f0fd2ecd",
        "name": "Test Visitor",
        "avatarUrl": ""
      },
      "lastMessageAt": "2025-01-23T...",
      "status": "OPEN",
      "unreadCount": 0
    }
  ],
  "pagination": { ... }
}
```

---

## ✅ **TEST 8: Check Chat Pass Status (Before Purchase)**

```http
GET http://localhost:5001/api/v1/subscriptions/chat-pass/status
Authorization: Bearer <VISITOR_JWT_TOKEN>
```

**Expected Response:**
```json
{
  "success": true,
  "hasChatPass": false,
  "inGracePeriod": false,
  "expiresAt": null,
  "graceEndsAt": null
}
```

---

## ✅ **TEST 9: Create Chat Pass Checkout Session**

```http
POST http://localhost:5001/api/v1/subscriptions/chat-pass/checkout
Authorization: Bearer <VISITOR_JWT_TOKEN>
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Note:** This requires valid Stripe keys in `.env`. If Stripe is not configured, you'll get a 503 error.

---

## ✅ **TEST 10: Mark Messages as Read**

```http
PUT http://localhost:5001/api/v1/messages/mark-read
Authorization: Bearer <VISITOR_JWT_TOKEN>
Content-Type: application/json

{
  "threadId": "6922b9e62a99ae94f0fd2ef4"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## 🧹 **CLEANUP: Reset Test Data**

To reset the test data and run fresh tests:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  await mongoose.connection.db.collection('messagethreads').deleteMany({});
  await mongoose.connection.db.collection('messages').deleteMany({});
  await mongoose.connection.db.collection('users').deleteMany({ email: /test\\./ });
  await mongoose.connection.db.collection('businesses').deleteMany({ name: /Test|Premium Hair Studio|Free Hair Salon/ });
  console.log('✅ Test data cleaned');
  process.exit(0);
});
"
```

Then run the tests again:
```bash
node test-chat-system.js
```

---

## 📊 **SUCCESS CRITERIA**

✅ All 10 tests should pass
✅ Visitor can send 1 free message
✅ Visitor blocked from 2nd message without chat pass
✅ Free owner blocked from replying
✅ Premium owner can reply
✅ Visitor sees blurred owner reply
✅ Chat pass checkout URL generated
✅ Inbox endpoints return correct data
✅ Message counts accurate
✅ Entitlements enforced correctly

---

## 🐛 **TROUBLESHOOTING**

### "User not found" error
- Make sure you're using the correct JWT token
- JWT should be in `Authorization: Bearer <token>` header

### 403 Forbidden errors
- Check that the user role matches the endpoint (visitor vs owner)
- Verify business is premium for owner reply tests

### 404 Thread not found
- Use the thread ID from the test output
- Make sure test data exists (run `node test-chat-system.js` first)

### Stripe checkout fails
- Check `STRIPE_SECRET_KEY` in `.env`
- Verify `FRONTEND_URL` is set for redirect URLs

---

**Status: READY FOR HTTP TESTING ✅**

Use Postman, Thunder Client, or curl to test these endpoints!
