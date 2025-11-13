# Time Manager 2.0

A comprehensive time management feature for SalonHub visitors and owners, providing daily, weekly, and (future) monthly planning capabilities with motivational quotes and progress analytics.

## Overview

The Time Manager 2.0 is a modular frontend feature that integrates with the backend time-service API (proxied or stubbed). It provides:

- **Daily Planner**: Morning/Afternoon/Evening task organization
- **Weekly Planner**: 7-day grid view with task distribution
- **Quote Banner**: Daily motivational quote
- **Progress Analytics**: Visual completion tracking
- **Local Sync**: Best-effort localStorage caching for offline resilience

## Architecture

### Frontend Structure
```
features/timeManager/
├── components/
│   ├── DailyPlanner.jsx       # Daily view with session grouping
│   ├── WeeklyPlanner.jsx      # Weekly grid view
│   ├── QuoteBanner.jsx        # Motivational quote display
│   └── ProgressAnalytics.jsx  # Task completion meter
├── hooks/
│   ├── usePlannerApi.js       # API adapter wrapping visitorTimeApi
│   └── useLocalSync.js        # localStorage caching hook
├── pages/
│   └── TimeManagerPage.jsx    # Main page with tabs and navigation
├── styles/
│   └── timeManager.css        # Feature-specific styles
└── index.js                   # Barrel exports
```

### Backend Integration
The feature connects to backend via:
- **Proxy mode**: When `TIME_SERVICE_URL` is set, requests are forwarded to the microservice
- **Stub mode**: When `TIME_SERVICE_URL` is unset, in-memory endpoints provide local functionality

Backend endpoints:
- `GET /api/visitor/time/tasks/daily?date=YYYY-MM-DD`
- `GET /api/visitor/time/tasks/weekly?startDate=YYYY-MM-DD`
- `POST /api/visitor/time/tasks`
- `PUT /api/visitor/time/tasks/:id`
- `DELETE /api/visitor/time/tasks/:id`
- `GET /api/visitor/time/quote`

## Usage

### Routing
The feature is mounted at `/visitor/time/*`:
- `/visitor/time` → renders TimeManagerPage
- `/visitor/time/daily` → Daily planner tab
- `/visitor/time/weekly` → Weekly planner tab

### Components

#### TimeManagerPage
Main container that renders QuoteBanner, ProgressAnalytics, and tab navigation for Daily/Weekly planners.

```jsx
import { TimeManagerPage } from '../features/timeManager';

<Route path="time/*" element={<TimeManagerPage />} />
```

#### DailyPlanner
Session-based (Morning/Afternoon/Evening) task organizer.
- Date picker for selecting target day
- Create/Edit/Delete tasks
- Real-time completion toggle
- Loading and error states

#### WeeklyPlanner
7-day grid view for weekly task distribution.
- Week navigation (prev/next)
- Multi-day task overview
- Same CRUD operations as daily planner

#### QuoteBanner
Fetches and displays a motivational quote from the API.

#### ProgressAnalytics
Shows a visual meter of task completion percentage.

### Hooks

#### usePlannerApi
Adapter hook that wraps existing `visitorTimeApi` methods for consistent interface.

```jsx
const api = usePlannerApi();
await api.getDaily('2025-01-15');
await api.createTask({ title: 'Task', session: 'Morning' });
```

#### useLocalSync
Best-effort localStorage caching for offline support and fast load times.

```jsx
useLocalSync('tm.daily.tasks', tasks);
```

## Styling

The feature uses a dedicated stylesheet (`timeManager.css`) with the following conventions:
- `.tm-*` prefix for all time manager classes
- Responsive grid layouts for mobile/desktop
- Consistent spacing with existing SalonHub design

## Future Enhancements (from PRD)

- [ ] Monthly overview with heatmap
- [ ] Recurring tasks (daily/weekly patterns)
- [ ] Reflection prompts and journaling
- [ ] Reminder notifications via cron
- [ ] Drag-and-drop task reordering
- [ ] Owner parity (owner-specific pages/hooks)
- [ ] Analytics dashboard (time distribution, completion trends)
- [ ] Offline-first mode with service worker

## Development

### Running Locally
1. Ensure backend is running: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Navigate to `/visitor/time/daily`

### Environment Variables
- `TIME_SERVICE_URL`: If set, proxies to microservice; else uses stubs

### Testing
- Component tests: `npm test -- timeManager`
- E2E tests: Include time manager flows in Playwright/Cypress suite

## Dependencies

- React 18
- React Router v7
- Axios (via shared `timeClient`)
- Existing shared components: `TaskCard`, `TaskForm`, `LoadingSpinner`

## Changelog

### v2.0.0 (2025-01)
- Initial modular feature implementation
- Daily/Weekly planners with CRUD
- Quote banner and progress analytics
- Local sync caching
- Integrated with existing visitor time API
