# FlightLine Mobile Theme + Layout Cleanup — Phase 7B

**Date:** 2026-06-26  
**Status:** Patch prepared  
**Scope:** Frontend mobile UX only  
**System:** FlightLine Command Center  

---

## 1. Purpose

Phase 7B addresses two mobile usability issues identified from the FlightLine PWA screenshot:

1. The current mobile experience is too dark as the only presentation mode.
2. The first mobile viewport is crowded, with Flight Attendant controls dominating the screen and Active Deals pushed too low.

This phase is intentionally frontend-only.

No backend routes, Phase 7 integration endpoints, authentication, or voice engine logic should be changed.

---

## 2. Changes

Phase 7B adds:

- Light / Dark / Device theme selector in the mobile header.
- Theme persistence using `localStorage`.
- Device mode using `prefers-color-scheme`.
- Active Deals moved above Flight Attendant.
- Flight Attendant compact by default.
- One primary Talk button visible by default.
- Secondary voice controls moved behind a More/Less expansion control.
- Quick Actions converted to a more compact horizontal row.
- Reduced card padding and vertical crowding.
- More flexible stage pills and deal cards.
- FL logo added to the mobile header.

---

## 3. Files Changed

```text
frontend/src/components/Mobile/FlightlineMobile.jsx
frontend/src/components/Mobile/FlightlineMobile.css
frontend/public/flightline-logo.svg
```

---

## 4. Acceptance Criteria

Phase 7B is accepted when:

- Mobile users can choose Light, Dark, or Device mode.
- Theme preference persists after refresh.
- Device mode follows the phone/browser appearance setting.
- Active Deals appear higher on the mobile page.
- Flight Attendant is compact by default.
- Talk remains visible and usable.
- Speak Briefing, Short/Standard, Stop, and prompt buttons remain available under More.
- Quick Actions are less visually dominant.
- Stage pills do not clip awkwardly.
- Voice controls still work.
- Existing backend and Phase 7 integration endpoints are unaffected.

---

## 5. Validation Commands

```bash
cd /var/www/flightline/frontend
npm run build
```

Recommended mobile QA:

```text
1. Open FlightLine on iPhone.
2. Confirm Device is the default theme.
3. Switch to Light mode.
4. Refresh and confirm Light persists.
5. Switch to Dark mode.
6. Refresh and confirm Dark persists.
7. Switch back to Device.
8. Confirm Active Deals are higher on the page.
9. Confirm Flight Attendant is compact.
10. Tap More and confirm voice controls are still available.
11. Tap Talk and confirm the voice loop still works.
12. Confirm Quick Actions are compact and usable.
```

---

## 6. Final Note

This phase should make the mobile PWA feel calmer and more operational without removing any functionality.


## PWA Icon Update

- PWA home-screen icon wired for iPhone.
- Added apple-touch-icon.png.
- Added icon-192.png and icon-512.png from the same FL mark.
- Added manifest.json.
- Updated index.html with Apple mobile web app metadata.
