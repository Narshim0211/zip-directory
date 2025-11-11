# Owner Module Setup

This document explains how the business-owner module is organized after the refactor.

(1) **Frontend**
* `/src/layouts/OwnerLayout.jsx` renders `OwnerSidebar` + `<Outlet />`.
* Pages under `/components` (e.g., `OwnerDashboard.jsx`, `OwnerMyBusiness.jsx`, `OwnerNotifications.jsx`, `OwnerSurveysPage.jsx`) plug into the layout via `/owner/*` routes.
* `OwnerSidebar` lists `[Dashboard, My Business, Surveys, Notifications, Logout]` and calls `AuthContext.logout`.
* All owner pages call `src/api/owner/index.js`, which prefixes requests with `/owner` so the logic stays isolated.

(2) **Backend**
* `middleware/authOwnerMiddleware.js` ensures JWTs belong to `role === 'owner'`.
* `controllers/owner/*` and `services/owner/*` implement dashboard, business, survey, and notification flows.
* `routes/ownerRoutes.js` mounts at `/api/owner/*`, so owner APIs live under one router.

(3) **Environment**
Set both visitor and owner API targets in `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_OWNER_API_PREFIX=/owner
REACT_APP_VISITOR_API_PREFIX=/visitor
```

If you deploy owner/visitor backends separately, use `REACT_APP_OWNER_API_PREFIX` and the axios wrappers to point at the correct base.
