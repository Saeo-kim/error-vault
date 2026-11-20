# Error Vault

A personal technical knowledge system for capturing, understanding, and reusing
software errors.

Error Vault is a mobile-first Progressive Web App (PWA) with a Spring Boot REST API
and PostgreSQL storage.

## Status
- **Phase 1 (foundation): complete.** Project structure, mobile-first frontend shell,
  backend skeleton, database migrations and local setup are in place.
- **Phase 2 (MVP): complete.** Capture, search, view, edit and delete errors on a phone.
  See [docs/roadmap.md](docs/roadmap.md).

## Project layout
| Path | Contents |
|------|----------|
| `frontend/` | React + TypeScript + Vite PWA |
| `backend/` | Spring Boot 3.5, Java 21 REST API |
| `docker-compose.yml` | Local PostgreSQL 16 |
| `docs/` | Architecture, decisions, roadmap, local development guide |

## Quick start

```bash
# 1. Database
docker compose up -d db

# 2. Backend (http://localhost:8080)
cd backend && ./mvnw spring-boot:run

# 3. Frontend (http://localhost:5173), in another terminal
cd frontend && npm install && npm run dev
```

Full instructions, troubleshooting, and the test commands are in
[docs/local-development.md](docs/local-development.md).

## Tests
```bash
cd backend && ./mvnw verify
cd frontend && npm test && npm run build && npm run test:e2e   # e2e needs the backend running
```

## Documentation
- [Architecture](docs/architecture.md)
- [Architecture decisions](docs/decisions.md)
- [Roadmap](docs/roadmap.md)
- [Local development](docs/local-development.md)
