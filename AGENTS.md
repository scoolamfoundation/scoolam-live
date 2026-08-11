# Scoolam — repo notes for agents

## Stack
- Monorepo (yarn 4 PnP, workspaces: `apps/web`). Repo root = `/workspace/project/scoolam-live`.
- App: `apps/web` — Next.js 16 + better-auth + Postgres (via @neondatabase/serverless).
- Deployed externally on work hosts: port 12000 → work-1, 12001 → work-2.

## Build / run
- **Build MUST use webpack, not Turbopack** — Turbopack fails with a PnP workspace-root resolution error.
  `ANYTHING_PUBLISH_BUNDLER=webpack yarn next build --webpack` (matches `publisher/run-next-build.mjs`).
- Run two instances: `yarn next start -p 12000` and `yarn next start -p 12001` (backgrounded, logs to `/tmp/web.log` / `/tmp/web2.log`).
- Postgres runs in docker container `pg` (db/user `scoolam`); `wsproxy` container fronts it for the neon serverless WebSocket driver.
  Health: `curl -s localhost:12000/api/topics` → 200.

## Auth gotchas (load-bearing — do not rewrite `src/lib/auth.ts`)
- `secure: true` cookie attribute is set, so better-auth **prepends `__Secure-`** to cookie names.
  The actual session cookie is `__Secure-better-auth.session_token`, NOT `better-auth.session_token`.
- `src/middleware.ts` must check BOTH `better-auth.session_token` (plain-HTTP dev) and
  `__Secure-better-auth.session_token` (HTTPS/work hosts). A mismatch here silently redirects
  `/admin` → `/admin/login` at the middleware layer even when the session is valid, while API
  routes (`/api/*`) keep working (they bypass the middleware cookie check) — a confusing "browser
  login broken, curl works" symptom.
- `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated) must include every work host that needs sign-in:
  work-1 and work-2.
- Admin seed account: `admin@scoolam.local` / `admin123` (is_admin=true). Note the login form
  placeholder says `admin@scoolam.com` but the real email ends in `.local`.

## DB connection pools
- `src/app/api/utils/sql.ts` creates its own `@neondatabase/serverless` Pool (WebSocket → wsproxy → pg),
  separate from better-auth's pool. Both go through wsproxy; wsproxy logs show ~10s per WS connection.
- `.env` is the source of truth for `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `BETTER_AUTH_TRUSTED_ORIGINS`, `NEON_WS_PROXY`.
