# Flightline Troubleshooting

Last Updated: June 23, 2026

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

## Known Issue: Mobile Blank/Dark Screen

### Symptom

On iPhone, `https://flightline.autoauditpro.io` shows a dark/blank screen or background without usable Flightline content.

### Causes Found on June 22, 2026

- App rendered desktop before mobile detection completed.
- Mobile WebSocket behavior could create runtime risk before authenticated pilot flow was ready.
- Global CSS used fixed height and hidden overflow, preventing normal mobile scrolling.

### Fixes Applied

- Mobile detection updated so Flightline Mobile renders on initial mobile load.
- Mobile CSS updated to allow normal page height and vertical scrolling.
- Mobile WebSocket behavior disabled for demo mode.

### Verification

```bash
cd /var/www/flightline/frontend
npm run build
```

Then open the site in a fresh iPhone Safari tab.

Expected:

- Flightline Mobile loads.
- The page scrolls.
- Active Deals appears.
- Deal Flow Pipeline and Today's Snapshot are visible.

## Known Issue: Mobile Deal Appears to Move Stages

### Symptom

Tapping a customer/deal appears to move that deal into Negotiation or another stage.

### Cause

The mobile deal card navigated to `/deal/<id>`, forcing the app to reload. The desktop mock data generator then regenerated random stages, which made the deal appear to move.

### Fix Applied

Mobile deal/customer tap now opens an in-page detail card instead of navigating away.

Expected behavior:

- Stage tap filters deals.
- Deal/customer tap opens detail card.
- Close returns to the same stage list.

## Known Issue: Mobile Snapshot Shows Zeros

### Symptom

Today's Snapshot showed zero values for Total Deals, Closed, Revenue, and Appointments.

### Cause

The mobile snapshot used fields like `closed`, `salePrice`, `appointmentTime`, and same-day created dates. The desktop 12-deal demo source primarily uses fields such as `grossProfit`, `probability`, and stage.

### Fix Applied

Today's Snapshot now uses MVP calculations from the active demo deal set:

- Total Deals: `deals.length`
- Closed: deals with probability at or above 90%
- Revenue: summed `grossProfit` or fallback `salePrice`
- Appointments: Test Drive stage or `appointmentTime`

## Known Issue: Flight Attendant Voice Quality

### Symptom

Flight Attendant successfully reads the Flightline status briefing out loud, but the voice sounds low-quality and robotic.

### Cause

Flight Attendant v1 uses the browser's built-in speech synthesis engine. This is useful for proving the readout workflow, but it is not a production-quality voice layer.

### Current Status

- Written briefing generation works.
- Speak Briefing works.
- Native browser voice quality is not acceptable for production.

### Next Fix Direction

- Improve voice selection where available.
- Tune rate and pitch.
- Shorten spoken briefing scripts.
- Add a stop speaking button.
- Prepare premium TTS such as ElevenLabs or a Nova-quality voice service.

## Smart Doc

Smart Doc should remain stopped. It is a retired/shelved prototype and is not required for Flightline.

```bash
pm2 status
pm2 stop smart-doc-v2
pm2 save
```