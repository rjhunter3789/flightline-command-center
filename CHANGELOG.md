# Changelog

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
