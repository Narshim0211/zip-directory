# 🧪 Business Profile V2 - Testing Guide

**Quick Start:** Test the world-class business profile page you just built!

---

## 🚀 How to Test

### **1. Start Your Servers**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### **2. Create/Update a Test Business**

You need a business with `bookingSlug` and `isPublicProfileActive: true`

**Option A:** Use existing business from your database

**Option B:** Create test business via Owner Dashboard at `http://localhost:3000/owner/my-business`

---

## 📋 Test Scenarios

### **Test 1: Basic Profile (Minimal Data)**

**Setup:**
- Business with just name, city, cover photo
- No promotions
- No team
- No hours

**Expected Result:**
- ✅ Hero shows with name and location
- ✅ No verified badge (not verified)
- ✅ No "Open Now" pill (no hours)
- ✅ Services section shows
- ✅ Gallery shows
- ✅ Contact shows
- ✅ Hours section **hidden** (no data)
- ✅ Team section **hidden** (no data)
- ✅ Promotions banner **hidden** (no data)

**How to Test:**
```
Visit: http://localhost:3000/booking-profile/YOUR_SLUG
```

---

### **Test 2: Verified Business with Hours**

**Setup (via MongoDB or Owner Dashboard):**
```javascript
{
  verificationStatus: "fully_verified",
  isOpenNow: true,
  hours: {
    mon: "9:00-18:00",
    tue: "9:00-18:00",
    wed: "9:00-18:00",
    thu: "9:00-18:00",
    fri: "9:00-18:00",
    sat: "10:00-16:00",
    sun: "Closed"
  }
}
```

**Expected Result:**
- ✅ **Gold verified badge** appears next to business name (pulsing animation)
- ✅ **Green "Open Now" pill** shows (if currently within hours)
- ✅ **Hours section** appears at bottom
- ✅ **Today is highlighted** in blue
- ✅ Closed days show "Closed"

**Visual Check:**
```
Hero: Business Name ✓ | 🟢 Open Now | 📍 Dallas, TX
Hours Table: Today's row has blue background
```

---

### **Test 3: Business with Team**

**Setup (add staff via Owner Dashboard or MongoDB):**
```javascript
{
  staff: [
    {
      name: "Sarah Johnson",
      role: "Senior Hair Stylist",
      photoUrl: "https://example.com/photo.jpg",
      isActive: true
    },
    {
      name: "Mike Chen",
      role: "Color Specialist",
      photoUrl: null,  // Test placeholder
      isActive: true
    }
  ]
}
```

**Expected Result:**
- ✅ **Team section** appears after Services
- ✅ **Horizontal scroll** on mobile
- ✅ Sarah's photo loads
- ✅ Mike shows **gradient placeholder with "M"**
- ✅ Roles display under names
- ✅ Cards lift on hover

**Visual Check:**
```
Team cards scroll horizontally
Circle photos with blue border
Hover = card lifts + shadow appears
```

---

### **Test 4: Active Promotion**

**Setup (add promotion via MongoDB):**
```javascript
{
  promotions: [
    {
      title: "First-Time Client Special",
      description: "Get 20% off your first visit this month",
      discountPercent: 20,
      startDate: new Date("2025-11-01"),
      endDate: new Date("2025-12-31"),
      isActive: true
    }
  ]
}
```

**Expected Result:**
- ✅ **Pink gradient banner** appears below hero
- ✅ Shows: 🎁 icon + title + description
- ✅ **"Save 20%" badge** displays
- ✅ **"Book Now →" button** works
- ✅ Banner is **responsive** (stacks on mobile)

**Visual Check:**
```
Pink banner with white text
Promo badge: "Save 20%"
Book Now button (white with pink text)
```

---

### **Test 5: Expired Promotion (Auto-Hide)**

**Setup:**
```javascript
{
  promotions: [
    {
      title: "Black Friday Deal",
      discountPercent: 50,
      startDate: new Date("2025-11-24"),
      endDate: new Date("2025-11-25"), // Past date
      isActive: true
    }
  ]
}
```

**Expected Result:**
- ✅ **Promotions banner does NOT show** (auto-filtered by API)
- ✅ Page loads normally without promotion
- ✅ No empty space where banner would be

**How It Works:**
```javascript
// Backend filters expired promotions automatically
const now = new Date();
const activePromotions = promotions.filter(promo =>
  new Date(promo.startDate) <= now &&
  new Date(promo.endDate) >= now
);
```

---

### **Test 6: Complete Profile (All Features)**

**Setup:** Business with:
- ✅ Verified status
- ✅ Cover photo + logo
- ✅ Hours (open now)
- ✅ 3+ team members
- ✅ Active promotion
- ✅ 5+ services
- ✅ 10+ gallery photos
- ✅ Contact info

**Expected Result:**
- ✅ **Hero:** Name + verified badge + open now + rating
- ✅ **Promotions banner:** Pink gradient with offer
- ✅ **Highlights:** Auto-generated badges
- ✅ **About section:** Short bio
- ✅ **Recent work carousel:** Scrollable photos
- ✅ **Services grid:** Cards with prices + "Book" buttons
- ✅ **Team section:** Horizontal scroll cards
- ✅ **Gallery:** Masonry layout
- ✅ **Contact:** Phone, email, address
- ✅ **Hours:** Full table with today highlighted
- ✅ **Sticky CTA:** Fixed bottom on mobile

**Scroll Test:**
1. Page loads (hero visible)
2. Scroll down → promotions banner
3. Scroll more → services grid
4. Scroll more → team section
5. Scroll more → gallery
6. Scroll more → contact + hours
7. **Total scroll time: ~12 seconds** ✅

---

## 📱 Mobile Testing

### **Device Tests:**

**iPhone (375px width):**
- [ ] Hero fits screen
- [ ] Verified badge + pill stack vertically
- [ ] Promotions banner stacks
- [ ] Team cards scroll horizontally
- [ ] Services grid shows 1 column
- [ ] Hours table readable
- [ ] Sticky CTA visible at bottom

**iPad (768px width):**
- [ ] Hero larger
- [ ] Promotions banner horizontal
- [ ] Team cards scroll
- [ ] Services grid 2 columns
- [ ] Gallery 2 columns

**Desktop (1200px+):**
- [ ] All sections centered (max-width: 1200px)
- [ ] Gallery 3 columns
- [ ] Services grid 3-4 columns
- [ ] No sticky CTA on bottom (hero has CTA)

---

## 🎨 Visual Checks

### **Animations:**
- [ ] Verified badge pulses (2s loop)
- [ ] Team cards lift on hover
- [ ] Hours rows highlight on hover
- [ ] Service cards shadow on hover
- [ ] Promo CTA lifts on hover

### **Colors:**
- [ ] Verified badge: Gold (#FFD700)
- [ ] Open Now: Green (rgba(76, 175, 80, 0.9))
- [ ] Closed: Red (rgba(244, 67, 54, 0.9))
- [ ] Promotions: Pink gradient
- [ ] Team border: Blue (#2196f3)

### **Spacing:**
- [ ] Sections have consistent gaps
- [ ] Cards have proper padding
- [ ] Mobile padding adequate
- [ ] No overlapping elements

---

## 🐛 Common Issues & Fixes

### **Issue 1: Verified Badge Not Showing**

**Cause:** `verificationStatus` not set to `"fully_verified"`

**Fix:**
```javascript
// In MongoDB or via API
business.verificationStatus = "fully_verified";
```

---

### **Issue 2: "Open Now" Not Updating**

**Cause:** `isOpenNow` calculated on business save, not real-time

**Fix:** The cron job should update this hourly. For testing:
```javascript
// Manually set in database
business.isOpenNow = true;
```

---

### **Issue 3: Team Photos Not Loading**

**Cause:** Invalid photo URL or CORS issue

**Fix:**
- Check `photoUrl` is valid
- Test URL directly in browser
- Fallback should show gradient placeholder with initials

---

### **Issue 4: Promotions Not Showing**

**Debug Checklist:**
- [ ] `promotions` array exists in business
- [ ] `isActive: true`
- [ ] `startDate` is in past
- [ ] `endDate` is in future
- [ ] Check browser console for API response

**Test API Directly:**
```bash
curl http://localhost:5000/api/public/profile/YOUR_SLUG
```

Look for `promotions` array in response.

---

### **Issue 5: Hours Section Empty**

**Cause:** `hours` object missing or all days empty

**Fix:**
```javascript
business.hours = {
  mon: "9:00-18:00",
  tue: "9:00-18:00",
  wed: "9:00-18:00",
  thu: "9:00-18:00",
  fri: "9:00-18:00",
  sat: "10:00-16:00",
  sun: "Closed"
};
```

---

## ✅ Final Checklist

Before considering testing complete:

### **Functionality:**
- [ ] All sections render correctly
- [ ] Conditional sections hide when no data
- [ ] Booking flow works from all CTAs
- [ ] Lightbox works for gallery
- [ ] No console errors

### **Performance:**
- [ ] Page loads <2 seconds
- [ ] No layout shift
- [ ] Images lazy load
- [ ] Smooth scrolling

### **Mobile:**
- [ ] All sections responsive
- [ ] Horizontal scroll works
- [ ] Sticky CTA appears
- [ ] Touch interactions smooth

### **Visual:**
- [ ] Verified badge animates
- [ ] Open Now pill shows correct status
- [ ] Promotions banner eye-catching
- [ ] Team cards professional
- [ ] Hours table clean

---

## 🎉 Success Criteria

**Profile page is ready when:**

✅ **Trust established in 3 seconds** (hero + verified badge + open now)
✅ **Booking conversion path clear** (multiple CTAs)
✅ **12-second scroll** shows complete profile
✅ **Mobile-first** experience smooth
✅ **Zero errors** in console
✅ **All data sections** render or hide gracefully

---

## 📊 Test Data Template

Use this JSON to create a complete test business:

```json
{
  "name": "Luxe Hair Studio",
  "bookingSlug": "luxe-hair-studio-dallas",
  "isPublicProfileActive": true,
  "logoUrl": "https://via.placeholder.com/200",
  "coverPhotoUrl": "https://via.placeholder.com/1200x500",
  "bio": "Dallas's premier hair salon specializing in balayage and color treatments. Over 10 years of experience making our clients look and feel amazing.",
  "city": "Dallas",
  "state": "TX",
  "address": "123 Main Street",
  "phone": "(214) 555-0123",
  "email": "info@luxehairstudio.com",
  "category": "Salon",
  "verificationStatus": "fully_verified",
  "ratingAverage": 4.8,
  "ratingsCount": 124,
  "isOpenNow": true,
  "hours": {
    "mon": "9:00-18:00",
    "tue": "9:00-18:00",
    "wed": "9:00-18:00",
    "thu": "9:00-20:00",
    "fri": "9:00-20:00",
    "sat": "10:00-16:00",
    "sun": "Closed"
  },
  "services": [
    { "name": "Women's Haircut", "price": 65, "duration": 60 },
    { "name": "Balayage", "price": 250, "duration": 180 },
    { "name": "Color & Highlights", "price": 150, "duration": 120 }
  ],
  "staff": [
    {
      "name": "Sarah Johnson",
      "role": "Senior Stylist - Balayage Specialist",
      "photoUrl": "https://via.placeholder.com/200",
      "isActive": true
    },
    {
      "name": "Mike Chen",
      "role": "Color Expert",
      "isActive": true
    }
  ],
  "promotions": [
    {
      "title": "First-Time Client Special",
      "description": "Get 20% off your first visit this month!",
      "discountPercent": 20,
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": "2025-12-31T23:59:59Z",
      "isActive": true
    }
  ],
  "photos": [
    { "url": "https://via.placeholder.com/400x600", "caption": "Recent balayage work" },
    { "url": "https://via.placeholder.com/400x500", "caption": "Blonde transformation" },
    { "url": "https://via.placeholder.com/400x700", "caption": "Color correction" }
  ]
}
```

---

**Happy Testing!** 🚀

If you find any issues, check the console and API responses first.
