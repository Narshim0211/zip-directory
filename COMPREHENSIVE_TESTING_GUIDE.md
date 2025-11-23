# 🧪 Comprehensive Testing Guide - All Features

**Date**: 2025-11-23
**Scope**: All existing features + Love-Only Surveys

---

## 🎯 Testing Strategy

We'll test in this order:
1. **Backend Server Startup** - Ensure no errors
2. **Frontend Server Startup** - Ensure compilation succeeds
3. **Core Features** - Existing functionality (Reviews, Bookings, Promotions, etc.)
4. **New Feature** - Love-Only Surveys
5. **Integration** - Verify no conflicts between old and new

---

## 1️⃣ Server Startup Tests

### Backend Server

**Test**: Start backend server without errors

```bash
cd backend
npm start
```

**Expected Output**:
```
✅ Server running on http://localhost:5000
✅ MongoDB connected
✅ All routes loaded
```

**Check for errors**:
- ❌ Port 5000 already in use → Kill process and restart
- ❌ MongoDB connection failed → Check MongoDB is running
- ❌ Module not found → Run `npm install`

---

### Frontend Server

**Test**: Start frontend server and compile successfully

```bash
cd frontend
npm start
```

**Expected Output**:
```
✅ Compiled successfully!
✅ Local: http://localhost:3000
✅ On Your Network: http://192.168.x.x:3000
```

**Check for errors**:
- ❌ Port 3000 in use → Kill process or change port
- ❌ Module not found → Run `npm install`
- ❌ Syntax errors in JSX → Check recent file changes

---

## 2️⃣ Core Features Testing

### A. Authentication & User Management

**Test 1: User Registration**
```
1. Navigate to http://localhost:3000/register
2. Fill in registration form:
   - Email: test-visitor@salonhub.com
   - Password: Test1234!
   - Name: Test Visitor
   - Role: Visitor
3. Click "Register"

✅ Expected: Redirect to dashboard
✅ Expected: User appears in Users collection
```

**Test 2: User Login**
```
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: (existing user)
   - Password: (correct password)
3. Click "Login"

✅ Expected: Redirect to role-specific dashboard
✅ Expected: JWT token stored in localStorage
```

---

### B. Business Profiles & Search

**Test 3: View Business Profiles**
```
1. Navigate to http://localhost:3000/
2. Scroll to business listings
3. Click on any business card

✅ Expected: Business profile page loads
✅ Expected: Shows services, reviews, booking button
✅ Expected: Business details display correctly
```

**Test 4: Search Businesses**
```
1. Navigate to http://localhost:3000/
2. Use search bar at top
3. Enter: "Hair" or "Salon" or "Nails"
4. Press Enter

✅ Expected: Filtered results appear
✅ Expected: Search is case-insensitive
✅ Expected: Shows count of results
```

---

### C. Reviews System

**Test 5: Create Review**
```
1. Login as visitor
2. Navigate to a business profile
3. Scroll to reviews section
4. Click "Write a Review"
5. Fill in:
   - Rating: 5 stars
   - Review text: "Amazing service! Loved my new hairstyle."
6. Submit

✅ Expected: Review appears immediately
✅ Expected: Business rating updates
✅ Expected: Review count increases
```

**Test 6: View Reviews**
```
1. Visit any business profile
2. Scroll to reviews section

✅ Expected: Reviews display with star ratings
✅ Expected: Shows reviewer name and date
✅ Expected: Newest reviews appear first
```

**Test 7: Report Review (Moderation)**
```
1. Login as visitor
2. View any review
3. Click "Report" button
4. Select reason: "Inappropriate content"
5. Submit report

✅ Expected: Report submitted successfully
✅ Expected: Admin can see report in moderation dashboard
```

---

### D. Bookings System

**Test 8: Create Booking**
```
1. Login as visitor
2. Navigate to business profile
3. Click "Book Now"
4. Select service (e.g., "Box Braids - $150")
5. Choose date and time
6. Enter contact info
7. Click "Confirm Booking"

✅ Expected: Booking confirmation appears
✅ Expected: Email sent (if configured)
✅ Expected: Booking appears in visitor's dashboard
✅ Expected: Owner sees booking in their dashboard
```

**Test 9: View Bookings (Owner)**
```
1. Login as business owner
2. Navigate to /owner/bookings
3. View booking list

✅ Expected: All bookings display
✅ Expected: Shows status (pending, confirmed, completed)
✅ Expected: Can filter by status
```

**Test 10: Cancel Booking**
```
1. Login as visitor
2. Go to My Bookings
3. Find upcoming booking
4. Click "Cancel"
5. Confirm cancellation

✅ Expected: Status changes to "cancelled"
✅ Expected: Refund processed (if deposit paid)
✅ Expected: Owner receives notification
```

---

### E. Promotions System

**Test 11: Create Promotion (Owner)**
```
1. Login as premium owner
2. Navigate to /owner/promotions
3. Click "Create Promotion"
4. Fill in:
   - Title: "20% Off New Clients"
   - Description: "First-time clients save 20%"
   - Discount: 20%
   - Expires: 7 days from now
5. Click "Create"

✅ Expected: Promotion appears in list
✅ Expected: Shows on business profile
✅ Expected: Displays countdown timer
```

**Test 12: View Active Promotions**
```
1. Navigate to business profile with promotion
2. Check top of page

✅ Expected: Promotion banner appears
✅ Expected: Shows discount percentage
✅ Expected: Shows expiry date
```

---

### F. Chat/Messaging System

**Test 13: Send Message (Visitor to Owner)**
```
1. Login as visitor
2. Navigate to business profile
3. Click "Message" button
4. Type: "Hi, do you offer children's haircuts?"
5. Click "Send"

✅ Expected: Message appears in thread
✅ Expected: Owner sees unread count
✅ Expected: Message stored in database
```

**Test 14: Reply to Message (Owner)**
```
1. Login as business owner
2. Navigate to /owner/inbox
3. Click on message thread
4. Type reply: "Yes! We specialize in kids' cuts. Book anytime!"
5. Click "Send"

✅ Expected: Reply appears in thread
✅ Expected: Visitor gets notification
✅ Expected: Thread marked as read
```

---

### G. Community Feed (Existing Posts & Surveys)

**Test 15: View Feed**
```
1. Login as any user
2. Navigate to /feed or home page
3. Scroll through feed

✅ Expected: Mixed content (posts, polls, love surveys)
✅ Expected: Loads more on scroll (infinite scroll)
✅ Expected: Shows author info and timestamp
```

**Test 16: Create Traditional Poll**
```
1. Login as owner or visitor
2. Click "Create Survey" button
3. Select "📊 Poll"
4. Enter question: "Which hair color is trending?"
5. Add options:
   - Option 1: "Blonde"
   - Option 2: "Brunette"
   - Option 3: "Red"
   - Option 4: "Black"
6. Click "Create Poll"

✅ Expected: Poll appears in feed immediately
✅ Expected: Shows all 4 options
✅ Expected: Can vote by selecting radio button
```

**Test 17: Vote on Traditional Poll**
```
1. Find poll in feed
2. Select an option (e.g., "Blonde")
3. Click "Vote"

✅ Expected: Results appear with percentages
✅ Expected: Shows vote distribution bars
✅ Expected: Shows total vote count
✅ Expected: Can't vote again (option disabled)
```

**Test 18: React to Post (Like/Love)**
```
1. Find any post in feed
2. Scroll to engagement bar at bottom
3. Click "👍 Like" button

✅ Expected: Like count increases
✅ Expected: Button turns blue (active state)
✅ Expected: Click again removes like

4. Click "❤️ Love" button

✅ Expected: Love count increases
✅ Expected: Like removed, Love added (switch)
✅ Expected: Button turns red (active state)
```

---

### H. Premium Owner Dashboard

**Test 19: View Premium Dashboard**
```
1. Login as premium owner
2. Navigate to /owner/dashboard

✅ Expected: Premium badge visible (💎 Premium Member)
✅ Expected: Revenue stats display
✅ Expected: Bookings count shows
✅ Expected: 4 giant action buttons appear
```

**Test 20: Quick Actions Banner**
```
1. On premium dashboard
2. Check top section for Quick Actions

✅ Expected: Shows missing items (if any):
   - "Add a cover photo →" (if missing)
   - "X unread messages →" (if unread exists)
   - "Create your first promotion →" (if none)
✅ Expected: Clicking item navigates to correct page
```

**Test 21: Stat Cards Navigation**
```
1. On premium dashboard
2. Hover over "💰 Revenue" card

✅ Expected: "View Details →" CTA appears
✅ Expected: Card lifts slightly (hover effect)

3. Click Revenue card

✅ Expected: Navigate to /owner/bookings
```

---

## 3️⃣ NEW FEATURE: Love-Only Surveys

### Test 22: Create Love-Only Survey

**Step-by-step**:
```
1. Login as owner or visitor
2. Navigate to feed or dashboard
3. Click "Create Survey" button
4. Modal opens

✅ Expected: Survey type selector appears
✅ Expected: 2 buttons: "📊 Poll" and "❤️ Love-Only"

5. Click "❤️ Love-Only" button

✅ Expected: Button turns blue/active
✅ Expected: Options section disappears
✅ Expected: Image URL field appears
✅ Expected: Author Note field appears

6. Fill in fields:
   - Question: "Do you love natural hairstyles?"
   - Image URL: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f" (optional)
   - Author Note: "Thank you for the love! Natural is beautiful 💜" (optional)

7. Click "Create Love Survey"

✅ Expected: Modal closes
✅ Expected: Survey appears in feed immediately
✅ Expected: Survey type is "love-only" in database
```

---

### Test 23: View Love-Only Survey in Feed

**Check display**:
```
1. Scroll to newly created Love survey in feed

✅ Expected: Distinct styling (larger, centered)
✅ Expected: Question appears as large heading
✅ Expected: Image displays (if provided)
✅ Expected: "♥ Love" button visible (pink border, white bg)
✅ Expected: No vote options (unlike poll)
✅ Expected: Engagement bar at bottom
```

---

### Test 24: Vote on Love-Only Survey

**Step-by-step**:
```
1. Find Love-only survey in feed
2. Hover over "♥ Love" button

✅ Expected: Button fills with pink color
✅ Expected: Smooth transition animation

3. Click "♥ Love" button

✅ Expected: Button shows "💗 Loving..." briefly
✅ Expected: API call to /api/v1/analytics/reactions/toggle/survey/{id}
✅ Expected: Results appear with fade-in animation

4. Check results display:

✅ Expected: Large percentage (e.g., "87%")
✅ Expected: "loved this" label below percentage
✅ Expected: "+X% from your vote" impact message
✅ Expected: Author note appears in styled box (if provided)
✅ Expected: Engagement bar updates (Love count increases)

5. Try to vote again:

✅ Expected: Button disabled or shows "Already loved"
✅ Expected: Can't submit duplicate vote
```

---

### Test 25: Love Survey - Engagement Bar

**Check engagement metrics**:
```
1. After voting on Love survey
2. Scroll to engagement bar at bottom

✅ Expected: View count displays (👁 X)
✅ Expected: Response count shows total votes (💬 X responses)
✅ Expected: Like count (👍 0 or X)
✅ Expected: Love count (❤️ X) - matches your vote
✅ Expected: Love button is active/red (since you loved it)
```

---

### Test 26: Switch Between Survey Types

**Test type selector**:
```
1. Click "Create Survey"
2. Click "❤️ Love-Only"
3. Fill in question: "Test love survey"
4. Click "📊 Poll" button

✅ Expected: Author Note field disappears
✅ Expected: Image URL field disappears
✅ Expected: Options section reappears
✅ Expected: Question field retains value
✅ Expected: Form adapts smoothly

5. Switch back to "❤️ Love-Only"

✅ Expected: Options disappear again
✅ Expected: Love fields reappear
✅ Expected: No data loss
```

---

### Test 27: Love Survey - Author Note Display

**Test personalized note**:
```
1. Create Love survey with author note: "Thanks! Visit my salon for 20% off 💜"
2. View survey in feed
3. Vote with Love button
4. Check results

✅ Expected: Author note appears in styled box
✅ Expected: Quote marks around note
✅ Expected: "— {Author Name}" attribution
✅ Expected: Left pink border on note box
✅ Expected: Note only appears AFTER voting (not before)
```

---

### Test 28: Love Survey - Image Display

**Test with image URL**:
```
1. Create Love survey with image URL:
   - Use: https://images.unsplash.com/photo-1560869713-7d0a29430803
2. View in feed

✅ Expected: Image displays above Love button
✅ Expected: Image is responsive (fits container)
✅ Expected: Image has rounded corners
✅ Expected: Max height ~300px
✅ Expected: Image loads or shows placeholder if URL fails
```

---

### Test 29: Love Survey - Mobile Responsive

**Test on mobile device or resize browser**:
```
1. Resize browser to 375px width (iPhone size)
2. View Love survey in feed

✅ Expected: Question font size reduces (18px)
✅ Expected: Love button remains full width
✅ Expected: Percentage reduces to 40px font size
✅ Expected: Padding adjusts (16px instead of 20px)
✅ Expected: All elements stack vertically
✅ Expected: Touch-friendly button size (min 44px height)
```

---

### Test 30: Love Survey - Error Handling

**Test API failure scenarios**:
```
1. Create Love survey
2. Stop backend server
3. Try to vote on Love survey

✅ Expected: Error message appears: "Failed to submit Love"
✅ Expected: Button returns to "♥ Love" state
✅ Expected: Loading state clears
✅ Expected: No crash or blank screen

4. Restart backend
5. Try voting again

✅ Expected: Vote succeeds
✅ Expected: Results display correctly
```

---

## 4️⃣ Integration Testing

### Test 31: Mixed Feed (Polls + Love Surveys)

**Test both types coexist**:
```
1. Create 2 traditional polls
2. Create 2 Love surveys
3. View feed

✅ Expected: All 4 surveys appear in feed
✅ Expected: Each type displays correctly
✅ Expected: No styling conflicts
✅ Expected: Can vote on each independently
✅ Expected: Engagement bars work for both types
```

---

### Test 32: Follow System Integration

**Test follow button on Love surveys**:
```
1. Login as Visitor A
2. View Love survey by Owner B
3. Check Follow button in header

✅ Expected: Follow button appears
✅ Expected: Can follow owner from Love survey
✅ Expected: Following status updates globally
✅ Expected: All surveys by Owner B update (no duplicate state)
```

---

### Test 33: Reaction System Integration

**Test reactions on both survey types**:
```
1. Create traditional poll
2. Vote on poll
3. Scroll to engagement bar
4. Click "❤️ Love" button

✅ Expected: Love count increases
✅ Expected: Works same as posts

5. Create Love survey
6. Vote with Love button
7. Check engagement bar

✅ Expected: Love count matches vote
✅ Expected: Same reaction API used
✅ Expected: No duplicate reaction records
```

---

### Test 34: Premium Dashboard + Love Surveys

**Test owner creates Love survey from dashboard**:
```
1. Login as premium owner
2. Go to /owner/dashboard
3. Click "CREATE PROMOTION" or similar action
4. Should also have option to create survey

✅ Expected: Can create Love survey from dashboard
✅ Expected: Survey appears in feed immediately
✅ Expected: Dashboard stats update (if tracked)
```

---

### Test 35: Search & Filter with Love Surveys

**Test Love surveys in search/filter**:
```
1. Create Love surveys in different categories:
   - Hair
   - Nails
   - Makeup
2. Use category filter (if exists)

✅ Expected: Love surveys filter by category
✅ Expected: Search works on question text
✅ Expected: Both poll and love-only results show
```

---

## 5️⃣ Performance Testing

### Test 36: Feed Loading Performance

**Test with multiple items**:
```
1. Create 20+ surveys (mix of poll and love-only)
2. Navigate to feed
3. Use browser DevTools → Network tab
4. Refresh page

✅ Expected: Initial load < 2 seconds
✅ Expected: API calls complete < 500ms
✅ Expected: No N+1 query issues
✅ Expected: Images lazy load
✅ Expected: Smooth scrolling
```

---

### Test 37: Reaction API Performance

**Test rapid clicking**:
```
1. Find Love survey
2. Rapidly click Love button 5 times

✅ Expected: Only 1 vote registers
✅ Expected: Button disables during API call
✅ Expected: No duplicate reactions in database
✅ Expected: No race condition errors
```

---

## 6️⃣ Database Verification

### Test 38: Survey Model Fields

**Check MongoDB directly**:
```javascript
// In MongoDB shell or Compass
db.surveys.findOne({ surveyType: 'love-only' })

✅ Expected fields:
{
  _id: ObjectId,
  surveyType: 'love-only',
  question: String,
  imageUrl: String (optional),
  authorNote: String (optional),
  loveCount: 0, // or number
  lastLoveAt: null, // or Date
  viewCount: 0, // or number
  author: ObjectId,
  visibility: 'public',
  isActive: true,
  voters: [], // Array of user IDs
  createdAt: Date,
  updatedAt: Date
}
```

---

### Test 39: Reaction Records

**Check reaction collection**:
```javascript
db.reactions.find({ contentType: 'survey' })

✅ Expected:
{
  userId: ObjectId,
  contentId: String (survey ID),
  contentType: 'survey',
  reactionType: 'love',
  createdAt: Date,
  updatedAt: Date
}

// Verify no duplicates:
db.reactions.aggregate([
  { $group: { _id: { userId: '$userId', contentId: '$contentId' }, count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

✅ Expected: Empty array (no duplicates)
```

---

## 7️⃣ Edge Cases

### Test 40: Empty States

**Test no surveys exist**:
```
1. Fresh database or clear all surveys
2. Navigate to feed

✅ Expected: "No surveys yet" message
✅ Expected: CTA to create first survey
✅ Expected: No errors in console
```

---

### Test 41: Unauthenticated User

**Test as logged-out user**:
```
1. Logout
2. Navigate to feed
3. View Love survey

✅ Expected: Survey displays
✅ Expected: Love button shows
✅ Expected: Click Love → "Please login" message
✅ Expected: Redirect to login page
```

---

### Test 42: Very Long Question

**Test text overflow**:
```
1. Create Love survey with 200 character question
2. View in feed

✅ Expected: Question wraps properly
✅ Expected: No text overflow
✅ Expected: Container expands to fit
✅ Expected: Responsive on mobile
```

---

### Test 43: Invalid Image URL

**Test broken image**:
```
1. Create Love survey with imageUrl: "https://invalid-url.com/broken.jpg"
2. View in feed

✅ Expected: Broken image icon OR placeholder
✅ Expected: Survey still displays
✅ Expected: No JavaScript errors
✅ Expected: Love button still works
```

---

## 8️⃣ Browser Compatibility

### Test 44: Cross-Browser Testing

**Test in multiple browsers**:

**Chrome**:
```
✅ Survey type selector works
✅ Love button animations smooth
✅ Results fade-in animation works
✅ All features functional
```

**Firefox**:
```
✅ Modal displays correctly
✅ CSS grid layout works
✅ Reactions toggle properly
✅ No console errors
```

**Safari** (if available):
```
✅ Webkit-specific styles work
✅ Border-radius renders correctly
✅ Flexbox layout intact
```

**Edge**:
```
✅ All features work same as Chrome
✅ No IE11 legacy issues
```

---

## 9️⃣ Regression Testing

### Test 45: Existing Polls Still Work

**Critical test**:
```
1. Create traditional poll (not love-only)
2. Vote on poll
3. View results

✅ Expected: Polls work exactly as before
✅ Expected: No broken functionality
✅ Expected: Same UI/UX as pre-Love feature
✅ Expected: Multi-option voting works
✅ Expected: Percentage bars display
```

---

### Test 46: Reviews Still Work

**Test unrelated feature**:
```
1. Create review on business
2. View review
3. Report review

✅ Expected: No impact from Love surveys
✅ Expected: All review features functional
✅ Expected: No routing conflicts
```

---

### Test 47: Bookings Still Work

**Test unrelated feature**:
```
1. Create booking
2. View booking in dashboard
3. Cancel booking

✅ Expected: No impact from Love surveys
✅ Expected: All booking features functional
✅ Expected: No API conflicts
```

---

## 🎯 Success Criteria

### All Tests Must Pass

- ✅ **43/43 Core Features** pass
- ✅ **10/10 Love Survey Features** pass
- ✅ **6/6 Integration Tests** pass
- ✅ **4/4 Performance Tests** pass
- ✅ **7/7 Edge Cases** handled
- ✅ **3/3 Regression Tests** pass

### Performance Benchmarks

- ✅ Feed loads in < 2 seconds
- ✅ Reaction API responds in < 200ms
- ✅ No memory leaks
- ✅ No console errors

### Code Quality

- ✅ Zero duplicate files
- ✅ Zero routing conflicts
- ✅ Backward compatible
- ✅ Clean console (no warnings)

---

## 📊 Test Results Log

Create a test log as you go:

```
Date: 2025-11-23
Tester: [Your Name]

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Backend Startup | ✅ | No errors |
| 2 | Frontend Startup | ✅ | Compiled OK |
| 3 | View Business | ✅ | All data displays |
| ... | ... | ... | ... |
| 22 | Create Love Survey | ✅ | Modal works |
| 24 | Vote Love Survey | ✅ | Results show |
| ... | ... | ... | ... |

Overall: PASS / FAIL
Issues Found: [List any bugs]
```

---

## 🐛 Bug Reporting Template

If you find issues, report like this:

```
Bug #1
------
Feature: Love Survey - Vote Button
Steps to Reproduce:
1. Create Love survey
2. Click Love button
3. ...

Expected: Results should appear
Actual: Error message "Failed to submit Love"

Error in console: [Paste error]
Browser: Chrome 120
Screenshot: [Attach if helpful]
```

---

## 🚀 Ready to Test!

Start with:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - MongoDB (if not running as service)
mongod
```

Then open http://localhost:3000 and begin testing! 🎉
