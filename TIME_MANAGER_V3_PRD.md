# Time Manager V3 - Product Requirements Document

**Version:** 3.0  
**Date:** November 14, 2025  
**Status:** Implementation Ready  
**Objective:** Transform Time Manager into a world-class planner system combining Google Calendar, Sunsama, Notion, and Motion UX patterns.

---

## 🎯 Executive Summary

### Current State (80% Complete)
- ✅ Separate time-service microservice exists
- ✅ Models have proper schema with scope, session, reminders
- ✅ Backend services separated for visitor/owner
- ✅ Basic UI components functional
- ❌ **UX Issues:** Tasks don't stick to correct views, weekly isn't a real calendar, unclear daily placement
- ❌ **Missing:** Inline task creation, checkbox backend sync, reminder UX, error boundaries

### Target State (100% World-Class)
- ✅ Real calendar grids for weekly/monthly
- ✅ Inline task creation in each session/day/date cell
- ✅ Checkbox completion syncs to backend instantly
- ✅ Reminder system with email/SMS support
- ✅ Error boundaries isolate component failures
- ✅ Smooth animations and progress tracking
- ✅ Tasks properly scoped to their view (daily→daily, weekly→weekly, monthly→monthly)

---

## 🌙 UX Vision

### Design Principles
1. **Direct Manipulation** - Add tasks directly where they belong (no modal popups unless necessary)
2. **Instant Feedback** - Checkboxes update immediately with optimistic UI
3. **Clear Hierarchy** - Each view shows only tasks belonging to that scope
4. **Progressive Disclosure** - Show task details on demand
5. **Fail Gracefully** - If monthly breaks, daily/weekly still work

---

## 📋 Feature Specifications

### 1. Daily Planner (Session-Based Layout)

#### Visual Structure
```
┌─────────────────────────────────────────┐
│  Daily Planner - Nov 14, 2025           │
│  Progress: ████████░░ 80%               │
├─────────────────────────────────────────┤
│  ☀️ MORNING                [+ Add Task] │
│  ☐ Client consultation prep             │
│  ☑ Review analytics dashboard           │
│  ☐ Email follow-ups                     │
├─────────────────────────────────────────┤
│  🌤️ AFTERNOON              [+ Add Task] │
│  ☐ Team meeting                         │
│  ☐ Content planning                     │
├─────────────────────────────────────────┤
│  🌙 EVENING                [+ Add Task] │
│  ☐ Personal project work                │
└─────────────────────────────────────────┘
```

#### Requirements
- **3-Column Grid:** Morning | Afternoon | Evening
- **Inline Add Button:** Inside each session header
- **Task Cards Show:**
  - Checkbox (updates backend on click)
  - Title (click to expand/edit)
  - Duration badge (if set)
  - Priority indicator (color-coded)
- **Empty State:** "No tasks for [session]" with visual icon
- **API Call:** `GET /api/visitor/time/daily?date=YYYY-MM-DD`
- **Scope Filter:** Only shows tasks where `scopeTag='daily'` AND `taskDate=today`

---

### 2. Weekly Planner (7-Day Calendar Grid)

#### Visual Structure
```
┌──────────────────────────────────────────────────────────────┐
│  Weekly Planner - Nov 11-17, 2025                            │
│  Progress: ████████░░ 75%                                    │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────────┤
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │                 │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                 │
│[+]  │[+]  │[+]  │[+]  │[+]  │[+]  │[+]  │                 │
│☐ T1 │☐ T3 │☑ T5 │     │☐ T8 │     │☐ T9 │                 │
│☑ T2 │☐ T4 │☐ T6 │     │     │     │     │                 │
│     │     │☐ T7 │     │     │     │     │                 │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────────────────┘
```

#### Requirements
- **Horizontal 7-Day Grid:** Mon through Sun
- **Each Day Card Shows:**
  - Date number (e.g., "11")
  - "+ Add Task" button at top
  - List of tasks (title + checkbox only)
  - Max 5 tasks visible, "+N more" if overflow
- **Click Task:** Opens inline editor or side panel
- **Click Date:** Opens daily view for that date
- **Click "+ Add":** Opens quick add form with date pre-filled
- **API Call:** `GET /api/visitor/time/weekly?weekStart=YYYY-MM-DD`
- **Scope Filter:** Shows tasks where `scopeTag='weekly'` AND `taskDate in [Mon-Sun]`
- **Week Navigation:** Previous/Next week buttons

---

### 3. Monthly Planner (Full Calendar)

#### Visual Structure
```
┌────────────────────────────────────────────────────────────┐
│  Monthly Planner - November 2025          [← →]            │
│  Progress: ████████░░ 70%                                  │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┬────────────────┤
│ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                │
│     │     │     │     │     │  1  │  2  │                │
│     │     │     │     │     │ [+] │ [+] │                │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                │
│  3  │  4  │  5  │  6  │  7  │  8  │  9  │                │
│ [+] │ [+] │ [+] │ [+] │ [+] │ [+] │ [+] │                │
│ ☐T1 │     │ ☑T2 │     │ ☐T3 │     │     │                │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴────────────────┘
```

#### Requirements
- **Standard Calendar Grid:** 5-6 rows, 7 columns
- **Each Date Cell Shows:**
  - Date number
  - "+ Add" icon (top-right corner)
  - Up to 3 tasks (title + checkbox)
  - "+N more" badge if overflow
- **Click Date Number:** Opens daily view
- **Click "+ Add":** Quick add with date pre-filled
- **Click Task:** Inline edit
- **API Call:** `GET /api/visitor/time/monthly?month=11&year=2025`
- **Scope Filter:** Shows tasks where `scopeTag='monthly'` AND `taskDate in month`
- **Month Navigation:** Previous/Next month buttons

---

### 4. Reminder System

#### UX Flow
1. **On Any Task Card:** Show `🔔 Reminder` button
2. **Click Opens Modal:**
   ```
   ┌─────────────────────────────────┐
   │  Set Reminder                   │
   ├─────────────────────────────────┤
   │  Task: "Team meeting"           │
   │  Date: [Nov 14, 2025]           │
   │  Time: [09:00 AM]               │
   │                                 │
   │  Send via:                      │
   │  ☑ Email                        │
   │  ☐ SMS (enter phone)            │
   │                                 │
   │  [Cancel]  [Save Reminder]      │
   └─────────────────────────────────┘
   ```
3. **Backend:** Stores reminder in `task.reminder` object
4. **Cron Job:** Checks every minute for `reminder.sendAt <= now AND reminder.sentAt == null`
5. **Delivery:** Sends via Twilio (SMS) or Nodemailer (Email)
6. **Update:** Sets `reminder.sentAt = now`

#### API Endpoints
- `PUT /api/visitor/time/tasks/:id/reminder` - Set/update reminder
- `DELETE /api/visitor/time/tasks/:id/reminder` - Remove reminder

---

## 🏗️ Technical Architecture

### Backend Structure (Already Exists ✅)
```
time-service/
├── src/
│   ├── models/
│   │   ├── visitor/VisitorTask.js ✅
│   │   └── owner/OwnerTask.js ✅
│   ├── services/
│   │   ├── visitor/visitorTimeService.js ✅
│   │   ├── owner/ownerTimeService.js ✅
│   │   └── shared/reminderService.js ✅
│   ├── routes/
│   │   ├── visitor/timeRoutes.js ✅
│   │   └── owner/timeRoutes.js ✅
│   └── cron/
│       └── reminderCron.js (needs update)
```

### Frontend Structure (Needs Refinement)
```
frontend/src/features/timeManager/
├── pages/
│   ├── visitor/
│   │   ├── DailyView.jsx (needs inline add)
│   │   ├── WeeklyView.jsx (needs real grid)
│   │   └── MonthlyView.jsx (needs calendar)
│   └── owner/ (duplicate structure)
├── components/
│   ├── TaskCard.jsx (needs checkbox handler)
│   ├── AddTaskModal.jsx (convert to inline form)
│   ├── ReminderModal.jsx (NEW)
│   ├── ProgressBar.jsx ✅
│   ├── WeeklyGrid.jsx (needs rebuild)
│   ├── MonthlyGrid.jsx (NEW)
│   └── ErrorBoundary.jsx (NEW)
├── hooks/
│   ├── useTimeManagerApi.js ✅
│   └── useReminders.js (NEW)
└── styles/
    └── timeManagerNew.css
```

---

## 🔧 Implementation Phases

### PHASE 1: Fix Daily Planner ✅ (Already Good, Minor Tweaks)
**Goal:** Inline "Add Task" inside each session, instant checkbox updates

**Tasks:**
1. Move "+ Add Task" button inside session headers ✅ (Already done)
2. Add optimistic UI for checkbox clicks
3. Show duration + priority badges on TaskCard
4. Add empty state illustrations
5. Test error boundary

**Files to Edit:**
- `DailyView.jsx` - Minor refinements
- `TaskCard.jsx` - Add badges and instant feedback

---

### PHASE 2: Build Weekly Calendar Grid 🔨 (CRITICAL)
**Goal:** Real 7-day horizontal calendar

**Tasks:**
1. Create `WeeklyGrid.jsx` component with 7 columns
2. Map tasks to correct day using `taskDate`
3. Add "+ Add" inside each day card
4. Click day → open daily view for that date
5. Add week navigation (prev/next)

**Files to Create/Edit:**
- `WeeklyGrid.jsx` (rebuild existing)
- `WeeklyView.jsx` (connect to new grid)

**API Logic:**
```javascript
// GET /api/visitor/time/weekly?weekStart=2025-11-11
// Returns tasks where:
// - scopeTag='weekly'
// - taskDate >= 2025-11-11 AND taskDate <= 2025-11-17
```

---

### PHASE 3: Build Monthly Calendar 🔨 (NEW COMPONENT)
**Goal:** Standard month calendar with task indicators

**Tasks:**
1. Create `MonthlyGrid.jsx` with calendar generation logic
2. Calculate first day of month, number of days
3. Render 5-6 week rows
4. Show task count badges per date
5. Click date → daily view
6. Add "+ Add" icon in each cell
7. Month navigation (prev/next)

**Files to Create:**
- `MonthlyGrid.jsx` (NEW)
- `MonthlyView.jsx` (rebuild existing)

**Calendar Logic:**
```javascript
function generateCalendar(month, year) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDay = firstDay.getDay(); // 0=Sun, 6=Sat
  const daysInMonth = lastDay.getDate();
  
  // Build grid with padding
  const grid = [];
  let week = [];
  
  // Padding days from previous month
  for (let i = 0; i < startDay; i++) {
    week.push(null);
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  
  // Final week padding
  while (week.length > 0 && week.length < 7) {
    week.push(null);
  }
  if (week.length > 0) grid.push(week);
  
  return grid;
}
```

---

### PHASE 4: Reminder System 🔔 (NEW FEATURE)
**Goal:** Full reminder UX + backend

**Tasks:**
1. Create `ReminderModal.jsx`
2. Add "🔔 Reminder" button to TaskCard
3. Backend endpoint: `PUT /tasks/:id/reminder`
4. Update `reminderCron.js` to check every minute
5. Integrate Twilio (SMS) and Nodemailer (Email)
6. Test delivery

**Files to Create/Edit:**
- `ReminderModal.jsx` (NEW)
- `TaskCard.jsx` (add reminder button)
- `reminderCron.js` (update logic)
- `reminderService.js` (SMS/Email integration)

**Cron Logic:**
```javascript
// Run every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  // Find tasks with pending reminders
  const tasks = await VisitorTask.find({
    'reminder.enabled': true,
    'reminder.sendAt': { $lte: now },
    'reminder.sentAt': null
  });
  
  for (const task of tasks) {
    await sendReminder(task);
    task.reminder.sentAt = now;
    await task.save();
  }
});
```

---

### PHASE 5: Owner Profile Integration 🏢
**Goal:** Duplicate time manager for owners

**Tasks:**
1. Copy `visitor/*` pages to `owner/*`
2. Update API hook to use owner endpoints
3. Test isolation (visitor data ≠ owner data)
4. Add business-specific fields if needed

**Files to Create:**
- `pages/owner/DailyView.jsx`
- `pages/owner/WeeklyView.jsx`
- `pages/owner/MonthlyView.jsx`

---

### PHASE 6: Final Polish 🎨
**Goal:** Animations, progress tracking, error handling

**Tasks:**
1. Add fade-in animations for modals/grids
2. Add error boundaries around each view
3. Test component isolation (if monthly crashes, daily still works)
4. Add loading skeletons
5. Performance optimization (memoization, lazy loading)
6. Accessibility audit (keyboard navigation, ARIA labels)

**Components to Add:**
- `ErrorBoundary.jsx`
- `LoadingSkeleton.jsx`
- `EmptyState.jsx`

---

## 🧪 Testing Strategy

### Unit Tests
- Task card checkbox updates
- Calendar grid generation
- Date range calculations
- Reminder scheduling logic

### Integration Tests
- Daily → Weekly → Monthly navigation
- Task creation across views
- Reminder delivery
- Error boundary isolation

### E2E Tests
```javascript
// Cypress test example
describe('Time Manager Weekly View', () => {
  it('should create task in correct day', () => {
    cy.visit('/visitor/time/weekly');
    cy.get('[data-day="Wed"]').find('[data-testid="add-task"]').click();
    cy.get('input[name="title"]').type('Test Task');
    cy.get('button[type="submit"]').click();
    cy.get('[data-day="Wed"]').should('contain', 'Test Task');
  });
});
```

---

## 📊 Success Metrics

### UX Metrics
- ✅ Task creation time < 5 seconds
- ✅ Checkbox response time < 200ms
- ✅ View switching animation < 300ms
- ✅ Reminder delivery accuracy > 99%

### Technical Metrics
- ✅ Component isolation (error boundary coverage 100%)
- ✅ API response time < 500ms
- ✅ Frontend bundle size increase < 50KB
- ✅ Zero data leakage between visitor/owner

---

## 🚀 Deployment Plan

### Phase Rollout
1. **Week 1:** PHASE 1-2 (Daily + Weekly)
2. **Week 2:** PHASE 3-4 (Monthly + Reminders)
3. **Week 3:** PHASE 5-6 (Owner + Polish)

### Feature Flags
```javascript
const FEATURES = {
  TIME_MANAGER_WEEKLY_GRID: true,
  TIME_MANAGER_MONTHLY_CALENDAR: true,
  TIME_MANAGER_REMINDERS: false, // Enable after testing
  TIME_MANAGER_OWNER: false
};
```

---

## 📝 API Reference

### Visitor Endpoints
```
GET    /api/visitor/time/daily?date=YYYY-MM-DD
POST   /api/visitor/time/daily
GET    /api/visitor/time/weekly?weekStart=YYYY-MM-DD
POST   /api/visitor/time/weekly
GET    /api/visitor/time/monthly?month=MM&year=YYYY
POST   /api/visitor/time/monthly
PUT    /api/visitor/time/tasks/:id
DELETE /api/visitor/time/tasks/:id
PUT    /api/visitor/time/tasks/:id/complete
PUT    /api/visitor/time/tasks/:id/reminder
DELETE /api/visitor/time/tasks/:id/reminder
```

### Owner Endpoints (Same structure)
```
/api/owner/time/daily
/api/owner/time/weekly
/api/owner/time/monthly
/api/owner/time/tasks/:id
...
```

---

## 🎨 Design System

### Colors
- **Primary:** #6366f1 (Indigo)
- **Success:** #22c55e (Green)
- **Warning:** #f59e0b (Amber)
- **Error:** #ef4444 (Red)
- **Gray Scale:** #f3f4f6, #e5e7eb, #9ca3af, #4b5563

### Typography
- **Headings:** Inter, 600 weight
- **Body:** Inter, 400 weight
- **Mono:** JetBrains Mono (for time displays)

### Spacing
- **Base Unit:** 4px
- **Grid Gap:** 16px (4 units)
- **Card Padding:** 16px
- **Section Margin:** 24px

---

## 🔐 Security Considerations

### Data Isolation
- Visitor and owner tasks completely separate
- UserId validation on all endpoints
- No shared task IDs across profiles

### Reminder Safety
- Rate limit: 10 reminders per user per day
- Phone number validation before SMS
- Email whitelist/blacklist support
- Cron job failure recovery

### Error Handling
- Never expose internal error details
- Log all errors to monitoring service
- Graceful degradation (offline mode)

---

## 📚 Documentation

### User Guide
- How to create daily tasks
- How to navigate weekly/monthly views
- How to set reminders
- Keyboard shortcuts

### Developer Guide
- Component architecture
- API integration
- Error boundary setup
- Testing guidelines

---

## 🏁 Conclusion

This PRD provides a complete roadmap to transform the Time Manager from 80% to 100% world-class. The backend is already solid; we need to focus on **UX refinement, real calendar grids, reminder system, and error isolation**.

**Next Steps:**
1. ✅ Get stakeholder approval on UX vision
2. 🔨 Start PHASE 2 (Weekly Grid) immediately
3. 📅 Schedule PHASE 3 (Monthly Calendar)
4. 🔔 Test reminder system thoroughly
5. 🚀 Deploy incrementally with feature flags

---

**Document Owner:** Development Team  
**Last Updated:** November 14, 2025  
**Review Cycle:** Bi-weekly during implementation
