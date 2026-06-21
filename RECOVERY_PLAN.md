# Flightline Recovery Plan

Last Updated: June 21, 2026

## Current Server Information

| Item | Value |
|---|---|
| Server | DigitalOcean server shown as `autoauditpro` |
| Flightline location | `/var/www/flightline` |
| Backend location | `/var/www/flightline/backend` |
| Frontend location | `/var/www/flightline/frontend` |
| Backend entry point | `/var/www/flightline/backend/src/server.js` |
| PM2 process | `flightline-backend` |
| Backend port | `3001` |
| Database | Local MongoDB on `127.0.0.1:27017` |
| GitHub repo | `rjhunter3789/flightline-command-center` |

## Desired PM2 State

| Process | Desired State | Notes |
|---|---|---|
| `auto-audit` | Online | Auto Audit Pro production app |
| `flightline-backend` | Online | Flightline backend |
| `smart-doc-v2` | Stopped | Retired/shelved prototype |

## Quick Health Check

```bash
pm2 status
systemctl status mongod --no-pager
df -h
free -h
```

Expected:

- `auto-audit` online
- `flightline-backend` online
- `smart-doc-v2` stopped
- MongoDB active running
- Disk below warning level
- Swap active

## If Flightline Crashes

Check PM2 and logs:

```bash
pm2 status
pm2 logs flightline-backend --lines 80 --nostream
```

Check MongoDB:

```bash
systemctl status mongod --no-pager
ss -ltnp | grep 27017
```

If MongoDB is down:

```bash
systemctl restart mongod
systemctl status mongod --no-pager
pm2 restart flightline-backend
pm2 status
```

## Known June 2026 Failure Pattern

Flightline was crash-looping because MongoDB was down after an OOM kill. The server had no swap at the time.

Corrective actions completed:

- Added persistent 2GB swap at `/swapfile`.
- Restarted MongoDB.
- Restarted Flightline.
- Left Smart Doc stopped.
- Fixed Mongoose shutdown handler.

## Mongoose Shutdown Handler

The old Mongoose callback shutdown pattern is no longer valid. The handler in `backend/src/server.js` was updated to use async/await.

If the following appears in logs, verify the current server file has the async/await shutdown handler:

```text
MongooseError: Connection.prototype.close() no longer accepts a callback
```

## Backup Guidance

Code is now backed up through GitHub.

Before any major change:

```bash
cd /var/www/flightline
git status
```

After verified changes:

```bash
git add <files>
git commit -m "<message>"
git push
```

## Environment Files

Environment files should remain on the server and should not be committed.

Important:

- Do not commit `.env` files.
- Do not commit credentials.
- Do not commit token files.
- Verify `git status` before every commit.

## Access Recovery

If SSH access is lost, use the DigitalOcean dashboard console or reset root password from the DigitalOcean dashboard.

## Documentation

Current detailed documentation is in the `docs/` folder.

Start with:

- `docs/FLIGHTLINE-DOCUMENTATION-INDEX.md`
- `docs/FLIGHTLINE-OPERATIONS-RUNBOOK.md`
- `docs/FLIGHTLINE-TROUBLESHOOTING.md`
- `docs/FLIGHTLINE-RECOVERY-2026-06-21.md`
