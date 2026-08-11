# Deploying scoolam.com on a Hostinger VPS

This guide takes a fresh Linux VPS (only the OS installed) to a live
**https://scoolam.com** serving the Next.js app, with Postgres, SSL, and
auto-restart on boot.

> All commands run as a non-root sudo user on the VPS unless prefixed with
> `sudo`. Replace `scoolam.com` with your domain everywhere if different.

---

## 0. What gets installed

| Layer        | Software                                   | How                         |
|--------------|--------------------------------------------|-----------------------------|
| Reverse proxy | Nginx + Let's Encrypt SSL                | apt + certbot               |
| App runtime  | Node.js 22 + Yarn 4 (via corepack)         | NodeSource                  |
| Process mgr  | systemd (`scoolam-web.service`)            | this repo's unit file       |
| Database     | PostgreSQL 17                              | docker (compose)            |
| DB proxy     | neon wsproxy (for the serverless driver)   | docker (compose)            |

The app connects to Postgres through `@neondatabase/serverless`
(WebSocket → wsproxy → Postgres). This is the transport `lib/auth.ts` and
`lib/db-config.ts` expect, so no code changes are needed for production —
we keep the same working setup as local dev.

---

## 1. Point the domain at the VPS

1. In the Hostinger VPS panel, note your server's **public IP**.
2. In your domain's DNS (wherever `scoolam.com` is managed), add:

   | Type | Name  | Value (your VPS IP) | TTL  |
   |------|-------|----------------------|------|
   | A    | `@`   | `203.0.113.10`       | 300  |
   | A    | `www` | `203.0.113.10`       | 300  |

3. Wait for DNS to resolve (check with `dig +short scoolam.com` — it should
   return your VPS IP) before you request the SSL certificate in step 7.

---

## 2. Create a deploy user and secure SSH

```bash
# As root, on the VPS:
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/   # or paste your pubkey
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

From now on, SSH in as `deploy@<VPS-IP>`.

---

## 3. Install Docker (for Postgres + wsproxy)

```bash
# As deploy:
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
$(. /etc/os-release; echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker deploy
# log out and back in for the group to take effect, or: newgrp docker
```

Verify: `docker ps` (no sudo needed after re-login).

---

## 4. Install Node.js 22 + Yarn 4

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential python3   # for native deps (argon2, sharp)

# Enable Yarn 4 via corepack (ships with Node 22):
sudo corepack enable
corepack prepare yarn@4.12.0 --activate
node -v && yarn -v    # should print v22.x and 4.12.0
```

---

## 5. Clone the repo and install dependencies

```bash
cd /home/deploy
git clone https://github.com/scoolamfoundation/scoolam-live.git
cd scoolam-live

# Install deps (generates .pnp.cjs and .yarn/unplugged from yarn.lock).
yarn install
```

---

## 6. Start the database (Postgres + wsproxy)

Set a strong Postgres password first, then bring the stack up:

```bash
cd /home/deploy/scoolam-live

# Create an env file for the database stack (used by docker-compose.prod.yml).
# At minimum set a strong POSTGRES_PASSWORD; keep it — you'll reuse it below.
cat > .env.db <<'EOF'
POSTGRES_USER=scoolam
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
POSTGRES_DB=scoolam
EOF

docker compose --env-file .env.db -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps   # pg + wsproxy should be "Up"

# The compose file mounts Scoolam-Db/production.sql into the Postgres
# initdb.d, so the schema + admin seed are applied automatically on first run.
# Verify the admin user exists:
docker exec -e PGPASSWORD=scoolam pg \
  psql -U scoolam -d scoolam -c "SELECT email, is_admin FROM \"user\";"
# Expected: admin@scoolam.local | t
```

> If you ever change the password in `.env.db`, recreate the volume: it is only
> read on first DB creation. To reset: `docker compose -f docker-compose.prod.yml
# down -v` then `up -d` (⚠️ this wipes all data).

---

## 7. Configure the app environment

```bash
cd /home/deploy/scoolam-live/apps/web
cp .env.production.example .env.production
nano .env.production
```

Fill in:
- **`DATABASE_URL`** — set the password to match `POSTGRES_PASSWORD` from step 6.
  `postgres://scoolam:YOUR_PASSWORD@localhost:5432/scoolam`
- **`BETTER_AUTH_SECRET`** — generate one: `openssl rand -base64 32` and paste it.
- Leave `AUTH_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS` as
  `https://scoolam.com`.
- `NEON_WS_PROXY` stays `localhost:8080/v1?address=pg:5432`.

---

## 8. Build the app

```bash
cd /home/deploy/scoolam-live/apps/web

# MUST use webpack — Turbopack fails on this yarn PnP monorepo.
# The app reads .env.production when NODE_ENV=production.
NODE_ENV=production ANYTHING_PUBLISH_BUNDLER=webpack yarn next build --webpack
```

Expect "✓ Compiled successfully" and a route list at the end (~1–3 min).

---

## 9. Install + start the app as a systemd service

```bash
cd /home/deploy/scoolam-live
sudo cp deploy/scoolam-web.service /etc/systemd/system/scoolam-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now scoolam-web
sudo systemctl status scoolam-web    # active (running)
curl -s http://127.0.0.1:3000/api/topics | head -c 80   # JSON, not an error
```

Logs: `sudo journalctl -u scoolam-web -f`

> If `corepack` isn't on PATH for systemd, set `ExecStart` to the absolute
> `yarn` path (`which yarn` as deploy) in the unit file.

---

## 10. Install Nginx + SSL

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Site config
cd /home/deploy/scoolam-live
sudo cp deploy/nginx/scoolam.conf /etc/nginx/sites-available/scoolam
sudo ln -s /etc/nginx/sites-available/scoolam /etc/nginx/sites-enabled/scoolam
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Get the SSL certificate (DNS must already resolve to this VPS):
sudo certbot --nginx -d scoolam.com -d www.scoolam.com
# certbot rewrites the server blocks to listen on 443 + auto-renews.
```

Open **https://scoolam.com** — the homepage should load.

---

## 11. Verify admin login

1. Go to **https://scoolam.com/admin/login**.
2. Sign in with `admin@scoolam.local` / `admin123`.
3. You should land on **https://scoolam.com/admin** (the dashboard).
4. **Change the admin password** immediately via Settings.

If `/admin` redirects back to `/admin/login` despite a correct password, see
`AGENTS.md` → "Auth gotchas": the middleware checks the `__Secure-` cookie
prefix, which requires the request to be over HTTPS (Nginx + certbot provide
this). Make sure `X-Forwarded-Proto` reaches the app (the nginx config forwards
it) and that `BETTER_AUTH_TRUSTED_ORIGINS` includes `https://scoolam.com`.

---

## 12. Day-to-day operations

| Task                | Command                                                       |
|---------------------|---------------------------------------------------------------|
| App logs            | `sudo journalctl -u scoolam-web -f`                           |
| Restart app         | `sudo systemctl restart scoolam-web`                          |
| Rebuild after pull  | `git pull && yarn install && yarn next build --webpack && sudo systemctl restart scoolam-web` |
| DB shell            | `docker exec -it -e PGPASSWORD=scoolam pg psql -U scoolam -d scoolam` |
| DB backup           | `docker exec pg pg_dump -U scoolam scoolam > backup_$(date +%F).sql` |
| DB restore          | `cat backup.sql \| docker exec -i pg psql -U scoolam -d scoolam` |
| Restart DB stack    | `docker compose -f docker-compose.prod.yml restart`           |
| Check SSL renew     | `sudo certbot renew --dry-run`                                |

---

## Troubleshooting

- **`next build` fails with a workspace/PnP root error** → you forgot
  `--webpack`. Use `yarn next build --webpack`.
- **`yarn` not found in systemd** → in `scoolam-web.service`, set
  `ExecStart` to the absolute path from `which yarn`.
- **502 Bad Gateway** → app not running: `sudo systemctl status scoolam-web`,
  check `journalctl`. Common cause: wrong `DATABASE_URL` password or wsproxy
  not up (`docker ps`).
- **`INVALID_ORIGIN` on signup/login** → `BETTER_AUTH_TRUSTED_ORIGINS` is
  missing `https://scoolam.com`; edit `.env.production` and restart the service.
- **Admin login loops back to login over HTTPS** → ensure Nginx forwards
  `X-Forwarded-Proto https` (the bundled config does) so better-auth's
  `secure: true` cookies attach correctly.
