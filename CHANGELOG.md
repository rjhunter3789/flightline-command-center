 # Changelog
## [1.4.0] - 2025-08-24

 Update the v2.0.0 entry:

  ## [2.0.0] - 2025-08-25

  ### Added
  - **Floating Windows Dashboard** - Complete rewrite with react-rnd
    - True drag-and-drop windows (move anywhere on screen)
    - Resize from ANY edge or corner (not just dividers)
    - Minimize/maximize each window
    - Close/hide windows in edit mode
    - Bring to front on click (z-index management)
    - Save custom layouts to localStorage

  - **Team Chat System** - Internal communication platform
    - Slack-like interface with channels and DMs
    - Role-based colored avatars (Owner=purple, Manager=blue, Sales=green)
    - Real-time messaging interface
    - Channel switching (#general, #sales, #managers, #service)
    - Online/offline status indicators
    - Mock data for demonstration

  ### Changed
  - Replaced WindowDashboard with FloatingDashboard
  - Complete UI paradigm shift from fixed panels to floating windows
  - Each component now operates as independent window
  - App serves on port 8080 (separate from auto-audit on port 80)

  ### Fixed
  - AlertSystem CSS conflict (removed fixed positioning inside windows)
  - Chat.jsx typo (MoreVertical size prop)
  - All resize and drag functionality working as expected

  ### Build Info
  - Final build size: 78.82 kB JS, 4.23 kB CSS
  - Dependencies: react-rnd@10.5.2
  - 5 floating windows total

  ### Removed
  - react-resizable-panels (replaced with react-rnd)
  - Fixed panel layouts
  - Grid-based dashboard
  - WindowDashboard component
  ### Changed
  - Replaced grid-based layout with window-style resizable panels
  - Implemented react-resizable-panels for true edge-based resizing
  - Removed grid snapping for smooth, precise control
  - Complete rewrite of dashboard to WindowDashboard component

  ### Added
  - WindowDashboard component with free-form resizing
  - Resize handles on all panel edges (vertical and horizontal)
  - True window-style resizing from any divider
  - New CSS architecture for proper panel layout

  ### Fixed
  - Backend trust proxy configuration (changed from true to specific value)
  - MongoDB connection using IPv4 (127.0.0.1) instead of IPv6
  - Layout now allows any aspect ratio for panels
  - Removed all minimum width/height constraints
  - Fixed overlapping panels issue with proper flex layout

  ### Security
  - Updated trust proxy settings to prevent IP bypass vulnerability
  ## [1.3.1] - 2025-08-24

  ### Fixed
  - Fixed MongoDB connection issue (changed from ::1 to 127.0.0.1)
  - Fixed Express trust proxy setting for rate limiting
  - Reduced minimum width constraints for dashboard widgets:
    - Deal Flow: minW reduced from 6 to 2
    - Deal Cards: minW reduced from 6 to 3

  ### Current Status
  - Flightline backend running stable
  - Dashboard allows more flexible widget sizing
  - All services operational

  ## [1.3.0] - 2025-08-23

  ### Added
  - Customizable dashboard with drag-and-drop
  - Layout persistence in localStorage
  - Edit mode for dashboard customization

  ## [1.2.0] - 2025-08-23

  ### Added
  - Recovery plan documentation
  - PM2 ecosystem configuration
  - Initial deployment to DigitalOcean

  ## [1.0.0] - 2025-08-21

  ### Added
  - Initial Flightline dashboard
  - Real-time deal tracking
  - WebSocket support
  - MongoDB integration
