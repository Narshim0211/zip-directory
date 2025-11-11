# SalonHub Monorepo

This repository contains both the backend (`/backend`) and frontend (`/frontend`) workspaces for the SalonHub project. It ships with modern modular structure, centralized error handling, and Docker setups for production-style deployments.

## Architecture Highlights

1. **Backend**
   * Modules under `controllers/`, `routes/`, `services/`, and `utils/`.
   * Global `errorMiddleware` and `asyncHandler` wrappers keep APIs fault tolerant.
   * `logger.js` centralizes error logs so Express never stops on an exception.
2. **Frontend**
   * Shared layouts (`layouts/`), modular pages (e.g. surveys, notifications), and `ErrorBoundary`.
   * API clients centralized under `src/api/`.
   * Top-level `App` wraps routes with the shared `ErrorBoundary` so single-page crashes are isolated.
3. **Docker**
   * Separate `Dockerfile` for backend and frontend + `.dockerignore` files.
   * `docker-compose.yml` orchestrates MongoDB, backend, and frontend with linked networking.

## Running locally with Docker

```bash
cd main-site
docker-compose up --build
```

This builds both services, spins up MongoDB, and exposes:

* Backend → `http://localhost:5000`
* Frontend → `http://localhost:3000` (served by Nginx)

The frontend automatically points to the backend service via `REACT_APP_API_URL`.

## Notes

- Adjust `backend/.env` for production secrets before deploying.
- Logs are sent to the console via `utils/logger.js` for easier integration with log aggregators.
- If you need additional services (e.g., Redis, worker queues), simply extend `docker-compose.yml`.
