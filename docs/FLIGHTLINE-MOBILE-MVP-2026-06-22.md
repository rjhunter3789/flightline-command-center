# Flightline Mobile MVP Update - June 22, 2026

## Purpose

This document records the June 22, 2026 Flightline Mobile MVP stabilization and usability update.

The goal of this pass was to make the mobile experience usable on iPhone, align it with the desktop demo environment, and correct mobile interaction behavior.

## Final Confirmed Mobile State

| Area | Status |
|---|---|
| Mobile page loads on iPhone | Confirmed working |
| Mobile blank/dark screen | Resolved |
| Mobile scrolling | Resolved |
| Mobile demo data | Now uses the same desktop 12-deal demo source |
| Mobile WebSocket behavior | Disabled for mobile demo mode |
| Active Deals | Working |
| Deal Flow Pipeline | Stage cards are actionable |
| Deal/customer tap | Opens in-page mobile detail card |
| Today's Snapshot | Shows useful MVP metrics |
| Git status | Clean and pushed after updates |

## Key Commits

| Commit | Purpose |
|---|---|
| `d8d2321` | Allow mobile scrolling in Flightline |
| `1515285` | Add demo fallback data to Flightline Mobile |
| `79fd1cd` | Render Flightline Mobile on initial mobile load |
| `0001703` | Disable WebSocket in Flightline Mobile demo mode |
| `6ca5fdb` | Use desktop demo deals in Flightline Mobile |
| `330a836` | Open mobile deal details in place |
| `8c4ceee` | Make mobile pipeline stages actionable |
| `2ce05a4` | Show useful mobile snapshot metrics |

## Problem Summary

The initial mobile version was not behaving like a mobile version of Flightline Command Center.

Observed issues:

- iPhone displayed a blank/dark screen.
- Mobile view did not scroll properly.
- Mobile used a separate lightweight 3-deal fallback instead of the desktop 12-deal demo environment.
- Tapping a customer/deal navigated to `/deal/<id>`, forcing a reload.
- Reloading regenerated random mock data and made deals appear to move stages.
- Deal Flow Pipeline stage cards displayed counts but were not actionable.
- Today's Snapshot showed zero values because it was reading fields not present in the desktop mock data.

## Root Causes

### Blank Mobile Screen

The mobile page appeared to load the background but not usable content.

Contributing causes:

- The app initially rendered desktop before mobile detection completed.
- Mobile WebSocket behavior created runtime risk before authenticated pilot flow was ready.
- Global CSS used fixed height and hidden overflow, which blocked mobile scrolling.

### Mobile/Data Parity Gap

Desktop used `useRealTimeData()` to generate 12 active mock deals.

Mobile used its own fallback data and was not connected to the same demo data source.

### Customer Tap Behavior

The mobile deal card used route navigation instead of an in-page detail view:

```javascript
window.location.href = `/deal/${dealId}`;
```

There was no proper mobile deal-detail route for this MVP flow. The route change forced a reload and regenerated the demo data.

## Fixes Applied

### Mobile Rendering

- Updated mobile detection so mobile renders correctly on initial load.
- Updated mobile CSS behavior so the page can scroll on iPhone.
- Disabled live WebSocket behavior for mobile demo mode.

### Shared Demo Data

Flightline Mobile now imports and uses `useRealTimeData()`.

This aligns mobile with the desktop 12-deal demo environment.

Mobile keeps a small fallback data set only as an emergency fallback if desktop demo data is unavailable.

### Stage Normalization

Mobile now maps desktop stage IDs to mobile labels:

| Desktop stage | Mobile label |
|---|---|
| `showroom` | Showroom |
| `test_drive` | Test Drive |
| `negotiation` | Negotiation |
| `finance` | F&I Office |

### Deal Detail Behavior

Mobile deal/customer tap now opens an in-page detail card instead of navigating away.

Expected behavior:

- Tap stage: filter active deals.
- Tap customer/deal: open detail card.
- Tap Close: return to the same list.

### Deal Flow Pipeline Behavior

Pipeline stage cards are now actionable.

Expected behavior:

- Tap Deal Flow Pipeline.
- Tap Showroom, Test Drive, Negotiation, or F&I Office.
- Mobile switches back to Active Deals filtered to the selected stage.

### Today's Snapshot Metrics

Today's Snapshot now shows MVP-useful demo metrics:

| Metric | MVP Calculation |
|---|---|
| Total Deals | `deals.length` |
| Closed | Deals with probability at or above 90% |
| Revenue | Sum of `grossProfit` or fallback `salePrice` |
| Appointments | Test Drive stage deals or deals with `appointmentTime` |

## Current Expected Mobile Flow

1. Open `https://flightline.autoauditpro.io` on iPhone.
2. Flightline Mobile loads.
3. Active Deals shows stage filters and demo deal cards.
4. Deal Flow Pipeline cards navigate into matching Active Deals stage.
5. Customer/deal tap opens in-place detail card.
6. Today's Snapshot shows meaningful demo metrics.
7. Staff Activity groups deals by salesperson.
8. Chat & Sentiment remains placeholder/MVP-level.

## Known Limitations

- This is still a demo/MVP mobile experience.
- Mobile design does not yet fully match the desktop command center visual weight.
- Live dealership/CRM/DMS integrations are not connected.
- Mobile WebSocket behavior is intentionally disabled until authenticated pilot flow is ready.
- Today's Snapshot uses MVP/demo calculations, not final production dealership metrics.
- Chat & Sentiment remains placeholder behavior.
- Desktop build warnings still exist in older dashboard components.

## Recommended Next Pass

1. Mobile visual polish to better match Flightline desktop.
2. Improve customer/deal detail screen.
3. Add sticky bottom navigation or command tabs.
4. Add mobile priority alert section.
5. Clean up older frontend build warnings.
6. Create authenticated pilot flow before re-enabling live WebSocket behavior on mobile.
7. Decide whether mobile snapshot cards should become fully actionable.
