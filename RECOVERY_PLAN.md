. Here's a simplified version focusing on your current setup:

  # Flightline Recovery Plan

  ## Current Server Information
  - Server: DigitalOcean Droplet
  - IP: 146.190.39.214
  - OS: Ubuntu 24.04 LTS
  - Location: /var/www/flightline

  ## Running Services
  1. flightline-backend (PM2 id: 2)
  2. auto-audit (PM2 id: 0)
  3. smart-doc (PM2 id: 1)
  4. MongoDB 6.0.25

  ## Quick Recovery Commands

  ### If Flightline Crashes:
  ```bash
  pm2 restart flightline-backend
  pm2 logs flightline-backend --lines 50

  If MongoDB Issues:

  sudo systemctl status mongod
  sudo systemctl restart mongod

  Check All Services:

  pm2 status
  pm2 logs --lines 20

  Backup Commands

  Manual Backup:

  # Backup code (excluding node_modules)
  tar -czf flightline-backup-$(date +%Y%m%d).tar.gz --exclude='node_modules' /var/www/flightline

  # Backup MongoDB
  mongodump --db flightline --out /tmp/mongo-backup-$(date +%Y%m%d)

  Environment Files

  - Backend: /var/www/flightline/backend/.env
  - MongoDB: 127.0.0.1:27017
  - JWT secrets need to be changed from defaults

  Common Fixes

  Rate Limit Error:

  - Already fixed: app.set('trust proxy', true); in server.js

  MongoDB Connection:

  - Already fixed: Use 127.0.0.1 instead of localhost

  Frontend Changes:

  cd /var/www/flightline/frontend
  npm run build

  Access Recovery

  If locked out:
  1. DigitalOcean Dashboard → Access → Reset Root Password
  2. Use web console if SSH fails

  Local Backup Location

  Windows: C:\Users\nakap\Desktop\Flightline\
 ## Version 2.0.0 Implementation Notes

  ### Successful Architecture
  - **FloatingDashboard.jsx**: Main container with 5 windows
  - **Chat.jsx & Chat.css**: Slack-like team communication
  - **react-rnd**: Provides drag and resize functionality

  ### Window Default Positions
  ```javascript
  missionStatus: { x: 20, y: 80, width: 350, height: 400 }
  dealFlow: { x: 390, y: 80, width: 800, height: 200 }
  dealCards: { x: 390, y: 300, width: 800, height: 400 }
  alerts: { x: 20, y: 500, width: 350, height: 200 }
  chat: { x: 1210, y: 80, width: 500, height: 600 }

  Production Access URLs

  - Auto Audit Pro: http://146.190.39.214 (port 80)
  - Flightline: http://146.190.39.214:8080 (port 8080)

  Next Development Tasks

  1. Connect chat to real backend (WebSocket)
  2. Fix WebSocket connection URL
  3. Add user authentication
  4. Persist messages to database
  5. Real-time sync across users

  Deployment Verified

  - Date: 2025-08-25
  - Version: 2.0.0
  - Status: Fully operational
  - Features: All working as designed

  Your Flightline v2.0.0 is now fully documented and operational! 🚀
