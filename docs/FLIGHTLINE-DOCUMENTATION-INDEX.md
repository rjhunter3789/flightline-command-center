# Flightline Documentation Index

Last Updated: June 21, 2026

## Purpose

This documentation set records the current operating state, deployment structure, recovery notes, and server dependencies for Flightline Command Center.

Flightline is deployed on the `autoauditpro` DigitalOcean server and is managed through PM2.

## Primary Documents

| Document | Purpose |
|---|---|
| `FLIGHTLINE-SERVER-ARCHITECTURE.md` | Current server layout, app locations, PM2 processes, MongoDB, swap, and related infrastructure |
| `FLIGHTLINE-OPERATIONS-RUNBOOK.md` | Daily/weekly operational commands and health checks |
| `FLIGHTLINE-TROUBLESHOOTING.md` | Known issues, failure symptoms, diagnostic steps, and fixes |
| `FLIGHTLINE-RECOVERY-2026-06-21.md` | Recovery record from the June 20-21, 2026 stabilization session |
| `FLIGHTLINE-SMART-DOC-RETIREMENT-NOTE.md` | Notes on Smart Doc being retired/shelved and left stopped |
| `FLIGHTLINE-GIT-AND-DEPLOYMENT.md` | GitHub repository, deployment path, commit process, and PM2 restart guidance |

## Current Production Summary

| Item | Current State |
|---|---|
| Server | `autoauditpro` DigitalOcean server |
| Flightline path | `/var/www/flightline` |
| Backend path | `/var/www/flightline/backend` |
| Frontend path | `/var/www/flightline/frontend` |
| PM2 process | `flightline-backend` |
| Backend port | `3001` |
| MongoDB | Local MongoDB on `127.0.0.1:27017` |
| GitHub repo | `rjhunter3789/flightline-command-center` |
| Smart Doc | Stopped, retired prototype |
| Swap | `/swapfile`, 2GB, persistent through `/etc/fstab` |

## Current PM2 Intent

| Process | Desired State | Notes |
|---|---|---|
| `auto-audit` | Online | Auto Audit Pro production process |
| `flightline-backend` | Online | Flightline backend |
| `smart-doc-v2` | Stopped | Retired/shelved Smart Document Assistant prototype |

## Important Notes

- Flightline is now under Git version control.
- The initial production snapshot was committed and pushed to GitHub.
- The Mongoose shutdown handler was updated to remove the deprecated callback pattern.
- The primary crash-loop cause was MongoDB being down after an OOM kill.
- Smart Doc should remain stopped unless there is a specific reason to revive it.
