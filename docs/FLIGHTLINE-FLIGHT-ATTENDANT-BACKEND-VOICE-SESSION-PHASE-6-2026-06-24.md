# FlightLine Flight Attendant Backend Voice Session Phase 6

Date: 2026-06-24
Project: FlightLine Command Center
Scope: FlightLine Mobile and Flight Attendant backend route
Status: Patch script added, pending server application and mobile test

## Purpose

Phase 6 moves Flight Attendant conversational intake away from browser SpeechRecognition and into a backend-backed voice turn loop.

This is Path B from the Phase 5 testing decision.

## Why this change is needed

Phase 5 proved that:

- Tap Talk worked.
- The first spoken request could be understood.
- Premium voice playback could work after audio priming.
- Flight Attendant could return visually to listening mode.

But iPhone Safari did not reliably deliver a second speech-recognition result after the first premium spoken response.

That means browser SpeechRecognition is acceptable as a proof of concept, but not reliable enough for a hands-free Flight Attendant experience.

## Phase 6 architecture

The new flow is:

1. User taps Talk once.
2. Browser opens a microphone stream using getUserMedia.
3. Frontend records a short voice turn using MediaRecorder.
4. Audio is posted to the Flight Attendant backend.
5. Backend transcribes the audio with OpenAI transcription.
6. Frontend maps the transcript to a FlightLine-only intent.
7. Flight Attendant generates the scoped briefing.
8. Premium voice speaks the response.
9. After the response finishes, the next short voice turn opens.
10. User ends the session by saying stop listening or tapping Stop Listening.

## Product boundary

Flight Attendant is not Nova.

Flight Attendant is scoped only to FlightLine and dealership deal activity.

Allowed topics:

- Active deals
- Deal flow
- Pipeline status
- Today's snapshot
- What needs attention
- Deal-stage counts
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
- General assistant tasks
- Any request not tied to FlightLine deal activity

## Guardrails

- Read-only only
- No deal changes
- No CRM writeback
- No DMS writeback
- No outbound messages
- No workflow triggers
- No background listening after the session ends
- No wake word
- No Nova-style general assistant behavior

## Backend additions

New service:

- backend/src/services/openaiTranscriptionProvider.js

Updated route:

- backend/src/routes/flightAttendantRoutes.js

New endpoints:

- GET /api/flight-attendant/conversation/status
- POST /api/flight-attendant/conversation/transcribe

The transcription endpoint accepts audio bodies from MediaRecorder and returns:

```json
{
  "success": true,
  "transcript": "what needs attention",
  "provider": "openai",
  "model": "gpt-4o-mini-transcribe"
}
```

## Frontend additions

Updated:

- frontend/src/components/Mobile/FlightlineMobile.jsx

Key changes:

- Uses getUserMedia for microphone permission.
- Uses MediaRecorder for short spoken turns.
- Sends each turn to the backend for transcription.
- Stops relying on browser SpeechRecognition for follow-up turns.
- Keeps the same FlightLine-only intent router.
- Keeps premium voice playback.

## Environment

Requires:

- OPENAI_API_KEY

Optional:

- OPENAI_STT_MODEL

Default transcription model:

- gpt-4o-mini-transcribe

## Server application steps

Run from the FlightLine server:

```bash
cd /var/www/flightline
git pull
node scripts/apply-flight-attendant-backend-voice-session-phase6.js
cd backend
node -c src/routes/flightAttendantRoutes.js
node -c src/services/openaiTranscriptionProvider.js
cd ../frontend
npm run build
cd ..
git status
git add backend/src/routes/flightAttendantRoutes.js backend/src/services/openaiTranscriptionProvider.js frontend/src/components/Mobile/FlightlineMobile.jsx docs/FLIGHTLINE-FLIGHT-ATTENDANT-BACKEND-VOICE-SESSION-PHASE-6-2026-06-24.md scripts/apply-flight-attendant-backend-voice-session-phase6.js
git commit -m "Add Flight Attendant backend voice session Phase 6"
git push
git status
```

After commit, restart backend if needed:

```bash
pm2 restart flightline-backend
```

## Backend test

```bash
curl -s http://localhost:3001/api/flight-attendant/conversation/status | python3 -m json.tool
```

Expected configured response if OPENAI_API_KEY is set:

```json
{
  "success": true,
  "configured": true,
  "provider": "openai",
  "model": "gpt-4o-mini-transcribe"
}
```

## Mobile test checklist

1. Hard refresh flightline.autoauditpro.io.
2. Tap Talk once.
3. Allow microphone access.
4. Ask: today's snapshot.
5. Confirm status changes to processing.
6. Confirm Flight Attendant answers audibly.
7. Wait for next listening window.
8. Ask: what needs attention?
9. Confirm second turn is transcribed and answered.
10. Ask: how's the weather?
11. Confirm out-of-scope response.
12. Say: stop listening.
13. Confirm session ends.

## Known MVP limitation

Phase 6 records short voice turns instead of a fully continuous streaming session. This is more reliable than browser SpeechRecognition and closer to the desired hands-free session, but true live streaming can be evaluated later for native iOS or CarPlay.
