# FlightLine Flight Attendant Voice Input Phase 5A

Date: 2026-06-24
Project: FlightLine Command Center
Scope: FlightLine Mobile only
Status: Patch script added, pending server application and mobile test

## Purpose

Phase 5A adds constrained browser speech-recognition intake to the Flight Attendant panel in FlightLine Mobile.

This is not open-ended agent behavior. It is a tap-to-talk command router that maps a small set of spoken commands to the existing read-only FlightLine briefings.

## Guardrails

- Read-only only
- No deal changes
- No CRM or DMS writeback
- No outbound messages
- No workflow triggers
- No background listening
- No wake word
- No CarPlay microphone work yet
- User must tap Talk before microphone capture starts

## Supported spoken commands

| Spoken phrase | Result |
|---|---|
| active deal summary | Active Deal Summary |
| active deals | Active Deal Summary |
| active deal | Active Deal Summary |
| deal flow | Deal Flow Summary |
| pipeline | Deal Flow Summary |
| today's snapshot | Today's Snapshot |
| todays snapshot | Today's Snapshot |
| snapshot | Today's Snapshot |
| what needs attention | What Needs Attention |
| needs attention | What Needs Attention |
| attention | What Needs Attention |
| stop speaking | Stop Speaking |
| stop playback | Stop Speaking |
| stop | Stop Speaking |

## User experience

The Flight Attendant header gets a new Talk button next to Speak Briefing.

Expected flow:

1. User taps Talk.
2. Browser requests microphone permission if needed.
3. UI status changes to Listening.
4. User says one supported command.
5. UI shows the recognized command.
6. Flight Attendant builds the matching briefing.
7. Existing OpenAI premium voice playback speaks the briefing.
8. If premium voice fails, existing native browser speech fallback still applies.

## Files affected by patch

The patch script updates:

- frontend/src/components/Mobile/FlightlineMobile.jsx

The script does not modify backend routes, OpenAI TTS configuration, CRM/DMS code, or CarPlay files.

## Patch script

Added:

- scripts/apply-flight-attendant-voice-input-phase5a.js

## Server application steps

Run from the FlightLine server:

```bash
cd /var/www/flightline
git pull
node scripts/apply-flight-attendant-voice-input-phase5a.js
cd frontend
npm run build
cd ..
git status
git add frontend/src/components/Mobile/FlightlineMobile.jsx docs/FLIGHTLINE-FLIGHT-ATTENDANT-VOICE-INPUT-PHASE-5A-2026-06-24.md scripts/apply-flight-attendant-voice-input-phase5a.js
git commit -m "Add Flight Attendant voice input Phase 5A"
git push
git status
```

## Mobile test checklist

On iPhone:

1. Open flightline.autoauditpro.io mobile view.
2. Confirm Flight Attendant panel loads.
3. Tap Talk.
4. Allow microphone access if prompted.
5. Say: active deals.
6. Confirm recognized command displays.
7. Confirm Active Deal Summary appears.
8. Confirm premium voice speaks the new briefing.
9. Tap Talk again and say: deal flow.
10. Confirm Deal Flow Summary appears and speaks.
11. Test: today's snapshot.
12. Test: what needs attention.
13. Test: stop speaking.
14. Confirm Stop Speaking stops playback and listening state.

## Browser limitation note

Browser speech recognition support varies by browser and iOS version. If unsupported, the app should show:

Voice input is not supported in this browser. Use the briefing buttons or Speak Briefing.

That is acceptable for Phase 5A. The goal is a constrained mobile prototype, not final CarPlay voice architecture.
