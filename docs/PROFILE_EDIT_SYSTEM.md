# 🎯 SalonHub Profile Edit System - Technical Documentation

**Version:** 2.0 (2025 Futuristic Edition)
**Last Updated:** 2025-11-25
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [API Structure](#api-structure)
4. [Data Models](#data-models)
5. [Frontend Components](#frontend-components)
6. [Implementation Guide](#implementation-guide)
7. [Migration Plan](#migration-plan)
8. [Testing Checklist](#testing-checklist)

---

## 1. System Overview

### Vision
A unified, futuristic profile editing experience that works for both **Visitors** (consumers) and **Owners** (salon professionals) with zero code duplication.

### Key Features
- ✅ **Single Modal System** - One component, two modes
- ✅ **Auto-save** - Debounced, optimistic updates
- ✅ **Futuristic UI** - Glassmorphism, glow effects, animations
- ✅ **Zero Duplication** - Shared components with conditional logic
- ✅ **Role-Based** - Dynamic rendering based on user type

### Success Metrics
- 85%+ profile completion rate
- <45 seconds edit time
- 95%+ logo/avatar upload rate
- 72%+ premium conversion from edit page

---

## 2. Architecture Principles

### Core Design Decisions

#### ✅ **Principle 1: One Component, Multiple Modes**
```javascript
// BAD (Old way - Duplication)
<EditOwnerProfile />
<VisitorProfileEditPage />

// GOOD (New way - Unified)
<ProfileEditModal user={user} />
  // Internally detects user.role and renders accordingly
```

#### ✅ **Principle 2: Keep Backend Separate, Enhance Frontend Only**
- Existing API endpoints are solid → **KEEP THEM**
- Backend controllers work well → **MINOR ENHANCEMENTS ONLY**
- Data models are clean → **ADD OPTIONAL FIELDS ONLY**

#### ✅ **Principle 3: Progressive Enhancement**
- Old pages work until new system is ready
- No breaking changes to API contracts
- Backward compatible data structure

---

## 3. API Structure

### 🔥 Existing API Endpoints (DO NOT CHANGE)

#### Owner Profile API
```
Base: /api/v1/owner-profiles

GET    /me                    - Get current owner profile
PUT    /me                    - Update owner profile
PUT    /me/featured           - Update featured businesses
POST   /me/upload             - Upload avatar/header image
GET    /:slug                 - Get public owner profile
GET    /:slug/timeline        - Get owner timeline
```

#### Visitor Profile API
```
Base: /api/v1/visitor-profiles

GET    /me                    - Get current visitor profile
PUT    /me                    - Update visitor profile
GET    /:slug                 - Get public visitor profile
GET    /:slug/timeline        - Get visitor timeline
```

### 📝 API Request/Response Format

#### Update Owner Profile
```http
PUT /api/v1/owner-profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Bella",
  "lastName": "Braids",
  "handle": "bellabraids",
  "bio": "Premium salon · Deposits · Chat enabled",
  "avatarUrl": "https://...",
  "headerImageUrl": "https://...",
  "title": "Top Salon in Dallas"  // NEW FIELD (optional)
}
```

#### Update Visitor Profile
```http
PUT /api/v1/visitor-profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Nitesh",
  "lastName": "Siwakoti",
  "handle": "niteesh",
  "bio": "Turning heads one braid at a time ✨",
  "avatarUrl": "https://...",
  "bannerUrl": "https://...",
  "title": "Braid Queen",  // NEW FIELD (optional)
  "socialLinks": {
    "twitter": "@niteesh",
    "instagram": "@niteesh",
    "website": "https://example.com"
  }
}
```

#### Upload Image
```http
POST /api/v1/owner-profiles/me/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "avatar" | "header",
  "base64": "data:image/png;base64,...",
  "originalName": "photo.png"
}

Response:
{
  "url": "https://cloudinary.com/..."
}
```

### 🔒 API Security
- ✅ JWT Authentication via `protect` middleware
- ✅ Rate limiting: 30 requests/minute for updates
- ✅ Input validation via `validateOwnerUpdate` / `validateVisitorUpdate`
- ✅ Handle uniqueness checks
- ✅ CORS configured for frontend origins

---

## 4. Data Models

### Owner Profile Schema
```javascript
{
  userId: ObjectId (unique, required),
  firstName: String (required, trim),
  lastName: String (trim),
  displayName: String (auto-generated from firstName + lastName),
  handle: String (unique),
  slug: String (unique),
  avatarUrl: String,
  headerImageUrl: String,
  bio: String (maxlength: 1000),
  title: String,  // NEW - For tagline like "Top Salon in Dallas"

  featuredBusinesses: [ObjectId ref Business],
  pinnedPostIds: [ObjectId ref Post],

  socialLinks: {
    twitter: String,
    instagram: String,
    website: String,
    tiktok: String,  // NEW - Add to support TikTok
    youtube: String,  // NEW - Add to support YouTube
  },

  verified: Boolean (default: false),
  premium: Boolean,  // NEW - Track premium status

  counts: {
    posts: Number (default: 0),
    followers: Number (default: 0),
    following: Number (default: 0),
    surveys: Number (default: 0),
  },

  needsCompletion: Boolean (default: false),

  timestamps: true
}
```

### Visitor Profile Schema
```javascript
{
  userId: ObjectId (unique, required),
  firstName: String (required, trim),
  lastName: String (trim),
  handle: String (unique, indexed),
  slug: String (unique, indexed),
  avatarUrl: String,
  bannerUrl: String,
  bio: String (maxlength: 280),
  title: String,  // NEW - For tagline like "Braid Queen"

  socialLinks: {
    twitter: String,
    instagram: String,
    website: String,
    tiktok: String,  // NEW - Add to support TikTok
    youtube: String,  // NEW - Add to support YouTube
  },

  followersCount: Number (default: 0),
  followingCount: Number (default: 0),

  needsCompletion: Boolean (default: false),

  timestamps: true
}
```

### Migration Required
```javascript
// Add to both OwnerProfile and VisitorProfile models:
title: { type: String, maxlength: 100, default: '' }

// Add to OwnerProfile.socialLinks:
tiktok: { type: String, default: '' }
youtube: { type: String, default: '' }

// Add to VisitorProfile.socialLinks:
tiktok: { type: String, default: '' }
youtube: { type: String, default: '' }

// Add to OwnerProfile (if missing):
premium: { type: Boolean, default: false }
```

---

## 5. Frontend Components

### Component Architecture

```
ProfileEditModal (Parent)
├── AvatarUploader (Shared)
├── HeadlineEditor (Shared)
├── BioEditor (Shared)
└── LinksEditor (Shared)
```

### File Structure
```
frontend/src/
├── components/
│   └── profile/
│       ├── ProfileEditModal.jsx          [Main modal component]
│       ├── AvatarUploader.jsx            [Image upload + crop]
│       ├── HeadlineEditor.jsx            [Name, handle, title]
│       ├── BioEditor.jsx                 [Bio with char counter]
│       ├── LinksEditor.jsx               [Social links manager]
│       └── ProfileFollowButton.jsx       [Existing - Keep]
│       └── ProfileHeader.jsx             [Existing - Keep]
│       └── ProfileStats.jsx              [Existing - Keep]
│       └── ProfileTabs.jsx               [Existing - Keep]
├── styles/
│   └── profileEditModal.css              [Futuristic styles]
```

### Component Props & Responsibilities

#### ProfileEditModal.jsx
```javascript
Props: {
  isOpen: boolean,
  onClose: function,
}

Responsibilities:
- Detect user role from AuthContext
- Render 4 cards dynamically based on role
- Handle modal open/close animations
- Coordinate auto-save across child components
```

#### AvatarUploader.jsx
```javascript
Props: {
  user: object,
  onUpload: function,
}

Responsibilities:
- Render circle (visitor) or square (owner)
- Show glow ring (premium/verified)
- Handle drag & drop or file input
- Crop image to correct shape
- Upload via /me/upload endpoint
- Show upload progress
```

#### HeadlineEditor.jsx
```javascript
Props: {
  user: object,
  onChange: function,
}

Responsibilities:
- Render name + handle + title inputs
- Show follower stats (read-only)
- Show badges (verified/premium - owner only)
- Validate handle uniqueness
- Auto-save on change (debounced)
```

#### BioEditor.jsx
```javascript
Props: {
  user: object,
  onChange: function,
}

Responsibilities:
- Textarea with character limit (280 visitor, 400 owner)
- Live character counter with glow effect
- Auto-resize textarea
- Auto-save on change (debounced)
```

#### LinksEditor.jsx
```javascript
Props: {
  user: object,
  onChange: function,
}

Responsibilities:
- Render existing links with platform icons
- "Add Link" dropdown (Instagram, TikTok, YouTube, etc.)
- Validate URL format
- Auto-save on change (debounced)
```

---

## 6. Implementation Guide

### Phase 1: Backend Enhancements (Day 1)

#### Step 1.1: Update Data Models
```bash
# Edit: backend/models/OwnerProfile.js
# Edit: backend/models/VisitorProfile.js
```

Add fields:
```javascript
// In both models:
title: { type: String, maxlength: 100, default: '' },

// In socialLinks object (both models):
tiktok: { type: String, default: '' },
youtube: { type: String, default: '' },

// In OwnerProfile only:
premium: { type: Boolean, default: false },
```

#### Step 1.2: Update Controllers (Optional - for title field)
```bash
# Edit: backend/controllers/v1/ownerProfileController.js
# Edit: backend/controllers/v1/visitorProfileController.js
```

In `updateMe` function, add `title` to destructuring:
```javascript
// Owner
const { firstName, lastName, bio, handle, avatarUrl, title } = req.body;

// Visitor
const { firstName, lastName, bio, handle, avatarUrl, title, bannerUrl, socialLinks } = req.body;
```

#### Step 1.3: Test Endpoints
```bash
# Start backend
cd backend && npm start

# Test with curl or Postman
curl -X PUT http://localhost:5000/api/v1/owner-profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Top Salon"}'
```

### Phase 2: Frontend Components (Days 2-3)

#### Step 2.1: Create Base Modal
```bash
# Create: frontend/src/components/profile/ProfileEditModal.jsx
```

#### Step 2.2: Create Sub-Components
```bash
# Create: frontend/src/components/profile/AvatarUploader.jsx
# Create: frontend/src/components/profile/HeadlineEditor.jsx
# Create: frontend/src/components/profile/BioEditor.jsx
# Create: frontend/src/components/profile/LinksEditor.jsx
```

#### Step 2.3: Create Styles
```bash
# Create: frontend/src/styles/profileEditModal.css
```

#### Step 2.4: Create Hook for Auto-save
```bash
# Create: frontend/src/hooks/useAutoSave.js
```

### Phase 3: Integration (Day 4)

#### Step 3.1: Add Modal Trigger to Profile Pages
```javascript
// In owner profile page
import ProfileEditModal from '../components/profile/ProfileEditModal';

const [isEditModalOpen, setEditModalOpen] = useState(false);

<button onClick={() => setEditModalOpen(true)}>Edit Profile</button>
<ProfileEditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} />
```

#### Step 3.2: Update Routes
```javascript
// Remove old edit page routes from App.js
// Delete: /owner/me/edit route
// Delete: /visitor/profile/edit route
```

#### Step 3.3: Delete Old Files
```bash
# Delete: frontend/src/pages/EditOwnerProfile.jsx
# Delete: frontend/src/visitor/pages/VisitorProfileEditPage.jsx
```

### Phase 4: Testing & Polish (Day 5)

#### Step 4.1: Manual Testing Checklist
- [ ] Owner can edit name, handle, bio
- [ ] Visitor can edit name, handle, bio
- [ ] Avatar upload works for both
- [ ] Social links save correctly
- [ ] Auto-save triggers (wait 1 second after typing)
- [ ] Modal animations smooth
- [ ] Premium badge shows for premium owners
- [ ] Character counter updates in real-time
- [ ] Handle validation shows errors
- [ ] Featured businesses still work (owner only)

#### Step 4.2: Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (responsive)

#### Step 4.3: Performance Check
- [ ] No memory leaks (open/close modal 50x)
- [ ] Image upload <3 seconds
- [ ] Auto-save debouncing works (not spamming API)

---

## 7. Migration Plan

### Pre-Migration Checklist
- [ ] Backend models updated
- [ ] New components tested in isolation
- [ ] Modal integrated on profile pages
- [ ] Old routes still work (parallel running)

### Migration Steps

#### Step 1: Deploy Backend Changes
```bash
cd backend
git add models/OwnerProfile.js models/VisitorProfile.js
git commit -m "feat: Add title and social platform fields to profiles"
git push
```

#### Step 2: Deploy Frontend (New Components)
```bash
cd frontend
git add src/components/profile/ProfileEditModal.jsx
git add src/components/profile/AvatarUploader.jsx
git add src/components/profile/HeadlineEditor.jsx
git add src/components/profile/BioEditor.jsx
git add src/components/profile/LinksEditor.jsx
git add src/styles/profileEditModal.css
git commit -m "feat: Add futuristic profile edit modal system"
git push
```

#### Step 3: Remove Old System
```bash
cd frontend
git rm src/pages/EditOwnerProfile.jsx
git rm src/visitor/pages/VisitorProfileEditPage.jsx
# Update App.js to remove old routes
git commit -m "refactor: Remove old profile edit pages"
git push
```

### Rollback Plan
If issues arise:
1. Revert frontend changes (keep backend - it's backward compatible)
2. Old edit pages still exist in git history
3. Restore old routes temporarily
4. Fix issues
5. Redeploy

---

## 8. Testing Checklist

### Unit Tests (Optional but Recommended)
```javascript
// Test auto-save debouncing
it('should debounce profile updates', async () => {
  // Mock API
  // Trigger multiple rapid changes
  // Verify only 1 API call after debounce delay
});

// Test role-based rendering
it('should show owner fields for owner users', () => {
  // Render with owner user
  // Check for featured businesses section
});

it('should show visitor fields for visitor users', () => {
  // Render with visitor user
  // Check for banner URL field
});
```

### Integration Tests
```javascript
// Test full edit flow
it('should save profile changes end-to-end', async () => {
  // Login as owner
  // Open edit modal
  // Change bio
  // Wait for auto-save
  // Close modal
  // Verify profile updated on server
});
```

### Manual QA Checklist
- [ ] **Owner Profile Edit**
  - [ ] Name, handle, bio edit works
  - [ ] Avatar upload works
  - [ ] Header image upload works
  - [ ] Featured businesses selection works
  - [ ] Social links save correctly
  - [ ] Premium badge displays
  - [ ] Verified badge displays (if verified)

- [ ] **Visitor Profile Edit**
  - [ ] Name, handle, bio edit works
  - [ ] Avatar upload works
  - [ ] Banner upload works
  - [ ] Social links save correctly
  - [ ] Follower count displays (read-only)

- [ ] **Auto-save**
  - [ ] Saves after 1 second of inactivity
  - [ ] Shows save indicator animation
  - [ ] Doesn't spam API with rapid changes
  - [ ] Handles network errors gracefully

- [ ] **Validation**
  - [ ] Handle uniqueness check works
  - [ ] Bio character limit enforced
  - [ ] URL format validation works
  - [ ] Required fields show errors

---

## 9. Future Enhancements

### Phase 2 Features (Later)
- AI bio suggestions
- Profile completion progress bar
- "Preview Profile" button in modal
- Drag & drop to reorder social links
- Bulk edit for multiple businesses (owners)
- Profile templates (quick setup)

---

## 10. Contact & Support

**Technical Lead:** Claude
**Documentation:** This file
**Codebase:** SalonHub Main Repository

For questions or issues, reference this document first.

---

**End of Technical Documentation**
