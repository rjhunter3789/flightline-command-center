# FlightLine Documentation Index

Last Updated: June 23, 2026

## Purpose

This documentation set records the current operating state, deployment structure, recovery notes, mobile MVP status, Flight Attendant voice briefing status, premium voice implementation, CarPlay entitlement request status, and server dependencies for FlightLine Command Center.

FlightLine is deployed on the `autoauditpro` DigitalOcean server and is managed through PM2.

## Naming Standard

Use this hierarchy consistently:

```text
FlightLine = platform / command board / operational system
Flight Attendant = voice assistant / persona
flightline.autoauditpro.io = lowercase domain
```

## Primary Documents

| Document | Purpose |
|---|---|
| `FLIGHTLINE-SERVER-ARCHITECTURE.md` | Current server layout, app locations, PM2 processes, MongoDB, swap, and related infrastructure |
| `FLIGHTLINE-OPERATIONS-RUNBOOK.md` | Daily/weekly operational commands, health checks, and frontend mobile verification steps |
| `FLIGHTLINE-TROUBLESHOOTING.md` | Known issues, failure symptoms, diagnostic steps, and fixes |
| `FLIGHTLINE-RECOVERY-2026-06-21.md` | Recovery record from the June 20-21, 2026 stabilization session |
| `FLIGHTLINE-MOBILE-MVP-2026-06-22.md` | Mobile MVP stabilization, mobile behavior fixes, expected flow, known limitations, and next pass |
| `FLIGHTLINE-FLIGHT-ATTENDANT-VOICE-BRIEFING-2026-06-23.md` | Flight Attendant voice briefing status, premium playback, latency polish, naming standard, guardrails, and next pass |
| `FLIGHTLINE-FLIGHT-ATTENDANT-PREMIUM-TTS-PLAN-2026-06-23.md` | Premium voice architecture, backend OpenAI provider path, frontend playback, latency polish, privacy/cost controls, and implementation phases |
| `FLIGHTLINE-CARPLAY-ENTITLEMENT-REQUEST-2026-06-23.md` | CarPlay Voice-Based Conversational entitlement submission, scope, safety posture, and next steps |
| `FLIGHTLINE-SMART-DOC-RETIREMENT-NOTE.md` | Notes on Smart Doc being retired/shelved and left stopped |
| `FLIGHTLINE-GIT-AND-DEPLOYMENT.md` | GitHub repository, deployment path, commit process, and PM2 restart guidance |

## Current Production Summary

| Item | Current State |
|---|---|
| Server | `autoauditpro` DigitalOcean server |
| FlightLine path | `/var/www/flightline` |
| Backend path | `/var/www/flightline/backend` |
| Frontend path | `/var/www/flightline/frontend` |
| PM2 process | `flightline-backend` |
| Backend port | `3001` |
| MongoDB | Local MongoDB on `127.0.0.1:27017` |
| GitHub repo | `rjhunter3789/flightline-command-center` |
| Mobile MVP | Working on iPhone with shared 12-deal demo source |
| Flight Attendant | Premium voice playback confirmed working; native browser speech remains fallback |
| Premium Voice | Backend OpenAI provider path and frontend MP3 playback confirmed working |
| Latency State | `Generating...` button state confirmed working during premium audio preparation |
| Customer-Facing Name | `FlightLine` |
| Domain | `flightline.autoauditpro.io` |
| CarPlay | Voice-Based Conversational entitlement request submitted; pending Apple review/status update |
| Smart Doc | Stopped, retired prototype |
| Swap | `/swapfile`, 2GB, persistent through `/etc/fstab` |

## Current PM2 Intent

| Process | Desired State | Notes |
|---|---|---|
| `auto-audit` | Online | Auto Audit Pro production process |
| `flightline-backend` | Online | FlightLine backend |
| `smart-doc-v2` | Stopped | Retired/shelved Smart Document Assistant prototype |

## Important Notes

- FlightLine is under Git version control.
- The initial production snapshot was committed and pushed to GitHub.
- The Mongoose shutdown handler was updated to remove the deprecated callback pattern.
- The primary crash-loop cause was MongoDB being down after an OOM kill.
- FlightLine Mobile MVP is usable on iPhone and uses the same desktop 12-deal demo source.
- Flight Attendant premium voice is confirmed working as a read-only mobile feature.
- Native browser speech remains the fallback baseline.
- Premium voice generation stays behind the backend.
- Provider configuration must not be exposed to React.
- FlightLine CarPlay entitlement request was submitted as Voice-Based Conversational.
- FlightLine CarPlay scope should remain Flight Attendant read-only voice briefings only.
- CarPlay should not expose the full dashboard, customer cards, deal updates, CRM/DMS writeback, outbound messages, or workflow triggers.
- Mobile WebSocket behavior is intentionally disabled until authenticated pilot flow is ready.
- Microphone input remains deferred.
- Write actions remain deferred.
- The next recommended voice/product step is pilot controls, privacy mode, and usage/cost monitoring.
- Smart Doc should remain stopped unless there is a specific reason to revive it.
