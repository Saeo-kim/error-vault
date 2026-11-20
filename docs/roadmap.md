# Roadmap

## Phase 1 — Foundation (complete when the checks below pass)
- [x] Planning documents: architecture, decisions, roadmap, local development.
- [x] Frontend project: React + TypeScript + Vite PWA, mobile-first app shell,
      routing, service worker, PWA manifest and icons.
- [x] Frontend checks: type-check, lint, unit tests, production build, Playwright
      mobile-viewport tests (run in Chromium at phone size).
- [x] Backend project: Spring Boot 3.5.16, Java 21, Maven wrapper, Actuator health.
- [x] Backend checks: JUnit tests (H2 PostgreSQL mode); application started against
      local PostgreSQL 16 with the Flyway baseline applied.
- [x] PostgreSQL local setup via Docker Compose and documented fallback.
- [x] README and local development guide.

Phase 1 does not include any error-record feature. The frontend home page is a
placeholder. Phase 1 is "ready to build on", not "app finished".

## Phase 2 — MVP: capture, browse and reuse errors (complete)

**Goal:** Record an error with context, find it again quickly on a phone, and edit or
delete it.

### Scope
1. Backend: `error_record` table (migration `V2`), CRUD REST endpoints under
   `/api/errors`, search by `q` and `tag`, validation, 404 handling.
2. Frontend:
   - List page: newest first, search box, tag chips, empty state.
   - Create and edit form: title, error message, stack trace, source, environment,
     root cause, resolution, tags.
   - Detail page: all fields, edit and delete actions (delete asks for confirmation).
   - Mobile layout on all pages; touch targets ≥ 44px; no horizontal scrolling.
3. Tests: backend API tests (create, read, update, delete, search, validation, 404);
   frontend unit tests for the form and API client; Playwright mobile tests for the
   create → list → detail → delete flow with the real API running.

### Out of scope for MVP
- Authentication and multiple users.
- Offline caching of record data (the app shell works offline; records need network).
- Full-text search ranking, attachments, export, AI-assisted explanations.

### MVP acceptance criteria (verified)
- A user on a 390×844 viewport can create an error, find it by a word in its message,
  open it, edit it, and delete it, all through the UI.
- All backend and frontend tests pass; `npm run build` and `./mvnw verify` succeed.
- The flow passes in Playwright against the running backend and local PostgreSQL.

**Result:** 16 backend tests and 12 frontend unit tests pass; 5 Playwright mobile tests pass
(Pixel 7 profile, 390px wide) against the real backend and PostgreSQL 16.15.

## Later phases (not planned in detail yet)
- Phase 3: Authentication, richer tagging, related-error suggestions.
- Phase 4: Full-text search, import/export, deployment configuration.
