# Phase 2 Testing Checklist - Owner Staff Management

## 🚀 Setup

**Backend:** http://localhost:5000
**Frontend:** http://localhost:3000

Both servers should be running in separate PowerShell windows.

---

## ✅ Test Checklist

### 1. Login as Owner
- [ ] Navigate to http://localhost:3000
- [ ] Click "Login" or go to `/login`
- [ ] Login with owner credentials
- [ ] Verify redirect to owner dashboard

### 2. Navigate to Staff Management
- [ ] From owner dashboard, click "Booking Manager" or navigate to `/owner/booking`
- [ ] Look for "Staff Management" link/button
- [ ] Click to go to `/owner/booking/staff`
- [ ] Verify page loads without errors

### 3. View Staff List (Empty State)
**If no staff exists:**
- [ ] Should see empty state message
- [ ] Should see "Add Staff Member" button
- [ ] Should see settings toggle at top

**If staff exists:**
- [ ] Staff members display in grid layout
- [ ] Each card shows: photo, name, role
- [ ] Shows service count (e.g., "3 services")
- [ ] Shows active status badge
- [ ] Edit and Delete buttons visible

### 4. Check Settings Toggle
- [ ] Find "Allow customers to choose staff" toggle at top
- [ ] Click toggle ON → should see success message
- [ ] Click toggle OFF → should see success message
- [ ] Verify setting persists after page refresh

### 5. Add New Staff Member
- [ ] Click "Add Staff Member" button
- [ ] Modal should open with form

**Form Fields:**
- [ ] Name field (required)
- [ ] Role field
- [ ] Photo URL field
- [ ] Service assignment checkboxes (should show your services)
- [ ] Weekly schedule editor (7 days)

**Weekly Schedule:**
- [ ] Each day has enable/disable checkbox
- [ ] When enabled, shows time inputs
- [ ] Can add multiple time slots per day
- [ ] Can remove time slots
- [ ] Time format: HH:MM (e.g., 09:00, 17:00)

**Test Adding Staff:**
- [ ] Enter name: "Sarah Johnson"
- [ ] Enter role: "Senior Stylist"
- [ ] Enter photo URL: `https://i.pravatar.cc/300?img=47`
- [ ] Select at least 2 services
- [ ] Enable Monday-Friday
- [ ] Set hours: 09:00 - 17:00
- [ ] Enable Saturday, set hours: 10:00 - 16:00
- [ ] Leave Sunday disabled
- [ ] Click "Save"
- [ ] Should see success message
- [ ] Modal closes
- [ ] New staff appears in list

### 6. Add Another Staff Member
- [ ] Click "Add Staff Member" again
- [ ] Name: "Mike Chen"
- [ ] Role: "Master Barber"
- [ ] Photo URL: `https://i.pravatar.cc/300?img=12`
- [ ] Select different services
- [ ] Set different schedule (e.g., Tuesday-Saturday)
- [ ] Click "Save"
- [ ] Verify both staff members now visible

### 7. Edit Existing Staff
- [ ] Click "Edit" on first staff member
- [ ] Modal opens with pre-filled data
- [ ] Change role to "Master Stylist"
- [ ] Add one more service
- [ ] Modify Saturday hours to 10:00 - 14:00
- [ ] Click "Save"
- [ ] Verify changes reflected in card

### 8. Test Schedule Editor Features
**Open edit modal for any staff:**
- [ ] Click Monday checkbox → time inputs should appear
- [ ] Click "Add Time Slot" → new slot added
- [ ] Set second slot: 18:00 - 21:00 (evening hours)
- [ ] Click remove (×) on one slot → slot removed
- [ ] Uncheck Monday → all Monday slots should be hidden
- [ ] Re-check Monday → slots should reappear
- [ ] Save and verify

### 9. Delete Staff Member
- [ ] Click "Delete" on one staff member
- [ ] Should see confirmation dialog
- [ ] Click "Cancel" → nothing happens
- [ ] Click "Delete" again
- [ ] Click "Confirm" → staff removed
- [ ] Should see success message
- [ ] Staff no longer in list

### 10. Service Assignment Verification
**In edit modal:**
- [ ] Check multiple services
- [ ] Uncheck some services
- [ ] Click "Save"
- [ ] Verify service count updates on card
- [ ] Open edit again → selected services still checked

### 11. Form Validation
**Test required field:**
- [ ] Click "Add Staff Member"
- [ ] Leave name empty
- [ ] Try to save
- [ ] Should see validation error

**Test schedule validation:**
- [ ] Enable a day
- [ ] Leave time fields empty
- [ ] Try to save
- [ ] Should handle gracefully (or show validation)

### 12. Error Handling
**Test backend errors:**
- [ ] Stop backend server (close its window)
- [ ] Try to add/edit staff
- [ ] Should see error message
- [ ] Restart backend
- [ ] Verify it works again

### 13. Responsive Design
**Desktop:**
- [ ] Staff cards in grid (multiple columns)
- [ ] Modal is centered and readable
- [ ] All buttons accessible

**Mobile/Narrow Window:**
- [ ] Resize browser window to ~400px width
- [ ] Staff cards stack vertically
- [ ] Modal adjusts to screen size
- [ ] All features still accessible

### 14. Data Persistence
- [ ] Refresh page (F5)
- [ ] All staff should still be visible
- [ ] Settings toggle state preserved
- [ ] Schedule data intact

### 15. Integration Check
**Verify API calls (Browser DevTools):**
- [ ] Open DevTools → Network tab
- [ ] Filter by "Fetch/XHR"
- [ ] Add staff → should see POST to `/api/owner/staff`
- [ ] Edit staff → should see PATCH to `/api/owner/staff/:staffId`
- [ ] Delete staff → should see DELETE to `/api/owner/staff/:staffId`
- [ ] Toggle setting → should see PATCH to `/api/owner/staff/settings`
- [ ] All should return 200 status

---

## 🐛 Known Issues to Watch For

1. **Photo URL validation:** Currently accepts any string
2. **Time format:** Must be HH:MM (09:00, not 9:00)
3. **Service requirement:** If no services exist in business, can't assign any
4. **Schedule slots:** Adding many slots might make modal scrollable

---

## 📸 Screenshot Checklist

Take screenshots of:
1. ✅ Empty state (no staff)
2. ✅ Staff list with 2+ members
3. ✅ Add staff modal (open, filled form)
4. ✅ Weekly schedule editor (some days enabled)
5. ✅ Edit modal with existing data
6. ✅ Success message after save
7. ✅ Delete confirmation
8. ✅ Settings toggle (both states)

---

## ✅ Success Criteria

Phase 2 is successful if:
- [ ] Can add staff members with all details
- [ ] Can edit existing staff
- [ ] Can delete staff
- [ ] Weekly schedule works for all 7 days
- [ ] Service assignment works correctly
- [ ] Settings toggle persists
- [ ] No console errors
- [ ] All API calls return 200
- [ ] Data persists after refresh
- [ ] UI is responsive and intuitive

---

## 🚨 Report Issues

If you encounter any issues, note:
1. What action you were performing
2. Error message (if any)
3. Browser console errors (DevTools → Console)
4. Network request status (DevTools → Network)
5. Screenshot of the issue

---

## 🎯 Next Phase

After Phase 2 testing is complete and all issues resolved:
→ **Phase 3:** Customer Booking Flow
   - Public booking page with staff selection
   - Date/time picker with availability
   - Booking confirmation

---

**Ready to test!** Follow the checklist above and mark each item as you complete it.
