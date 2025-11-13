# Time Manager 2.0 - Architecture Diagram

## Feature Structure

```
features/timeManager/
│
├── components/                    # UI Components
│   ├── DailyPlanner.jsx          ← Session-based (M/A/E) task organizer
│   ├── WeeklyPlanner.jsx         ← 7-day grid view planner
│   ├── QuoteBanner.jsx           ← Motivational quote display
│   └── ProgressAnalytics.jsx     ← Task completion meter
│
├── hooks/                         # Custom React Hooks
│   ├── usePlannerApi.js          ← API adapter (wraps visitorTimeApi)
│   └── useLocalSync.js           ← localStorage caching for offline
│
├── pages/                         # Route Pages
│   └── TimeManagerPage.jsx       ← Main container with tabs & navigation
│
├── styles/                        # Stylesheets
│   └── timeManager.css           ← Feature-specific styles (.tm-* namespace)
│
├── index.js                       # Barrel exports
├── README.md                      # Feature documentation
└── TIME_MANAGER_V2_IMPLEMENTATION.md  # This implementation summary
```

## Component Hierarchy

```
TimeManagerPage
├── QuoteBanner
├── ProgressAnalytics
└── [Tab Navigation: Daily | Weekly]
    ├── DailyPlanner
    │   ├── TaskForm (shared)
    │   └── TaskCard (shared) × N
    │       └── LoadingSpinner (shared)
    │
    └── WeeklyPlanner
        ├── TaskForm (shared)
        └── TaskCard (shared) × N
            └── LoadingSpinner (shared)
```

## Data Flow

```
User Action
    ↓
Component (DailyPlanner/WeeklyPlanner)
    ↓
usePlannerApi Hook (adapter)
    ↓
visitorTimeApi (existing API client)
    ↓
timeClient (axios with auth)
    ↓
Backend API
    ├── Proxy Mode → TIME_SERVICE_URL (microservice)
    └── Stub Mode → In-memory endpoints (local dev)
```

## Routing Structure

```
/visitor/time/*
    ↓
TimeManagerPage
    ↓
    ├── /visitor/time/daily  → DailyPlanner
    └── /visitor/time/weekly → WeeklyPlanner
```

## State Management

```
Component State
    ↓
Local State (useState)
    ├── tasks[]
    ├── loading
    ├── error
    ├── editing
    └── showForm
    ↓
useLocalSync (localStorage backup)
    ↓
Local Storage (tm.daily.tasks / tm.weekly.tasks)
```

## API Endpoints

```
Backend: /api/visitor/time/

├── GET    /tasks/daily?date=YYYY-MM-DD     → Daily tasks
├── GET    /tasks/weekly?startDate=YYYY-MM-DD → Weekly tasks
├── POST   /tasks                            → Create task
├── PUT    /tasks/:id                        → Update task
├── DELETE /tasks/:id                        → Delete task
└── GET    /quote                            → Random quote
```

## Integration Points

### Shared Components (Existing)
- `TaskCard` (`shared/components/time/TaskCard.jsx`)
- `TaskForm` (`shared/components/time/TaskForm.jsx`)
- `LoadingSpinner` (`shared/components/LoadingSpinner.jsx`)

### Shared API Clients (Existing)
- `visitorTimeApi` (`api/visitorTimeApi.js`)
- `timeClient` (`api/timeClient.js`) - Axios instance with JWT auth

### Layouts (Existing)
- `VisitorLayout` - Wraps all visitor routes
- `ProtectedRoute` - Role-based auth guard

### Navigation (Existing)
- `SidebarNav` - Updated with Time Manager link

## Environment Variables

```env
TIME_SERVICE_URL=<microservice_url>  # Optional
# If set: Routes proxy to microservice
# If unset: Routes use in-memory stubs
```

## Session Breakdown (Daily Planner)

```
Morning    [06:00 - 12:00]
Afternoon  [12:00 - 18:00]
Evening    [18:00 - 24:00]
```

Tasks are grouped by session for visual organization.

## Week Structure (Weekly Planner)

```
Mon | Tue | Wed | Thu | Fri | Sat | Sun
─────────────────────────────────────────
[Tasks distributed across 7 days]
```

Week starts on Monday; navigation buttons move by 7-day increments.

## Offline Strategy

```
Network Request
    ↓
Try Backend API
    ├── Success → Update State + Cache
    └── Failure → Load from Cache (if available)
                  └── Show Error + Retry Button
```

## Future Architecture (from PRD)

```
TimeManagerPage (current)
    ↓
+ MonthlyOverview
    ├── Calendar Heatmap
    └── Monthly Goals
    ↓
+ RecurringTasks
    ├── Daily Patterns
    └── Weekly Patterns
    ↓
+ Reflections
    ├── Journaling
    └── Mood Tracking
    ↓
+ Analytics Dashboard
    ├── Time Distribution Charts
    └── Completion Trends
```

## Key Design Decisions

1. **Modular Feature Organization**: Keeps time manager self-contained
2. **Adapter Pattern**: `usePlannerApi` isolates API details
3. **Local Sync**: Best-effort caching for resilience
4. **Shared Components**: Reuses existing TaskCard/TaskForm
5. **Nested Routing**: Preserves direct access to daily/weekly while providing unified page
6. **Proxy/Stub Backend**: Enables local dev without microservice
7. **CSS Namespace**: `.tm-*` prevents style conflicts

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| TimeManagerPage | Container, navigation, quote, analytics |
| DailyPlanner | Session-based CRUD, date picker |
| WeeklyPlanner | 7-day grid CRUD, week navigation |
| QuoteBanner | Fetch & display quote |
| ProgressAnalytics | Calculate & display completion % |
| usePlannerApi | API adapter, method mapping |
| useLocalSync | localStorage sync, offline cache |

---

This architecture supports the current implementation and provides clear extension points for future enhancements outlined in the PRD.
