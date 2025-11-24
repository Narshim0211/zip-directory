# 🚀 SalonHub API Routing - Quick Reference Card

## ✅ The ONE Rule

**ALWAYS use the unified API client:**

```javascript
import api from '../api/axios';
```

**NEVER do:**
```javascript
import axios from 'axios';  // ❌ FORBIDDEN
```

---

## 📝 API Call Format

### ✅ CORRECT
```javascript
import api from '../api/axios';

// All routes start with /v1
api.get('/v1/feed')
api.post('/v1/auth/login', { email, password })
api.get('/v1/visitor-profiles/me')
api.post('/v1/analytics/profile/view/123')
```

### ❌ WRONG
```javascript
// Missing /v1
api.get('/feed')

// Hardcoded URL
axios.get('http://localhost:5000/v1/feed')

// Using fetch
fetch('/api/v1/feed')

// Including /api in route (baseURL already has it)
api.get('/api/v1/feed')
```

---

## 🔍 How to Verify It Works

**1. Check console logs:**
```
🌐 [AXIOS] GET http://localhost:5000/api/v1/feed
🌐 [AXIOS] POST http://localhost:5000/api/v1/auth/login
```

**If you DON'T see these logs, something is wrong.**

**2. Check Network tab:**
- All XHR requests should go to: `http://localhost:5000/api/v1/...`

---

## 🎯 Common Routes

```javascript
// Authentication
api.post('/v1/auth/login', { email, password })
api.post('/v1/auth/register', userData)
api.post('/v1/auth/logout')

// Feed
api.get('/v1/feed')                    // Visitor feed
api.get('/v1/feed/owner')              // Owner feed

// Profiles
api.get('/v1/visitor-profiles/me')     // My visitor profile
api.get('/v1/owner-profiles/me')       // My owner profile
api.get('/v1/visitor-profiles/:slug')  // Public visitor profile
api.get('/v1/owner-profiles/:slug')    // Public owner profile

// Analytics
api.post('/v1/analytics/profile/view/:ownerId')
api.post('/v1/analytics/post/react/:postId', { reactionType })
api.get('/v1/analytics/profile/:ownerId')

// Owner
api.post('/v1/owner/posts', postData)
api.post('/v1/owner/surveys', surveyData)
api.post('/v1/owner/follow/:targetId')
api.delete('/v1/owner/follow/:targetId')

// Visitor
api.post('/v1/visitor/surveys', surveyData)
api.post('/v1/visitor/surveys/:id/vote', { optionId })
```

---

## 🛡️ Before Committing

```bash
# Run verification script
bash verify-api-routing.sh

# Should see:
# ✓ PASS: No direct axios imports
# ✓ PASS: No axios.create() calls
# ✓ PASS: No hardcoded URLs
# 🎉 EXCELLENT! All checks passed!
```

---

## 🐛 Quick Troubleshooting

### No `🌐 [AXIOS]` logs?
→ You're bypassing the unified instance. Check your imports.

### 404 errors?
→ Check if route has `/v1` prefix and backend endpoint exists.

### Token not sent?
→ Check `localStorage.getItem('token')` - axios.js automatically attaches it.

---

## 📚 Full Docs

- `API_ROUTING_CLEANUP_COMPLETE.md` - Complete guide
- `CLEANUP_EXECUTION_SUMMARY.md` - What was done
- `CODEBASE_API_AUDIT_REPORT.json` - Detailed audit

---

**Last Updated:** November 23, 2025
