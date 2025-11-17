# End-to-End Testing Guide - Complete Booking System

## 🎯 Test Objective
Verify the complete booking flow from owner setup to customer booking confirmation.

---

## ✅ Pre-Test Setup

### Verify Servers Running:
- [ ] Backend: http://localhost:5000 (check for MongoDB connected message)
- [ ] Frontend: http://localhost:3000 (should load without errors)
- [ ] Both PowerShell windows open and showing logs

### Test Data Needed:
- Owner account credentials
- At least 1 service defined
- At least 1 staff member
- Staff schedule configured
- Booking slug set

---

## 📋 End-to-End Test Flow

### PHASE 1: Owner Setup (Prerequisites)

#### 1.1 Login as Owner
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter owner email and password
- [ ] Click "Login"
- [ ] Verify redirect to `/owner/dashboard`
- [ ] Check: No console errors (F12)

#### 1.2 Verify Business Profile
- [ ] Go to "My Business" or `/owner/my-business`
- [ ] Verify business name is set
- [ ] Check booking slug exists (e.g., "luxe-salon")
- [ ] If no slug: Set one now and save
- [ ] Note down your booking slug: `________________`

#### 1.3 Create/Verify Services
- [ ] Go to Booking Manager or `/owner/booking`
- [ ] Check if services exist
- [ ] If none: Click "Add Service"
  - Name: "Haircut & Style"
  - Description: "Professional haircut with styling"
  - Duration: 60 minutes
  - Price: $50
  - Visibility: Public ✓
  - Click Save
- [ ] Add another service:
  - Name: "Hair Coloring"
  - Description: "Full hair color treatment"
  - Duration: 120 minutes
  - Price: $120
  - Visibility: Public ✓
  - Click Save
- [ ] Verify at least 2 services are visible

#### 1.4 Create Staff Members
- [ ] Go to Staff Management: `/owner/booking/staff`
- [ ] Check for existing staff
- [ ] Click "Add Staff Member"

**Staff Member 1:**
- [ ] Name: "Sarah Johnson"
- [ ] Role: "Senior Stylist"
- [ ] Photo URL: `https://i.pravatar.cc/300?img=47`
- [ ] Select BOTH services (Haircut & Coloring)
- [ ] Weekly Schedule:
  - Monday: ✓ 09:00 - 17:00
  - Tuesday: ✓ 09:00 - 17:00
  - Wednesday: ✓ 09:00 - 17:00
  - Thursday: ✓ 09:00 - 17:00
  - Friday: ✓ 09:00 - 17:00
  - Saturday: ✓ 10:00 - 16:00
  - Sunday: ☐ (disabled)
- [ ] Click "Save"
- [ ] Verify staff appears in list

**Staff Member 2:**
- [ ] Click "Add Staff Member" again
- [ ] Name: "Mike Chen"
- [ ] Role: "Master Barber"
- [ ] Photo URL: `https://i.pravatar.cc/300?img=12`
- [ ] Select ONLY "Haircut & Style" service
- [ ] Weekly Schedule:
  - Monday: ☐
  - Tuesday: ✓ 10:00 - 18:00
  - Wednesday: ✓ 10:00 - 18:00
  - Thursday: ✓ 10:00 - 18:00
  - Friday: ✓ 10:00 - 18:00
  - Saturday: ✓ 09:00 - 15:00
  - Sunday: ☐
- [ ] Click "Save"
- [ ] Verify both staff members visible

#### 1.5 Configure Customer Settings
- [ ] Still on Staff Management page
- [ ] Find toggle: "Allow customers to choose staff"
- [ ] Turn it ON (blue/enabled)
- [ ] Should see success message
- [ ] Verify setting saved (refresh page, should still be ON)

---

### PHASE 2: Customer Booking Flow (Main Test)

#### 2.1 Open Public Booking Page
- [ ] Open new incognito/private window (or different browser)
- [ ] Navigate to: `http://localhost:3000/book/[your-booking-slug]`
  - Replace `[your-booking-slug]` with the slug from step 1.2
- [ ] Page should load without errors
- [ ] Should see business name
- [ ] Should see available services

**Expected UI:**
- Business logo/name at top
- "Book an Appointment" heading
- Service cards with prices
- No staff selection yet (appears after service selected)

#### 2.2 Select Service
- [ ] Click on "Haircut & Style" service card
- [ ] Card should highlight (border/background change)
- [ ] Staff selection section should appear below
- [ ] Should see 2 staff members (Sarah & Mike)
- [ ] Should see "Any Staff" option (recommended badge)

**Verify Staff Display:**
- [ ] Sarah Johnson shows (with photo, name, role)
- [ ] Mike Chen shows (with photo, name, role)
- [ ] "Any Staff" card visible
- [ ] Date picker should appear

#### 2.3 Select "Any Staff"
- [ ] Click "Any Staff" card
- [ ] Should highlight
- [ ] Date picker should be enabled
- [ ] Select tomorrow's date
- [ ] Time slots should appear
- [ ] Should see slots from 09:00 onwards (earliest staff start time)

**Verify Time Slots:**
- [ ] Slots displayed in grid (2-4 columns depending on screen)
- [ ] Each slot shows time (e.g., "09:00", "09:30", "10:00")
- [ ] Slots are clickable
- [ ] Should see slots until 17:00 (latest common end time)

#### 2.4 Select Specific Staff (Test Staff Filtering)
- [ ] Go back and click "Sarah Johnson" card
- [ ] Date picker still shows tomorrow
- [ ] Time slots should update
- [ ] Should see 09:00 - 17:00 slots (Sarah's schedule)

Now test Mike:
- [ ] Click "Mike Chen" card
- [ ] Keep tomorrow's date (assume it's a weekday)
- [ ] Time slots should change to 10:00 - 18:00 (Mike's schedule)

#### 2.5 Test Different Service with Different Staff
- [ ] Go back to service selection
- [ ] Click "Hair Coloring" service
- [ ] Staff section should update
- [ ] Should see ONLY Sarah Johnson (she's assigned to coloring)
- [ ] Should NOT see Mike (not assigned to coloring)
- [ ] Should see "Any Staff" option

#### 2.6 Test Sunday (No Availability)
- [ ] Select "Hair Coloring"
- [ ] Select Sarah Johnson
- [ ] Change date to next Sunday
- [ ] Should see message: "No time slots available"
- [ ] This is correct (Sarah doesn't work Sundays)

#### 2.7 Complete Booking Flow
- [ ] Select "Haircut & Style" service
- [ ] Select "Sarah Johnson"
- [ ] Select tomorrow's date (weekday)
- [ ] Click "10:00" time slot
- [ ] Time slot should highlight
- [ ] Customer form should appear

**Fill Customer Information:**
- [ ] Name: "John Doe"
- [ ] Email: "john.doe@example.com"
- [ ] Phone: "555-123-4567"
- [ ] Notes: "First time customer, would like consultation"
- [ ] Click "Confirm Booking"

**Expected Result:**
- [ ] Loading indicator appears briefly
- [ ] Success message displays
- [ ] Shows booking confirmation:
  - Service: Haircut & Style
  - Staff: Sarah Johnson
  - Date: [selected date]
  - Time: 10:00
  - Confirmation message
- [ ] Can see "Book Another Appointment" button

#### 2.8 Verify Booking Creation (Backend)
- [ ] Check backend terminal/window
- [ ] Should see POST request to `/api/public/booking/[slug]`
- [ ] Should return 201 status
- [ ] No errors in console

---

### PHASE 3: Owner Booking Verification

#### 3.1 View Booking in Owner Dashboard
- [ ] Switch back to owner browser window
- [ ] Navigate to Booking Manager: `/owner/booking`
- [ ] Refresh page
- [ ] Should see new booking in list

**Verify Booking Details:**
- [ ] Customer name: John Doe
- [ ] Service: Haircut & Style
- [ ] Staff: Sarah Johnson
- [ ] Date: Tomorrow
- [ ] Time: 10:00
- [ ] Status: Pending

#### 3.2 Test Booking Management
- [ ] Click on the booking to view details
- [ ] Verify all information is correct
- [ ] Click "Confirm" booking
- [ ] Status should change to "Confirmed"
- [ ] Should see "Confirmed At" timestamp

#### 3.3 Test Booking Statistics
- [ ] Go to booking stats (if available)
- [ ] Should show 1 upcoming booking
- [ ] Should show 1 pending or confirmed booking
- [ ] Total bookings should include the new one

---

### PHASE 4: Edge Cases & Error Handling

#### 4.1 Test Invalid Booking Slug
- [ ] Open new window
- [ ] Go to: `http://localhost:3000/book/invalid-slug-xyz`
- [ ] Should show 404 or "Booking page not found" message
- [ ] Should NOT crash

#### 4.2 Test Form Validation
- [ ] Go to valid booking page
- [ ] Complete service, staff, date, time selection
- [ ] Leave name blank, try to submit
- [ ] Should show validation error
- [ ] Enter invalid email (e.g., "notanemail")
- [ ] Should show email validation error
- [ ] Fill correctly and submit
- [ ] Should succeed

#### 4.3 Test Backend Down
- [ ] Stop backend server (close its window or Ctrl+C)
- [ ] Try to submit a new booking
- [ ] Should show user-friendly error message
- [ ] Should NOT crash frontend
- [ ] Restart backend
- [ ] Try again - should work

#### 4.4 Test Double Booking Prevention
- [ ] Create a booking: Tomorrow, 10:00, Sarah
- [ ] Try to create another: Same date, 10:00, Sarah
- [ ] Should show "Time slot unavailable" error
- [ ] OR should allow (depends on implementation)

#### 4.5 Test Staff Selection Disabled
- [ ] Go to Staff Management as owner
- [ ] Turn OFF "Allow customers to choose staff"
- [ ] Go to public booking page (refresh)
- [ ] Select a service
- [ ] Staff selection should be HIDDEN
- [ ] Should skip directly to date/time
- [ ] Should auto-assign staff when booking

---

### PHASE 5: Responsive Design Testing

#### 5.1 Mobile View (Customer)
- [ ] Resize browser to 375px width (iPhone size)
- [ ] Go through complete booking flow
- [ ] Service cards should stack vertically
- [ ] Staff cards should stack
- [ ] Time slots should stack (1-2 columns)
- [ ] Form should be readable and usable
- [ ] All buttons should be tappable

#### 5.2 Mobile View (Owner)
- [ ] Login as owner on narrow window
- [ ] Go to Staff Management
- [ ] Should be usable on mobile
- [ ] Modal should fit screen
- [ ] Schedule editor should work

---

## ✅ Success Criteria

All tests pass if:
- [ ] Owner can create staff with schedules
- [ ] Owner can assign services to staff
- [ ] Customer can access booking page via slug
- [ ] Customer can select service and see available staff
- [ ] Customer can see time slots based on staff schedule
- [ ] Time slots match staff working hours
- [ ] Customer can complete booking with valid info
- [ ] Booking appears in owner dashboard
- [ ] Owner can view and manage bookings
- [ ] Form validation works correctly
- [ ] Error messages are user-friendly
- [ ] No console errors during normal flow
- [ ] Responsive on mobile devices
- [ ] Staff selection toggle works correctly

---

## 🐛 Issue Reporting Template

If you find issues, document:

**Issue #:**
- **What you were doing:** [e.g., Selecting a time slot]
- **Expected:** [e.g., Slot should highlight and form should appear]
- **Actual:** [e.g., Nothing happened]
- **Error in console:** [F12 > Console tab]
- **Network error:** [F12 > Network tab, check failed requests]
- **Backend logs:** [Check backend terminal]
- **Screenshot:** [If applicable]

---

## 📊 Test Results Summary

**Total Tests:** 50+
**Passed:** ___
**Failed:** ___
**Blocked:** ___

**Critical Issues:** (list any blocking bugs)

**Minor Issues:** (list any cosmetic or minor bugs)

**Recommendations:** (any suggested improvements)

---

## 🎉 Final Verification

- [ ] Complete booking flow works end-to-end
- [ ] Data persists correctly in database
- [ ] Owner and customer views are synchronized
- [ ] No data loss on refresh
- [ ] All 3 phases (Backend, Owner UI, Customer UI) working together
- [ ] System ready for production deployment

---

**Test completed by:** ________________
**Date:** ________________
**System Version:** Phase 3 Complete
**Browser(s) tested:** ________________
**Issues found:** ___

---

## 🚀 Next Steps After Testing

1. **If all tests pass:** System is ready!
   - Document any edge cases
   - Prepare deployment checklist
   - Set up production database
   
2. **If issues found:** 
   - Prioritize critical bugs
   - Fix and retest
   - Update documentation

3. **Enhancements to consider:**
   - Email confirmations
   - SMS notifications
   - Payment integration
   - Booking cancellation by customer
   - Recurring appointments
   - Staff dashboard (view their own schedule)
