# 🤖 CLAUDE.md - Internal AI Agent Documentation
**Last Updated:** 2025-01-25
**Session Context:** Admin Comment Paywall Toggle Implementation

---

## 📋 Table of Contents
1. [Session Summary](#session-summary)
2. [Implementation Overview](#implementation-overview)
3. [Files Created/Modified](#files-createdmodified)
4. [Architecture Decisions](#architecture-decisions)
5. [Testing Checklist](#testing-checklist)
6. [Future Considerations](#future-considerations)

---

## Session Summary

### **Problem Statement**
User needed ability to temporarily disable comment paywall for testing/debugging without touching code or redeploying. Current implementation blocked ALL commenting when user didn't have premium/chat pass, preventing admin from testing the feature itself.

### **Solution Implemented**
World-class admin toggle system with 4-layer architecture:
1. **Global Config Model** - Database-backed configuration store
2. **Cached Config Service** - 5-minute TTL in-memory cache
3. **Entitlements Integration** - Global override in `canComment()` function
4. **Admin Dashboard UI** - Beautiful toggle switch with instant feedback

### **Business Value**
- ✅ Test comment features without upgrade prompts
- ✅ Run "Free Comment Weekend" promotions
- ✅ Emergency kill-switch if payment system breaks
- ✅ Zero code deployment needed after implementation
- ✅ Admin audit trail (who changed what, when)

---

## Implementation Overview

### **System Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD UI                        │
│   [💬 Comment Paywall Control] [🔒 ON/OFF Toggle]           │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST /admin/config/comment-paywall
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              ADMIN API ROUTE (configRoutes.js)               │
│  • Validates boolean input                                   │
│  • Requires adminOnly middleware                             │
│  • Updates SystemConfig DB + instant cache update            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            CONFIG SERVICE (configService.js)                 │
│  • In-memory cache: 5-min TTL                                │
│  • Auto-refresh on first access after expiry                 │
│  • Instant cache update on writes                            │
│  • Fallback to safe defaults if DB unavailable              │
└───────────────────────┬─────────────────────────────────────┘
                        │ isCommentPaywallEnabled()
                        ▼
┌─────────────────────────────────────────────────────────────┐
│     ENTITLEMENTS SERVICE (chatEntitlementsService.js)        │
│  canComment() checks global flag FIRST:                      │
│    if (!await isCommentPaywallEnabled()) return true;        │
│    // ... rest of premium/chat pass logic                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          COMMENTS CONTROLLER (commentsController.js)         │
│  Uses canComment() before creating comment                   │
│  Returns 403 with upgrade prompt if not allowed              │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Created/Modified

### **✨ NEW FILES CREATED**

#### 1. `backend/models/SystemConfig.js`
**Purpose:** Universal model for storing global platform configurations
**Key Features:**
- Unique key-value pairs (supports any data type)
- Tracks who changed what (`updatedBy` field)
- Automatic timestamps (`createdAt`, `updatedAt`)
- Indexed for fast lookups

#### 2. `backend/services/configService.js`
**Purpose:** Cached configuration management service
**Key Features:**
- 5-minute in-memory cache (300,000ms TTL)
- Auto-refresh on stale cache
- Instant cache update on writes
- Safe defaults if DB unavailable
- `initializeDefaults()` - Seeds default configs on startup
- `isCommentPaywallEnabled()` - Helper for comment paywall check

#### 3. `backend/routes/admin/configRoutes.js`
**Purpose:** Admin-only API endpoints for config management
**Routes:**
- `GET /admin/config/comment-paywall` - Get current paywall status
- `POST /admin/config/comment-paywall` - Toggle paywall (requires `{enabled: boolean}`)

**Security:** Protected by `protect` + `adminOnly` middleware

---

### **📝 MODIFIED FILES**

#### 1. `backend/services/chatEntitlementsService.js`
**Changes:**
- Added import: `const { isCommentPaywallEnabled } = require('./configService');`
- Modified `canComment()` function to check global flag FIRST (lines 170-174):
  ```javascript
  // 🌐 GLOBAL ADMIN OVERRIDE - Check if paywall is disabled
  const paywallEnabled = await isCommentPaywallEnabled();
  if (!paywallEnabled) {
    return { allowed: true, reason: 'Paywall disabled by admin' };
  }
  ```

#### 2. `backend/routes/adminRoutes.js`
**Changes:**
- Added import and mount for config routes (lines 10-11):
  ```javascript
  const adminConfigRoutes = require('./admin/configRoutes');
  router.use('/config', adminConfigRoutes);
  ```

#### 3. `backend/server.js`
**Changes:**
- Added config service initialization after DB connection (lines 101-108):
  ```javascript
  // Initialize global config service
  try {
    const { initializeDefaults } = require('./services/configService');
    await initializeDefaults();
    logger.info('Config service initialized with defaults');
  } catch (err) {
    logger.warn('Config service initialization failed:', err.message);
  }
  ```

#### 4. `frontend/src/components/AdminDashboard.js`
**Changes:**
- Added state management:
  - `commentPaywallEnabled` (boolean)
  - `paywallLoading` (boolean)
- Added `toggleCommentPaywall()` async function
- Added API call to fetch initial paywall status in `useEffect`
- Added beautiful toggle UI section between "Maintenance" and "Publish Article" sections
- Features:
  - Animated toggle switch (pink when ON, gray when OFF)
  - Lock/unlock emoji indicators (🔒/🔓)
  - Clear status text explaining current state
  - Loading state during API call

---

## Architecture Decisions

### **Why In-Memory Cache (Not Redis)?**
- **Simplicity:** No additional infrastructure needed
- **Performance:** Zero network latency
- **Cost:** Free (no Redis instance required)
- **Scale:** 5-minute TTL is acceptable for this use case
- **Future:** Easy to swap for Redis if multi-server deployment needed

### **Why 5-Minute Cache TTL?**
- **Balance:** Performance vs. responsiveness
- **Admin Experience:** Toggle takes effect within 5 minutes automatically
- **Cost:** Reduces DB queries from thousands/min to ~12/hour
- **Emergency:** Admin can restart server if immediate change needed

### **Why Global Override in `canComment()`?**
- **Single Point of Control:** Only one place to modify
- **No Code Duplication:** Reuses existing entitlements logic
- **Safe Default:** If cache/DB fails, defaults to paywall ON (safe for revenue)
- **Clean Architecture:** Separation of concerns (config vs. business logic)

### **Why Admin-Only (Not User-Configurable)?**
- **Business Control:** Monetization should be platform decision
- **Prevents Abuse:** Users can't bypass paywall themselves
- **Audit Trail:** Track which admin made changes
- **Security:** Requires admin auth token

---

## Testing Checklist

### **Backend Testing**
- [ ] Server starts without errors after config service initialization
- [ ] `GET /admin/config/comment-paywall` returns `{enabled: true}` by default
- [ ] `POST /admin/config/comment-paywall` with `{enabled: false}` updates database
- [ ] Non-admin users get 403 when accessing config routes
- [ ] Config cache refreshes after 5 minutes
- [ ] Instant cache update after POST (no 5-min wait)

### **Comment System Testing**
- [ ] **Paywall ON:** Non-premium visitor blocked from commenting
- [ ] **Paywall ON:** Premium owner CAN comment
- [ ] **Paywall OFF:** ANY visitor can comment freely
- [ ] **Paywall OFF:** ANY owner can comment freely
- [ ] Error responses include proper upgrade prompts when paywall ON

### **Admin Dashboard Testing**
- [ ] Toggle appears in admin dashboard between Maintenance and Publish Article
- [ ] Toggle shows correct initial state (ON/OFF)
- [ ] Clicking toggle triggers API call and updates UI
- [ ] Loading state shows during API call
- [ ] Status text updates immediately after toggle
- [ ] Lock/unlock emoji changes based on state
- [ ] Color changes: Pink (ON) / Gray (OFF)

### **Integration Testing**
- [ ] Toggle OFF → Test comment as visitor → Comment created successfully
- [ ] Toggle OFF → Test comment as owner → Comment created successfully
- [ ] Toggle ON → Test comment as visitor without chat pass → 403 error with upgrade prompt
- [ ] Toggle ON → Test comment as owner without premium → 403 error with upgrade prompt
- [ ] Multiple admins can see same toggle state
- [ ] Changes persist after server restart

---

## Future Considerations

### **Potential Enhancements**
1. **Audit Logs Dashboard**
   - Show history of who toggled paywall when
   - Track revenue impact of free periods

2. **Scheduled Toggles**
   - "Free Comment Weekend" auto-scheduler
   - Time-based promotions

3. **A/B Testing Integration**
   - Split traffic: 50% paywall ON, 50% OFF
   - Measure conversion impact

4. **More Feature Flags**
   - Maintenance mode
   - Beta feature toggles
   - Regional settings

5. **Redis Migration (if multi-server)**
   - Replace in-memory cache with Redis
   - Instant propagation across all servers
   - No 5-minute delay

### **Known Limitations**
- Cache TTL means changes take up to 5 minutes to propagate
- In-memory cache doesn't survive server restarts (refetches from DB)
- No rollback mechanism (can toggle back, but no automatic rollback)

---

## Quick Reference

### **How to Add New Global Config**
```javascript
// 1. Add default in configService.js initializeDefaults()
{
  key: 'newFeatureEnabled',
  value: false,
  description: 'Enable new feature X'
}

// 2. Create helper function in configService.js
async function isNewFeatureEnabled() {
  return await getConfig('newFeatureEnabled', false);
}

// 3. Export it
module.exports = {
  // ... existing exports
  isNewFeatureEnabled
};

// 4. Use in your code
const { isNewFeatureEnabled } = require('./services/configService');
if (await isNewFeatureEnabled()) {
  // feature logic
}
```

### **How to Debug Config Issues**
```javascript
// Force cache refresh
const { refreshCache } = require('./services/configService');
await refreshCache();

// Check current cache state
console.log(configCache); // Internal variable in configService.js

// Query database directly
const SystemConfig = require('./models/SystemConfig');
const config = await SystemConfig.findOne({ key: 'commentPaywallEnabled' });
console.log(config);
```

---

## Summary for Future AI Agents

**What was built:** Global admin toggle for comment paywall with 4-layer architecture (Model → Service → Entitlements → UI).

**Why it was built:** Enable testing/debugging of comment features without hitting paywall, run promotions, and provide emergency kill-switch.

**How it works:** Admin clicks toggle in dashboard → API updates database + cache → `canComment()` checks global flag → returns true if paywall disabled, bypassing premium checks.

**Key files:**
- `SystemConfig.js` (model)
- `configService.js` (caching)
- `chatEntitlementsService.js` (integration)
- `adminRoutes.js` + `admin/configRoutes.js` (API)
- `AdminDashboard.js` (UI)

**Safe to modify:** Adding more feature flags follows same pattern. Never breaks existing premium logic.

**DO NOT modify:** `canComment()` premium checks (only the global override at top). Cache TTL without understanding performance impact.

---

# Hair Glow-Up Diary: Flexible Rolling Weeks System

**Last Updated:** 2025-11-26
**Feature:** Personal Week Timing System for Hair Goals Tracking

---

## Problem Statement

Users needed a clear understanding of:
1. When their current week started and ends
2. How far through the week they are (progress)
3. Real-time tracking of completed routine tasks
4. A system that makes sense regardless of when they started their journey

The original implementation used calendar weeks (Mon-Sun), which caused confusion when users started mid-week.

---

## Solution: Personal Rolling Weeks

### Core Concept
**Weeks are personal 7-day periods starting from when the user began their journey, NOT calendar weeks.**

Example:
- User starts journey on Thursday, Jan 15
- Week 1: Jan 15 - Jan 21
- Week 2: Jan 22 - Jan 28
- And so on...

### Key Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| Week Timing | Personal 7-day periods from journey start | Calendar weeks cause confusion when starting mid-week |
| Missed Weeks | Auto-advance, can fill past weeks | Don't block user progress; encourage catching up |
| Task Completion | Real-time checking with localStorage | Immediate feedback; persists across sessions |
| Week Completion | Auto-completes when week ends | Low friction; logging is optional but encouraged |

---

## Architecture

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    HairGoalsContext                          │
│  • startDate: Journey start timestamp                        │
│  • getCurrentWeekNumber(): Calculates week from start date   │
│  • getWeekInfo(): Returns dates, progress, days remaining    │
│  • initializeJourney(): Sets start date when user begins     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    HairGoalsPage                             │
│  • Week Info Card: Shows week timing visually                │
│  • Real-time Checklist: Tasks saved on each click            │
│  • Progress Bar: Visual % through current week               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  hairGoalsStorage.js                         │
│  • WEEKLY_CHECKLIST: { [weekNumber]: { [stepId]: bool } }   │
│  • getChecklistForWeek(weekNum): Load week's checked items   │
│  • updateChecklistItem(week, stepId, checked): Save item     │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified

### 1. `frontend/src/features/toolkit/context/HairGoalsContext.jsx`

**New Helper Functions:**
```javascript
// Format date as "Mar 15"
function formatShortDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Add days to a date
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Get days remaining until end date
function getDaysRemaining(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
```

**New Context Functions:**
- `getWeekInfo(weekNumber?)` - Returns comprehensive week information:
  ```javascript
  {
    weekNumber: 3,
    startDate: Date,
    endDate: Date,
    startFormatted: "Mar 15",    // Human-readable
    endFormatted: "Mar 21",      // Human-readable
    daysRemaining: 4,
    progressPercent: 43,         // 0-100
    isCurrentWeek: true,
    isPastWeek: false,
    isFutureWeek: false
  }
  ```
- `initializeJourney(customStartDate?)` - Sets journey start date

**Updated Functions:**
- `getCurrentWeekNumber()` - Now calculates based on personal start date

---

### 2. `frontend/src/features/toolkit/utils/hairGoalsStorage.js`

**New Storage Key:**
```javascript
WEEKLY_CHECKLIST: 'weeklyChecklist'  // Real-time checklist state per week
```

**New Functions:**
```javascript
// Load all weeks' checklists
export function loadWeeklyChecklist(userId = 'default')

// Save all weeks' checklists
export function saveWeeklyChecklist(checklist, userId = 'default')

// Get checklist for specific week
export function getChecklistForWeek(weekNumber, userId = 'default')

// Update single item in a week's checklist (real-time save)
export function updateChecklistItem(weekNumber, stepId, isChecked, userId = 'default')
```

**Data Structure:**
```javascript
{
  1: { "step-123": true, "step-456": false },  // Week 1
  2: { "step-123": true, "step-456": true },   // Week 2
  // ...
}
```

---

### 3. `frontend/src/features/toolkit/pages/HairGoalsPage.jsx`

**New Imports:**
```javascript
import {
  // ... existing imports
  getChecklistForWeek,
  updateChecklistItem
} from "../utils/hairGoalsStorage";
```

**New useEffect for Loading Checklist:**
```javascript
// Load checked items when current week changes
useEffect(() => {
  if (currentWeek && routineSteps.length > 0) {
    const savedChecklist = getChecklistForWeek(currentWeek);
    const checkedState = {};
    routineSteps.forEach((item) => {
      checkedState[item.id] = savedChecklist[item.id] || false;
    });
    setCheckedItems(checkedState);
  }
}, [currentWeek, routineSteps]);
```

**Updated handleCheckItem (Real-time Saving):**
```javascript
const handleCheckItem = (stepId) => {
  const newValue = !checkedItems[stepId];
  setCheckedItems((prev) => ({
    ...prev,
    [stepId]: newValue,
  }));
  // Persist to localStorage in real-time
  updateChecklistItem(currentWeek, stepId, newValue);
};
```

**New Dashboard UI - Week Info Card:**
```jsx
<div className="hg-week-info-card">
  <div className="hg-week-info-card__header">
    <div className="hg-week-info-card__title">
      <span className="hg-week-info-card__week">Week {currentWeek}</span>
      <span className="hg-week-info-card__goal">{selectedGoal?.emoji} {selectedGoal?.title}</span>
    </div>
    {streak > 0 && (
      <div className="hg-week-info-card__streak">{streak} 🔥</div>
    )}
  </div>

  <div className="hg-week-info-card__dates">
    <span>Started: {weekInfo.startFormatted}</span>
    <span className="hg-week-info-card__arrow">→</span>
    <span>Ends: {weekInfo.endFormatted}</span>
  </div>

  <div className="hg-week-info-card__progress">
    <div className="hg-week-info-card__progress-bar">
      <div className="hg-week-info-card__progress-fill" style={{ width: `${weekInfo.progressPercent}%` }} />
    </div>
    <span className="hg-week-info-card__days-left">
      {weekInfo.daysRemaining === 0 ? "Last day!" : `${weekInfo.daysRemaining} days left`}
    </span>
  </div>
</div>
```

---

### 4. `frontend/src/features/toolkit/styles/hairGoalsDiary.css`

**New CSS Classes (lines 1666-1814):**
- `.hg-week-info-card` - Main container with gradient background
- `.hg-week-info-card__header` - Flex header with week/goal + streak
- `.hg-week-info-card__week` - Large week number
- `.hg-week-info-card__goal` - Goal emoji + title
- `.hg-week-info-card__streak` - Golden streak badge
- `.hg-week-info-card__dates` - Date range display
- `.hg-week-info-card__arrow` - Arrow between dates
- `.hg-week-info-card__progress` - Progress container
- `.hg-week-info-card__progress-bar` - Background track
- `.hg-week-info-card__progress-fill` - Animated fill
- `.hg-week-info-card__days-left` - Days remaining text

**Design Features:**
- Purple gradient background matching app theme
- Golden streak badge with shadow
- Smooth progress bar animation
- Dark mode support
- Mobile responsive

---

## Testing Checklist

### Week Calculation
- [ ] New user starts journey → Week 1 starts today
- [ ] User 10 days into journey → Shows Week 2
- [ ] Week dates are correct (7-day spans)
- [ ] Progress percentage updates through the week

### Checklist Persistence
- [ ] Check an item → Saved to localStorage immediately
- [ ] Refresh page → Checked items still checked
- [ ] Change weeks → Different checklist shown
- [ ] Go back to previous week → Previous checks preserved

### UI/UX
- [ ] Week Info Card displays clearly
- [ ] Dates formatted as "Mar 15" not "2024-03-15"
- [ ] Progress bar fills smoothly
- [ ] "Last day!" shows on final day
- [ ] Streak badge only shows if streak > 0
- [ ] Mobile layout works properly

---

## Usage Examples

### User Journey Example
```
Day 1 (Start):
  - User selects goal: "Grow Length"
  - User adds routine: Wash (Mon), Deep Condition (Wed)
  - Journey starts: Nov 26, 2025

Dashboard shows:
  - Week 1
  - Started: Nov 26 → Ends: Dec 2
  - Progress: 0% (first day)
  - 6 days left

Day 4:
  - User checks "Wash" task
  - Progress: 57%
  - 3 days left

Day 8 (Week 2):
  - Auto-advances to Week 2
  - Started: Dec 3 → Ends: Dec 9
  - Previous week's checks preserved in storage
  - Fresh checklist for Week 2
```

---

## Future Enhancements

1. **Week History View** - See all past weeks with completion %
2. **Notifications** - Remind user when week is ending
3. **Analytics** - Track which tasks are consistently completed
4. **Custom Week Length** - Allow 5-day or 10-day cycles
5. **Sync to Backend** - Store checklist in database for cross-device

---

## Quick Debugging

```javascript
// Check current week info
const weekInfo = getWeekInfo();
console.log(weekInfo);

// Check stored checklist
const allChecklists = loadWeeklyChecklist();
console.log(allChecklists);

// Force start date (for testing)
saveField('START_DATE', '2025-11-20T00:00:00.000Z');
```

---

*End of Hair Goals Flexible Rolling Weeks Documentation*

---

# Hair Glow-Up Diary: Journey Feature Enhancement

**Last Updated:** 2025-11-27
**Feature:** My Past Journeys - Emotional Memory Book Experience

---

## Overview

Enhanced the Journey History feature to transform raw data archives into an emotional "Memory Book" experience. Users can now name their journeys, add taglines, see feeling timelines, and revisit their hair story in a beautiful scrapbook format.

---

## Core Changes

### 1. Security Framework Added

**File:** `frontend/src/features/toolkit/utils/hairGoalsStorage.js`

Added comprehensive security measures for localStorage data:

```javascript
// Max length limits for text fields
const MAX_LENGTHS = {
  name: 100,
  tagline: 200,
  note: 500,
  goalNote: 500,
  progressNote: 1000,
};

// Sanitize text input to prevent XSS
export function sanitizeText(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .replace(/[<>]/g, '')      // Remove remaining angle brackets
    .trim()
    .slice(0, maxLength);
}

// Validate journey object structure
export function validateJourney(journey) {
  const errors = [];
  if (!journey.id) errors.push('Journey ID is required');
  if (journey.name && journey.name.length > MAX_LENGTHS.name)
    errors.push('Name exceeds maximum length');
  // ... more validations
  return { valid: errors.length === 0, errors };
}
```

### 2. Journey Naming Modal

**File:** `frontend/src/features/toolkit/components/JourneyNameModal.jsx`

A beautiful modal that appears when users restart their journey:

- Optional naming (skip generates auto-name like "Grow Length - Nov 2025")
- Tagline field for emotional context
- Input validation and sanitization
- Smooth animations
- Skip or Save & Archive options

### 3. Feeling Timeline Component

**File:** `frontend/src/features/toolkit/components/FeelingTimeline.jsx`

Visual timeline showing emotional journey milestones:

- Shows 3 key points: Start -> Middle -> End
- Compact mode for cards (emojis with arrows)
- Full mode for Memory Book (dots, week labels, feeling words)
- Summary text based on emotional arc

### 4. Journey History Page Redesign

**File:** `frontend/src/features/toolkit/pages/HairGoalsJourneyHistoryPage.jsx`

Transformed from data list to emotional scrapbook:

- Cover photo cards (uses last photo from journey)
- Custom journey names with edit capability
- Taglines displayed in italics
- Feeling timeline preview (compact mode)
- Stats row: weeks, logged, photos
- Final feeling indicator
- Inline edit mode for name/tagline
- Beautiful empty state

### 5. Journey Detail Page Redesign (Memory Book)

**File:** `frontend/src/features/toolkit/pages/HairGoalsJourneyDetailPage.jsx`

Beautiful scrapbook-style journey detail:

- Hero section with cover photo
- Editable name and tagline
- Stats summary bar
- Emotional section titles with icons:
  - "The Emotional Journey" (feeling timeline)
  - "Captured Moments" (photo grid)
  - "Week by Week" (notes and reflections)
  - "Products I Loved"
  - "The Routine"
  - "The Goal"

---

## New Storage Functions

```javascript
// Generate default journey name
export function generateJourneyName(goal, startDate, endDate) {
  const goalTitle = goal?.title || 'Hair Journey';
  const month = new Date(startDate).toLocaleString('default', { month: 'short' });
  const year = new Date(startDate).getFullYear();
  return `${goalTitle} - ${month} ${year}`;
}

// Update journey name/tagline (for retroactive editing)
export function updateJourneyDetails(journeyId, updates, userId = 'default') {
  const history = loadJourneyHistory(userId);
  const index = history.findIndex(j => j.id === journeyId);
  if (index === -1) return { success: false };

  history[index] = {
    ...history[index],
    name: sanitizeText(updates.name, MAX_LENGTHS.name),
    tagline: sanitizeText(updates.tagline, MAX_LENGTHS.tagline)
  };

  localStorage.setItem(getKey(STORAGE_KEYS.JOURNEY_HISTORY, userId), JSON.stringify(history));
  return { success: true };
}

// Get single journey by ID
export function getJourneyById(journeyId, userId = 'default') {
  const history = loadJourneyHistory(userId);
  return history.find(j => j.id === journeyId) || null;
}
```

---

## CSS Classes Reference

### Journey Name Modal (jnm-*)
- `.jnm-overlay` - Modal backdrop
- `.jnm-modal` - Modal container
- `.jnm-header` - Title section
- `.jnm-form` - Form fields
- `.jnm-input` - Text inputs
- `.jnm-btn-skip` / `.jnm-btn-save` - Action buttons

### Feeling Timeline (ft-*)
- `.ft-compact` - Compact emoji row
- `.ft-timeline` - Full timeline
- `.ft-milestone` - Milestone point
- `.ft-milestone-dot` - Emoji circle
- `.ft-connector` - Line between milestones
- `.ft-summary` - Summary text box

### Journey History Page (jhp-*)
- `.jhp-grid` - Card grid layout
- `.jhp-card` - Journey card
- `.jhp-card-cover` - Cover photo area
- `.jhp-card-content` - Card body
- `.jhp-card-stats` - Stats row
- `.jhp-card-timeline` - Timeline preview
- `.jhp-card-edit` - Edit mode
- `.jhp-empty` - Empty state

### Memory Book (mb-*)
- `.mb-hero` - Hero section
- `.mb-hero-cover` - Cover photo
- `.mb-hero-content` - Title area
- `.mb-stats` - Stats bar
- `.mb-section` - Content section
- `.mb-section-header` - Section header with icon
- `.mb-photo-grid` - Photo gallery
- `.mb-weeks` - Week cards container
- `.mb-week-card` - Individual week
- `.mb-products` / `.mb-routine` - Lists
- `.mb-goal` - Goal section

---

## Data Structure

Journey object now includes:

```javascript
{
  id: "journey-1732712345678",
  sequence: 1,
  savedAt: "2025-11-27T10:00:00.000Z",
  startDate: "2025-10-01T00:00:00.000Z",
  endDate: "2025-11-27T00:00:00.000Z",

  // NEW: Custom naming
  name: "My Waist Length Journey",  // Optional, auto-generated if skipped
  tagline: "The journey that changed everything",  // Optional

  goal: { id: 'length', emoji: '📏', title: 'Grow Length', ... },
  routineSteps: [...],
  products: [...],
  weeklyEntries: [...],
  photos: [...],
  summary: {
    finalFeeling: 4,
    weeksLogged: 8,
    streak: 5
  }
}
```

---

## Testing Checklist

### Journey Naming
- [ ] Click "Start New Journey" -> Naming modal appears
- [ ] Enter custom name -> Saves correctly
- [ ] Click "Skip" -> Auto-generated name used
- [ ] Tagline is optional
- [ ] XSS input is sanitized

### Journey History Page
- [ ] Cards show cover photos (if available)
- [ ] Edit button works (pencil icon)
- [ ] Inline editing saves changes
- [ ] Feeling timeline shows in compact mode
- [ ] "Open Memory Book" navigates correctly
- [ ] "Compare" shows photo compare modal
- [ ] Empty state displays when no journeys

### Memory Book (Detail Page)
- [ ] Hero shows cover photo or gradient
- [ ] Name and tagline editable
- [ ] Stats show correctly
- [ ] Feeling timeline shows in full mode
- [ ] Photo grid displays all photos
- [ ] Week cards show feelings and notes
- [ ] Products and routine sections work
- [ ] Goal section shows at bottom
- [ ] Back button returns to history

### Security
- [ ] HTML tags stripped from inputs
- [ ] Max lengths enforced
- [ ] Validation errors shown appropriately

---

## Future Enhancements

1. **Share Journey** - Generate shareable link/image
2. **Export to PDF** - Download memory book as PDF
3. **Journey Comparisons** - Side-by-side view of multiple journeys
4. **Backend Sync** - Store journeys in MongoDB for cross-device
5. **Journey Templates** - Pre-made names/taglines based on goal type

---

## Quick Reference

### Restart Journey Flow
```
User clicks "Start New Journey"
  -> handleRestartJourney() prepares journey data
  -> setNameModalOpen(true)
  -> JourneyNameModal opens

User enters name (optional) + tagline (optional)
  -> Click "Save & Archive" or "Skip"
  -> handleSaveJourneyWithName({ name, tagline })
  -> appendJourneyHistoryEntry() validates & saves
  -> resetAllData() clears current journey
  -> setCurrentView('goal') restarts flow
```

### Edit Journey Name
```
User clicks pencil icon on card
  -> startEdit(journey)
  -> Card switches to edit mode

User edits name/tagline
  -> saveEdit()
  -> updateJourneyDetails() saves to localStorage
  -> Local state updated
  -> Toast shows "Journey updated!"
```

---

*End of Journey Feature Enhancement Documentation*

---

# Business Profile Page - Marketplace Style 2025

**Last Updated:** 2025-11-27
**Feature:** Visitor Business Profile Redesign (Booksy/Fresha inspired)

---

## Overview

Complete redesign of the Business Profile page for visitors to match modern marketplace standards (Booksy, Fresha, StyleSeat). The new design features a hero banner, quick action bar, photo gallery with lightbox, and modular component architecture.

---

## Architecture

### Component Structure
```
frontend/src/components/business/
├── index.js                 # Barrel exports
├── BusinessHero.jsx         # Hero banner with cover photo, ratings, verified badge
├── BusinessActions.jsx      # Quick action bar (Save, Message, Directions, Share)
├── BusinessPhotos.jsx       # Photo gallery with lightbox preview
├── BusinessAbout.jsx        # Description, hours, contact, social media
├── BusinessServices.jsx     # Services list with prices, disabled Book buttons
└── BusinessStaff.jsx        # Team member grid with avatars
```

### Main Page
```
frontend/src/pages/visitor/
├── BusinessProfile.jsx      # Main page composing all components
└── BusinessProfile.css      # Comprehensive styles (1300+ lines)
```

---

## Key Components

### 1. BusinessHero
- Full-width hero banner with cover photo or gradient fallback
- Business logo in circle
- Category badge and verification status
- Star ratings with count
- Location display
- Dark overlay for text readability

### 2. BusinessActions
- Sticky action bar (stays visible on scroll)
- Save/bookmark toggle with state
- Message button (disabled for non-premium)
- Directions (opens Google Maps)
- Share (Web Share API with clipboard fallback)

### 3. BusinessPhotos
- Responsive grid (1-6 columns based on count)
- Fullscreen lightbox with keyboard navigation
- "View all X photos" expansion
- Empty state for no photos

### 4. BusinessAbout
- Expandable description with "Read more"
- Business hours with current day highlight
- Open/Closed status indicator
- Contact links (address, phone, email, website)
- Social media icons (Instagram, Facebook, X, TikTok)

### 5. BusinessServices
- Grouped by category
- Service name, description, duration, price
- Disabled "Book" button with "Coming Soon" badge
- "View all X services" expansion

### 6. BusinessStaff
- Grid of team member cards
- Avatar with initials fallback
- Name and role display
- Color-coded initials based on name

---

## CSS Naming Convention

All classes use `bp-` prefix (business profile):

- `.bp-page` - Page container
- `.bp-hero` - Hero section
- `.bp-hero__*` - Hero children
- `.bp-actions` - Action bar
- `.bp-actions__btn` - Action buttons
- `.bp-section` - Content section
- `.bp-section__title` - Section headers
- `.bp-photos__*` - Photo gallery
- `.bp-lightbox__*` - Fullscreen viewer
- `.bp-about__*` - About section
- `.bp-services__*` - Services list
- `.bp-staff__*` - Staff grid
- `.bp-sticky-cta` - Mobile sticky footer

---

## Backend Changes

### visitorBusiness.controller.js
Added missing fields to `getFullProfile`:
- `photos` - Array of photo objects
- `staff` - Array of staff members
- `socialMedia` - Social media handles
- `verificationStatus` - Verification tier
- `listingType` - Free or premium
- `premiumSubscription` - Subscription status

---

## Explore Page Enhancement

### VisitorPage.js
- Added "Show All" button to display all businesses
- Category filter dropdown
- Results count display
- Redesigned business cards with badges
- Empty state with call-to-action

### New CSS Classes (VisitorPage.css)
- `.explore-card` - New card design
- `.explore-card__badge` - Verified/Premium badges
- `.explore-filter-select` - Category dropdown
- `.explore-show-all-btn` - Show all button
- `.explore-empty-state` - No results state

---

## Files Created

| File | Purpose |
|------|---------|
| `components/business/BusinessHero.jsx` | Hero banner component |
| `components/business/BusinessActions.jsx` | Quick actions component |
| `components/business/BusinessPhotos.jsx` | Photo gallery with lightbox |
| `components/business/BusinessAbout.jsx` | About section component |
| `components/business/BusinessServices.jsx` | Services list component |
| `components/business/BusinessStaff.jsx` | Staff grid component |
| `components/business/index.js` | Barrel exports |

## Files Modified

| File | Changes |
|------|---------|
| `pages/visitor/BusinessProfile.jsx` | Complete rebuild with new components |
| `pages/visitor/BusinessProfile.css` | 1300+ lines of new styles |
| `components/VisitorPage.js` | Added Show All, category filter, new cards |
| `styles/VisitorPage.css` | Enhanced styles for explore page |
| `controllers/directory/visitorBusiness.controller.js` | Added photos, staff, socialMedia fields |

---

## Testing Checklist

### Business Profile
- [ ] Hero displays cover photo or gradient fallback
- [ ] Logo shows in circle if available
- [ ] Verified badge shows for verified businesses
- [ ] Star ratings display correctly
- [ ] Save button toggles state
- [ ] Message button works for premium businesses
- [ ] Directions opens Google Maps
- [ ] Share copies URL or uses Web Share API
- [ ] Photo gallery shows all photos
- [ ] Lightbox navigation works (keyboard + buttons)
- [ ] Hours show current day highlighted
- [ ] Open/Closed status is correct
- [ ] Services list with prices
- [ ] Book buttons show "Coming Soon"
- [ ] Staff grid displays team members
- [ ] Mobile sticky CTA appears on mobile

### Explore Page
- [ ] All businesses load on page
- [ ] Category filter works
- [ ] Show All button resets filters
- [ ] Search works with name/city/zip
- [ ] Results count updates
- [ ] Cards show cover photos
- [ ] Verified/Premium badges display
- [ ] View Details navigates to profile

---

## Design Features

### Colors
- Primary: `#9333ea` (Purple)
- Secondary: `#ec4899` (Pink)
- Success/Verified: `#10b981` (Green)
- Warning: `#fbbf24` (Amber)
- Text: `#1f2937` (Dark gray)
- Muted: `#6b7280` (Gray)

### Responsive Breakpoints
- Desktop: Full layout
- Tablet (768px): Adjusted hero, horizontal scroll actions
- Mobile (480px): Compact cards, single column, sticky CTA

### Dark Mode
Full dark mode support via `prefers-color-scheme: dark`

---

*End of Business Profile Page Documentation*

---

*End of CLAUDE.md - This document is for AI agent context only.*
