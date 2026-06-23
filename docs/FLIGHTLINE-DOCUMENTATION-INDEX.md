# Flightline Documentation Index

Last Updated: June 23, 2026

## Purpose

This documentation set records the current operating state, deployment structure, recovery notes, mobile MVP status, Flight Attendant voice briefing status, premium voice planning, and server dependencies for Flightline Command Center.

Flightline is deployed on the `autoauditpro` DigitalOcean server and is managed through PM2.

## Primary Documents

| Document | Purpose |
|---|---|
| `FLIGHTLINE-SERVER-ARCHITECTURE.md` | Current server layout, app locations, PM2 processes, MongoDB, swap, and related infrastructure |
| `FLIGHTLINE-OPERATIONS-RUNBOOK.md` | Daily/weekly operational commands, health checks, and frontend mobile verification steps |
| `FLIGHTLINE-TROUBLESHOOTING.md` | Known issues, failure symptoms, diagnostic steps, and fixes |
| `FLIGHTLINE-RECOVERY-2026-06-21.md` | Recovery record from the June 20-21, 2026 stabilization session |
| `FLIGHTLINE-MOBILE-MVP-2026-06-22.md` | Mobile MVP stabilization, mobile behavior fixes, expected flow, known limitations, and next pass |
| `FLIGHTLINE-FLIGHT-ATTENDANT-VOICE-BRIEFING-2026-06-23.md` | Flight Attendant Voice Briefing v1.1, confirmed status, voice quality finding, guardrails, and next pass |
| `FLIGHTLINE-FLIGHT-ATTENDANT-PREMIUM-TTS-PLAN-2026-06-23.md` | Premium voice architecture plan, backend voice stub recommendation, privacy/cost controls, and implementation phases |
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
| Mobile MVP | Working on iPhone with shared 12-deal demo source |
| Flight Attendant | Voice Briefing v1.1 confirmed working; native browser voice is the stable fallback baseline |
| Premium Voice | Planning documented; next recommended step is backend voice stub |
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
- Flightline Mobile MVP is now usable on iPhone and uses the same desktop 12-deal demo source.
- Flight Attendant Voice Briefing v1.1 is confirmed working as a read-only proof of concept.
- Native browser speech remains the fallback baseline, but premium voice should be implemented through the backend.
- The next recommended voice build step is a backend voice stub before selecting or integrating a provider.
- Mobile WebSocket behavior is intentionally disabled until authenticated pilot flow is ready.
- Smart Doc should remain stopped unless there is a specific reason to revive it.