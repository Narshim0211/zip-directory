# Frontend Testing Checklist

## ✅ Pre-Flight Check

### Backend Services Status
```powershell
.\test-services.ps1
```

**Expected Result:**
- [x] Main Backend running on port 5000
- [x] Profile Service running on port 6001
- [x] Booking Service running on port 6002
- [x] Payment Service running on port 6003

**Status**: ✅ ALL SERVICES RUNNING

### Frontend Status
```powershell
cd frontend
npm run dev
```

**Expected**: Frontend running on http://localhost:3000

---

## 🧪 Component Testing Checklist

### Test 1: Access Microservices Dashboard
- [ ] Navigate to: `http://localhost:3000/microservices`
- [ ] Should be redirected to login if not authenticated
- [ ] Login with your credentials
- [ ] After login, should see Microservices Dashboard
- [ ] Should see 4 service cards: Profile, Services, Bookings, Payments

**Expected Outcome**: Dashboard loads with all 4 service navigation cards

---

### Test 2: Profile Manager
Navigate to: `http://localhost:3000/microservices/profile`

#### Test 2.1: View Profile
- [ ] Profile data loads automatically
- [ ] See your name, email, role
- [ ] See social links section
- [ ] No loading errors in console

**Expected**: Profile displays correctly

#### Test 2.2: Update Profile
- [ ] Enter bio text: "Professional salon owner with 10+ years experience"
- [ ] Add Instagram: `https://instagram.com/testsalon`
- [ ] Add Facebook: `https://facebook.com/testsalon`
- [ ] Click "Update Profile"
- [ ] See success message: "Profile updated successfully!"
- [ ] Refresh page - changes should persist

**Expected**: Profile updates saved to database

#### Test 2.3: Create Timeline Post
- [ ] Select type: "post"
- [ ] Enter content: "Excited to announce our new service offerings!"
- [ ] Click "Create Post"
- [ ] See success message: "Timeline post created successfully!"

**Expected**: Post created successfully

---

### Test 3: Service Manager
Navigate to: `http://localhost:3000/microservices/services`

#### Test 3.1: View Services (Initial)
- [ ] Page loads successfully
- [ ] Shows "No services yet" message (if no services exist)
- [ ] "+ New Service" button visible

**Expected**: Empty state or existing services displayed

#### Test 3.2: Create Service
- [ ] Click "+ New Service"
- [ ] Form appears with all fields
- [ ] Fill in:
  - Name: `Premium Haircut`
  - Category: `haircut`
  - Price: `50.00`
  - Duration: `60`
  - Deposit: `12.50`
  - Description: `Professional haircut with wash and style`
- [ ] Click "Create Service"
- [ ] See success message
- [ ] Service appears in services grid

**Expected**: Service created and displayed

#### Test 3.3: Create Multiple Services
Create these additional services:
- [ ] Hair Coloring (category: coloring, $120, 120 min)
- [ ] Manicure (category: nails, $35, 45 min)
- [ ] Facial Treatment (category: spa, $80, 90 min)

**Expected**: All services visible in grid

#### Test 3.4: Delete Service
- [ ] Click "Delete" on any service
- [ ] Confirm deletion in dialog
- [ ] See success message
- [ ] Service removed from grid

**Expected**: Service deleted from database

---

### Test 4: Booking Manager
Navigate to: `http://localhost:3000/microservices/bookings`

#### Test 4.1: View Bookings (Initial)
- [ ] Page loads successfully
- [ ] Shows "No bookings yet" (if no bookings exist)
- [ ] "+ New Booking" button visible

**Expected**: Empty state or existing bookings displayed

#### Test 4.2: Create Booking
- [ ] Click "+ New Booking"
- [ ] Form appears
- [ ] Service dropdown populated with your services
- [ ] Fill in:
  - Service: Select "Premium Haircut"
  - Date: Tomorrow's date
  - Time: `14:00` (2:00 PM)
  - Notes: `First time customer, allergic to certain products`
- [ ] Click "Create Booking"
- [ ] See success message
- [ ] Booking appears in list with "PENDING" status

**Expected**: Booking created successfully

#### Test 4.3: Update Booking Status - Confirm
- [ ] Find the pending booking
- [ ] Click "Confirm" button
- [ ] Status changes to "CONFIRMED" (green badge)
- [ ] See success message
- [ ] Buttons change to "Mark Complete" and "No Show"

**Expected**: Status updated to confirmed

#### Test 4.4: Update Booking Status - Complete
- [ ] Click "Mark Complete"
- [ ] Status changes to "COMPLETED" (blue badge)
- [ ] See success message
- [ ] No action buttons (booking is final)

**Expected**: Booking marked as completed

#### Test 4.5: Create & Cancel Booking
- [ ] Create another booking
- [ ] Click "Cancel" on the pending booking
- [ ] Status changes to "CANCELLED" (red badge)

**Expected**: Booking cancelled

---

### Test 5: Payment Manager
Navigate to: `http://localhost:3000/microservices/payments`

#### Test 5.1: Transactions Tab
- [ ] "Transactions" tab active by default
- [ ] If no transactions: Shows "No transactions yet"
- [ ] If transactions exist: Shows list with amounts, dates, status

**Expected**: Transactions tab displays correctly

#### Test 5.2: Subscriptions Tab
- [ ] Click "Subscriptions" tab
- [ ] If no subscriptions: Shows "No active subscriptions"
- [ ] If subscriptions exist: Shows plan details, pricing, billing cycle

**Expected**: Subscriptions tab displays correctly

#### Test 5.3: Stripe Account Tab
- [ ] Click "Stripe Account" tab
- [ ] If not connected: Shows "Connect with Stripe" button and info card
- [ ] If connected: Shows account details (ID, status, enabled features)

**Expected**: Stripe tab displays connection status

#### Test 5.4: Connect Stripe (Optional)
⚠️ **Note**: This will redirect to actual Stripe onboarding
- [ ] Click "Connect with Stripe"
- [ ] Should redirect to Stripe Connect onboarding
- [ ] Complete or skip Stripe setup
- [ ] Return to app
- [ ] Should show connected status

**Expected**: Stripe connection initiated

---

### Test 6: Navigation Between Components

#### Test 6.1: Dashboard Navigation
- [ ] Go to: `http://localhost:3000/microservices`
- [ ] Click "Profile Service" card → ProfileManager loads
- [ ] Click browser back → Dashboard loads
- [ ] Click "Service Management" → ServiceManager loads
- [ ] Click "Booking Management" → BookingManager loads
- [ ] Click "Payment Management" → PaymentManager loads

**Expected**: Smooth navigation between all components

#### Test 6.2: Direct URL Navigation
- [ ] Enter: `http://localhost:3000/microservices/profile`
- [ ] Enter: `http://localhost:3000/microservices/services`
- [ ] Enter: `http://localhost:3000/microservices/bookings`
- [ ] Enter: `http://localhost:3000/microservices/payments`

**Expected**: All URLs load correct components

---

## 🔍 Developer Tools Checks

### Browser Console
- [ ] Open DevTools (F12)
- [ ] Console tab shows no errors
- [ ] No React warnings
- [ ] API calls logged (if using console.log)

**Expected**: Clean console, no errors

### Network Tab
- [ ] Open DevTools → Network tab
- [ ] Filter by "Fetch/XHR"
- [ ] Navigate through components
- [ ] Check API calls:
  - [ ] `GET /api/profiles-service/me` → Status 200
  - [ ] `PATCH /api/profiles-service/me` → Status 200
  - [ ] `GET /api/booking-service/services/my` → Status 200
  - [ ] `POST /api/booking-service/services` → Status 201
  - [ ] `GET /api/booking-service/bookings/my` → Status 200
  - [ ] `GET /api/payment-service/payments/transactions/my` → Status 200

**Expected**: All API calls return successful status codes

### Application Tab
- [ ] Open DevTools → Application tab
- [ ] Check Local Storage
- [ ] Find JWT token (key might be 'token' or 'authToken')
- [ ] Token format: `Bearer eyJ...`

**Expected**: Valid JWT token present

---

## 🎨 UI/UX Checks

### Visual Consistency
- [ ] All buttons styled consistently
- [ ] Form inputs have proper styling
- [ ] Cards have consistent spacing
- [ ] Colors match your theme
- [ ] Typography is readable

### Responsive Design
- [ ] Resize browser window
- [ ] Test mobile view (< 768px)
- [ ] Test tablet view (768px - 1024px)
- [ ] Test desktop view (> 1024px)
- [ ] All components responsive

### Loading States
- [ ] See loading indicators when fetching data
- [ ] Loading spinners appear during API calls
- [ ] Buttons disabled during submission

### Error Handling
- [ ] Try creating service with missing required field
- [ ] Should see validation error
- [ ] Try with invalid data (negative price)
- [ ] Error messages are user-friendly

---

## 🚨 Edge Cases

### Empty States
- [ ] Services list with 0 services
- [ ] Bookings list with 0 bookings
- [ ] Transactions with 0 transactions
- [ ] All show appropriate "No items yet" messages

### Error Scenarios
- [ ] Stop Profile Service
- [ ] Try to load profile → should show error message
- [ ] Restart Profile Service
- [ ] Reload page → should work again

### Authentication
- [ ] Logout
- [ ] Try to access `/microservices`
- [ ] Should redirect to login
- [ ] Login again
- [ ] Should access components successfully

---

## 📊 Performance Checks

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Profile data loads in < 1 second
- [ ] Services load in < 1 second
- [ ] No lag when switching tabs

### Memory
- [ ] Open DevTools → Performance → Memory
- [ ] Navigate between components
- [ ] No significant memory leaks
- [ ] Memory usage stable

---

## ✅ Final Verification

### Functionality
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Data persists across page refreshes
- [ ] Forms validate correctly
- [ ] Success messages display
- [ ] Error messages display

### Integration
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Proxy routes functioning
- [ ] Data saving to MongoDB

### User Experience
- [ ] Navigation intuitive
- [ ] Forms easy to use
- [ ] Error messages helpful
- [ ] Loading states clear
- [ ] Success feedback immediate

---

## 🎯 Sign-Off Checklist

Before considering frontend complete:

- [ ] All 6 main tests passed
- [ ] Browser console clean (no errors)
- [ ] Network tab shows successful API calls
- [ ] All components render correctly
- [ ] All features functional
- [ ] Responsive design verified
- [ ] Error handling tested
- [ ] Edge cases handled

---

## 📝 Test Results Template

Copy this and fill in your results:

```
TEST DATE: __________
TESTER: __________

✅ PASSED | ❌ FAILED | ⚠️ ISSUE

[ ] Test 1: Dashboard Access
[ ] Test 2: Profile Manager (2.1, 2.2, 2.3)
[ ] Test 3: Service Manager (3.1, 3.2, 3.3, 3.4)
[ ] Test 4: Booking Manager (4.1, 4.2, 4.3, 4.4, 4.5)
[ ] Test 5: Payment Manager (5.1, 5.2, 5.3, 5.4)
[ ] Test 6: Navigation (6.1, 6.2)

Browser Console: Clean / Has Errors
Network Calls: All Success / Some Failed
UI/UX: Good / Needs Work
Performance: Good / Slow

ISSUES FOUND:
1. 
2. 
3. 

OVERALL STATUS: ✅ PASS | ❌ FAIL | ⚠️ NEEDS WORK
```

---

## 🎉 Success Criteria

**All tests passing** = Ready for production deployment!

Next steps after all tests pass:
1. Document any customizations
2. Prepare deployment configuration
3. Set up production environment variables
4. Deploy to production
5. Monitor for issues

---

**Good luck with testing! 🚀**

For issues, check:
- FRONTEND_QUICK_START.md (troubleshooting)
- Browser console (errors)
- Network tab (API calls)
- Backend terminal logs
