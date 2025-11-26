# 🎯 Personal vs Business Profile - Complete Separation

**Date:** November 25, 2025
**Status:** 🚧 Being Implemented

---

## 🧑 The Problem (Current State)

**WRONG:**
When owner clicks "Edit Profile" → Opens "Edit Business Profile" modal
→ Shows business logo, business name, tagline, professional summary
→ This is CONFUSING because the owner's **personal profile** (Nitesh Siwakoti @nitesh) is different from **business profile** (Nites Salon @nites
)

---

## ✅ The Solution (Correct Architecture)

### Two Completely Separate Things:

```
┌────────────────────────────────────────────────────────────────┐
│         1. PERSONAL PROFILE (The Human / Owner)                │
├────────────────────────────────────────────────────────────────┤
│  Database: OwnerProfile collection                             │
│  Route: /owner/profile/me                                      │
│  Edit Modal: "Edit Your Profile" (purple glow-up style)       │
│                                                                │
│  Shows:                                                        │
│  - Personal avatar (round photo)                               │
│  - Full name: Nitesh Siwakoti                                  │
│  - Personal @handle: @nitesh                                   │
│  - Personal bio: "I am a hairstylist passionate about..."     │
│  - Personal social links (Instagram, TikTok of the person)    │
│  - Stats: followers, following, posts                          │
│                                                                │
│  This appears in:                                              │
│  - Top bar of owner dashboard                                  │
│  - When other owners/visitors view their personal profile     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│       2. BUSINESS PROFILE (The Salon / Business Entity)        │
├────────────────────────────────────────────────────────────────┤
│  Database: Business collection                                 │
│  Route: /business/:businessId or /owner/business/me            │
│  Edit Modal: "Edit Business Profile" (white business style)   │
│                                                                │
│  Shows:                                                        │
│  - Business logo (square/rounded square)                       │
│  - Business name: Nites Salon                                  │
│  - Business @handle: @nites
                                 │
│  - Tagline: "Top Salon in Dallas"                             │
│  - Professional summary: "We specialize in..."                 │
│  - Business social links (salon's Instagram, YouTube)          │
│  - Services, gallery, location, booking (later)               │
│                                                                │
│  This appears in:                                              │
│  - "My Business" section on owner dashboard                    │
│  - Public directory (what clients see)                         │
│  - Featured Businesses section                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture

### OwnerProfile (Personal)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  // ✅ PERSONAL IDENTITY
  firstName: "Nitesh",
  lastName: "Siwakoti",
  displayName: "Nitesh Siwakoti",
  handle: "nitesh",  // @nitesh
  slug: "nitesh-siwakoti",
  avatarUrl: "https://.../personal-avatar.jpg",
  headerImageUrl: "https://.../personal-header.jpg",

  // ✅ PERSONAL INFO
  bio: "I am a passionate hairstylist...",  // Personal bio
  title: "Master Stylist",  // Personal title

  // ✅ PERSONAL SOCIAL LINKS
  socialLinks: {
    instagram: "@nitesh",  // Personal Instagram
    tiktok: "@nitesh",
    twitter: "@nitesh"
  },

  // ✅ PERSONAL STATS
  counts: {
    posts: 0,
    followers: 0,
    following: 0,
    surveys: 0
  },

  // ✅ REFERENCES TO BUSINESSES OWNED
  featuredBusinesses: [ObjectId, ObjectId],  // Array of Business IDs

  verified: false,
  premium: false
}
```

### Business (Salon/Spa/Shop)
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),  // Who owns this business

  // ✅ BUSINESS IDENTITY
  name: "Nites Salon",
  slug: "nites-salon",
  handle: "nites",  // @nitess
  logoUrl: "https://.../business-logo.jpg",  // Square logo
  bannerUrl: "https://.../business-banner.jpg",

  // ✅ BUSINESS INFO
  tagline: "Top Salon in Dallas",
  description: "We specialize in braids, weaves, and natural hair...",
  category: "Salon",

  // ✅ BUSINESS SOCIAL LINKS
  socialLinks: {
    instagram: "@nites_salon",  // Business Instagram
    tiktok: "@nites_salon",
    youtube: "youtube.com/c/nites_salon"
  },

  // ✅ LOCATION
  address: "123 Main St",
  city: "Dallas",
  state: "TX",
  zip: "75001",

  // ✅ BUSINESS DETAILS
  services: [{name: "Braids", price: 50, duration: 60}],
  images: ["gallery1.jpg", "gallery2.jpg"],
  specialties: ["Braids", "Natural Hair"],

  // ✅ STATUS
  moderationStatus: "APPROVED",
  status: "approved",

  // ✅ BUSINESS STATS
  stats: {
    views: 0,
    bookings: 0,
    reviews: []
  }
}
```

---

## 🎨 Frontend Components

### Current (WRONG):
```jsx
// ProfilePage.jsx - Owner's dashboard
<button onClick={openEditModal}>
  Edit Profile  ← Opens BUSINESS edit modal ❌
</button>
```

### New (CORRECT):
```jsx
// ProfilePage.jsx - Owner's dashboard

{/* TOP SECTION - PERSONAL PROFILE */}
<div className="owner-personal-section">
  <img src={ownerProfile.avatarUrl} />
  <h2>{ownerProfile.displayName}</h2>
  <p>@{ownerProfile.handle}</p>
  <p>{ownerProfile.bio}</p>

  <button onClick={() => setShowPersonalEditModal(true)}>
    ✏️ Edit Profile  ← Opens PERSONAL edit modal ✅
  </button>
</div>

{/* BOTTOM SECTION - MY BUSINESS(ES) */}
<div className="my-business-section">
  <h3>My Business</h3>

  {businesses.map(business => (
    <BusinessCard key={business._id} business={business} />
  ))}

  <button onClick={() => setShowBusinessEditModal(true)}>
    🏢 Edit Business Profile  ← Opens BUSINESS edit modal ✅
  </button>

  <button onClick={() => setShowCreateBusinessModal(true)}>
    ➕ Create New Business
  </button>
</div>

{/* MODALS */}
{showPersonalEditModal && (
  <EditPersonalProfileModal  // ← Purple glow-up style
    profile={ownerProfile}
    onClose={() => setShowPersonalEditModal(false)}
  />
)}

{showBusinessEditModal && (
  <EditBusinessProfileModal  // ← White business style
    business={selectedBusiness}
    onClose={() => setShowBusinessEditModal(false)}
  />
)}
```

---

## 🛣️ API Routes

### Personal Profile Routes
```
GET    /api/v1/owner-profiles/me           → Get owner's PERSONAL profile
PUT    /api/v1/owner-profiles/me           → Update PERSONAL info
POST   /api/v1/owner-profiles/me/upload    → Upload PERSONAL avatar/header
GET    /api/v1/owner-profiles/:slug        → Public view of PERSONAL profile
```

### Business Profile Routes
```
GET    /api/v1/businesses/my-businesses     → Get all businesses owned by user
GET    /api/v1/businesses/:id               → Get specific business
POST   /api/v1/businesses                   → Create new business
PUT    /api/v1/businesses/:id               → Update business info
POST   /api/v1/businesses/:id/upload        → Upload business logo/banner
DELETE /api/v1/businesses/:id               → Delete business
```

---

## 📋 Implementation Checklist

### Phase 1: Backend Separation ✅ (Already Done!)
- [x] OwnerProfile model exists (personal)
- [x] Business model exists (business)
- [x] Separate collections in MongoDB

### Phase 2: API Endpoints (New)
- [ ] Create `GET /api/v1/businesses/my-businesses` controller
- [ ] Create `POST /api/v1/businesses` controller (create business)
- [ ] Create `PUT /api/v1/businesses/:id` controller (update business)
- [ ] Create `POST /api/v1/businesses/:id/upload` controller (logo/banner)
- [ ] Update OwnerProfile routes to be PERSONAL-only

### Phase 3: Frontend Components (New)
- [ ] Create `EditPersonalProfileModal.jsx` (purple glow-up style)
  - Fields: firstName, lastName, personalHandle, personalAvatar, personalBio, personalSocialLinks
- [ ] Create/Update `EditBusinessProfileModal.jsx` (white business style)
  - Fields: businessName, businessHandle, logo, tagline, description, businessSocialLinks
- [ ] Create `MyBusinessSection.jsx` component for dashboard
- [ ] Create `BusinessCard.jsx` preview component

### Phase 4: Owner Dashboard Update
- [ ] Split ProfilePage.jsx into two sections:
  - Top: Personal profile with "Edit Profile" button
  - Bottom: "My Business" with "Edit Business Profile" button
- [ ] Show featured businesses from `ownerProfile.featuredBusinesses`
- [ ] Add "Create New Business" flow

---

## 🎯 User Flow (Correct)

### Flow 1: Edit Personal Info
```
1. Owner Dashboard → Top section shows: Nitesh Siwakoti @nitesh
2. Click "✏️ Edit Profile" button
3. Opens EditPersonalProfileModal (purple style)
4. Can edit:
   - First name: Nitesh
   - Last name: Siwakoti
   - Handle: @nitesh
   - Avatar (round photo)
   - Personal bio
   - Personal social links
5. Save → PUT /api/v1/owner-profiles/me
6. Modal closes → Personal info updated
```

### Flow 2: Edit Business Info
```
1. Owner Dashboard → Bottom section shows: Nites Salon @nites

2. Click "🏢 Edit Business Profile" button
3. Opens EditBusinessProfileModal (white style)
4. Can edit:
   - Business name: Nites Salon
   - Handle: @nites

   - Logo (square)
   - Tagline
   - Professional summary
   - Business social links
   - Services, gallery (later)
5. Save → PUT /api/v1/businesses/{businessId}
6. Modal closes → Business info updated
```

### Flow 3: Create New Business
```
1. Owner Dashboard → "My Business" section
2. Click "➕ Create New Business"
3. Opens CreateBusinessModal
4. Fill in business details
5. Save → POST /api/v1/businesses
6. New business appears in "My Business" section
7. Gets added to ownerProfile.featuredBusinesses
```

---

## 🚫 What Should NEVER Happen

❌ Personal avatar should NOT appear on business listing
❌ Business logo should NOT appear on personal profile
❌ Personal @handle should NOT be same as business @handle
❌ Personal bio should NOT be same as business description
❌ Clicking "Edit Profile" should NOT open business edit modal
❌ Personal social links should NOT be same as business social links

---

## 🎓 Real-World Example

### Example: Nitesh (Owner)

**Personal Profile (OwnerProfile):**
```
Name: Nitesh Siwakoti
Handle: @nitesh
Avatar: Nitesh's photo (round)
Bio: "Master stylist with 10 years experience. Love natural hair!"
Instagram: @nitesh_hairstylist (personal account)
```

**Business Profile 1 (Business):**
```
Name: Nites Salon
Handle: @nites
_salon
Logo: Salon logo (square)
Tagline: "Top Salon in Dallas"
Description: "Specializing in braids, weaves, and natural hair care..."
Instagram: @nites
_salon (business account)
Location: Dallas, TX
```

**Business Profile 2 (Business):**
```
Name: Bella Braids Boutique
Handle: @bella_braids
Logo: Boutique logo (square)
Tagline: "Premium Braiding Studio"
Description: "Luxury braiding experience..."
Instagram: @bella_braids (business account)
Location: Fort Worth, TX
```

→ Nitesh (1 person) owns 2 businesses (Nites Salon + Bella Braids)
→ Each business has its own logo, handle, social links
→ Personal profile is separate from all business profiles

---

## 📊 Component Breakdown

### EditPersonalProfileModal.jsx (NEW)
```jsx
// Purple/glow-up style modal
<Modal title="Edit Your Profile">
  <AvatarUploader
    label="Profile Photo"
    shape="circle"
    current={profile.avatarUrl}
    onUpload={(url) => handleUpload('avatar', url)}
  />

  <Input label="First Name" value={firstName} />
  <Input label="Last Name" value={lastName} />
  <Input label="Handle" prefix="@" value={handle} />
  <Textarea label="Bio" value={bio} maxLength={1000} />

  <SocialLinksEditor
    label="Personal Social Links"
    links={socialLinks}
  />

  <Button onClick={savePersonalProfile}>
    Save Profile
  </Button>
</Modal>
```

### EditBusinessProfileModal.jsx (UPDATE)
```jsx
// White/business style modal
<Modal title="Edit Business Profile">
  <AvatarUploader
    label="Business Logo"
    shape="square"
    current={business.logoUrl}
    onUpload={(url) => handleUpload('logo', url)}
  />

  <Input label="Business Name" value={name} />
  <Input label="Handle" prefix="@" value={handle} />
  <Input label="Tagline" value={tagline} />
  <Textarea label="Professional Summary" value={description} />

  <SocialLinksEditor
    label="Business Social Links"
    links={socialLinks}
  />

  <LocationEditor address={address} city={city} state={state} />

  <Button onClick={saveBusinessProfile}>
    Save Business Profile
  </Button>
</Modal>
```

---

## ✅ Success Criteria

When implementation is complete:

1. ✅ Owner dashboard shows TWO clear sections:
   - Personal profile (top)
   - My Business (bottom)

2. ✅ Clicking "Edit Profile" opens PERSONAL edit modal (purple)

3. ✅ Clicking "Edit Business Profile" opens BUSINESS edit modal (white)

4. ✅ Personal avatar is round, business logo is square

5. ✅ Personal @handle is different from business @handle

6. ✅ Can create multiple businesses under one owner

7. ✅ Each business has independent info (logo, handle, social links)

8. ✅ Zero confusion between personal and business profiles

---

## 🚀 Migration Plan

### Step 1: Create New Components (Frontend)
1. Create `EditPersonalProfileModal.jsx`
2. Update `EditBusinessProfileModal.jsx` to remove personal fields
3. Create `MyBusinessSection.jsx`
4. Create `BusinessCard.jsx`

### Step 2: Create New API Endpoints (Backend)
1. Add business routes to `server.js`
2. Create `backend/routes/v1/businesses.routes.js`
3. Create `backend/controllers/v1/businessController.js`
4. Use existing `Business` model

### Step 3: Update Owner Dashboard (Frontend)
1. Modify `ProfilePage.jsx` to show two sections
2. Add state for both modals: `showPersonalEdit`, `showBusinessEdit`
3. Fetch businesses: `GET /api/v1/businesses/my-businesses`
4. Wire up both edit buttons correctly

### Step 4: Test Complete Flow
1. Test editing personal profile
2. Test editing business profile
3. Test creating new business
4. Verify data saves to correct collections

---

## 🎓 Summary

**Before (Wrong):**
- One confusing "Edit Profile" button
- Opens business edit modal for personal profile
- Mixed personal and business info

**After (Correct):**
- Two clear sections: Personal + My Business
- "Edit Profile" → Personal modal (purple)
- "Edit Business Profile" → Business modal (white)
- Complete separation, zero confusion

**Database:**
- `ownerprofiles` collection → Personal info
- `businesses` collection → Business info
- Clean, scalable architecture

**This is how Instagram works:**
- Personal account (@nitesh)
- Business accounts (@nites_salon, @bella_braids)
- Each has separate profile, separate edit flow
