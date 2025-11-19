# 📡 Engagement Metrics API - Contract Documentation

## **Base URL**
```
Production: https://api.salonhub.com/api/v1/analytics
Development: http://localhost:5000/api/v1/analytics
```

---

## **Profile Analytics API**

### **Record Profile View**

**Endpoint:** `POST /profile/view/:ownerId`

**Description:** Records a view on an owner's business profile. Auto-increments daily, weekly, and total counters.

**Parameters:**
- `ownerId` (path, required): User ID of the owner

**Auth:** None (public)

**Request:**
```http
POST /api/v1/analytics/profile/view/507f1f77bcf86cd799439011
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "today": 8,
    "last7Days": 55,
    "total": 343
  }
}
```

**Error Responses:**
- `400 Bad Request`: Owner ID missing or invalid
- `500 Internal Server Error`: Database error

---

### **Get Profile Insights**

**Endpoint:** `GET /profile/:ownerId`

**Description:** Retrieves current analytics for an owner's business profile.

**Parameters:**
- `ownerId` (path, required): User ID of the owner

**Auth:** None (public)

**Request:**
```http
GET /api/v1/analytics/profile/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "today": 8,
    "last7Days": 55,
    "total": 343
  }
}
```

**Notes:**
- If no analytics exist yet, returns zeros
- Automatically resets daily/weekly counters if needed

---

## **Survey Analytics API**

### **Record Survey View**

**Endpoint:** `POST /survey/view/:surveyId`

**Description:** Records a view on a survey. Prevents spam by tracking unique viewers.

**Parameters:**
- `surveyId` (path, required): Survey ID

**Auth:** Optional (tracks user if authenticated)

**Request:**
```http
POST /api/v1/analytics/survey/view/507f1f77bcf86cd799439012
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 121,
    "responses": 37,
    "reactions": {
      "like": 12,
      "love": 10,
      "total": 22
    }
  }
}
```

---

### **Record Survey Response**

**Endpoint:** `POST /survey/respond/:surveyId`

**Description:** Records a survey submission. User can only respond once.

**Parameters:**
- `surveyId` (path, required): Survey ID

**Auth:** Required (JWT)

**Request:**
```http
POST /api/v1/analytics/survey/respond/507f1f77bcf86cd799439012
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 121,
    "responses": 38,
    "reactions": {
      "like": 12,
      "love": 10,
      "total": 22
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Survey ID missing

---

### **Add/Update Survey Reaction**

**Endpoint:** `POST /survey/react/:surveyId`

**Description:** Adds or updates a user's reaction to a survey.

**Parameters:**
- `surveyId` (path, required): Survey ID

**Auth:** Required (JWT)

**Request Body:**
```json
{
  "reactionType": "like"
}
```

**Valid Reaction Types:**
- `like` (thumbs up)
- `love` (heart)

**Request:**
```http
POST /api/v1/analytics/survey/react/507f1f77bcf86cd799439012
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "reactionType": "love"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 121,
    "responses": 38,
    "reactions": {
      "like": 12,
      "love": 11,
      "total": 23
    }
  }
}
```

**Behavior:**
- If user hasn't reacted before: adds new reaction
- If user already reacted: changes reaction type
- If user clicks same reaction: does nothing (no spam)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Invalid reaction type

---

### **Get Survey Engagement**

**Endpoint:** `GET /survey/:surveyId`

**Description:** Retrieves current engagement metrics for a survey.

**Parameters:**
- `surveyId` (path, required): Survey ID

**Auth:** None (public)

**Request:**
```http
GET /api/v1/analytics/survey/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 121,
    "responses": 38,
    "reactions": {
      "like": 12,
      "love": 11,
      "total": 23
    }
  }
}
```

---

## **Post Analytics API**

### **Record Post View**

**Endpoint:** `POST /post/view/:postId`

**Description:** Records a view on an owner post. Prevents spam by tracking unique viewers.

**Parameters:**
- `postId` (path, required): Post ID

**Auth:** Optional (tracks user if authenticated)

**Request:**
```http
POST /api/v1/analytics/post/view/507f1f77bcf86cd799439013
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 90,
    "reactions": {
      "like": 8,
      "love": 6,
      "total": 14
    }
  }
}
```

---

### **Add/Update Post Reaction**

**Endpoint:** `POST /post/react/:postId`

**Description:** Adds or updates a user's reaction to a post.

**Parameters:**
- `postId` (path, required): Post ID

**Auth:** Required (JWT)

**Request Body:**
```json
{
  "reactionType": "like"
}
```

**Valid Reaction Types:**
- `like` (thumbs up)
- `love` (heart)

**Request:**
```http
POST /api/v1/analytics/post/react/507f1f77bcf86cd799439013
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "reactionType": "love"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 90,
    "reactions": {
      "like": 8,
      "love": 7,
      "total": 15
    }
  }
}
```

**Behavior:**
- If user hasn't reacted before: adds new reaction
- If user already reacted: changes reaction type
- If user clicks same reaction: does nothing (no spam)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Invalid reaction type

---

### **Get Post Engagement**

**Endpoint:** `GET /post/:postId`

**Description:** Retrieves current engagement metrics for a post.

**Parameters:**
- `postId` (path, required): Post ID

**Auth:** None (public)

**Request:**
```http
GET /api/v1/analytics/post/507f1f77bcf86cd799439013
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "views": 90,
    "reactions": {
      "like": 8,
      "love": 7,
      "total": 15
    }
  }
}
```

---

## **Error Response Format**

All errors follow this format:

```json
{
  "success": false,
  "status": "error",
  "message": "Error description"
}
```

### **Common Error Codes**

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 400 | Bad Request | Invalid parameters, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Database error, unexpected server error |

---

## **Rate Limiting**

(Future implementation)

- **Profile views:** 100 requests/min per IP
- **Reactions:** 10 requests/min per user
- **Read operations:** 1000 requests/min per IP

---

## **Webhooks** 

(Future implementation)

Subscribe to real-time engagement events:

- `profile.view.recorded`
- `survey.responded`
- `post.reacted`

---

## **Data Retention**

- **Profile insights:** Indefinite (aggregated data)
- **Survey engagement:** Indefinite
- **Post engagement:** Indefinite
- **User tracking arrays:** Limited to last 10,000 unique users per item

---

## **CORS Configuration**

Allowed origins:
- `https://salonhub.com`
- `https://admin.salonhub.com`
- `http://localhost:3000` (development)
- `http://localhost:5173` (development)

---

## **SDK / Client Libraries**

### **JavaScript/React**
```javascript
import analyticsClient from '@salonhub/analytics';

// Record profile view
await analyticsClient.profile.recordView(ownerId);

// Get insights
const insights = await analyticsClient.profile.getInsights(ownerId);

// Add reaction
await analyticsClient.survey.addReaction(surveyId, 'love');
```

### **cURL Examples**

See individual endpoint documentation above.

---

## **Testing Endpoints**

**Health Check:**
```http
GET /api/v1/analytics/health
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics module is operational",
  "endpoints": {
    "profile": "/api/v1/analytics/profile",
    "survey": "/api/v1/analytics/survey",
    "post": "/api/v1/analytics/post"
  }
}
```

---

## **Changelog**

### **v1.0.0** (November 19, 2025)
- Initial release
- Profile insights (daily, weekly, total views)
- Survey engagement (views, responses, reactions)
- Post engagement (views, reactions)
- Spam prevention (unique user tracking)
- Auto-reset logic for time-based counters

---

**Maintained by:** SalonHub Engineering Team  
**Support:** engineering@salonhub.com  
**Last Updated:** November 19, 2025
