# Profile v2 Implementation Plan

**Date:** November 12, 2025
**Status:** 🚧 In Progress

---

## Current Implementation Status

### ✅ Already Complete (90%)

The previous implementation delivered most of PRD v2 requirements:

| Feature | Status | Notes |
|---------|--------|-------|
| OwnerProfile model | ✅ | Has all required fields including `headerImageUrl`, `socialLinks` |
| VisitorProfile model | ✅ | Has core fields, missing `bannerUrl` and `socialLinks` |
| Handle & slug system | ✅ | Unique per role, auto-generated |
| Follow system | ✅ | OwnerFollow, VisitorFollow edge tables |
| Public profile routes | ✅ | `/o/:slug` and `/v/:slug` working |
| Edit profile (owner) | ✅ | Full edit page with avatar/header upload |
| Timeline endpoint | ✅ | Returns posts + surveys merged |
| Feed identity | ✅ | All posts/surveys show owner identity |
| Auto-creation | ✅ | Profiles created on first API call |
| Migration scripts | ✅ | Backfill scripts exist |

---

## Gaps to Fill (PRD v2)

### Backend (10%)

1. ❌ **VisitorProfile**: Add `bannerUrl` and `socialLinks` fields
2. ❌ **Timeline filtering**: Support `?tab=posts|surveys` query param
3. ❌ **About endpoint**: Return structured bio/links/counts for About tab

### Frontend (40%)

4. ❌ **ProfileTabs component**: Posts | Surveys | About navigation
5. ❌ **Tab routing**: Update public profiles to filter timeline by tab
6. ❌ **AboutCard component**: Display bio, links, counts, featured businesses
7. ❌ **VisitorProfileEditPage**: Create visitor edit page (clone of owner)
8. ❌ **Visitor Toolkit rename**: Change "Profile" nav item to "My Toolkit"
9. ❌ **Edit button**: Add to public profile header (only if viewing own profile)

### Error Handling & UX (10%)

10. ❌ **Error boundaries**: Wrap timeline, header, about in error boundaries
11. ❌ **profileIncomplete redirect**: If user has incomplete profile, redirect to edit
12. ❌ **Handle validation UI**: Show real-time "handle taken" errors

---

## Execution Sequence

### Step 1: Backend Model Updates (5 min)

**File:** `backend/models/VisitorProfile.js`

**Add:**
```javascript
bannerUrl: { type: String, default: '' },
socialLinks: {
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  website: { type: String, default: '' },
}
```

---

### Step 2: Timeline Tab Filtering (10 min)

**File:** `backend/controllers/v1/ownerProfileController.js`
**Update:** `getTimeline()` to support `?tab=posts|surveys|all`

**Logic:**
- `tab=posts` → return only posts
- `tab=surveys` → return only surveys
- `tab=all` or missing → return both (default)

**Same for:** `visitorProfileController.js`

---

### Step 3: Frontend - ProfileTabs Component (15 min)

**File:** `frontend/src/components/Shared/ProfileTabs.jsx`

**Props:**
```javascript
{
  activeTab: 'posts' | 'surveys' | 'about',
  onTabChange: (tab) => void,
  counts: { posts: number, surveys: number }
}
```

**Renders:**
```
[ Posts (12) | Surveys (5) | About ]
```

---

### Step 4: AboutCard Component (15 min)

**File:** `frontend/src/components/Shared/AboutCard.jsx`

**Displays:**
- Bio
- Social links (Twitter, Instagram, Website)
- Join date
- Follower/following counts
- Featured businesses (owner only)

---

### Step 5: Update PublicOwnerProfile (20 min)

**File:** `frontend/src/pages/PublicOwnerProfile.jsx`

**Changes:**
1. Add `ProfileTabs` component
2. Add state for `activeTab`
3. Filter timeline fetch by tab: `/timeline?tab=${activeTab}`
4. Render `AboutCard` when `activeTab === 'about'`
5. Add "Edit Profile" button if viewing own profile

---

### Step 6: Update PublicVisitorProfile (20 min)

**File:** `frontend/src/pages/PublicVisitorProfile.jsx`

**Same changes as owner profile**

---

### Step 7: Create VisitorProfileEditPage (20 min)

**File:** `frontend/src/pages/VisitorProfileEditPage.jsx`

**Clone from:** `EditOwnerProfile.jsx`
**Remove:** Featured businesses section
**Keep:** Name, handle, bio, avatar, banner, social links

---

### Step 8: Rename Visitor Profile → My Toolkit (10 min)

**Files to update:**
1. `frontend/src/visitor/layouts/VisitorLayout.jsx` - Navigation item
2. `frontend/src/App.js` - Route from `/visitor/profile` → `/visitor/toolkit`
3. `frontend/src/visitor/pages/VisitorProfile.jsx` - Rename file to `VisitorToolkit.jsx`

**Navigation:**
```javascript
{ label: 'My Toolkit', path: '/visitor/toolkit', icon: '🛠️' }
{ label: 'Profile', path: '/visitor/profile/edit', icon: '👤' } // New
```

---

### Step 9: Add Error Boundaries (15 min)

**Wrap these sections:**
- `<ProfileHeader />` in try-catch
- `<Timeline />` in ErrorBoundary
- `<AboutCard />` in ErrorBoundary

**Fallback:**
```jsx
<div className="error-block">
  <p>Failed to load this section</p>
  <button onClick={retry}>Retry</button>
</div>
```

---

### Step 10: Profile Incomplete Redirect (10 min)

**File:** `frontend/src/context/AuthContext.jsx`

**On login success:**
```javascript
if (user.profileIncomplete) {
  navigate(user.role === 'owner' ? '/owner/profile/edit' : '/visitor/profile/edit');
}
```

---

## Testing Checklist

### Backend
- [ ] VisitorProfile has bannerUrl and socialLinks
- [ ] Timeline with `?tab=posts` returns only posts
- [ ] Timeline with `?tab=surveys` returns only surveys
- [ ] Timeline with `?tab=all` returns both

### Frontend
- [ ] ProfileTabs component renders correctly
- [ ] Clicking tabs filters timeline
- [ ] AboutCard displays all info correctly
- [ ] Featured businesses show only for owners
- [ ] VisitorProfileEditPage works
- [ ] "My Toolkit" navigation item works
- [ ] Old `/visitor/profile` redirects to `/visitor/toolkit`
- [ ] Error boundaries prevent page crashes
- [ ] profileIncomplete redirects to edit page

### Integration
- [ ] Owner can edit profile → see changes on public page
- [ ] Visitor can edit profile → see changes on public page
- [ ] Follow counts update in About tab
- [ ] Social links are clickable and open in new tab
- [ ] Avatar/banner upload works for both roles

---

## Time Estimate

| Phase | Time |
|-------|------|
| Backend updates | 15 min |
| Frontend components | 50 min |
| Navigation & routing | 20 min |
| Error handling | 15 min |
| Testing | 30 min |
| **Total** | **~2 hours** |

---

## Next Action

Start with Step 1: Update VisitorProfile model
