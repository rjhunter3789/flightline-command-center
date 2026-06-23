# Flightline Server Architecture

Last Updated: June 22, 2026

## Server

Flightline is deployed on the DigitalOcean server shown in the shell prompt as `autoauditpro`.

Production path:

`/var/www/flightline`

## Application Layout

| Application | Path | Current Role |
|---|---|---|
| Auto Audit Pro | `/opt/auto-audit-pro` | Active production app |
| Flightline | `/var/www/flightline` | Active production app |
| Smart Doc v2 | `/var/www/smart-doc-v2` | Retired/shelved prototype, stopped in PM2 |
| Smart Document Assistant | `/opt/smart-document-assistant` | Older RAG codebase, Git-backed |
| Smart Document Assistant working folder | `/var/www/smart-document-assistant` | Older RAG working folder with credentials and backups |
| Nova source | `/root/voice-drive-buddy` | Source exists, not PM2 deployed |

## Flightline Structure

Primary repo contents:

- `/var/www/flightline/backend`
- `/var/www/flightline/frontend`
- `/var/www/flightline/docs`
- `/var/www/flightline/README.md`
- `/var/www/flightline/CHANGELOG.md`
- `/var/www/flightline/RECOVERY_PLAN.md`
- `/var/www/flightline/nginx.conf`

Backend entry point:

`/var/www/flightline/backend/src/server.js`

PM2 ecosystem config:

`/var/www/flightline/backend/ecosystem.config.js`

Backend port:

`3001`

## Frontend and Mobile MVP

Frontend source path:

`/var/www/flightline/frontend`

Active build path served by Nginx:

`/var/www/flightline/frontend/build`

Important frontend/mobile files:

- `frontend/src/App.jsx`
- `frontend/src/App.css`
- `frontend/src/components/Mobile/FlightlineMobile.jsx`
- `frontend/src/components/Mobile/FlightlineMobile.css`
- `frontend/src/hooks/useRealTimeData.js`

Mobile MVP notes:

- Flightline Mobile is the active mobile MVP path for iPhone.
- Mobile uses the same desktop 12-deal demo source through `useRealTimeData()`.
- Mobile WebSocket behavior is disabled for demo mode until authenticated pilot access is ready.
- Frontend changes require `npm run build` from `/var/www/flightline/frontend`.
- The built frontend is local server state; source changes are tracked through Git.

## PM2 Processes

Current intended PM2 state:

| Process | Status | Purpose |
|---|---|---|
| `auto-audit` | Online | Auto Audit Pro |
| `flightline-backend` | Online | Flightline backend |
| `smart-doc-v2` | Stopped | Retired Smart Doc prototype |

Useful commands:

```bash
pm2 status
pm2 describe flightline-backend
pm2 logs flightline-backend --lines 80 --nostream
pm2 save
```

## MongoDB

Flightline depends on local MongoDB.

Service:

`mongod`

Expected status:

`active (running)`

Expected listener:

`127.0.0.1:27017`

Useful commands:

```bash
systemctl status mongod --no-pager
systemctl restart mongod
ss -ltnp | grep 27017
```

## Swap

A persistent swap file was added during recovery.

Swap file:

`/swapfile`

Size:

`2GB`

Persistence entry:

`/swapfile none swap sw 0 0`

Config file:

`/etc/fstab`

Useful commands:

```bash
free -h
grep swapfile /etc/fstab
```

## Disk Cleanup Completed

The server was previously at approximately 84% disk usage. Cleanup reduced usage to approximately 70%.

Completed cleanup:

- Trimmed system journal logs.
- Removed old Docker image/container leftovers.
- Removed disabled snap revisions.
- Stopped retired Smart Doc process.
- Stopped Flightline crash loop while MongoDB was down.

## Current Recommendation

Leave Smart Doc stopped. Keep Auto Audit Pro and Flightline online. Do not restart retired services unless there is a specific business need.

For Flightline Mobile, keep the MVP stable before re-enabling live WebSocket behavior or adding authenticated pilot access.