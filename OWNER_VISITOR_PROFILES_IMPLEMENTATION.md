# Owner & Visitor Public Profiles Implementation Summary

## Overview

This document summarizes the implementation of **Owner Public Profiles (X-style)** and **Visitor Public Profiles (survey-only)** for the SalonHub platform, as per the PRD requirements.

**Status:** ✅ Implementation Complete  
**Backend:** Running on `http://localhost:5000`  
**Frontend:** Ready for dev testing on `http://localhost:3000`

---

## Architecture & Design

### Core Concept

- **Owner Profile** (`/o/:slug`): Public profile for salon owners with:
  - Identity badge (avatar, name, handle)
  - Bio and featured businesses
  - Timeline of posts and surveys
  - Follow/unfollow button
  - Edit endpoint for profile owner only

- **Visitor Profile** (`/v/:slug`): Public profile for visitors with:
  - Identity badge (avatar, name, handle)
  - Bio
  - Timeline of surveys only (no posts)
  - Follow/unfollow button

### Database Models

#### New Models

1. **OwnerProfile** (`backend/models/OwnerProfile.js`)
   - Fields: `userId`, `firstName`, `lastName`, `handle`, `slug`, `avatarUrl`, `bio`, `featuredBusinesses`, `followersCount`, `followingCount`, `needsCompletion`
   - Virtual: `fullName` (firstName + lastName)
   - Indexes: slug (unique), userId (unique)

2. **OwnerFollow** (`backend/models/OwnerFollow.js`)
   - Fields: `followerId`, `ownerProfileId`, `createdAt`
   - Unique compound index: `followerId` + `ownerProfileId`

3. **VisitorProfile** (`backend/models/VisitorProfile.js`)
   - Fields: `userId`, `firstName`, `lastName`, `handle`, `slug`, `avatarUrl`, `bio`, `followersCount`, `followingCount`, `needsCompletion`
   - Virtual: `fullName`
   - Indexes: slug (unique), userId (unique)

4. **VisitorFollow** (`backend/models/VisitorFollow.js`)
   - Fields: `followerId`, `visitorProfileId`, `createdAt`
   - Unique compound index: `followerId` + `visitorProfileId`

---

## Backend Implementation

### Services

1. **ownerProfileService** (`backend/services/owner/ownerProfileService.js`)
   - `ensureProfileForUser(user)` — Create profile for new owner if missing
   - `getBySlug(slug)` — Fetch public profile by slug
   - `updateProfile(userId, updates)` — Update owner's own profile
   - `updateFeatured(userId, businessIds)` — Update featured businesses

2. **ownerFollowService** (`backend/services/owner/ownerFollowService.js`)
   - `followOwner({ followerId, ownerProfileId })` — Create follow edge
   - `unfollowOwner({ followerId, ownerProfileId })` — Delete follow edge

3. **visitorProfileService** (`backend/services/visitor/visitorProfileService.js`)
   - `ensureProfileForUser(user)` — Create profile for new visitor if missing
   - `getBySlug(slug)` — Fetch public profile by slug
   - `updateProfile(userId, updates)` — Update visitor's own profile

4. **visitorFollowService** (`backend/services/visitor/visitorFollowService.js`)
   - `followTarget({ followerId, targetType, targetId })` — Create follow edge
   - `unfollowTarget({ followerId, targetType, targetId })` — Delete follow edge

5. **feedService** (updated `backend/services/feedService.js`)
   - `attachIdentities(items)` — Load and attach OwnerProfile/VisitorProfile identity to posts/surveys
   - Called automatically in feed endpoints and controllers

### Controllers

1. **ownerProfileController** (`backend/controllers/v1/ownerProfileController.js`)
   - `getMe()` — Fetch current owner's profile (auth required)
   - `updateMe()` — Update current owner's profile (auth required)
   - `updateFeatured()` — Update featured businesses (auth required)
   - `getPublic()` — Fetch owner profile by slug (public)
   - `getTimeline()` — Fetch owner's posts and surveys (public)
   - `follow()` — Follow an owner (auth required)
   - `unfollow()` — Unfollow an owner (auth required)
   - `isFollowing()` — Check if current user follows this owner (auth required)

2. **visitorProfileController** (`backend/controllers/v1/visitorProfileController.js`)
   - Similar structure to owner controller
   - `getTimeline()` returns surveys only

### Routes

1. **v1 Owner Profiles** (`backend/routes/v1/ownerProfiles.routes.js`)
   - `GET /api/v1/owner-profiles/me` — Get current user's owner profile
   - `PUT /api/v1/owner-profiles/me` — Update current user's profile
   - `PUT /api/v1/owner-profiles/me/featured` — Update featured businesses
   - `GET /api/v1/owner-profiles/:slug` — Get public profile by slug
   - `GET /api/v1/owner-profiles/:slug/timeline` — Get timeline (posts + surveys)
   - `POST /api/v1/owner-profiles/:id/follow` — Follow profile
   - `DELETE /api/v1/owner-profiles/:id/follow` — Unfollow profile
   - `GET /api/v1/owner-profiles/:id/is-following` — Check follow status

2. **v1 Visitor Profiles** (`backend/routes/v1/visitorProfiles.routes.js`)
   - Similar structure to owner profiles
   - `GET /api/v1/visitor-profiles/:slug/timeline` — Returns surveys only

### Middleware & Utilities

1. **rateLimit** (`backend/middleWare/rateLimit.js`)
   - In-memory rate limiter (update: 30/min, follow: 60/min)
   - Production: Replace with Redis-backed limiter

2. **profileValidators** (`backend/validators/profileValidators.js`)
   - `validateOwnerUpdate()` — Validates firstName, lastName, handle format, bio length
   - `validateVisitorUpdate()` — Same validation rules

3. **slugify** (`backend/utils/slugify.js`)
   - Simple URL-slug generator (lowercase, hyphens, alphanumeric only)

### Backfill & Migration

**Script:** `backend/scripts/backfillOwnerProfiles.js`
- Finds all users with `role: 'owner'` who don't have an OwnerProfile
- Creates OwnerProfile for each
- Slugifies handle based on firstName + lastName

**NPM Script:** `npm run backfill:owners` (from backend folder)

---

## Frontend Implementation

### New Pages

1. **PublicOwnerProfile** (`frontend/src/pages/PublicOwnerProfile.jsx`)
   - Route: `/o/:slug`
   - Displays owner identity, bio, featured businesses, and timeline
   - Calls `GET /v1/owner-profiles/:slug` and `GET /v1/owner-profiles/:slug/timeline`
   - Follow button with current follow status via `GET /v1/owner-profiles/:id/is-following`

2. **EditOwnerProfile** (`frontend/src/pages/EditOwnerProfile.jsx`)
   - Route: `/owner/me/edit` (protected, owner role only)
   - Displays form to edit firstName, lastName, handle, bio, avatarUrl
   - Calls `GET /v1/owner-profiles/me` to prefill form
   - Calls `PUT /v1/owner-profiles/me` to save changes

3. **PublicVisitorProfile** (`frontend/src/pages/PublicVisitorProfile.jsx`)
   - Route: `/v/:slug`
   - Displays visitor identity, bio, and surveys timeline
   - Calls `GET /v1/visitor-profiles/:slug` and `GET /v1/visitor-profiles/:slug/timeline`
   - Follow button with current follow status via `GET /v1/visitor-profiles/:id/is-following`

### Updated Components

1. **IdentityBadge** (`frontend/src/components/Shared/IdentityBadge.jsx`)
   - Renders avatar, full name, and handle
   - Links to `/o/:slug` for owners, `/v/:slug` for visitors
   - Used in feed cards and public profiles

2. **FollowButton** (`frontend/src/components/FollowButton.jsx`)
   - Updated to call v1 profile endpoints when `targetType` is 'owner' or 'visitor'
   - Falls back to legacy `/follow/*` endpoints if no targetType provided
   - Displays "Following" or "Follow" state

3. **PostCard, SurveyCard, FeedPostCard** (updated)
   - Now render IdentityBadge with post.identity
   - Pass identity to follow button for correct endpoint routing

### App Routes

Updated `frontend/src/App.js`:
- `/o/:slug` → PublicOwnerProfile
- `/owner/me/edit` → EditOwnerProfile (protected)
- `/v/:slug` → PublicVisitorProfile

---

## API Contract

### Owner Profile Endpoints

```
GET    /api/v1/owner-profiles/me
       Response: { _id, userId, firstName, lastName, handle, slug, bio, avatarUrl, featuredBusinesses, followersCount, followingCount, needsCompletion }

PUT    /api/v1/owner-profiles/me
       Body: { firstName, lastName, bio, handle, avatarUrl }
       Response: { _id, ... }

PUT    /api/v1/owner-profiles/me/featured
       Body: { businessIds: [...] }
       Response: { _id, ... }

GET    /api/v1/owner-profiles/:slug
       Response: { _id, userId, firstName, lastName, handle, slug, bio, avatarUrl, featuredBusinesses, followersCount, followingCount }

GET    /api/v1/owner-profiles/:slug/timeline?page=1&size=10
       Response: { items: [{ type: 'post' | 'survey', data: {...} }], total, page, size }

POST   /api/v1/owner-profiles/:id/follow
       Response: { following: true }

DELETE /api/v1/owner-profiles/:id/follow
       Response: { following: false }

GET    /api/v1/owner-profiles/:id/is-following
       Response: { following: true | false }
```

### Visitor Profile Endpoints

```
GET    /api/v1/visitor-profiles/me
       Response: { _id, userId, firstName, lastName, handle, slug, bio, avatarUrl, followersCount, followingCount, needsCompletion }

PUT    /api/v1/visitor-profiles/me
       Body: { firstName, lastName, bio, handle, avatarUrl }
       Response: { _id, ... }

GET    /api/v1/visitor-profiles/:slug
       Response: { _id, userId, firstName, lastName, handle, slug, bio, avatarUrl, followersCount, followingCount }

GET    /api/v1/visitor-profiles/:slug/timeline?page=1&size=10
       Response: { items: [{ type: 'survey', data: {...} }], total, page, size }

POST   /api/v1/visitor-profiles/:id/follow
       Response: { following: true }

DELETE /api/v1/visitor-profiles/:id/follow
       Response: { following: false }

GET    /api/v1/visitor-profiles/:id/is-following
       Response: { following: true | false }
```

---

## Feed Identity Integration

### How It Works

When a post or survey is fetched, the `attachIdentities` service:
1. Loads OwnerProfile/VisitorProfile for the item's author (`userId`)
2. Attaches identity object: `{ type: 'owner' | 'visitor', fullName, handle, slug, avatarUrl, profileId }`
3. Returns the enriched item

### Usage in Controllers

- `postController.js` — calls `attachIdentities` before returning posts
- `surveyController.js` — calls `attachIdentities` before returning surveys
- `feedService.js` — `buildFeed` and `getFeedForVisitor` automatically attach identities

---

## Quick Start

### Backend Setup

1. **Install dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000` (or next available port if 5000 is busy)

3. **Create owner profiles for existing users** (optional):
   ```bash
   npm run backfill:owners
   ```

### Frontend Setup

1. **Start dev server**:
   ```bash
   cd frontend
   npm start
   ```
   App will run on `http://localhost:3000`

2. **Test public profiles**:
   - Navigate to `/o/owner-slug` to view owner profile
   - Navigate to `/v/visitor-slug` to view visitor profile
   - Click "Follow" button to toggle follow status

### Test Endpoints (using cURL or Postman)

```bash
# Get owner profile by slug
curl http://localhost:5000/api/v1/owner-profiles/john-doe

# Get owner timeline
curl http://localhost:5000/api/v1/owner-profiles/john-doe/timeline

# Check if current user follows this owner (requires Bearer token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/owner-profiles/OWNER_PROFILE_ID/is-following

# Follow an owner
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/owner-profiles/OWNER_PROFILE_ID/follow
```

---

## Files Created/Modified

### Backend

**Created:**
- `models/OwnerProfile.js`
- `models/OwnerFollow.js`
- `models/VisitorProfile.js`
- `models/VisitorFollow.js`
- `services/owner/ownerProfileService.js`
- `services/owner/ownerFollowService.js`
- `services/visitor/visitorProfileService.js`
- `services/visitor/visitorFollowService.js`
- `controllers/v1/ownerProfileController.js`
- `controllers/v1/visitorProfileController.js`
- `routes/v1/ownerProfiles.routes.js`
- `routes/v1/visitorProfiles.routes.js`
- `middleWare/rateLimit.js`
- `validators/profileValidators.js`
- `utils/slugify.js`
- `scripts/backfillOwnerProfiles.js`

**Modified:**
- `server.js` — Added v1 profile routes
- `services/feedService.js` — Added `attachIdentities` function
- `controllers/postController.js` — Calls `attachIdentities`
- `controllers/surveyController.js` — Calls `attachIdentities`
- `package.json` — Added `backfill:owners` script
- `services/owner/ownerProfileService.js` — Added `userId` to public profile select
- `services/visitor/visitorProfileService.js` — Added `userId` to public profile select

### Frontend

**Created:**
- `pages/PublicOwnerProfile.jsx`
- `pages/EditOwnerProfile.jsx`
- `pages/PublicVisitorProfile.jsx`

**Modified:**
- `App.js` — Added routes for public profiles and edit profile
- `components/FollowButton.jsx` — Updated to call v1 endpoints
- `components/Shared/IdentityBadge.jsx` — Links to profile pages
- `components/PostCard.jsx` — Uses IdentityBadge
- `components/SurveyCard.jsx` — Uses IdentityBadge and passes identity to FollowButton
- `visitor/components/FeedPostCard.jsx` — Uses identity for follow button

---

## Design Decisions

### 1. Separate Profile Models from User

- OwnerProfile/VisitorProfile are separate documents, linked via `userId`
- Allows flexible profile customization without modifying User model
- Simplifies future extensions (e.g., public/private profile toggles)

### 2. Edge Tables for Follows

- OwnerFollow and VisitorFollow track relationships via compound indexes
- Fast lookups and prevents duplicates via unique constraints
- Scales better than denormalization for large follow counts

### 3. Read-Time Identity Projection

- Identity is not denormalized into posts/surveys
- `attachIdentities` loads profiles at query time
- Pro: Single source of truth for identity data
- Con: Extra DB queries per feed item (future optimization: Redis cache)

### 4. v1 API Routes

- Separate from legacy `/follow/*` and `/api/*` endpoints
- Allows gradual migration without breaking existing clients
- Follows REST conventions and semantic versioning

### 5. In-Memory Rate Limiter

- Simple implementation for MVP
- **Note:** Not suitable for production / multi-server deployments
- **Future:** Replace with Redis-backed limiter (e.g., express-rate-limit + redis)

---

## Known Limitations & Future Improvements

### Current Limitations

1. **Rate Limiting:** In-memory store works only for single-process dev. Multi-process deployments need Redis.
2. **Identity Caching:** `attachIdentities` queries DB for each feed item. Cache with Redis for production scale.
3. **Timeline Pagination:** Basic page/size pagination; consider cursor-based for large timelines.
4. **Visitor Profile Timeline:** Currently only shows surveys. Could extend to show other activity types.

### Future Enhancements

1. **Caching Layer**
   - Cache profiles (30 min TTL) in Redis
   - Cache follow edges in memory or Redis
   - Use server-side caching headers for static content

2. **Search & Discovery**
   - Add full-text search for profiles (MongoDB Atlas Search or Elasticsearch)
   - Trending profiles/owners endpoint
   - Follow recommendations

3. **Profile Badges & Verification**
   - Verified owner badge (admin-assigned)
   - Featured profile boost (admin)
   - Profile completion % meter

4. **Activity Timeline**
   - Extend visitor timeline to include reviews, comments, etc.
   - Activity feed aggregation

5. **Notifications**
   - Notify when someone follows
   - Notify on new posts/surveys from followed profiles

6. **Analytics**
   - Profile views (tracking via ProfileVisit model if available)
   - Follow growth trends
   - Engagement metrics

---

## Testing Checklist

- [ ] Backend starts without errors on port 5000
- [ ] `GET /api/v1/owner-profiles/me` returns current owner's profile (auth required)
- [ ] `PUT /api/v1/owner-profiles/me` updates profile fields correctly
- [ ] `GET /api/v1/owner-profiles/:slug` returns public profile by slug
- [ ] `GET /api/v1/owner-profiles/:slug/timeline` returns posts + surveys sorted by date
- [ ] `POST /api/v1/owner-profiles/:id/follow` creates follow edge (auth required)
- [ ] `GET /api/v1/owner-profiles/:id/is-following` returns correct follow status (auth required)
- [ ] Frontend `/o/:slug` page loads and displays profile correctly
- [ ] Frontend `/owner/me/edit` page allows editing and saves changes
- [ ] Frontend `/v/:slug` page loads and displays visitor profile
- [ ] FollowButton toggles state and calls correct endpoint
- [ ] IdentityBadge links to correct profile page
- [ ] Feed items display author identity via IdentityBadge

---

## Troubleshooting

### Backend Won't Start

**Error:** "Unable to bind any port; exiting"
- **Cause:** Ports 5000-5009 already in use
- **Fix:** Kill existing Node processes: `Get-Process node | Stop-Process -Force`

**Error:** "MODULE_NOT_FOUND" on route require
- **Cause:** Incorrect relative paths in route files
- **Fix:** Check route requires are correct (e.g., `require('../asyncRouter')` from `routes/v1/`)

### Frontend Won't Load Profile

**Error:** 404 on profile page
- **Cause:** No profile found for given slug
- **Fix:** Ensure profile exists in DB; check slug matches exactly

**Error:** FollowButton not toggling state
- **Cause:** `targetId` or `targetType` is missing
- **Fix:** Verify identity object includes `profileId` and correct `type`

---

## Contact & Questions

For questions or additional requirements, refer to the original PRD or contact the development team.

**Implementation Date:** November 2025  
**Last Updated:** 2025-11-12

