# FlightLine Flight Attendant Voice Briefing - June 23, 2026

## Purpose

This document records the working Flight Attendant voice briefing milestones inside FlightLine Mobile.

FlightLine is the platform and operational command board. Flight Attendant is the read-only voice/persona that speaks status-board briefings.

The feature allows FlightLine Mobile to generate short or standard read-only status board briefings from current dashboard data and read them back using premium backend-generated audio, with native browser speech as fallback.

## Confirmed Working State

| Area | Status |
|---|---|
| Flight Attendant panel | Confirmed visible in FlightLine Mobile |
| Active Deal Summary | Confirmed working |
| Deal Flow Summary | Confirmed working |
| Today's Snapshot briefing | Confirmed working |
| What Needs Attention briefing | Confirmed working |
| Speak Briefing button | Confirmed working with premium voice first |
| Short briefing mode | Confirmed working |
| Standard briefing mode | Confirmed working |
| Stop Speaking button | Confirmed working with premium audio |
| Voice/status line | Confirmed working |
| Premium voice playback | Confirmed working on iPhone |
| Latency state | Confirmed working with `Generating...` button state |
| Native browser speech | Confirmed fallback path |
| Customer-facing product name | `FlightLine` |
| Voice/persona name | `Flight Attendant` |
| Microphone input | Not implemented yet |
| Write actions | Not implemented and intentionally excluded |

## Naming Standard

Use this hierarchy:

```text
FlightLine = platform / command board / operational system
Flight Attendant = voice assistant / persona
flightline.autoauditpro.io = lowercase domain
```

Correct examples:

```text
FlightLine active deal summary
FlightLine deal flow summary
FlightLine today's snapshot
FlightLine attention summary
```

Avoid:

```text
Flight Attendant active deal summary
```

Flight Attendant is the speaker, not the platform.

## Version Summary

### v1.0

Flight Attendant v1.0 proved that FlightLine Mobile could generate and read back preset status-board briefings.

Confirmed:

- Written briefings generated from mobile dashboard data.
- Speak Briefing worked through browser speech synthesis.
- Feature remained read-only.

Limitation found:

- Native browser voice quality was poor and not production-ready.

### v1.1

Flight Attendant v1.1 improved the usable voice briefing experience while keeping the feature frontend-only and read-only.

Confirmed:

- Short briefing mode works.
- Standard briefing mode works.
- Speak Briefing works.
- Stop Speaking works.
- Voice/status line works.
- Native voice selection works as far as Safari/browser support allows.
- Frontend build passed with only existing non-blocking dashboard warnings.

### v2.0 Premium Voice

Flight Attendant premium voice adds backend-generated audio playback while keeping the native browser voice as fallback.

Confirmed:

- Backend premium voice endpoint works.
- Frontend premium playback works on iPhone.
- Speak Briefing calls backend premium voice first.
- Returned MP3 audio plays in the mobile browser.
- Stop Speaking stops premium audio.
- Native browser speech remains fallback.
- Short and Standard briefing modes remain intact.

### v2.1 Latency Polish

Flight Attendant latency polish improves the waiting state while premium audio is being generated.

Confirmed:

- Button changes to `Generating...` while premium voice is being prepared.
- Status changes to `Generating premium voice...`.
- Speak Briefing is disabled while generation is in progress.
- Button re-enables after audio starts, fails, or falls back.
- No audio pre-generation was added.

### v2.2 Naming Polish

FlightLine naming polish clarifies the product hierarchy.

Confirmed:

- Header displays `FlightLine`.
- Demo badge displays `FlightLine Demo`.
- Standard briefing text and speech use `FlightLine active deal summary` and related `FlightLine` phrasing.
- Domain remains lowercase.

## What This Version Does

Flight Attendant is a read-only voice briefing layer for FlightLine Mobile.

It can generate and read back preset summaries for:

- Active Deals
- Deal Flow Pipeline
- Today's Snapshot
- What Needs Attention

The output is based on the same active deal data used by the mobile dashboard.

Premium playback flow:

1. User selects a briefing.
2. User taps Speak Briefing.
3. FlightLine Mobile requests premium audio from the backend.
4. The button displays `Generating...` while audio is prepared.
5. The returned MP3 plays in the mobile browser.
6. Stop Speaking stops playback.
7. If premium voice fails, the app falls back to native browser speech.

## What This Version Does Not Do

Flight Attendant does not:

- Listen for spoken commands.
- Change deal status.
- Send messages.
- Update CRM records.
- Access external systems.
- Replace Nova.
- Trigger workflow actions.

This version proves the read-only status-board briefing experience with production-quality voice playback.

## Current User Experience

Expected user flow:

1. Open FlightLine Mobile on iPhone.
2. Review the Flight Attendant panel near the top of the screen.
3. Choose Short or Standard briefing mode.
4. Tap one of the briefing buttons.
5. Confirm the written briefing updates.
6. Tap Speak Briefing.
7. Confirm the button changes to `Generating...` while audio is prepared.
8. Confirm premium voice reads the current briefing out loud.
9. Tap Stop Speaking to stop playback.
10. Confirm the voice/status line updates.

## Voice Quality Finding

Native browser speech readout works as a fallback, but premium backend-generated audio is the preferred user experience.

User testing confirmed the premium voice sounds good and works smoothly. Standard briefing can still have a short generation delay because it contains more text than Short mode. Phase 4.1 addressed that delay with clearer status and disabled-button behavior.

## Production Voice Direction

Current production voice path:

1. Keep native browser speech as fallback.
2. Use backend-generated premium audio for Speak Briefing.
3. Keep Short as default.
4. Avoid audio pre-generation until usage and cost controls exist.
5. Add microphone input only after read-only briefing remains stable.
6. Keep all write actions disabled until authenticated pilot controls exist.

## MVP Guardrails

Flight Attendant should remain read-only until authenticated pilot access and safety rules are defined.

Current guardrails:

- Read dashboard data only.
- Summarize status only.
- No dealer/customer data changes.
- No outbound communications.
- No CRM writeback.
- No external tool access.
- No microphone input yet.
- No provider configuration exposed in React.

## Real-World Use Case

The target use case is a dealer or manager who wants a quick status board briefing without manually reviewing every card on the dashboard.

Example request:

```text
Flight Attendant, what's the Active Deal Summary?
```

Expected short response style:

```text
Active deals: 12 total. Showroom 4, Test Drive 3, Negotiation 3, F&I 2. Two high urgency.
```

Expected standard response style:

```text
FlightLine active deal summary: you currently have 12 active deals. Showroom has 4, Test Drive has 3, Negotiation has 3, and F&I has 2. Two deals are high urgency. The highest gross opportunity is currently in Test Drive.
```

## Next Pass

Recommended next development pass:

- Add authenticated pilot access.
- Add privacy mode toggle.
- Add usage logging.
- Add cost monitoring.
- Keep microphone input deferred.
- Keep write actions deferred.

## Current Status

Flight Attendant premium voice playback is confirmed working as a read-only mobile feature.

Phase 4, Phase 4.1, and naming polish are complete.

The next major improvement should be pilot controls, privacy mode, and usage/cost monitoring.
