SalonHub – Backend API (Express + MongoDB)

Overview
- Single API used by the main site and the admin panel.
- Auth: JWT in `Authorization: Bearer <token>` header.
- CORS: Allowlist via `WEB_ORIGIN` and `ADMIN_ORIGIN` env vars, plus localhost for dev.

Run Locally
1) Install deps: `cd main-site/backend && npm install`
2) Env (.env):
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `PORT=5000`
   - `WEB_ORIGIN=https://salonhub.com`
   - `ADMIN_ORIGIN=https://admin.salonhub.com`
3) Start dev: `npm run dev` (nodemon)
4) Health: `GET /api/test`

Routes (high level)
- `POST /api/auth/register` – Create user (role: visitor/owner/admin)
- `POST /api/auth/login` – Login, returns JWT and user profile
- `GET /api/auth/me` – Current user (protected)
- `GET /api/admin/stats` – Overview metrics (protected, admin)
- `GET /api/admin/businesses` – List businesses with optional `status`
- `PUT /api/admin/businesses/:id/approve` – Approve business
- `PUT /api/admin/businesses/:id/reject` – Reject business

Dev Utilities
- `POST /api/dev/seed-admin` – Creates/updates admin user (disabled in production).

Security Notes
- Keep `JWT_SECRET` secret; rotate when needed.
- CORS errors return 403 with a descriptive message.

