# Changelog

## [2.3.3] - 2026-06-23

### Added

- Added OpenAI premium voice provider service: `backend/src/services/openaiVoiceProvider.js`.
- Wired Flight Attendant TTS route to OpenAI provider path.
- Configured server-side premium voice settings through backend `.env`.

### Confirmed

- `OPENAI_API_KEY` is set server-side only and masked in terminal output.
- `GET /api/flight-attendant/tts/status` returns `configured: true`.
- Premium voice provider reports `openai`.
- Premium voice model reports `gpt-4o-mini-tts`.
- Premium voice name reports `nova`.
- Premium voice format reports `mp3`.
- `POST /api/flight-attendant/tts` returns `HTTP/1.1 200 OK` when configured.
- Response content type is `audio/mpeg`.
- Test audio file generated successfully as MP3.
- `flightline-backend` remains online after PM2 restart.

### Guardrails

- API key is not committed to Git.
- API key is not exposed to React.
- Native browser speech remains fallback.
- No microphone input.
- No deal updates or write actions.

## [2.3.2] - 2026-06-23

### Added

- Added Flight Attendant backend voice stub route: `backend/src/routes/flightAttendantRoutes.js`.
- Registered backend route at `/api/flight-attendant`.
- Added status endpoint for premium voice availability.
- Added POST endpoint for future premium voice requests.

### Confirmed

- `node --check backend/src/routes/flightAttendantRoutes.js` passed.
- `node --check backend/src/server.js` passed.
- `flightline-backend` restarted successfully in PM2.
- `GET /api/flight-attendant/tts/status` returns configured false with fallback allowed.
- `POST /api/flight-attendant/tts` returns premium voice not configured with fallback allowed.
- Unsupported briefing type is rejected.
- Oversized briefing text is rejected.
- Backend remains online.

### Guardrails

- No premium voice provider is integrated yet.
- No provider credentials are required.
- No provider credentials are exposed to React.
- No deal updates or write actions are possible from this route.
- Native browser speech remains the fallback path.

## [2.3.1] - 2026-06-23

### Confirmed

- Flight Attendant Voice Briefing v1.1 confirmed working on Flightline Mobile.
- Short briefing mode works.
- Standard briefing mode works.
- Speak Briefing works.
- Stop Speaking works.
- Voice/status line works.
- Native browser voice selection works as far as Safari/browser support allows.
- Frontend build passed with existing non-blocking dashboard warnings.

### Changed

- Added Short / Standard briefing mode.
- Added Stop Speaking control.
- Added visible browser voice/status line.
- Tuned browser speech rate and pitch to make native speech less harsh.
- Kept Flight Attendant read-only with no backend dependency.

### Still Deferred

- Premium TTS integration.
- Microphone input.
- CRM/DMS write actions.
- External system access.

## [2.3.0] - 2026-06-23

### Added

- Added Flight Attendant Voice Briefing v1 documentation: `docs/FLIGHTLINE-FLIGHT-ATTENDANT-VOICE-BRIEFING-2026-06-23.md`.
- Added read-only Flight Attendant status-board briefing notes for Active Deals, Deal Flow, Today's Snapshot, and What Needs Attention.

### Confirmed

- Flight Attendant panel is visible in Flightline Mobile.
- Preset briefing buttons generate written status summaries.
- Speak Briefing reads the current Flightline status briefing out loud using browser speech synthesis.
- Flight Attendant Voice Briefing v1 is confirmed working as a proof of concept.

### Known Limitation

- Native browser voice quality is not acceptable for production.
- The next voice pass should improve voice selection, shorten spoken scripts, add stop controls, and prepare for premium TTS.
- Microphone input is not implemented yet.
- Flight Attendant remains read-only with no write actions.

## [2.2.0] - 2026-06-22

### Added

- Added Flightline Mobile MVP documentation: `docs/FLIGHTLINE-MOBILE-MVP-2026-06-22.md`.
- Added mobile MVP status, known limitations, expected mobile flow, and recommended next-pass items.

### Changed

- Updated Flightline Mobile to align with the desktop 12-deal demo environment.
- Updated mobile Active Deals behavior so tapping a customer/deal opens an in-page detail card instead of navigating to a fake `/deal/<id>` route.
- Updated mobile Deal Flow Pipeline so stage cards are actionable and route back into Active Deals filtered by selected stage.
- Updated Today's Snapshot mobile metrics so MVP values come from the active demo deal set instead of fields that were missing from desktop mock data.

### Fixed

- Fixed iPhone blank/dark mobile screen behavior.
- Fixed mobile scrolling constraints.
- Fixed mobile initial render by detecting mobile before first desktop render.
- Disabled mobile WebSocket behavior for demo mode until authenticated pilot flow is ready.
- Fixed misleading behavior where tapping a customer appeared to move that deal into Negotiation due to page reload and regenerated mock data.

## [2.1.0] - 2026-06-21

### Added

- Added current Flightline documentation set under `docs/`.
- Added server architecture documentation.
- Added operations runbook.
- Added troubleshooting guide.
- Added June 2026 recovery record.
- Added Git and deployment notes.
- Added Smart Doc retirement note.

### Fixed

- Updated Mongoose shutdown handler in `backend/src/server.js` to use async/await instead of the deprecated callback pattern.
- Resolved Flightline PM2 crash loop by restoring MongoDB after it had been killed by OOM.

### Operations

- Added persistent 2GB swap file at `/swapfile`.
- Cleaned system journal logs.
- Removed old Docker leftovers.
- Removed disabled snap revisions.
- Left retired Smart Doc stopped in PM2.
- Confirmed desired PM2 state: `auto-audit` online, `flightline-backend` online, `smart-doc-v2` stopped.

## [1.4.0] - 2025-08-24

Update the v2.0.0 entry:

## [2.0.0] - 2025-08-25

### Added

- Floating Windows Dashboard - Complete rewrite with react-rnd
  - True drag-and-drop windows
  - Resize from any edge or corner
  - Minimize/maximize each window
  - Close/hide windows in edit mode
  - Bring to front on click
  - Save custom layouts to localStorage

- Team Chat System - Internal communication platform
  - Slack-like interface with channels and DMs
  - Role-based colored avatars
  - Real-time messaging interface
  - Channel switching
  - Online/offline status indicators
  - Mock data for demonstration

### Changed

- Replaced WindowDashboard with FloatingDashboard.
- Shifted UI from fixed panels to floating windows.
- Each component operates as an independent window.
- App served on port 8080 at that time.

### Fixed

- AlertSystem CSS conflict.
- Chat.jsx typo.
- Resize and drag functionality.
- Backend trust proxy configuration.
- MongoDB connection using IPv4 `127.0.0.1` instead of IPv6.
- Dashboard panel layout flexibility.

### Security

- Updated trust proxy settings.

## [1.3.1] - 2025-08-24

### Fixed

- Fixed MongoDB connection issue by using `127.0.0.1` instead of `localhost`.
- Fixed Express trust proxy setting for rate limiting.
- Reduced minimum width constraints for dashboard widgets.

### Current Status At That Time

- Flightline backend running stable.
- Dashboard allowed more flexible widget sizing.
- Services operational.

## [1.3.0] - 2025-08-23

### Added

- Customizable dashboard with drag-and-drop.
- Layout persistence in localStorage.
- Edit mode for dashboard customization.

## [1.2.0] - 2025-08-23

### Added

- Recovery plan documentation.
- PM2 ecosystem configuration.
- Initial deployment to DigitalOcean.

## [1.0.0] - 2025-08-21

### Added

- Initial Flightline dashboard.
- Real-time deal tracking.
- WebSocket support.
- MongoDB integration.