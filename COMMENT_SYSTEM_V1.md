# SALONHUB COMMENT SYSTEM V1 - COMPLETE IMPLEMENTATION GUIDE

## 📋 Document Information
- **Version**: 1.0
- **Date**: November 2025
- **Status**: Implementation Ready
- **Paywall**: NONE (V2 feature)
- **Author**: Claude + SalonHub Team

---

## 🎯 EXECUTIVE SUMMARY

This document details the Comment System V1 implementation for SalonHub. This is a **ZERO-PAYWALL**, **ZERO-PREMIUM-LOGIC** version that provides basic commenting functionality for all logged-in users (Owners and Visitors equally).

### Key Principles
1. **NO useImpressionTracking** - Root cause of previous infinite loops
2. **NO raw axios in components** - Prevents re-render storms
3. **NO user.role checks for commenting** - Everyone equal in V1
4. **Simple, stable API** - Built on existing SalonHub patterns
5. **Future-proof** - V2 paywall can be added in 15 minutes

---

## 🔐 ACCESS CONTROL MATRIX

| Who | Looking At | Can Read | Can Write | Can Reply | Can Delete Own |
|-----|-----------|----------|-----------|-----------|----------------|
| **Owner (logged-in)** | Own content | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Owner (logged-in)** | Others' content | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Visitor (logged-in)** | Own content | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Visitor (logged-in)** | Others' content | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Guest (not logged-in)** | Any content | ✅ YES | ❌ NO (redirect to /login) | ❌ NO | ❌ N/A |

### Simple Rule
- **Logged-in = Full commenting power**
- **Guest = Read-only + redirect to login**

---

## 🏗️ ARCHITECTURE OVERVIEW

### Backend Stack
- **Framework**: Express.js (existing)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (existing middleware)
- **Security**: Rate limiting (existing patterns)

### Frontend Stack
- **Framework**: React (existing)
- **HTTP Client**: Axios (existing instance from `frontend/src/api/axios.js`)
- **State**: React useState/useEffect (NO external state library)
- **Auth**: AuthContext (existing)

---

## 📦 DATABASE SCHEMA

### Comment Model
Located at: `backend/models/Comment.js`

```javascript
const commentSchema = new mongoose.Schema({
  // Content Reference
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    // References either Survey._id or OwnerPost._id
  },

  contentType: {
    type: String,
    required: true,
    enum: ['survey', 'post'],
    // Determines which collection contentId points to
  },

  // Author
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Content
  text: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  },

  // Threading (1-level only)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true,
  },

}, {
  timestamps: true, // Auto-adds createdAt, updatedAt
});

// Indexes for performance
commentSchema.index({ contentId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ userId: 1 });
```

### Why This Schema?
- **contentId + contentType**: Polymorphic - works for both surveys and posts
- **parentId**: Enables 1-level replies (Instagram/Twitter style)
- **Indexes**: Fast queries for loading comments by content
- **timestamps**: Auto-tracking for sorting and display

---

## 🔌 API ENDPOINTS

Base URL: `/api/comments`

### 1. GET /api/comments
**Purpose**: Fetch all comments for a piece of content

**Query Parameters**:
- `contentId` (required): MongoDB ObjectId of survey/post
- `contentType` (required): 'survey' or 'post'

**Auth**: Optional (guests can read)

**Response**:
```json
[
  {
    "_id": "comment123",
    "contentId": "survey456",
    "contentType": "survey",
    "text": "Great survey!",
    "userId": {
      "_id": "user789",
      "firstName": "Jane",
      "lastName": "Doe",
      "avatarUrl": "https://..."
    },
    "parentId": null,
    "createdAt": "2025-11-25T10:00:00.000Z",
    "updatedAt": "2025-11-25T10:00:00.000Z",
    "replies": [
      {
        "_id": "comment124",
        "text": "Thanks!",
        "userId": { ... },
        "parentId": "comment123",
        "createdAt": "2025-11-25T10:05:00.000Z"
      }
    ]
  }
]
```

**Logic**:
1. Find all top-level comments (parentId === null)
2. Find all replies (parentId !== null)
3. Nest replies under parent comments
4. Populate userId with firstName, lastName, avatarUrl
5. Sort top-level by createdAt ASC (oldest first)

---

### 2. POST /api/comments
**Purpose**: Create a new comment or reply

**Auth**: REQUIRED (`protect` middleware)

**Body**:
```json
{
  "contentId": "survey456",
  "contentType": "survey",
  "text": "This is my comment",
  "parentId": null  // or "comment123" for reply
}
```

**Validation**:
- text: 1-500 characters
- contentId: valid ObjectId
- contentType: 'survey' or 'post'
- parentId: valid ObjectId or null

**Response**:
```json
{
  "_id": "comment125",
  "contentId": "survey456",
  "contentType": "survey",
  "text": "This is my comment",
  "userId": {
    "_id": "user789",
    "firstName": "Jane",
    "lastName": "Doe",
    "avatarUrl": "https://..."
  },
  "parentId": null,
  "createdAt": "2025-11-25T10:10:00.000Z",
  "updatedAt": "2025-11-25T10:10:00.000Z"
}
```

---

### 3. DELETE /api/comments/:id
**Purpose**: Delete a comment (and all its replies)

**Auth**: REQUIRED (`protect` middleware)

**Authorization**: User must be comment author

**Response**:
```json
{
  "success": true,
  "message": "Comment deleted"
}
```

**Logic**:
1. Check if comment exists
2. Check if req.user._id === comment.userId
3. Delete comment
4. Delete all replies (where parentId === commentId)

---

## 🔒 SECURITY IMPLEMENTATION

### 1. Authentication
Uses existing `protect` middleware from `backend/middleWare/authMiddleware.js`

```javascript
const { protect } = require('../middleWare/authMiddleware');

router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);
```

### 2. Rate Limiting
Uses existing rate limiter pattern:

```javascript
const rateLimit = require('express-rate-limit');

const commentRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 comments per minute
  message: 'Too many comments. Please wait a moment.',
});

router.post('/', commentRateLimiter, protect, createComment);
```

### 3. Input Sanitization
```javascript
const sanitizeHtml = require('sanitize-html');

// In controller
const text = sanitizeHtml(req.body.text, {
  allowedTags: [], // NO HTML allowed
  allowedAttributes: {},
});
```

### 4. Authorization Checks
```javascript
// Only author can delete
if (comment.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Unauthorized' });
}
```

---

## 🎨 FRONTEND COMPONENTS

### File Structure
```
frontend/src/
├── api/
│   └── commentApi.js          # API client functions
├── components/
│   └── comments/
│       ├── CommentList.jsx    # Container component
│       ├── CommentItem.jsx    # Single comment card
│       └── CommentInput.jsx   # Input for new comments/replies
└── styles/
    └── comments.css           # Comment-specific styles
```

---

### Component: CommentList.jsx

**Purpose**: Container that loads and displays all comments

**Props**:
- `contentId` (string): Survey or Post ID
- `contentType` (string): 'survey' or 'post'

**State**:
- `comments` (array): All comments with nested replies
- `loading` (boolean): Loading state
- `error` (string): Error message

**Logic**:
1. Fetch comments on mount
2. Render CommentInput for new comments
3. Map over comments to render CommentItem
4. Pass reply handlers down to CommentItem

**Key Point**: Uses plain `useState` and `useEffect` - NO custom hooks that cause re-renders

---

### Component: CommentItem.jsx

**Purpose**: Display single comment with reply functionality

**Props**:
- `comment` (object): Comment data
- `contentId` (string): For reply creation
- `contentType` (string): For reply creation
- `onDelete` (function): Callback after delete
- `onReplySuccess` (function): Callback after reply posted

**State**:
- `showReply` (boolean): Toggle reply input
- `deleting` (boolean): Delete in progress

**Features**:
- Avatar display
- User name (links to profile)
- Comment text
- Timestamp (relative: "2 hours ago")
- "Reply" button
- "Delete" button (only for author)
- Nested replies (indented)

---

### Component: CommentInput.jsx

**Purpose**: Text input for creating comments/replies

**Props**:
- `contentId` (string)
- `contentType` (string)
- `parentId` (string | null): null for top-level, commentId for reply
- `placeholder` (string): Custom placeholder
- `onSuccess` (function): Callback after successful post
- `onCancel` (function): For reply mode cancellation

**State**:
- `text` (string): Input value
- `submitting` (boolean): Submit in progress
- `error` (string): Error message

**Validation**:
- Min 1 character
- Max 500 characters
- Shows character count

**UX**:
- Textarea auto-expands
- Submit button disabled when empty
- Optimistic UI (instant display)
- Error toast on failure

---

## 🔗 API CLIENT (commentApi.js)

Located at: `frontend/src/api/commentApi.js`

```javascript
import api from './axios'; // Uses existing axios instance

export const commentApi = {
  // Get all comments for content
  getComments: async (contentId, contentType) => {
    const { data } = await api.get('/comments', {
      params: { contentId, contentType }
    });
    return data;
  },

  // Create new comment or reply
  createComment: async (contentId, contentType, text, parentId = null) => {
    const { data } = await api.post('/comments', {
      contentId,
      contentType,
      text,
      parentId,
    });
    return data;
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  },
};
```

**Why This Pattern?**
- Reuses existing axios instance (auto-includes auth token)
- Centralized API logic
- Easy to mock for testing
- Consistent error handling via axios interceptors

---

## 🚀 INTEGRATION POINTS

### Where to Add Comments

#### 1. Survey Feed Cards
File: `frontend/src/visitor/components/FeedSurveyCard.jsx`

```jsx
import CommentList from '../../components/comments/CommentList';

// Inside component, after engagement bar
<div className="mt-6">
  <CommentList
    contentId={survey._id}
    contentType="survey"
  />
</div>
```

#### 2. Owner Post Cards
File: `frontend/src/owner/components/PostCard.jsx` (if exists)

```jsx
<div className="mt-6">
  <CommentList
    contentId={post._id}
    contentType="post"
  />
</div>
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Backend
- [ ] Create `backend/models/Comment.js`
- [ ] Create `backend/routes/commentRoutes.js`
- [ ] Create `backend/controllers/commentController.js`
- [ ] Add route to `backend/server.js`
- [ ] Test with Postman/Thunder Client

### Frontend
- [ ] Create `frontend/src/api/commentApi.js`
- [ ] Create `frontend/src/components/comments/CommentList.jsx`
- [ ] Create `frontend/src/components/comments/CommentItem.jsx`
- [ ] Create `frontend/src/components/comments/CommentInput.jsx`
- [ ] Create `frontend/src/styles/comments.css`
- [ ] Add CommentList to Survey cards
- [ ] Add CommentList to Post cards
- [ ] Test in browser

---

## 🎨 DESIGN SPECIFICATIONS

### Visual Style
- **Background**: Light grey (#f9fafb)
- **Comment cards**: White with rounded corners (8px)
- **Typography**: 14-15px, -apple-system font stack
- **Spacing**: 16px between comments, 12px padding inside
- **Shadows**: Soft (0 1px 3px rgba(0,0,0,0.1))
- **Replies**: Indented 16px with left border (2px purple)

### Responsive
- **Mobile**: Full width, 12px padding
- **Tablet**: Max-width 680px
- **Desktop**: Max-width 720px

---

## 🔮 V2 PAYWALL MIGRATION

When ready to add paywall (future):

1. Create `frontend/src/utils/canComment.js`:
```javascript
export const canComment = (user) => {
  if (!user) return false;
  if (user.role === 'owner' && user.isPremium) return true;
  if (user.role === 'visitor' && user.hasChatPass) return true;
  return false;
};
```

2. Update `CommentInput.jsx`:
```javascript
import { canComment } from '../../utils/canComment';

// In component
if (!canComment(currentUser)) {
  return <PaywallCTA />;
}
```

**That's it. No rewrites needed.**

---

## 🐛 DEBUGGING GUIDE

### Common Issues

#### 1. "Comments not loading"
- Check browser console for 404
- Verify route is added to server.js
- Check MongoDB connection
- Verify contentId is valid ObjectId

#### 2. "Cannot post comment"
- Check if user is logged in (token in localStorage)
- Verify protect middleware is working
- Check rate limiter (wait 1 minute)
- Check text length (1-500 chars)

#### 3. "Infinite loop / blinking"
- Check for useImpressionTracking calls (should be ZERO)
- Check for raw axios in components (should use commentApi)
- Check useEffect dependencies
- Verify React.StrictMode is OFF in index.js

---

## 📞 SUPPORT

For questions or issues:
1. Check this documentation first
2. Review existing Survey/Post patterns in codebase
3. Test with Postman before blaming frontend
4. Check browser console + Network tab
5. Review backend logs

---

## ✅ TESTING CHECKLIST

### Manual Testing

**Backend**:
- [ ] GET /api/comments returns empty array for new content
- [ ] POST /api/comments creates comment (auth required)
- [ ] POST /api/comments creates reply with parentId
- [ ] DELETE /api/comments/:id deletes comment + replies
- [ ] DELETE fails if wrong user
- [ ] Rate limiter blocks after 10 posts/minute

**Frontend**:
- [ ] Comments load on page load
- [ ] New comment appears instantly (optimistic)
- [ ] Reply button works
- [ ] Reply appears indented
- [ ] Delete button only shows for author
- [ ] Delete works
- [ ] Guest sees "Log in to comment"
- [ ] Clicking input redirects guest to /login
- [ ] Character count works (500 max)
- [ ] Error messages show on failure

---

## 📚 REFERENCES

- Existing Auth Middleware: `backend/middleWare/authMiddleware.js`
- Existing Axios Instance: `frontend/src/api/axios.js`
- Survey Model: `backend/models/Survey.js`
- User Model: `backend/models/User.js`
- AuthContext: `frontend/src/context/AuthContext.js`

---

---

## ✅ IMPLEMENTATION COMPLETED (November 2025)

### Files Created/Modified

#### Backend Files
1. **backend/models/Comment.js** - Clean V1 schema with polymorphic references
   - Fields: `contentId`, `contentType`, `userId`, `text`, `parentId`
   - NO premium/paywall fields
   - Proper indexes for performance

2. **backend/routes/commentRoutes.js** - Simplified routes
   - GET /api/comments (no auth - guests can read)
   - POST /api/comments (auth required)
   - POST /api/comments/:id/reply (auth required)
   - DELETE /api/comments/:id (auth required)

3. **backend/controllers/commentsController.js** - Paywall removed
   - `getComments` - List all comments for content
   - `create` - Create new comment (NO canComment check)
   - `reply` - Reply to comment
   - `softDelete` - Delete own comment

4. **backend/services/commentsService.js** - Updated for V1 schema
   - `listByContent` - Fetch comments with nested replies
   - `createComment` - Simple validation + save
   - `softDeleteComment` - Authorization check + hard delete

5. **backend/server.js** - Route registration added
   - Line 168-170: Comment routes registered at `/api/comments`

#### Frontend Files
1. **frontend/src/api/commentApi.js** - API client
   - `getComments(contentType, contentId)`
   - `createComment(contentType, contentId, text)`
   - `replyToComment(parentId, contentType, contentId, text)`
   - `deleteComment(commentId)`

2. **frontend/src/components/CommentSection.jsx** - All-in-one component
   - CommentSection (parent container)
   - CommentItem (parent comments)
   - ReplyItem (nested replies)
   - Features:
     - Fetch comments on mount
     - Create/reply/delete comments
     - Guest login prompt
     - Character counter (500 max)
     - Optimistic UI updates

3. **frontend/src/styles/comments.css** - Complete styling
   - Clean, modern card-based design
   - 1-level threading (replies indented)
   - Responsive layout
   - Smooth transitions

### Usage Example

```jsx
import CommentSection from '../components/CommentSection';

// In your Survey or Post component:
<CommentSection contentType="survey" contentId={survey._id} />
<CommentSection contentType="post" contentId={post._id} />
```

### Next Steps for Integration
1. Import `CommentSection` into Survey cards
2. Import `CommentSection` into Post cards
3. Add below engagement bars or content
4. Test with logged-in and guest users

### V2 Paywall Migration (Future)
When ready to add paywall:
1. Add `canComment` check in `backend/controllers/commentsController.js` (15 min)
2. Add paywall CTA in `frontend/src/components/CommentSection.jsx` (15 min)
3. Total time: ~30 minutes

---

**END OF DOCUMENT**

This implementation guide is complete and ready for use. The Comment System V1 has been fully implemented and is ready for integration into Survey and Post cards.
