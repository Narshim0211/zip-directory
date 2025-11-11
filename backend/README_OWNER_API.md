# Owner API Reference

This file summarizes the owner-focused backend services and endpoints that power the **“My Business + Social Feed”** experience.
All `/api/owner/*` routes are guarded by `authOwnerMiddleware` and expect the caller to be an authenticated owner.

## Services introduced/extended

| Service | Purpose |
| --- | --- |
| `ownerBusinessService` | Ensures there is always a business document for the owner, updates core fields, and appends/clears gallery media URLs (`images[]`). |
| `galleryService` | Stores uploaded gallery media under `uploads/gallery/<ownerId>/` and exposes `uploadBase64` for base64-encoded payloads. |
| `ownerPostService` | Creates/updates/deletes owner posts, lists a paginated owner feed, and toggles emoji reactions while keeping the `Reaction` collection in sync. |
| `feedService` | Aggregates posts, surveys, news, and reviews into a unified feed, with optional `ownerId` scoping. |
| `analyticsService` | Adds `getOwnerPostInsights` & `getOwnerReactionSummary` to report on owner post engagement and emoji usage. |
| `notificationService` | Exposes `notifyOwnerEngagement` for emitting owner-friendly notifications via sockets. |

## New/updated Mongo models

* `Post` now stores `tags`, `visibility`, `isPromoted`, `emojiReactions`, and an `engagement` counter for likes/comments/shares.
* `Reaction` was added to record emoji interactions on both posts and comments.

## Owner routes (new additions)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/owner/business` | Returns the owner’s business profile. |
| `PUT` | `/api/owner/business` | Updates core business info (name, city, address, zip, description). |
| `POST` | `/api/owner/business/gallery` | Adds a gallery URL (either provided or uploaded via base64) to the business. |
| `DELETE` | `/api/owner/business/gallery` | Removes a gallery URL from the business. |
| `GET` | `/api/owner/posts` | Lists the owner’s posts (sorts newest first, optional `?limit=`). |
| `POST` | `/api/owner/posts` | Creates a new owner post (content/media/tags/visibility/isPromoted). |
| `PUT` | `/api/owner/posts/:postId` | Updates the owner’s post (payload fields are optional). |
| `DELETE` | `/api/owner/posts/:postId` | Deletes an owner post. |
| `POST` | `/api/owner/posts/:postId/react` | Toggles an emoji reaction on the owner’s post; request body must include `emoji`. |
| `GET` | `/api/owner/feed` | Retrieves the unified feed (posts, surveys, news, reviews) scoped to the owner with pagination support. |
| `GET` | `/api/owner/feed/insights` | Returns the owner’s post insights + emoji reaction summary from `analyticsService`. |

Existing owner routes for surveys, notifications, and dashboard stats remain in place.

## Notes for frontend integration

* Use `/api/owner/posts` for owner-only post management; visitors continue to use `/api/posts`.
* Gallery uploads expect either a direct `url` or base64-encoded payload; the response returns the finalized media URL.
* Reactions are stored in `Reaction` documents so analytics can aggregate emoji usage independently of business logic.
* Insights endpoint is meant for dashboard cards and charts (combine fields from `getOwnerPostInsights` / `getOwnerReactionSummary`).
