# Local development

## Prerequisites
- Node.js 22 or newer and npm.
- Java 21 (any JDK 21 distribution). The Maven wrapper (`./mvnw`) is included; no
  separate Maven install is needed.
- PostgreSQL 16: either Docker (recommended) or a local install.

## 1. Start PostgreSQL

With Docker:
```bash
docker compose up -d db
```
The service listens on `localhost:5432` with database `errorvault`, user `errorvault`,
password `errorvault`. These are development-only credentials.

Without Docker, create the same role and database:
```bash
sudo -u postgres psql -c "CREATE ROLE errorvault LOGIN PASSWORD 'errorvault';"
sudo -u postgres psql -c "CREATE DATABASE errorvault OWNER errorvault;"
```

## 2. Run the backend
```bash
cd backend
./mvnw spring-boot:run
```
- API and health: http://localhost:8080/actuator/health
- Flyway applies all migrations in `src/main/resources/db/migration` on startup.
- To use another database, set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`
  and `SPRING_DATASOURCE_PASSWORD`.

## 3. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Requests to `/api` are proxied to `localhost:8080`.
To point the proxy elsewhere, set `VITE_BACKEND_URL`.

## Checks

Backend:
```bash
cd backend
./mvnw verify          # unit and API tests (H2, no database server needed)
```

Frontend:
```bash
cd frontend
npm run lint           # oxlint
npm run build          # type-check and production build
npm test               # Vitest unit tests
npx playwright install # only if you do not have a Chromium/Chrome for Playwright
npm run test:e2e       # Playwright mobile-viewport tests. Start the backend and database first:
                       # the error-flow test calls the real API on localhost:8080
```
If a Chromium binary is already on the machine, set `PLAYWRIGHT_CHROMIUM_PATH` to its
path to skip the browser download.

## Troubleshooting
- **`Connection refused` on 5432:** start PostgreSQL (`docker compose up -d db`).
- **Flyway checksum mismatch:** do not edit a migration that has already been applied.
  Add a new migration instead.
- **Port in use:** set `SERVER_PORT` for the backend, or `--port` for Vite.
- **`./mvnw` is not executable:** run `chmod +x backend/mvnw`.
