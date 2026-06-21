# Flightline Troubleshooting

Last Updated: June 21, 2026

## Known Issue: Flightline Backend Crash Loop

### Symptom

PM2 shows `flightline-backend` online briefly, but uptime resets repeatedly and the restart count climbs.

Useful check:

```bash
pm2 status
```

### First Checks

```bash
pm2 logs flightline-backend --lines 80 --nostream
systemctl status mongod --no-pager
ss -ltnp | grep 27017
free -h
df -h
```

### Root Cause Found on June 20-21, 2026

The primary crash-loop cause was MongoDB being down after an OOM kill. Flightline starts by connecting to MongoDB. If MongoDB is unavailable, the application exits with code 1 and PM2 restarts it.

### Fix

Restart MongoDB and verify it is listening locally:

```bash
systemctl restart mongod
systemctl status mongod --no-pager
ss -ltnp | grep 27017
```

Then restart Flightline:

```bash
pm2 restart flightline-backend
pm2 status
```

## Known Issue: Mongoose Shutdown Handler Error

### Symptom

Logs show:

```text
MongooseError: Connection.prototype.close() no longer accepts a callback
```

### Cause

The older shutdown handler used a callback with `mongoose.connection.close(false, callback)`. Newer Mongoose versions no longer accept that callback pattern.

### Fix Applied

The shutdown handler in `backend/src/server.js` was updated to use async/await:

```javascript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

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
});
```

This fix was committed and pushed to GitHub.

## MongoDB Down

### Symptoms

- `systemctl status mongod` does not show active running.
- `ss -ltnp | grep 27017` returns nothing.
- Flightline exits shortly after startup.

### Fix

```bash
systemctl restart mongod
systemctl status mongod --no-pager
ss -ltnp | grep 27017
pm2 restart flightline-backend
pm2 status
```

## Low Memory / OOM Risk

The server is small and previously had no swap. MongoDB was killed by OOM.

Current mitigation:

- `/swapfile` added.
- 2GB swap active.
- Smart Doc stopped.

Check memory:

```bash
free -h
```

## Disk Pressure

Check disk:

```bash
df -h
```

Previous cleanup reduced disk usage from about 84% to about 70%.

Safe checks:

```bash
journalctl --disk-usage
du -h --max-depth=1 /var | sort -h
docker system df
snap list --all
```

Do not delete app folders or credential-bearing folders without reviewing them first.

## Smart Doc

Smart Doc should remain stopped. It is a retired/shelved prototype and is not required for Flightline.

```bash
pm2 status
pm2 stop smart-doc-v2
pm2 save
```
