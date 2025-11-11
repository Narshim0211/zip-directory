# Owner Structure Reference

## Folder layout (frontend)
- `frontend/src/layouts/OwnerLayout.jsx` – renders the left sidebar that wraps every `/owner/*` page; no additional navs are defined in the individual views.
- `frontend/src/layouts/VisitorLayout.jsx`/`VisitorSidebarLayout.jsx` – keep the public/visitor flows separate and contain the top navbar only for `/visitor/*` routes.
- `frontend/src/components` – shared widgets (e.g., `OwnerSidebar`, `NotificationBell`, `OwnerDashboard`, `OwnerSurveysPage`) but owner pages live under their own entry points.
- `frontend/src/hooks`, `services`, and `api` hold data-fetching utilities that can be shared as long as the owner vs visitor contexts stay distinct.

## Routing overview
- `frontend/src/App.js` now nests all owner routes under the protected `<Route path="/owner/*">` guarded by `ProtectedRoute` and `OwnerLayout`; there are explicit paths for `/owner/dashboard`, `/owner/my-business`, `/owner/explore`, `/owner/surveys`, and `/owner/notifications`.
- The owner layout ensures the top navbar is hidden whenever `location.pathname` starts with `/owner`; visitor/public routes continue to render `NavbarPublic`/`NavbarPrivate`.
- Backend and frontend APIs should mirror the same boundary (`/api/owner/*` vs `/api/visitor/*`) so role-specific controllers, middleware (`authOwnerMiddleware.js`), and data models remain isolated.

## Developer notes
- When you add a new owner page, register it only within the `/owner/*` route block so the left sidebar is reused automatically.
- Keep the owner sidebar links and `<NavLink>` paths synchronized with the actual route names (`/owner/dashboard`, `/owner/my-business`, `/owner/explore`, `/owner/surveys`, `/owner/notifications`); `NotificationBell` and logout live outside the navigation list but within the same layout.
- Do not import `NavbarPublic` or other visitor/top nav components inside owner views—layout bleed is prevented by rendering those only when the user is outside `/owner/*`.
- Backend changes for owner features should live under `backend/routes/owner` and use `authOwnerMiddleware`; share services (e.g., listing fetchers) only if context is clearly owner-scoped.
## DEV NOTES
- Never reuse owner components/layouts in visitor routes — keep visitor code under `src/components`/`src/pages` tied to `VisitorLayout`.
- Never import visitor pages into owner slots; owner layout and backend routes live under `/owner/*` and `/api/owner/*` respectively, guarded by `authOwner`.
- After visitor login, always redirect to `/visitor/home`. The public landing page must never appear inside authenticated visitor routes.
