# Architecture Decision Records

Format: each decision has a status, context, and consequence. Newest decisions are
added at the bottom.

## ADR-001 — React + TypeScript + Vite PWA for the frontend
- **Status:** Accepted (Phase 1)
- **Context:** The app must be mobile-first, installable, and usable offline for
  its app shell.
- **Decision:** React 19 with TypeScript, built with Vite, plus `vite-plugin-pwa`
  for manifest and service worker generation.
- **Consequences:** Fast dev server and build; PWA behaviour is generated, not
  hand-written. Offline record data is not cached in the MVP (see roadmap).

## ADR-002 — Spring Boot 3.5 on Java 21 for the backend
- **Status:** Accepted (Phase 1)
- **Context:** Java 21 was specified. Spring Boot 4.x is the newest major line but
  the 3.5 line is mature and the ecosystem (Flyway, Testing libraries) is well
  documented for it.
- **Decision:** Spring Boot 3.5.16 (latest 3.5 patch) with Java 21.
- **Consequences:** Stable APIs and dependency management. Upgrading to Spring Boot
  4.x is a later, separate decision.

## ADR-003 — PostgreSQL 16 with Flyway migrations
- **Status:** Accepted (Phase 1)
- **Context:** PostgreSQL was specified. Schema changes must be versioned and
  reproducible.
- **Decision:** PostgreSQL 16 for local development (Docker Compose). Flyway owns the
  schema; Hibernate only validates it (`ddl-auto: validate`).
- **Consequences:** Every schema change is a numbered SQL file reviewed in git.

## ADR-004 — Tests use in-memory H2 in PostgreSQL mode
- **Status:** Accepted (Phase 1)
- **Context:** Developers and CI should be able to run backend tests without a
  running database server, and Docker may not be available.
- **Decision:** Backend unit and API tests run on H2 (PostgreSQL compatibility mode)
  with the `test` profile. Local runs use real PostgreSQL.
- **Consequences:** Fast tests. SQL that is PostgreSQL-specific must still be checked
  against a real PostgreSQL run before release (documented in local-development.md).

## ADR-005 — Dev proxy instead of CORS
- **Status:** Accepted (Phase 1)
- **Decision:** Vite proxies `/api` to the backend in development. The backend does
  not need CORS configuration for the normal development flow.

## ADR-006 — Mobile-first verification with Playwright
- **Status:** Accepted (Phase 1)
- **Decision:** Mobile layout is verified with Playwright using a phone device
  profile (viewport, touch, device scale). Tests check for horizontal overflow and
  minimum touch-target sizes. A visual claim of "mobile ready" requires these tests
  to pass against the running dev server.
