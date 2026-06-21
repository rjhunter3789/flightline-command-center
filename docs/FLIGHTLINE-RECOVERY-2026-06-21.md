# Flightline Recovery Record - June 20-21, 2026

Last Updated: June 21, 2026

## Summary

Flightline was stabilized after a PM2 crash loop. The Mongoose shutdown error was real, but the primary outage cause was MongoDB being down after an OOM kill. The server was cleaned up, swap was added, MongoDB was restarted, Flightline was restored, and the Mongoose shutdown handler was fixed and pushed to GitHub.

## Confirmed Recovery State

| Area | State |
|---|---|
| Git | Clean and up to date with `origin/main` |
| Auto Audit Pro | Online in PM2 |
| Flightline | Online in PM2 |
| Smart Doc | Stopped |
| MongoDB | Active running |
| Disk | Approximately 70% used after cleanup |
| Swap | 2GB active and persistent |

## What Was Found

Flightline production source was located at:

`/var/www/flightline`

The repo was initialized, cleaned, committed, and pushed to:

`rjhunter3789/flightline-command-center`

Desired PM2 state after recovery:

- `auto-audit`: online
- `flightline-backend`: online
- `smart-doc-v2`: stopped

## Crash Loop Cause

`flightline-backend` had a very high restart count and kept restarting. Logs showed a Mongoose shutdown handler error:

`MongooseError: Connection.prototype.close() no longer accepts a callback`

That error was fixed, but deeper investigation showed Flightline was exiting because MongoDB was unavailable.

MongoDB had been killed by the system because of memory pressure. The server had no swap at the time.

MongoDB was restarted and confirmed listening on:

`127.0.0.1:27017`

## Actions Completed

1. Cleaned staged Git files before the initial Flightline commit.
2. Removed old archive and accidental files from the Flightline repo before commit.
3. Created a GitHub repo for Flightline.
4. Pushed the initial production snapshot.
5. Fixed the Mongoose shutdown handler in `backend/src/server.js`.
6. Committed and pushed the Mongoose fix.
7. Trimmed system journal logs, freeing about 2GB.
8. Removed old Docker leftovers, freeing about 1.1GB.
9. Removed disabled snap revisions.
10. Added persistent 2GB swap at `/swapfile`.
11. Restarted MongoDB.
12. Restarted Flightline.
13. Saved the PM2 process state with `pm2 save`.
14. Left retired Smart Doc stopped.

## Mongoose Fix Applied

Old pattern:

```javascript
mongoose.connection.close(false, () => {
  logger.info('MongoDB connection closed');
  process.exit(0);
});
```

New pattern:

```javascript
server.close(async () => {
  try {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
```

## Current Recommendation

Do not restart Smart Doc unless there is a clear business or technical reason. The server is stable, but still small. For long-term reliability, consider resizing the droplet or separating database and app workloads if Flightline, Auto Audit Pro, and future Nova services all need to run together.
