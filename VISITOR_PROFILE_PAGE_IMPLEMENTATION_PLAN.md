# 🎯 VISITOR BUSINESS PROFILE PAGE — IMPLEMENTATION PLAN

**Date:** November 23, 2025
**Goal:** Implement world-class visitor profile page with 60-80% booking conversion rate
**Status:** Planning & Analysis Phase

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What Already Exists (No Duplication Needed)

#### **1. PublicProfile.jsx** (`frontend/src/pages/PublicProfile.jsx`)
**Current Route:** `/booking-profile/:slug`
**Purpose:** Public business profile with booking functionality
**Status:** ✅ WELL-IMPLEMENTED

**What It Has:**
- ✅ Hero section with cover photo + logo
- ✅ Verified badge (✓) for fully_verified businesses
- ✅ Open/Closed status indicator
- ✅ Rating display (⭐ X.X with count)
- ✅ Book Appointment CTA button
- ✅ **MessageButton component** (chat integration)
- ✅ **PromotionBanner component** (active promotions)
- ✅ Services grid with prices + duration
- ✅ Team/Staff section
- ✅ Gallery/Recent Work carousel
- ✅ ReviewList component integration
- ✅ Business hours + location
- ✅ SEO meta tags (Helmet)
- ✅ Lightbox for gallery images

**What's Missing from PRD:**
- ❌ Gold premium badge (currently only shows verified ✓)
- ❌ Sticky CTAs (Book Now, Message, Call)
- ❌ Masonry gallery layout (currently carousel)
- ❌ Before/After photo support
- ❌ "Book with [Stylist Name]" buttons on staff
- ❌ Free vs Premium visual differentiation
- ❌ Service-specific booking CTAs

---

#### **2. BusinessDetails.js** (`frontend/src/components/BusinessDetails.js`)
**Current Route:** `/business/:id`
**Purpose:** Legacy business detail page with reviews
**Status:** ⚠️ LEGACY - Should be deprecated or redirected

**What It Has:**
- Basic business info display
- Review submission form
- Average rating calculation

**Issues:**
- Uses business ID instead of slug
- Minimal styling
- No booking integration
- No premium features
- Should redirect to `/booking-profile/:slug`

---

#### **3. VisitorPage.js** (`frontend/src/components/VisitorPage.js`)
**Purpose:** Search/Browse listings page
**Status:** ✅ GOOD - Search functionality works

**What It Has:**
- Geo-based search
- Category filtering
- Distance sorting
- Business cards with ratings
- Links to `/business/:id` (should link to `/booking-profile/:slug`)

---

### 🔧 Existing Components (Reusable)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| `MessageButton` | `components/MessageButton.jsx` | Opens chat modal for premium businesses | ✅ Working |
| `PromotionBanner` | `components/promotions/PromotionBanner.jsx` | Shows active promotions | ✅ Working |
| `ReviewList` | `components/reviews/ReviewList.jsx` | Displays business reviews | ✅ Working |
| `PreBookingMessageModal` | `components/PreBookingMessageModal.jsx` | Chat modal | ✅ Working |

---

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: Enhance PublicProfile.jsx (Main Profile Page)**

**Goal:** Transform existing PublicProfile.jsx into the world-class 7-section page from the PRD.

#### **Section 1: Hero Enhancement** ✅→🔧

**Current:** Basic hero with cover, logo, verified badge, open status
**Target:** Premium hero with gold badge, sticky CTAs, trust signals

**Changes Needed:**
```jsx
// ADD: Premium gold badge (separate from verified)
{profile.listingType === 'premium' && (
  <span className="premium-badge">
    💎 Premium
  </span>
)}

// ADD: Sticky CTAs (Book, Message, Call)
<div className="sticky-cta-bar">
  <button onClick={handleBookNow}>📅 Book Now</button>
  <MessageButton businessId={profile._id} ... />
  <a href={`tel:${profile.contact?.phone}`}>📞 Call</a>
</div>
```

**New CSS:**
```css
.premium-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  color: #000;
}

.sticky-cta-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 24px;
  display: flex;
  gap: 12px;
  z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
}
```

---

#### **Section 2: Promotion Banner** ✅

**Status:** Already implemented via `<PromotionBanner />` component
**Action:** No changes needed

---

#### **Section 3: Services Grid Enhancement** ✅→🔧

**Current:** Services displayed with price + duration + generic "Book" button
**Target:** Each service has its own "Book Now" CTA

**Changes Needed:**
```jsx
// EXISTING (Lines 193-220):
<div className="premium-service-card">
  <h3>{service.name}</h3>
  <span>{service.duration} min</span>
  <span>${service.price}</span>
  <button onClick={() => handleBookNow(service._id)}>Book</button>
</div>

// ENHANCE: Make CTAs more prominent
<button
  className="service-book-btn-prominent"
  onClick={() => handleBookNow(service._id)}
>
  Book {service.name} - ${service.price}
</button>
```

---

#### **Section 4: Gallery Transformation** 🔧

**Current:** Horizontal carousel (`recent-work-carousel`)
**Target:** Masonry grid with before/after support

**New Component Needed:**
```jsx
// components/MasonryGallery.jsx
const MasonryGallery = ({ photos, isPremium }) => {
  const freeLimit = 3;
  const displayPhotos = isPremium ? photos : photos.slice(0, freeLimit);

  return (
    <div className="masonry-gallery">
      {displayPhotos.map((photo, idx) => (
        <div key={idx} className="masonry-item">
          <img src={photo.url} alt={photo.caption} onClick={() => openLightbox(photo)} />
          {photo.isBeforeAfter && (
            <div className="before-after-label">Before/After</div>
          )}
        </div>
      ))}
      {!isPremium && photos.length > freeLimit && (
        <div className="gallery-upgrade-overlay">
          <p>🔒 {photos.length - freeLimit} more photos</p>
          <p>Premium businesses show full gallery</p>
        </div>
      )}
    </div>
  );
};
```

**CSS:**
```css
.masonry-gallery {
  column-count: 3;
  column-gap: 16px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  position: relative;
  cursor: pointer;
}

@media (max-width: 768px) {
  .masonry-gallery { column-count: 2; }
}
```

---

#### **Section 5: Reviews Enhancement** ✅→🔧

**Current:** ReviewList component integration
**Target:** Big gold rating + photo reviews priority

**Changes Needed:**
```jsx
// ADD: Rating summary banner before review list
<div className="rating-summary-banner">
  <div className="rating-large">
    <span className="rating-number">{profile.rating.average.toFixed(1)}</span>
    <span className="rating-stars">{"⭐".repeat(Math.round(profile.rating.average))}</span>
  </div>
  <div className="rating-meta">
    <p>{profile.rating.count} reviews</p>
    <p>4.7+ rating converts 3× better</p>
  </div>
</div>

<ReviewList
  reviews={profile.reviews}
  prioritizePhotoReviews={true}
/>
```

---

#### **Section 6: Staff/Team Enhancement** ✅→🔧

**Current:** Team cards with photo, name, role
**Target:** "Book with [Name]" CTAs

**Changes Needed:**
```jsx
// EXISTING (Lines 223-246):
<div className="team-card">
  <img src={member.photoUrl} alt={member.name} />
  <h4>{member.name}</h4>
  <p>{member.role}</p>
</div>

// ENHANCE: Add booking CTA
<div className="team-card">
  <img src={member.photoUrl} alt={member.name} />
  <h4>{member.name}</h4>
  <p>{member.role}</p>
  {member.specialty && <p className="specialty">Specialty: {member.specialty}</p>}
  <button onClick={() => handleBookWithStaff(member._id)}>
    Book with {member.name.split(' ')[0]}
  </button>
</div>
```

---

#### **Section 7: Hours + Map** ✅

**Status:** Already exists in PublicProfile.jsx (below reviews)
**Action:** Ensure it's styled prominently with:
- Open/Closed status
- Full weekly hours
- Google Maps embed or directions link

---

### **Phase 2: Free vs Premium Differentiation** 🆕

**Goal:** Visitors see clear visual difference between free and premium businesses.

**Backend Enhancement Needed:**
```javascript
// backend/routes/publicProfile.js (or wherever profile API is)

// ENSURE listingType is returned in public profile response:
const profile = {
  ...businessData,
  listingType: business.listingType, // 'free' or 'premium'
  isPremium: business.listingType === 'premium' && business.premiumSubscription?.active
};
```

**Frontend Display Logic:**
```jsx
// PublicProfile.jsx

const isPremium = profile.listingType === 'premium' && profile.premiumSubscription?.active;
const isFree = profile.listingType === 'free';

// Gallery
<MasonryGallery
  photos={profile.photos}
  isPremium={isPremium}
  freeLimit={3}
/>

// Message Button
{isPremium ? (
  <MessageButton businessId={profile._id} businessName={profile.name} isPremium={true} />
) : (
  <div className="free-listing-notice">
    <p>💬 This business has a free listing and cannot reply to messages.</p>
    <p>Premium businesses can chat with you directly.</p>
  </div>
)}

// Premium Badge
{isPremium && (
  <div className="premium-badge-hero">
    💎 Premium Business
  </div>
)}
```

---

### **Phase 3: Pay-to-Chat Logic (Visitor Chat Subscription)** 🆕

**PRD Requirement:** Visitors pay $9.99/mo for unlimited chat with premium businesses.

**Implementation:**

#### **A. Backend - Visitor Chat Subscription Model**

**New Model:**
```javascript
// backend/models/VisitorChatSubscription.js

const VisitorChatSubscriptionSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  price: { type: Number, default: 9.99 },
  billingCycle: { type: String, default: 'monthly' }
}, { timestamps: true });

module.exports = mongoose.model('VisitorChatSubscription', VisitorChatSubscriptionSchema);
```

#### **B. Entitlements Logic**

**New File:**
```javascript
// backend/lib/entitlements.js

const VisitorChatSubscription = require('../models/VisitorChatSubscription');

/**
 * Check if visitor can send a new message to a business
 */
exports.canSendMessage = async (visitorId, businessId) => {
  // First message is always free (to hook them in)
  const thread = await ChatThread.findOne({ visitorId, businessId });
  if (!thread || thread.messages.length === 0) {
    return { allowed: true, reason: 'first_message_free' };
  }

  // Check if visitor has active chat subscription
  const subscription = await VisitorChatSubscription.findOne({
    visitorId,
    status: 'active',
    endDate: { $gt: new Date() }
  });

  if (subscription) {
    return { allowed: true, reason: 'has_subscription' };
  }

  return {
    allowed: false,
    reason: 'subscription_required',
    message: 'Subscribe for $9.99/mo to chat with unlimited businesses'
  };
};

/**
 * Check if visitor can read owner replies
 */
exports.canReadReply = async (visitorId, threadId) => {
  const thread = await ChatThread.findById(threadId);

  // If no owner replies yet, can read everything
  const ownerReplies = thread.messages.filter(m => m.senderId.toString() === thread.businessOwnerId.toString());
  if (ownerReplies.length === 0) {
    return { allowed: true, reason: 'no_replies_yet' };
  }

  // Check subscription
  const subscription = await VisitorChatSubscription.findOne({
    visitorId,
    status: 'active'
  });

  if (subscription) {
    return { allowed: true, reason: 'has_subscription' };
  }

  return {
    allowed: false,
    reason: 'subscription_required',
    blurredCount: ownerReplies.length
  };
};
```

#### **C. Frontend - Paywall UI**

**Update MessageButton.jsx:**
```jsx
// components/MessageButton.jsx

const MessageButton = ({ businessId, businessName, isPremium }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleMessageClick = async () => {
    if (!user) {
      // Not logged in - prompt login
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    // Check if visitor can send message
    const { data } = await axios.get(`/api/v1/chat/can-send/${businessId}`);

    if (data.allowed) {
      setShowModal(true);
    } else {
      setShowPaywall(true); // Show $9.99/mo subscription modal
    }
  };

  return (
    <>
      <button onClick={handleMessageClick}>💬 Send Message</button>

      {showModal && <PreBookingMessageModal ... />}

      {showPaywall && (
        <ChatSubscriptionPaywall
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
        />
      )}
    </>
  );
};
```

**New Component:**
```jsx
// components/ChatSubscriptionPaywall.jsx

const ChatSubscriptionPaywall = ({ onClose, onSubscribe }) => {
  return (
    <div className="paywall-modal">
      <div className="paywall-content">
        <h2>💬 Unlimited Chat Access</h2>
        <p>Chat with any premium business on SalonHub</p>

        <div className="paywall-features">
          <div>✅ Message unlimited businesses</div>
          <div>✅ Read all replies instantly</div>
          <div>✅ Get booking confirmations via chat</div>
          <div>✅ Cancel anytime</div>
        </div>

        <div className="paywall-price">
          <span className="price">$9.99</span>
          <span className="period">/month</span>
        </div>

        <button className="paywall-cta" onClick={onSubscribe}>
          Subscribe & Start Chatting
        </button>

        <button className="paywall-close" onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};
```

---

### **Phase 4: Deprecate Legacy Routes** 🗑️

**Current Issue:** Two different routes for business profiles:
- ✅ `/booking-profile/:slug` (PublicProfile.jsx) - KEEP
- ❌ `/business/:id` (BusinessDetails.js) - REDIRECT

**Action:**
```jsx
// App.js - Add redirect
<Route
  path="/business/:id"
  element={<LegacyBusinessRedirect />}
/>

// components/LegacyBusinessRedirect.jsx
const LegacyBusinessRedirect = () => {
  const { id } = useParams();
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    // Fetch business by ID and get its slug
    axios.get(`/api/v1/businesses/${id}`)
      .then(res => setSlug(res.data.slug))
      .catch(() => navigate('/'));
  }, [id]);

  if (!slug) return <div>Redirecting...</div>;

  return <Navigate to={`/booking-profile/${slug}`} replace />;
};
```

**Update VisitorPage.js links:**
```jsx
// OLD:
<Link to={`/business/${biz._id}`}>View Details</Link>

// NEW:
<Link to={`/booking-profile/${biz.slug}`}>View Details</Link>
```

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: PublicProfile.jsx Enhancements** (3-5 hours)
- [ ] Add premium gold badge to hero
- [ ] Implement sticky CTA bar (Book, Message, Call)
- [ ] Create MasonryGallery component
- [ ] Add before/after photo support
- [ ] Enhance rating summary banner
- [ ] Add "Book with [Stylist]" to team cards
- [ ] Style free vs premium differentiation

### **Phase 2: Pay-to-Chat System** (6-8 hours)
- [ ] Create VisitorChatSubscription model
- [ ] Implement entitlements.js logic
- [ ] Create ChatSubscriptionPaywall component
- [ ] Update MessageButton with paywall check
- [ ] Add Stripe checkout for $9.99/mo subscription
- [ ] Implement blurred message UI for non-subscribers
- [ ] Add subscription management page for visitors

### **Phase 3: Cleanup & Optimization** (2-3 hours)
- [ ] Deprecate BusinessDetails.js
- [ ] Create LegacyBusinessRedirect component
- [ ] Update all links in VisitorPage.js
- [ ] Test all routes work correctly
- [ ] Update backend to ensure listingType is returned
- [ ] Add free listing notice for non-premium businesses

### **Phase 4: Testing & Validation** (2-3 hours)
- [ ] Test booking flow for premium businesses
- [ ] Test chat flow with and without subscription
- [ ] Test free vs premium visual differentiation
- [ ] Test sticky CTAs on mobile + desktop
- [ ] Verify promotions banner shows correctly
- [ ] Check gallery works with 3+ photos (free) vs unlimited (premium)
- [ ] Measure page load time (<2 seconds target)

---

## 🎯 SUCCESS METRICS (Post-Launch)

| Metric | Current (Estimated) | Target | Measurement |
|--------|---------------------|--------|-------------|
| Booking conversion rate | ~30% | >65% | Analytics: (Bookings / Profile Views) |
| Chat subscription conversion | N/A | >70% | (Subscriptions / Paywall Shows) |
| Avg time to action | ~15s | <8s | Time from page load to CTA click |
| Bounce rate | ~40% | <25% | Google Analytics |
| Premium owner retention | ~85% | >95% | Churn rate tracking |

---

## 🚨 CRITICAL DEPENDENCIES

### **Backend APIs That Must Exist:**
1. ✅ `GET /api/v1/public/profile/:slug` - Returns full business profile
2. ✅ `GET /api/v1/businesses/:id` - Get business by ID (for redirect)
3. ⚠️ `GET /api/v1/chat/can-send/:businessId` - Check visitor entitlement (NEW)
4. ⚠️ `POST /api/v1/chat/subscribe` - Create visitor chat subscription (NEW)
5. ⚠️ `GET /api/v1/chat/subscription/status` - Check visitor subscription (NEW)

### **Existing Components to Reuse:**
- ✅ MessageButton.jsx
- ✅ PromotionBanner.jsx
- ✅ ReviewList.jsx
- ✅ PreBookingMessageModal.jsx

### **New Components to Create:**
- ❌ MasonryGallery.jsx
- ❌ ChatSubscriptionPaywall.jsx
- ❌ LegacyBusinessRedirect.jsx
- ❌ RatingSummaryBanner.jsx (optional, can be inline)

---

## 📂 FILE STRUCTURE

```
frontend/src/
├── pages/
│   ├── PublicProfile.jsx ⬅️ MAIN FILE TO ENHANCE
│   └── PublicBooking.jsx ✅ (already exists)
│
├── components/
│   ├── MessageButton.jsx ⬅️ UPDATE WITH PAYWALL CHECK
│   ├── MasonryGallery.jsx ⬅️ CREATE NEW
│   ├── ChatSubscriptionPaywall.jsx ⬅️ CREATE NEW
│   ├── LegacyBusinessRedirect.jsx ⬅️ CREATE NEW
│   ├── PromotionBanner.jsx ✅
│   ├── ReviewList.jsx ✅
│   └── PreBookingMessageModal.jsx ✅
│
├── styles/
│   └── publicProfile.css ⬅️ ENHANCE WITH NEW STYLES
│
backend/
├── models/
│   └── VisitorChatSubscription.js ⬅️ CREATE NEW
│
├── lib/
│   └── entitlements.js ⬅️ CREATE NEW
│
├── routes/
│   └── chatRoutes.js ⬅️ ADD SUBSCRIPTION ENDPOINTS
```

---

## 💡 KEY INSIGHTS FROM ANALYSIS

### **What We DON'T Need to Build:**
1. ✅ Basic public profile page (PublicProfile.jsx is already good)
2. ✅ Booking integration (PublicBooking.jsx works)
3. ✅ Chat system (MessageButton + PreBookingMessageModal exist)
4. ✅ Promotions (PromotionBanner component works)
5. ✅ Reviews (ReviewList component works)

### **What We DO Need to Build:**
1. ❌ Sticky CTAs (Book, Message, Call) - Always visible
2. ❌ Masonry gallery with free/premium differentiation
3. ❌ Premium gold badge visual
4. ❌ Pay-to-chat subscription system ($9.99/mo for visitors)
5. ❌ Paywall modal for chat
6. ❌ Free listing notice ("This business can't reply to messages")
7. ❌ Staff booking CTAs ("Book with Sarah")

---

## 🔥 RECOMMENDED EXECUTION ORDER

### **Sprint 1: Visual Enhancements** (Day 1-2)
Focus on making PublicProfile.jsx look world-class:
1. Add sticky CTA bar
2. Implement premium badge
3. Create masonry gallery
4. Style free vs premium differentiation
5. Enhance services grid CTAs

### **Sprint 2: Pay-to-Chat System** (Day 3-4)
Build the visitor subscription monetization:
1. Create backend models + entitlements
2. Build paywall UI
3. Integrate Stripe checkout
4. Test subscription flow

### **Sprint 3: Cleanup & Optimization** (Day 5)
Polish and test:
1. Deprecate old routes
2. Update all links
3. Test all flows
4. Measure performance
5. Launch

---

## ✅ FINAL VERDICT

**Your existing codebase is 70% there!**

The PublicProfile.jsx page already has:
- Hero section ✅
- Promotions ✅
- Services ✅
- Gallery ✅
- Reviews ✅
- Team ✅
- Hours/Map ✅
- Chat integration ✅

**You just need to:**
1. Enhance visuals (sticky CTAs, premium badge, masonry gallery)
2. Add pay-to-chat subscription for visitors
3. Differentiate free vs premium businesses
4. Clean up legacy routes

**Estimated Total Effort:** 13-19 hours (2-3 days)

**Zero duplicate files needed** - We're enhancing what exists!

---

**Generated:** November 23, 2025
**Status:** Ready for approval to proceed with implementation
