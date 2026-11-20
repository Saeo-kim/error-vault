# Deployment (Render, one web service + PostgreSQL)

The app runs as one Docker image: the Spring Boot API serves the built React PWA on the
same HTTPS address, so the iPhone and PC use the same URL and the same records.

## What the image needs
| Variable | Purpose |
|----------|---------|
| `APP_AUTH_PASSWORD` | Required. The single sign-in password. Leave blank only for local development. |
| `APP_AUTH_SECURE_COOKIE` | `true` in production (HTTPS). Set by `render.yaml`. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Provided automatically from the Render database in `render.yaml`. |
| `PORT` | Set by Render. |

## Deploy steps
1. Push this branch to GitHub (already done for `claude/error-vault-phase-1-9xoa18`).
2. In Render: **New → Blueprint** → choose the `error-vault` repository and branch.
3. Render reads `render.yaml`, creates the web service and database, and asks for
   `APP_AUTH_PASSWORD`. Enter a password you will remember.
4. Wait for the first deploy to finish. Open the `https://…onrender.com` URL shown on the service page.
5. Sign in, then create an error to confirm saving works.

## On your iPhone (Safari)
1. Open the HTTPS URL in **Safari** (not an in-app browser).
2. Sign in with your password.
3. Tap **Share → Add to Home Screen → Add**.
4. Open **Error Vault** from the home screen. It runs full-screen without Safari's address bar.

## Important limits of the free plan
- **Database expiry:** Render's free PostgreSQL is deleted after about 30 days. For records that
  must persist, change `error-vault-db` to a paid plan in the Render dashboard before relying on it.
- **Sleep:** the free web service sleeps after about 15 minutes idle; the first request after that
  can take 30–60 seconds.

## Verifying a deployment
- `https://<host>/actuator/health` returns `{"status":"UP"}`.
- `https://<host>/api/errors` returns 401 without signing in.
- Sign in on the PC and iPhone with the same password; a record created on one appears on the other.
