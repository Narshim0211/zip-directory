# 🧪 Profile Edit System - Complete Testing Guide

**Last Updated:** 2025-11-25
**Implementation Status:** ✅ Complete

---

## 🚀 Quick Start

### Prerequisites
- ✅ Backend running on `http://localhost:5001`
- ✅ Frontend running on `http://localhost:3000`
- ✅ MongoDB connected
- ✅ Test user accounts (owner & visitor)

### Automated Tests
```bash
node test-profile-edit-system.js
```

---

## 📋 Manual Testing Checklist

### Phase 1: Owner Profile Edit

#### 1.1 Navigate to Owner Profile
- [ ] Login as an owner user
- [ ] Navigate to `/owner/me` or click on your profile
- [ ] Verify profile page loads with your data
- [ ] Verify "✏️ Edit Profile" button is visible

#### 1.2 Open Edit Modal
- [ ] Click "✏️ Edit Profile" button
- [ ] Modal should open with smooth fade-in animation
- [ ] Verify glassmorphism background (blurred, transparent)
- [ ] Verify 4 cards are visible:
  - Avatar Uploader
  - Headline Editor
  - Bio Editor
  - Links Editor

#### 1.3 Test Avatar Uploader (Owner)
**Visual Checks:**
- [ ] Avatar preview shows current image or placeholder
- [ ] Avatar is **square shape** (owners use square)
- [ ] If premium: **gold glow ring** animates around avatar
- [ ] If verified: **blue glow ring** animates around avatar
- [ ] Camera icon overlay appears on hover
- [ ] "Upload New Photo" text visible

**Functionality:**
- [ ] Click avatar area to trigger file picker
- [ ] Select an image file (JPG, PNG, GIF)
- [ ] File size validation: Should accept < 5MB
- [ ] File size validation: Should reject > 5MB with alert
- [ ] Image preview updates immediately after selection
- [ ] Upload progress shows (if implemented)
- [ ] After upload, avatar URL updates in profile

#### 1.4 Test Headline Editor (Owner)
**Fields Present:**
- [ ] Business Name input (instead of First Name)
- [ ] Handle input (with @ prefix)
- [ ] Tagline input (instead of Title/Role)
- [ ] Premium badge (if applicable)
- [ ] Verified badge (if applicable)
- [ ] Stats display (followers, following, posts, surveys)

**Functionality:**
- [ ] Type in Business Name field
- [ ] Changes appear immediately
- [ ] Type in Handle field
- [ ] Only lowercase letters, numbers, underscore allowed
- [ ] Special characters automatically removed
- [ ] Type in Tagline field (max 100 chars)
- [ ] Stats are **read-only** (cannot be edited)
- [ ] Premium/Verified badges show if applicable

#### 1.5 Test Bio Editor (Owner)
**Visual Checks:**
- [ ] Label shows "📝 Professional Summary"
- [ ] Textarea has placeholder text
- [ ] Character counter shows "0 / 400 characters"

**Functionality:**
- [ ] Type text into bio field
- [ ] Character counter updates in real-time
- [ ] Textarea auto-resizes as you type
- [ ] At 90% (360 chars): Counter turns **yellow** (warning)
- [ ] At 100% (400 chars): Counter turns **red** (error)
- [ ] Cannot type beyond 400 characters
- [ ] Error message appears if limit exceeded

#### 1.6 Test Links Editor (Owner)
**Platforms Available:**
- [ ] Instagram (pink icon)
- [ ] TikTok (cyan icon)
- [ ] YouTube (red icon)
- [ ] Twitter/X (blue icon)
- [ ] Website (cyan globe icon)

**Functionality:**
- [ ] Type URL in Instagram field
- [ ] Type URL in TikTok field
- [ ] Type URL in YouTube field
- [ ] Type URL in Twitter field
- [ ] Type URL in Website field
- [ ] All inputs accept text immediately
- [ ] Placeholder text shows format example
- [ ] "Leave empty to hide" hint visible

#### 1.7 Test Auto-Save (Owner)
**Timing Tests:**
- [ ] Edit Business Name field
- [ ] Stop typing
- [ ] Wait 1 second
- [ ] "Saving..." indicator appears (if implemented)
- [ ] After save: "Saved ✓" indicator appears
- [ ] Repeat for other fields (handle, bio, links)
- [ ] All changes save automatically after 1 second pause

**Error Handling:**
- [ ] Turn off internet connection
- [ ] Try editing a field
- [ ] Should show error message
- [ ] Turn on internet connection
- [ ] Edit should retry and succeed

#### 1.8 Close and Verify (Owner)
- [ ] Click outside modal (on background) to close
- [ ] Modal closes with smooth fade-out
- [ ] Profile page shows updated data
- [ ] Refresh page (F5)
- [ ] Updated data persists (saved to database)
- [ ] Reopen modal
- [ ] All previous changes are still there

---

### Phase 2: Visitor Profile Edit

#### 2.1 Navigate to Visitor Profile
- [ ] Logout from owner account
- [ ] Login as a visitor user
- [ ] Navigate to `/visitor/me` or click on your profile
- [ ] Verify profile page loads with your data
- [ ] Verify "✏️ Edit Profile" button is visible

#### 2.2 Open Edit Modal
- [ ] Click "✏️ Edit Profile" button
- [ ] Modal opens with same glassmorphism effect
- [ ] Verify 4 cards are visible (same as owner)

#### 2.3 Test Avatar Uploader (Visitor)
**Visual Checks:**
- [ ] Avatar preview shows current image or placeholder
- [ ] Avatar is **circle shape** (visitors use circle)
- [ ] No glow rings (visitors don't have premium/verified)
- [ ] Camera icon overlay on hover
- [ ] "Upload New Photo" text visible

**Functionality:**
- [ ] Click avatar to upload
- [ ] Select image file
- [ ] File size validation works (< 5MB)
- [ ] Preview updates immediately
- [ ] Upload completes successfully

#### 2.4 Test Headline Editor (Visitor)
**Fields Present:**
- [ ] First Name input
- [ ] Last Name input (visitors have this, owners don't)
- [ ] Handle input (with @ prefix)
- [ ] Title/Role input
- [ ] No badges (visitors don't have premium/verified)
- [ ] Stats display (followers, following, surveys)

**Functionality:**
- [ ] Type in First Name field
- [ ] Type in Last Name field
- [ ] Type in Handle field (lowercase, alphanumeric only)
- [ ] Type in Title/Role field (max 100 chars)
- [ ] Stats are read-only

#### 2.5 Test Bio Editor (Visitor)
**Visual Checks:**
- [ ] Label shows "💬 Your Bio"
- [ ] Character counter shows "0 / 280 characters" (shorter than owner)

**Functionality:**
- [ ] Type text into bio field
- [ ] Character counter updates
- [ ] Textarea auto-resizes
- [ ] At 90% (252 chars): Counter turns yellow
- [ ] At 100% (280 chars): Counter turns red
- [ ] Cannot exceed 280 characters
- [ ] Error message if limit exceeded

#### 2.6 Test Links Editor (Visitor)
**Same as Owner:**
- [ ] All 5 platform inputs available
- [ ] Same icons and colors
- [ ] Same functionality

#### 2.7 Test Auto-Save (Visitor)
- [ ] Edit First Name field
- [ ] Wait 1 second
- [ ] Changes save automatically
- [ ] Repeat for all fields
- [ ] All changes persist

#### 2.8 Close and Verify (Visitor)
- [ ] Click outside modal to close
- [ ] Profile shows updated data
- [ ] Refresh page
- [ ] Data persists
- [ ] Reopen modal
- [ ] All changes still there

---

### Phase 3: Cross-Feature Testing

#### 3.1 Modal Behavior
- [ ] **Escape Key:** Press ESC to close modal
- [ ] **Background Click:** Click overlay to close
- [ ] **Multiple Opens:** Open/close modal 5 times rapidly
- [ ] **No Memory Leaks:** Modal clears state on close

#### 3.2 Validation Edge Cases
**Handle Validation:**
- [ ] Try handle: `test@user!` → Should become `testuser`
- [ ] Try handle: `Test_User_123` → Should become `test_user_123`
- [ ] Try handle: `   spaces   ` → Should trim spaces

**Bio Validation:**
- [ ] Paste 500 character text into owner bio (400 limit)
- [ ] Should stop at 400 characters
- [ ] Paste 500 character text into visitor bio (280 limit)
- [ ] Should stop at 280 characters

**Image Validation:**
- [ ] Try uploading 10MB image → Should be rejected
- [ ] Try uploading PDF file → Should be rejected
- [ ] Try uploading valid JPG → Should succeed
- [ ] Try uploading valid PNG → Should succeed

#### 3.3 Auto-Save Edge Cases
**Rapid Typing:**
- [ ] Type rapidly in bio field for 5 seconds
- [ ] Stop typing
- [ ] Should only trigger ONE save (not multiple)
- [ ] Verify debounce works (1 second delay)

**Field Switching:**
- [ ] Edit Business Name
- [ ] Immediately switch to Bio field (before 1 second)
- [ ] Business Name should still save after 1 second
- [ ] Edit Bio field
- [ ] Both fields should save independently

#### 3.4 Role Detection
- [ ] Login as owner
- [ ] Modal shows **owner-specific fields** (Business Name, Tagline)
- [ ] Avatar is **square**
- [ ] Bio limit is **400 characters**
- [ ] Logout and login as visitor
- [ ] Modal shows **visitor-specific fields** (First Name, Last Name, Title)
- [ ] Avatar is **circle**
- [ ] Bio limit is **280 characters**

---

### Phase 4: UI/UX Testing

#### 4.1 Glassmorphism Design
- [ ] Background is blurred when modal opens
- [ ] Modal has semi-transparent glass effect
- [ ] Cards have subtle border and shadow
- [ ] Glow rings animate smoothly (premium/verified)
- [ ] Hover effects work on all buttons
- [ ] Focus effects work on all inputs

#### 4.2 Responsive Design
**Desktop (1920x1080):**
- [ ] Modal centered on screen
- [ ] All 4 cards visible
- [ ] No horizontal scrolling
- [ ] Text readable at normal zoom

**Tablet (768x1024):**
- [ ] Modal adapts to smaller screen
- [ ] Cards stack vertically if needed
- [ ] Text remains readable
- [ ] Touch targets are large enough

**Mobile (375x667):**
- [ ] Modal takes full screen or near-full
- [ ] Cards stack vertically
- [ ] Inputs are easy to tap
- [ ] No text overflow

#### 4.3 Accessibility
- [ ] Tab key navigates through inputs
- [ ] Focus indicators visible
- [ ] Screen reader can read all labels
- [ ] Color contrast meets WCAG standards
- [ ] Alt text on images

---

### Phase 5: Performance Testing

#### 5.1 Load Times
- [ ] Modal opens in < 500ms
- [ ] Image upload completes in < 3s (for 1MB image)
- [ ] Auto-save triggers in exactly 1 second
- [ ] Profile refresh after close is instant

#### 5.2 Network Conditions
**Slow 3G:**
- [ ] Modal still opens
- [ ] Auto-save queues requests
- [ ] Loading indicators show during save
- [ ] No errors on slow connection

**Offline:**
- [ ] Edits allowed in modal
- [ ] Save attempts show error
- [ ] Data not lost
- [ ] Retry works when back online

---

## 🐛 Known Issues & Expected Behavior

### Image Upload
- **Issue:** Visitor image upload may use owner endpoint
- **Status:** May need separate endpoint configuration
- **Workaround:** Test with owner account first

### Email Verification
- **Issue:** Email service shows max credits exceeded
- **Impact:** Verification emails may not send
- **Workaround:** Direct database updates for testing

### MongoDB Warnings
- **Issue:** Duplicate index warnings in console
- **Impact:** None (warnings only, functionality works)
- **Fix:** Clean up schema index definitions

---

## 🎯 Success Criteria

### ✅ Must Pass
- [ ] Modal opens and closes smoothly for both owner and visitor
- [ ] All fields are editable
- [ ] Auto-save works after 1 second
- [ ] Data persists after page refresh
- [ ] No console errors in browser (F12)
- [ ] No 404 or 500 errors in network tab

### ✨ Nice to Have
- [ ] Glow rings animate for premium users
- [ ] Upload progress bar shows during image upload
- [ ] Success toast notification after save
- [ ] Undo/redo functionality

---

## 📊 Test Results Template

Copy this template and fill in your results:

```
## Test Run: [Date/Time]
**Tester:** [Your Name]
**Environment:** [Chrome/Firefox/Safari on Windows/Mac/Linux]

### Owner Profile Edit
- [ ] Avatar Upload: PASS / FAIL
- [ ] Headline Editor: PASS / FAIL
- [ ] Bio Editor: PASS / FAIL
- [ ] Links Editor: PASS / FAIL
- [ ] Auto-Save: PASS / FAIL

### Visitor Profile Edit
- [ ] Avatar Upload: PASS / FAIL
- [ ] Headline Editor: PASS / FAIL
- [ ] Bio Editor: PASS / FAIL
- [ ] Links Editor: PASS / FAIL
- [ ] Auto-Save: PASS / FAIL

### Issues Found:
1. [Describe issue]
2. [Describe issue]

### Screenshots:
[Attach screenshots of any bugs]
```

---

## 🔧 Debugging Tips

### Modal Not Opening
1. Check browser console (F12) for errors
2. Verify ProfileEditModal is imported
3. Check `showEditModal` state is toggled
4. Verify `onEditProfile` prop is passed to ProfileHeader

### Auto-Save Not Working
1. Check network tab for API calls after 1 second
2. Verify `useAutoSave` hook is imported
3. Check console for save errors
4. Verify API token is valid

### Image Upload Failing
1. Check file size (must be < 5MB)
2. Check file type (JPG, PNG, GIF only)
3. Verify API endpoint is correct
4. Check network tab for 500 errors

### Changes Not Persisting
1. Check if auto-save triggered (network tab)
2. Verify API returned 200 status
3. Check MongoDB for updated data
4. Clear browser cache and retry

---

## 📞 Support

If you encounter issues during testing:

1. **Check Documentation:**
   - [PROFILE_EDIT_SYSTEM.md](docs/PROFILE_EDIT_SYSTEM.md)
   - [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)
   - [INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md)

2. **Run Automated Tests:**
   ```bash
   node test-profile-edit-system.js
   ```

3. **Check Server Logs:**
   - Backend: Terminal running `node server.js`
   - Frontend: Terminal running `npm start`

4. **Debug Steps:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Check Application > Local Storage for token

---

## 🎉 Completion

Once all tests pass:
- ✅ Mark [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) as 100% tested
- ✅ Update this document with test results
- ✅ Create GitHub issue if bugs found
- ✅ Celebrate! 🎊

**Expected Test Duration:** 45-60 minutes for complete testing
**Minimum Test Duration:** 15-20 minutes for critical path only
