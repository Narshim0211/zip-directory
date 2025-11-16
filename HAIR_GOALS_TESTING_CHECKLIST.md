# Hair Glow-Up Diary - Testing Checklist

## ✅ Complete These Tests Before Shipping

### Test 1: New User Journey
**Goal:** Verify first-time experience is smooth

1. Navigate to `/visitor/toolkit/goals`
2. Should see "Your Hair Glow-Up Starts Today" screen
3. Click "Start Your Glow-Up" button
4. ✅ Goal input appears with single field
5. Type a goal: "Grow healthier hair"
6. Click save
7. ✅ Redirects to upload photo screen
8. Upload a starting photo
9. ✅ Advances to main progress page
10. ✅ See "This Week" card with editable goal

**Expected Result:**
- No errors in console
- Goal appears in "This Week" card
- ✏️ Edit button visible next to goal
- Action buttons show: "Finish Check-In" + "Add Photo"
- Photo appears in timeline grid as "Week 1"

---

### Test 2: Edit Goal Mid-Week
**Goal:** Verify goals are always editable

1. On main page, locate "This Week" card
2. Click ✏️ Edit button next to goal
3. ✅ Compact modal opens (not full form)
4. See just the goal field (no other fields)
5. Change goal to: "Reduce frizz this week"
6. Click "Save Goal"
7. ✅ Modal closes immediately
8. ✅ NO success popup (quiet save)
9. ✅ Updated goal shows in "This Week" card

**Expected Result:**
- Edit button always visible when goal exists
- Compact modal (not overwhelming)
- Only goal field shown
- Changes save instantly
- No unnecessary popups

---

### Test 3: Complete Weekly Check-In
**Goal:** Verify 3-step form is simple and clear

1. Click "Finish Check-In" button
2. ✅ Full modal opens
3. ✅ Header says "3 simple steps"
4. **Step 1:** See current goal pre-filled
5. Can edit goal if needed
6. **Step 2:** See routine chips
7. Click 2-3 routine tags (e.g., "Deep Condition", "Oil Treatment")
8. **Step 3:** Select feeling emoji (e.g., 😊)
9. Add optional notes: "Hair feels softer!"
10. Click "✓ Save & Finish" button (full-width)
11. ✅ Form closes
12. ✅ Success message appears (if no photo) OR
13. ✅ Weekly report popup shows (if photo exists)

**Expected Result:**
- Only 3 steps shown
- No goalWhy or routineNote fields
- Form completion takes < 1 minute
- Clear progress through steps
- Appropriate feedback on save

---

### Test 4: Add Photo Only
**Goal:** Verify photo upload works independently

1. On main page, click "Add Photo" button
2. ✅ Hidden file input triggers
3. Select a photo from device
4. Wait for upload
5. ✅ Photo appears in timeline grid
6. ✅ Shows correct week number
7. ✅ "This Week" card updates if check-in complete
8. ✅ Weekly report popup shows if check-in complete

**Expected Result:**
- File picker opens immediately
- Photo uploads successfully
- Timeline grid updates
- Photo labeled with correct week
- Report shows if ready

---

### Test 5: View Weekly Report
**Goal:** Verify report popup displays correctly

**Scenario A: Complete Entry**
1. Complete check-in with goal + routine + feeling
2. Upload photo for that week
3. ✅ Report popup appears automatically
4. ✅ Shows this week's photo
5. ✅ Displays goal text
6. ✅ Shows feeling emoji
7. ✅ Lists routine tags
8. ✅ "View Full Report" button works

**Scenario B: Incomplete Entry**
1. Set goal but don't add photo
2. Click "Finish Check-In"
3. ✅ Shows success message (not popup)
4. ✅ Message says: "Add this week's photo to see full report"

**Expected Result:**
- Popup only shows when ready (photo + check-in done)
- All data displays correctly
- Can close popup
- Can navigate to full report page

---

### Test 6: Timeline Display
**Goal:** Verify photo timeline is clean and simple

1. Add multiple photos over several "weeks"
2. Scroll to "Your Timeline" section
3. ✅ See grid layout of photos
4. ✅ Each photo labeled "Week 1", "Week 2", etc.
5. ✅ Photos are clickable (hover effect)
6. ✅ NO compare mode slider
7. ✅ NO "Compare Side-by-Side" button
8. ✅ Simple grid view only

**Expected Result:**
- Clean grid of weekly photos
- Clear week labels
- No complex comparison UI
- Responsive on mobile

---

### Test 7: View Past Reports
**Goal:** Verify navigation to reports page

1. Click "View Past Reports →" link
2. ✅ Navigates to `/visitor/toolkit/goals/reports`
3. ✅ See list of all weekly reports
4. ✅ Can click each report to expand
5. Click back button
6. ✅ Returns to main page
7. ✅ State preserved (goal still shown)

**Expected Result:**
- Clean navigation
- Reports page loads
- All reports accessible
- Back navigation works

---

### Test 8: Context-Aware Buttons
**Goal:** Verify buttons change based on state

**State A: No Goal Set**
1. Clear localStorage
2. Refresh page
3. ✅ See "Start Your Glow-Up" only

**State B: Goal Set, No Check-In**
1. Set a goal
2. ✅ See "Finish Check-In" + "Add Photo" buttons
3. ✅ NO "View Report" button yet

**State C: Check-In Complete**
1. Complete check-in with feeling
2. ✅ See "View This Week's Report" button
3. ✅ Can still "Add Photo" if no photo
4. ✅ Can still ✏️ Edit goal

**Expected Result:**
- Buttons adapt to user's progress
- Always clear what to do next
- No confusion about state

---

### Test 9: Mobile Responsiveness
**Goal:** Verify UI works on small screens

1. Open DevTools → Mobile view (375px width)
2. ✅ "This Week" card fits screen
3. ✅ Edit button accessible
4. ✅ Action buttons stack vertically
5. Open check-in modal
6. ✅ Form fits mobile screen
7. ✅ Routine chips wrap properly
8. ✅ Full-width button fills space
9. ✅ Timeline grid responsive (2 columns)

**Expected Result:**
- No horizontal scroll
- All buttons accessible
- Forms usable on mobile
- Text readable (not tiny)

---

### Test 10: Dark Mode (if enabled)
**Goal:** Verify dark mode styling

1. Enable dark mode in settings
2. Navigate to hair goals page
3. ✅ "This Week" card uses dark theme
4. ✅ Modal forms use dark background
5. ✅ Text readable (high contrast)
6. ✅ Timeline photos have borders
7. ✅ Buttons visible in dark mode

**Expected Result:**
- All text readable
- Proper contrast ratios
- No white flashes
- Consistent theming

---

## Error Scenarios

### Error 1: Invalid File Upload
1. Try to upload non-image file (e.g., .pdf)
2. ✅ Should reject with error message
3. ✅ User can try again

### Error 2: Empty Goal Submission
1. Open goal edit modal
2. Clear goal field (empty)
3. Try to save
4. ✅ Should show validation error
5. ✅ Cannot save empty goal

### Error 3: Incomplete Check-In
1. Open full check-in form
2. Leave feeling unselected
3. Try to save
4. ✅ Should show validation error
5. ✅ Highlight required fields

---

## Performance Checks

### Check 1: Load Time
- [ ] Page loads in < 2 seconds
- [ ] No layout shift on load
- [ ] Images lazy load properly

### Check 2: Interaction Speed
- [ ] Modal opens instantly
- [ ] Form submissions < 500ms
- [ ] Photo upload shows progress

### Check 3: Memory Usage
- [ ] No memory leaks in DevTools
- [ ] localStorage doesn't exceed limits
- [ ] Photos compressed properly

---

## Accessibility Checks

### Check 1: Keyboard Navigation
- [ ] Can tab through all buttons
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Focus visible on all elements

### Check 2: Screen Reader
- [ ] Buttons have aria-labels
- [ ] Form fields have labels
- [ ] Errors announced
- [ ] Status changes announced

### Check 3: Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Buttons have sufficient contrast
- [ ] Emoji not sole indicator
- [ ] Readable in sunlight

---

## Regression Tests

### Ensure These Still Work:
- [ ] HairGoalsContext provider wraps correctly
- [ ] `getCurrentWeekNumber()` calculates correctly
- [ ] `addOrUpdateWeeklyEntry()` saves to context
- [ ] `getCurrentWeekEntry()` retrieves current week
- [ ] localStorage persists between sessions
- [ ] Navigation back button works
- [ ] Other toolkit pages unaffected

---

## Known Issues to Fix

### Priority 1 (Critical):
- [ ] **Fake wins in report generator** - Only show wins when data exists
  - File: `hairGoalsReportGenerator.js`
  - Function: `getWeeklyWins()`
  
### Priority 2 (Important):
- [ ] **Weekly report popup too clinical** - Make warmer and friendlier
  - File: `WeeklyReportPopup.jsx`
  - Changes: Larger emoji, friendlier copy, focus on photo

### Priority 3 (Nice to have):
- [ ] **Photo lightbox** - Click timeline photo to view larger
- [ ] **Delete photo** - Remove photo from week
- [ ] **Reset tracker** - Move to settings (removed from main page)

---

## Browser Testing

Test in these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Final Validation

Before shipping, confirm:
- [ ] ✅ No console errors
- [ ] ✅ No console warnings
- [ ] ✅ All links work
- [ ] ✅ All forms submit
- [ ] ✅ All modals close
- [ ] ✅ Data persists
- [ ] ✅ Navigation works
- [ ] ✅ Mobile responsive
- [ ] ✅ Dark mode works
- [ ] ✅ Accessible
- [ ] ✅ User-tested (got feedback)

---

## User Testing Script

**Give this to a real user:**

> "You want to track your hair growth progress. Try to:
> 1. Set a weekly goal
> 2. Take a photo of your hair
> 3. Record what products you used
> 4. See your progress over time
> 
> Tell me:
> - What was confusing?
> - What took too long?
> - What felt good?
> - Would you use this weekly?"

**Observe:**
- Where do they pause?
- Do they find the edit button?
- Do they understand the 3 steps?
- Do they complete the flow?

---

## Success Criteria

Ship when:
1. ✅ All critical tests pass
2. ✅ No console errors
3. ✅ Mobile works perfectly
4. ✅ 3+ users complete flow successfully
5. ✅ Average check-in time < 1 minute
6. ✅ Users find edit button without help
7. ✅ No confusion about next steps

**Goal: User says "This is so much easier now!"**
