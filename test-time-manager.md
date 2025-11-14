# Time Manager 2.0 - Testing Guide

## Server Status ✓
- **Time Service**: http://localhost:5500 (Running)
- **Backend**: http://localhost:5000 (Running)
- **Frontend**: http://localhost:3000 (Running)

---

## Phase 1: Manual UI Testing

### Test 1: DailyPlanner

#### Access the Daily View
1. Navigate to: http://localhost:3000/time-manager or http://localhost:3000/time-manager/daily
2. Login if required

#### Test Session Display
- [ ] Verify 3 sessions appear: 🌅 Morning, ☀️ Afternoon, 🌙 Evening
- [ ] Each session should have a "+ Quick Add" button

#### Test Quick-Add Feature
**Morning Session:**
1. Click "+ Quick Add" in Morning session
2. Yellow input box should appear
3. Type: "Morning coffee and planning"
4. Press **Enter** to save
5. Task should appear immediately in Morning section
6. [ ] Verify task was created

**Afternoon Session:**
1. Click "+ Quick Add" in Afternoon session
2. Type: "Team meeting at 2pm"
3. Press **Enter**
4. [ ] Verify task appears in Afternoon section

**Evening Session:**
1. Click "+ Quick Add" in Evening session
2. Type: "Review daily progress"
3. Press **Enter**
4. [ ] Verify task appears in Evening section

#### Test Task Operations
1. **Toggle Completion:**
   - Click checkbox on any task
   - [ ] Task should mark as complete
   - Click again to uncomplete

2. **Edit Task:**
   - Click "Edit" on a task
   - Change title or session
   - Save changes
   - [ ] Verify updates appear

3. **Delete Task:**
   - Click "Delete" on a task
   - Confirm deletion
   - [ ] Verify task is removed

#### Test Date Navigation
1. Change date to tomorrow
2. [ ] Should show empty or different tasks
3. Return to today
4. [ ] Original tasks should still be visible

#### Test Persistence (CRITICAL)
1. **Refresh the browser** (F5 or Ctrl+R)
2. [ ] **All tasks should still be there** ✓ (This was the main bug fix!)
3. Navigate away to another page
4. Return to Daily view
5. [ ] Tasks should persist

---

### Test 2: WeeklyPlanner

#### Access the Weekly View
1. Navigate to: http://localhost:3000/time-manager/weekly

#### Test Week Display
- [ ] Verify 7 columns showing Mon-Sun
- [ ] Each day shows date (e.g., "Mon - 2025-01-13")
- [ ] Task count badges appear: "(0)" or "(2)"

#### Test Week Navigation
1. Click **Previous Week** button
2. [ ] Dates should change to previous week
3. Click **Next Week** button twice
4. [ ] Should advance to next week

#### Create Tasks for Different Days
1. Click "+ Add Task"
2. Set date to Monday of current week
3. Create task: "Monday Review Meeting"
4. [ ] Verify appears under Monday column

5. Create another task for Wednesday
6. [ ] Verify appears under Wednesday column

#### Test Task Operations
1. Toggle completion on any task
2. [ ] Should update immediately
3. Edit a task, change its date
4. [ ] Should move to new day column

#### Cross-View Check
1. Note tasks created in Weekly view
2. Navigate to Daily view
3. Select same date
4. [ ] Tasks should appear in Daily view
5. Return to Weekly view
6. [ ] Tasks still visible

---

### Test 3: MonthlyPlanner

#### Access the Monthly View
1. Navigate to: http://localhost:3000/time-manager/monthly

#### Test Calendar Grid
- [ ] Calendar shows 7 columns (Sun-Sat)
- [ ] Weekday labels appear at top
- [ ] Current month and year display
- [ ] Today's date is highlighted in **blue**
- [ ] Empty dates are grayed out
- [ ] Previous/next month buttons work

#### Test Month Navigation
1. Click **< Previous Month**
2. [ ] Calendar shows previous month
3. Click **> Next Month** twice
4. [ ] Advances to next month
5. Return to current month

#### Create Tasks via Inspector
1. **Click on today's date** in the calendar
2. [ ] Inspector drawer slides in from right
3. [ ] Shows "Tasks for YYYY-MM-DD" header
4. Click "+ Add Task for [date]"
5. Fill in task form:
   - Title: "Monthly planning session"
   - Session: Morning
   - Save
6. [ ] Inspector shows the new task
7. [ ] Calendar cell shows green background
8. [ ] Task count appears on date cell

#### Test Different Dates
1. Click on a different date (e.g., 3 days from now)
2. Inspector opens for that date
3. Add task: "Future deadline"
4. [ ] Task appears in inspector
5. [ ] Date cell turns green with task count
6. Close inspector (click × button)
7. [ ] Inspector slides away

#### Test Task Operations in Inspector
1. Click on a date with tasks
2. In inspector:
   - [ ] Toggle task completion checkbox
   - [ ] Click "Edit" - form should appear
   - [ ] Click "Delete" - task removed
3. [ ] Calendar updates immediately

#### Test Visual Indicators
- [ ] Dates with tasks: **Green** background
- [ ] Today's date: **Blue** background
- [ ] Empty cells: **Gray** background
- [ ] Hover over dates: **Highlight** effect
- [ ] Task count shows: "1 task" or "2 tasks"

---

### Test 4: Cross-View Persistence (CRITICAL TEST)

This validates the main bug fix - UTC date storage ensuring persistence.

#### Create in Daily, View in All
1. Go to **Daily view** (today's date)
2. Create task: "Cross-view test - Daily"
3. Session: Afternoon
4. Save task

5. Navigate to **Weekly view**
6. [ ] Task appears in today's column ✓

7. Navigate to **Monthly view**
8. [ ] Task appears on today's date ✓
9. Click today's date to open inspector
10. [ ] Task visible in inspector ✓

#### Create in Weekly, View in All
1. Go to **Weekly view**
2. Create task for tomorrow: "Cross-view test - Weekly"
3. Save task

4. Navigate to **Daily view**
5. Change date to tomorrow
6. [ ] Task appears in Daily view ✓

7. Navigate to **Monthly view**
8. [ ] Tomorrow's date shows task count ✓
9. Click tomorrow's date
10. [ ] Task visible in inspector ✓

#### Create in Monthly, View in All
1. Go to **Monthly view**
2. Click on a date 5 days from now
3. Add task: "Cross-view test - Monthly"
4. Save

5. Navigate to **Weekly view**
6. Navigate to correct week
7. [ ] Task appears in correct day column ✓

8. Navigate to **Daily view**
9. Select same date (5 days from now)
10. [ ] Task appears in Daily view ✓

#### Persistence After Refresh
1. **Refresh browser** (F5)
2. Navigate to Daily view (today)
3. [ ] "Cross-view test - Daily" still exists ✓
4. Navigate to Weekly view
5. [ ] "Cross-view test - Weekly" still exists ✓
6. Navigate to Monthly view
7. [ ] All tasks still visible on calendar ✓

**If all checkboxes above are checked ✓, the persistence bug is FIXED!**

---

## Phase 2: API Endpoint Testing

### Test Daily Tasks Endpoint

```bash
# Get daily tasks for today
curl -X GET "http://localhost:5500/api/visitor/time/tasks/daily?date=2025-01-14" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "tasks": [...],
  "date": "2025-01-14"
}
```

### Test Weekly Tasks Endpoint

```bash
# Get weekly tasks starting Monday
curl -X GET "http://localhost:5500/api/visitor/time/tasks/weekly?startDate=2025-01-13" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Monthly Tasks Endpoint

```bash
# Get monthly tasks for January 2025
curl -X GET "http://localhost:5500/api/visitor/time/monthly?month=1&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Behaviors Summary

### ✓ Fixed Issues
1. **Task Persistence**: Tasks now persist after refresh (UTC midnight storage)
2. **Session Handling**: Lowercase sessions work correctly ('morning', 'afternoon', 'evening')
3. **Cross-View Sync**: Tasks appear correctly in all 3 views
4. **Date Handling**: UTC dates prevent timezone mismatches

### ✓ New Features
1. **Quick-Add**: Inline task creation in Daily view
2. **Calendar Grid**: Visual monthly calendar with task indicators
3. **Inspector Drawer**: Side panel for viewing/managing tasks by date
4. **Session Icons**: 🌅 ☀️ 🌙 for better UX
5. **Task Count Badges**: See task counts per day/date

### ✓ Error Handling
- User-friendly error messages
- Validation feedback
- Retry buttons on errors
- Console logging for debugging

---

## Troubleshooting

### Tasks Not Persisting
- Check browser console for errors
- Verify MongoDB connection in time-service logs
- Check that `taskDate` field is being sent in API requests

### Tasks Not Appearing in Other Views
- Verify date formats match (YYYY-MM-DD)
- Check session values are lowercase
- Inspect browser Network tab for API responses

### Calendar Not Displaying Correctly
- Check CSS file loaded properly
- Verify calendar grid calculation logic
- Check for JavaScript errors in console

### Inspector Not Opening
- Verify click handlers on calendar cells
- Check state management (selectedDate, inspectorOpen)
- Inspect React DevTools for state changes

---

## Testing Checklist Summary

- [ ] Daily view: Sessions, quick-add, task operations
- [ ] Weekly view: Week navigation, task grouping
- [ ] Monthly view: Calendar grid, inspector drawer
- [ ] Cross-view persistence: Tasks visible in all views
- [ ] Browser refresh: Tasks persist after reload
- [ ] Error handling: Graceful failures with messages
- [ ] Mobile responsive: Test on smaller screen sizes

---

## Success Criteria

All features working = **Time Manager 2.0 READY FOR PRODUCTION** 🎉

If any issues found, document them and we'll fix them immediately!
