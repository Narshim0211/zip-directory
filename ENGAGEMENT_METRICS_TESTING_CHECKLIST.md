# 🧪 Engagement Metrics System - Testing Checklist

## **Implementation Status: ✅ COMPLETE**

All engagement bars have been integrated into the UI per the Fix PRD requirements.

---

## **✅ What Was Implemented**

### **Backend (Already Complete)**
- ✅ Analytics module structure (`backend/modules/analytics/`)
- ✅ Profile analytics (model, service, controller, routes)
- ✅ Survey analytics (model, service, controller, routes)
- ✅ Post analytics (model, service, controller, routes)
- ✅ Global error handler
- ✅ Routes registered at `/api/v1/analytics/*`

### **Frontend Components (Already Complete)**
- ✅ `ProfileInsightBar.jsx` - Business profile analytics
- ✅ `SurveyEngagementBar.jsx` - Survey metrics with reactions
- ✅ `PostEngagementBar.jsx` - Post metrics with reactions
- ✅ `EngagementErrorBoundary.jsx` - Error handling
- ✅ API client (`frontend/src/api/analytics.js`)

### **UI Integration (JUST COMPLETED)**
- ✅ **SurveyCard.jsx** - `<SurveyEngagementBar surveyId={surveyId} />` added at line 72
- ✅ **PostCard.jsx** - `<PostEngagementBar postId={post._id || post.id} />` added at line 16
- ✅ **OwnerProfilePageV2.jsx** - `<ProfileInsightBar ownerId={profile.userId} />` added (shows for visitors only)

---

## **🧪 Testing Protocol**

### **PHASE 1: Backend API Testing**

#### **Test 1.1: Profile Analytics Endpoint**
```bash
# Test profile view recording
curl -X POST http://localhost:5002/api/v1/analytics/profile/view/<OWNER_USER_ID>

# Test profile insights retrieval
curl -X GET http://localhost:5002/api/v1/analytics/profile/<OWNER_USER_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "today": 1,
    "last7Days": 1,
    "total": 1
  }
}
```

**✅ Pass Criteria:**
- Response status: 200
- All three counters present (today, last7Days, total)
- Counters increment on repeated POST calls
- Even when 0, response returns `{"today": 0, "last7Days": 0, "total": 0}`

---

#### **Test 1.2: Survey Analytics Endpoint**
```bash
# Test survey view recording
curl -X POST http://localhost:5002/api/v1/analytics/survey/view/<SURVEY_ID>

# Test survey response recording (requires auth)
curl -X POST http://localhost:5002/api/v1/analytics/survey/respond/<SURVEY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Test survey reaction (requires auth)
curl -X POST http://localhost:5002/api/v1/analytics/survey/react/<SURVEY_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"reactionType": "love"}'

# Test survey engagement retrieval
curl -X GET http://localhost:5002/api/v1/analytics/survey/<SURVEY_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "views": 1,
    "responses": 0,
    "reactions": {
      "like": 0,
      "love": 1,
      "total": 1
    }
  }
}
```

**✅ Pass Criteria:**
- Views increment on POST to `/view`
- Responses increment on POST to `/respond` (auth required)
- Reactions increment/change on POST to `/react` (auth required)
- GET returns all metrics even when 0

---

#### **Test 1.3: Post Analytics Endpoint**
```bash
# Test post view recording
curl -X POST http://localhost:5002/api/v1/analytics/post/view/<POST_ID>

# Test post reaction (requires auth)
curl -X POST http://localhost:5002/api/v1/analytics/post/react/<POST_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"reactionType": "like"}'

# Test post engagement retrieval
curl -X GET http://localhost:5002/api/v1/analytics/post/<POST_ID>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "views": 1,
    "reactions": {
      "like": 1,
      "love": 0,
      "total": 1
    }
  }
}
```

**✅ Pass Criteria:**
- Views increment on POST to `/view`
- Reactions increment/change on POST to `/react` (auth required)
- GET returns metrics even when 0

---

### **PHASE 2: Frontend UI Testing**

#### **Test 2.1: Survey Engagement Bar Visibility**

**Steps:**
1. Navigate to Visitor Home (`http://localhost:3000/visitor/home`)
2. Scroll through surveys in the feed
3. **Look at each SurveyCard**

**✅ Pass Criteria:**
- Every survey card shows: `👁 X views   •   ❤️ X reactions   •   📝 X responses`
- Metrics display even when all values are **0**
- Example: `👁 0 views   •   ❤️ 0 reactions   •   📝 0 responses`
- Reaction buttons (👍 Like, ❤️ Love) are visible and clickable

**❌ Fail Indicators:**
- No engagement bar visible under survey
- Bar only appears when values > 0
- Component crashes or shows error message

---

#### **Test 2.2: Post Engagement Bar Visibility**

**Steps:**
1. Navigate to Owner Home (`http://localhost:3000/owner/home`)
2. Look at posts in the feed
3. **Check each PostCard**

**✅ Pass Criteria:**
- Every post card shows: `👁 X views   •   ❤️ X reactions`
- Metrics display even when **0**
- Example: `👁 0 views   •   ❤️ 0 reactions`
- Reaction buttons visible

**❌ Fail Indicators:**
- No engagement bar under posts
- Bar hidden when values are 0

---

#### **Test 2.3: Profile Insight Bar Visibility**

**Steps:**
1. As a **visitor**, navigate to an owner's profile
2. Go to: `http://localhost:3000/profile/<OWNER_SLUG>`
3. Click on the **"About"** tab
4. Scroll to the bottom

**✅ Pass Criteria:**
- Shows: 
  ```
  📊 Engagement Insights
  Total Profile Visits Today: 0
  Total Profile Visits (Last 7 Days): 0
  Total Profile Visits: 0
  ```
- Visible even when all counts are **0**
- Only shows for **visitors** viewing owner profiles (not for owners viewing their own profile)

**❌ Fail Indicators:**
- No insight bar visible
- Bar only shows when counts > 0
- Shows for owner viewing their own profile (should NOT show)

---

### **PHASE 3: Interaction Testing**

#### **Test 3.1: Survey Reactions**

**Steps:**
1. Login as a user
2. Navigate to a survey
3. Click the **👍 Like** button
4. Observe the reaction count

**✅ Pass Criteria:**
- Reaction count increments immediately (optimistic update)
- Button shows selected state (filled icon or color change)
- Network tab shows POST to `/api/v1/analytics/survey/react/<ID>`
- Clicking **❤️ Love** changes reaction (like count decreases, love increases)

---

#### **Test 3.2: Post Reactions**

**Steps:**
1. Login as a user
2. Navigate to owner posts
3. Click the **❤️ Love** button
4. Observe the reaction count

**✅ Pass Criteria:**
- Reaction count increments
- Button shows selected state
- Network tab shows POST to `/api/v1/analytics/post/react/<ID>`
- Can change from Love to Like

---

#### **Test 3.3: View Recording**

**Steps:**
1. Open browser Network tab
2. Navigate to a survey page
3. Look for API calls

**✅ Pass Criteria:**
- Network tab shows POST to `/api/v1/analytics/survey/view/<ID>`
- View count increments in UI
- Refreshing page does NOT increment view again (spam prevention)

---

### **PHASE 4: Error Handling Testing**

#### **Test 4.1: API Failure Graceful Degradation**

**Steps:**
1. Stop the backend server
2. Navigate to a survey page
3. Observe engagement bar

**✅ Pass Criteria:**
- Page does NOT crash
- Engagement bar shows "Unable to load metrics" or similar message
- Rest of the page functions normally
- Error boundary catches the failure

---

#### **Test 4.2: Invalid ID Handling**

**Steps:**
1. Manually test endpoint with invalid ID:
```bash
curl -X GET http://localhost:5002/api/v1/analytics/survey/invalid-id-12345
```

**✅ Pass Criteria:**
- Returns 404 or empty metrics
- Does NOT crash backend
- Frontend shows 0 values or error message

---

### **PHASE 5: Data Persistence Testing**

#### **Test 5.1: Counter Persistence**

**Steps:**
1. Record a view: `POST /analytics/profile/view/<ID>`
2. Restart backend server
3. Retrieve metrics: `GET /analytics/profile/<ID>`

**✅ Pass Criteria:**
- View count persists across restarts
- Daily/weekly counters maintain state
- No data loss

---

#### **Test 5.2: Auto-Reset Logic**

**Steps:**
1. Record views today
2. Change system date to tomorrow (or wait 24 hours)
3. Retrieve metrics

**✅ Pass Criteria:**
- `today` counter resets to 0
- `last7Days` counter includes yesterday's views
- `total` counter continues incrementing

---

## **📊 Testing Results Template**

Copy this to track your testing progress:

```
## Test Results - [Date]

### Backend API Tests
- [ ] Test 1.1: Profile Analytics - PASS / FAIL
- [ ] Test 1.2: Survey Analytics - PASS / FAIL
- [ ] Test 1.3: Post Analytics - PASS / FAIL

### Frontend UI Tests
- [ ] Test 2.1: Survey Engagement Bar - PASS / FAIL
- [ ] Test 2.2: Post Engagement Bar - PASS / FAIL
- [ ] Test 2.3: Profile Insight Bar - PASS / FAIL

### Interaction Tests
- [ ] Test 3.1: Survey Reactions - PASS / FAIL
- [ ] Test 3.2: Post Reactions - PASS / FAIL
- [ ] Test 3.3: View Recording - PASS / FAIL

### Error Handling Tests
- [ ] Test 4.1: API Failure - PASS / FAIL
- [ ] Test 4.2: Invalid ID - PASS / FAIL

### Data Persistence Tests
- [ ] Test 5.1: Counter Persistence - PASS / FAIL
- [ ] Test 5.2: Auto-Reset Logic - PASS / FAIL

### Overall Status: ✅ ALL PASS / ❌ FAILURES FOUND

### Issues Found:
1. [Issue description]
2. [Issue description]

### Screenshots:
[Attach screenshots of engagement bars in UI]
```

---

## **🚀 Deployment Checklist**

Before deploying to production:

- [ ] All tests passed
- [ ] Engagement bars visible in all locations
- [ ] Zero-value metrics render correctly
- [ ] Reaction buttons functional
- [ ] View tracking working
- [ ] Error boundaries prevent crashes
- [ ] API endpoints documented
- [ ] No duplicate files exist
- [ ] No routing conflicts
- [ ] Frontend builds without errors
- [ ] Backend starts without crashes
- [ ] MongoDB indexes created
- [ ] Rate limiting configured (future)
- [ ] CORS settings correct

---

## **📝 Known Limitations & Future Enhancements**

### Current Limitations:
- No rate limiting (allow unlimited requests)
- No webhook system
- Anti-spam limited to 10,000 users per item
- No analytics dashboard for owners yet

### Future Enhancements:
- Real-time analytics dashboard
- Export metrics to CSV
- Advanced filtering (date ranges, demographics)
- Webhook subscriptions
- Push notifications for milestones
- A/B testing integration

---

**Last Updated:** November 19, 2025  
**Status:** Ready for Testing
