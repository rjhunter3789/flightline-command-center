# FlightLine Flight Attendant Conversational Session Phase 5B

Date: 2026-06-24
Project: FlightLine Command Center
Scope: FlightLine Mobile only
Status: Patch script added, pending server application and mobile test

## Purpose

Phase 5B converts Flight Attendant from one-shot voice command mode into a scoped conversational session.

Flight Attendant is conversational, but not general-purpose. It is not Nova. It only answers questions related to FlightLine and deal activity.

## Product rule

Flight Attendant can be conversational, but not general-purpose.

## User experience

Expected session flow:

1. User taps Talk once.
2. Browser requests microphone permission if needed.
3. Flight Attendant enters a scoped listening session.
4. User asks a natural FlightLine question.
5. Flight Attendant maps the request to a supported FlightLine intent.
6. Flight Attendant generates a short response.
7. Premium voice speaks the response.
8. After speaking, Flight Attendant automatically listens again.
9. User can continue asking FlightLine questions without tapping again.
10. User says stop listening, stop speaking, or taps Stop Listening to end the session.

## Scope

Allowed topics:

- Active deals
- Deal flow
- Pipeline status
- Today's snapshot
- What needs attention
- Deal-stage counts
- Deal activity
- Manager attention items
- Repeat last response
- Shorter version
- More detail
- Stop listening

Out of scope:

- Weather
- Sports
- News
- Stocks
- Restaurants
- Traffic
- General assistant requests
- Anything not tied to FlightLine deal activity

## Off-topic response

If a user asks something outside FlightLine, Flight Attendant responds with:

Flight Attendant is scoped to FlightLine deal activity. Ask me about deal flow, active deals, today’s snapshot, or what needs attention.

## Guardrails

- Read-only only
- No deal changes
- No CRM or DMS writeback
- No outbound messages
- No workflow triggers
- No background listening after the session ends
- No wake word
- No Nova-style general assistant behavior
- No CarPlay microphone work yet
- User must tap Talk to start the session

## Files affected by patch

The patch script updates:

- frontend/src/components/Mobile/FlightlineMobile.jsx
- frontend/src/utils/flightAttendantAudio.js

## Patch script

Added:

- scripts/apply-flight-attendant-conversation-phase5b.js

## Why the audio helper changes

The premium voice helper now accepts an optional onEnded callback. This allows Flight Attendant to resume listening only after the spoken response finishes.

Without this callback, the app can start listening too early while the voice response is still playing.

## Server application steps

Run from the FlightLine server:

```bash
cd /var/www/flightline
git pull
node scripts/apply-flight-attendant-conversation-phase5b.js
cd frontend
npm run build
cd ..
git status
git add frontend/src/components/Mobile/FlightlineMobile.jsx frontend/src/utils/flightAttendantAudio.js docs/FLIGHTLINE-FLIGHT-ATTENDANT-CONVERSATIONAL-SESSION-PHASE-5B-2026-06-24.md scripts/apply-flight-attendant-conversation-phase5b.js
git commit -m "Add Flight Attendant conversational session Phase 5B"
git push
git status
```

## Mobile test checklist

On iPhone:

1. Open flightline.autoauditpro.io mobile view.
2. Confirm Flight Attendant panel loads.
3. Tap Talk once.
4. Allow microphone access if prompted.
5. Say: can you give me deal flow?
6. Confirm recognized command displays.
7. Confirm Deal Flow Summary appears and speaks.
8. Wait for speaking to finish.
9. Confirm it returns to listening.
10. Say: what needs attention?
11. Confirm it answers and returns to listening.
12. Say: shorter version.
13. Confirm it gives a short version.
14. Say: repeat that.
15. Confirm it repeats the last response.
16. Say: how's the weather?
17. Confirm it redirects to FlightLine-only scope.
18. Say: stop listening.
19. Confirm the session ends.

## Known browser limitation

Browser speech recognition support varies by browser and iOS version. Phase 5B remains a browser-based mobile prototype. Final CarPlay voice behavior should wait until Apple entitlement and native app architecture are confirmed.
