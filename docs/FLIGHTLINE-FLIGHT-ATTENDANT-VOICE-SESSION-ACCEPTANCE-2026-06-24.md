# FlightLine Flight Attendant Voice Session Acceptance

**Date:** 2026-06-24  
**Status:** GREEN / ACCEPTED  
**Accepted Build:** Phase 6C  
**Accepted Commit:** `331804d` — `Use fresh microphone stream for Flight Attendant turns`  
**System:** FlightLine Command Center  
**Assistant Persona:** Flight Attendant  
**Domain:** `flightline.autoauditpro.io`  

---

## 1. Executive Summary

Flight Attendant conversational voice sessions are now operational on iPhone mobile web.

The accepted implementation uses:

- Mobile browser microphone capture
- Short voice-turn recording windows
- Backend OpenAI transcription
- Existing FlightLine-only intent routing
- Premium OpenAI text-to-speech response playback
- A fresh microphone stream for every follow-up turn

The critical failure was isolated and resolved in Phase 6C. Earlier versions could answer the first spoken question but failed to capture usable audio on follow-up turns. Phase 6B instrumentation proved the follow-up recording was only sending approximately `5` bytes. Phase 6C fixed the issue by reopening a fresh microphone stream for each voice turn. After Phase 6C, follow-up voice turns recorded healthy audio payloads of approximately `138,000–139,000` bytes and produced correct FlightLine responses.

Flight Attendant is now able to conduct a scoped, multi-turn voice session while remaining inside FlightLine deal-activity boundaries.

---

## 2. Accepted Capabilities

Flight Attendant now supports the following accepted MVP behaviors:

| Capability | Status |
|---|---:|
| Tap-to-start voice session | PASS |
| Microphone permission request | PASS |
| First spoken FlightLine question | PASS |
| Backend transcription | PASS |
| Premium voice response playback | PASS |
| Follow-up spoken question | PASS |
| Repeat last response | PASS |
| Shorter version request | PASS |
| FlightLine-only scope enforcement | PASS |
| Out-of-scope weather redirect | PASS |
| Fresh mic capture after response playback | PASS |
| Session stop command | Expected / supported |

---

## 3. Key Validation Result

### Before Phase 6C

Follow-up turn appeared active in the UI but did not capture meaningful audio.

Observed second-turn payload:

```text
Audio bytes: 5
```

Interpretation:

- UI was cycling correctly.
- Recorder was stopping and sending something.
- Backend route was reachable.
- But the follow-up mic stream was effectively empty.

### After Phase 6C

Follow-up turn captured real microphone audio and routed successfully.

Observed second-turn payloads:

```text
Audio bytes: 139447
Audio bytes: 138532
```

Interpretation:

- Fresh microphone stream per turn fixed iPhone Safari follow-up capture.
- Backend transcription successfully processed the follow-up turn.
- Intent routing successfully mapped the follow-up command.
- Premium voice response played as expected.

---

## 4. Accepted Test Script

The accepted field test sequence was:

1. Open FlightLine on iPhone.
2. Hard refresh mobile browser.
3. Tap **Talk**.
4. Wait for the visible prompt:

```text
Speak now. Recording this FlightLine question for 5 seconds...
```

5. Ask:

```text
Today's snapshot
```

6. Confirm Flight Attendant responds audibly.
7. Wait for the next voice-turn prompt.
8. Ask:

```text
What needs attention?
```

9. Confirm audio capture shows a healthy payload and Flight Attendant responds.
10. Ask:

```text
Repeat that
```

11. Confirm Flight Attendant repeats the prior FlightLine response.
12. Ask:

```text
Give me the shorter version
```

13. Confirm Flight Attendant gives a shorter version of the prior response.
14. Ask:

```text
How's the weather?
```

15. Confirm Flight Attendant refuses the general-assistant/weather task and redirects back to FlightLine scope.

Observed out-of-scope behavior:

```text
Flight Attendant is scoped to FlightLine activity...
```

This is the correct behavior.

---

## 5. Flight Attendant Scope

Flight Attendant is **not Nova** and is **not a general assistant**.

Flight Attendant is scoped to:

- Deal flow
- Active deals
- Today's snapshot
- Deals needing attention
- Showroom activity
- Test drives
- Negotiation stage
- F&I / finance-office stage
- Shorter version / more concise response
- Repeat last response
- Stop listening / end session

Flight Attendant must not handle:

- Weather
- Sports
- News
- General web questions
- Personal assistant requests
- Calendar/email workflows
- Dealer data mutation
- CRM/DMS writeback
- Outbound customer messages
- Workflow automation

Correct out-of-scope behavior is to redirect the user back to FlightLine deal activity.

---

## 6. Read-Only Guardrails

Flight Attendant remains read-only.

Accepted constraints:

- No deal edits
- No stage movement
- No customer messaging
- No CRM writeback
- No DMS writeback
- No automatic workflow triggers
- No background listening after the user ends the session
- No wake word in the current MVP
- No CarPlay-specific behavior until native iOS architecture and entitlement path are ready

---

## 7. Architecture Overview

### Frontend

Primary mobile component:

```text
frontend/src/components/Mobile/FlightlineMobile.jsx
```

Accepted frontend behavior:

- Starts a conversational voice session from the mobile UI.
- Primes premium audio playback on user interaction.
- Opens a voice-turn capture window.
- Records a short audio turn.
- Sends audio to backend transcription.
- Routes transcript through FlightLine intent handling.
- Plays premium voice response.
- Reopens a fresh mic stream for the next turn.

### Backend Routes

Primary route file:

```text
backend/src/routes/flightAttendantRoutes.js
```

Relevant endpoints:

```text
GET  /api/flight-attendant/tts/status
POST /api/flight-attendant/tts
GET  /api/flight-attendant/conversation/status
POST /api/flight-attendant/conversation/transcribe
```

### Backend Transcription Provider

Primary service file:

```text
backend/src/services/openaiTranscriptionProvider.js
```

Accepted provider status:

```json
{
  "success": true,
  "configured": true,
  "provider": "openai",
  "model": "gpt-4o-mini-transcribe",
  "maxBytes": 8388608,
  "message": "OpenAI transcription is configured for Flight Attendant voice sessions."
}
```

### Backend TTS Provider

Primary service file:

```text
backend/src/services/openaiVoiceProvider.js
```

Existing accepted TTS configuration:

- OpenAI speech endpoint
- Model: `gpt-4o-mini-tts`
- Voice: `nova`
- Format: MP3
- Premium voice playback on mobile

---

## 8. Phase History

### Phase 5A — Browser Speech Recognition Prototype

Introduced basic browser voice input.

Result:

- First spoken commands were possible.
- Browser speech recognition was not reliable enough for sustained conversational sessions on iPhone.

### Phase 5B — Conversational Session Loop

Added session mode and natural follow-up handling.

Result:

- UI could cycle between response and listening state.
- Follow-up capture remained unreliable.

### Phase 5C — iOS Audio Unlock

Primed premium audio playback for iOS Safari.

Result:

- Fixed first-response audio playback.
- Flight Attendant could speak audibly after a voice command.

### Phase 5D — Listening Loop Stabilization

Attempted to stabilize browser speech-recognition restart behavior.

Result:

- UI looked active.
- iOS Safari still failed to deliver reliable follow-up recognition.

### Phase 6 — Backend Voice Session

Moved away from browser speech recognition and introduced backend transcription.

Result:

- Backend transcription configured successfully.
- First voice turn worked.
- Follow-up turn still appeared empty on iPhone.

### Phase 6B — Voice-Turn Window Instrumentation

Made the recording window explicit and surfaced audio byte count.

Result:

- Proved second-turn recording was essentially empty.
- Key diagnostic: `audio bytes: 5`.

### Phase 6C — Fresh Microphone Stream Per Turn

Reopened the microphone for every voice turn and stopped tracks after each capture.

Result:

- Follow-up voice capture fixed.
- Healthy audio payloads observed: `139447` and `138532` bytes.
- Multi-turn Flight Attendant voice session accepted.

---

## 9. Accepted Commits

| Phase | Commit | Description |
|---|---|---|
| Phase 5A | `15cb080` | Apply Flight Attendant voice input Phase 5A |
| Phase 5B | `4c89c9f` | Add Flight Attendant conversational session Phase 5B |
| Phase 5C | `140b3f0` | Fix Flight Attendant conversational audio on iOS |
| Phase 5D | `92a9475` | Stabilize Flight Attendant conversational listening loop |
| Phase 6 | `8d72396` | Add Flight Attendant backend voice session Phase 6 |
| Phase 6B | `da6db6e` | Clarify Flight Attendant voice turn capture |
| Phase 6C | `331804d` | Use fresh microphone stream for Flight Attendant turns |

---

## 10. Verification Commands

Backend syntax checks:

```bash
cd /var/www/flightline/backend
node -c src/routes/flightAttendantRoutes.js
node -c src/services/openaiTranscriptionProvider.js
```

Frontend build:

```bash
cd /var/www/flightline/frontend
npm run build
```

Backend transcription status:

```bash
curl -s http://localhost:3001/api/flight-attendant/conversation/status | python3 -m json.tool
```

Expected:

```json
{
  "success": true,
  "configured": true,
  "provider": "openai",
  "model": "gpt-4o-mini-transcribe"
}
```

PM2 backend restart, only required after backend changes:

```bash
pm2 restart flightline-backend
```

---

## 11. Current Known Limitations

This is an MVP voice session, not a native continuous streaming assistant.

Known limitations:

- Uses short recorded turns, not full duplex streaming.
- User should wait for the **Speak now** prompt before asking the next question.
- iPhone Safari requires fresh mic stream handling per turn.
- There is no wake word.
- There is no background listening after stop/end session.
- CarPlay behavior is not part of this web MVP.
- Native iOS / CarPlay should be evaluated separately after entitlement and app architecture are finalized.

---

## 12. Future Roadmap

Recommended next steps:

1. Lock Phase 6C as the accepted mobile web MVP.
2. Add a small persistent session state indicator:
   - Listening
   - Recording
   - Processing
   - Speaking
   - Waiting for next turn
3. Add optional server-side event logging for:
   - audio byte size
   - transcript
   - matched intent
   - response mode
   - transcription errors
4. Add a privacy note in UI:
   - Voice is processed only during active Talk sessions.
   - Flight Attendant does not listen after End/Stop.
5. Evaluate native iOS architecture for CarPlay after entitlement path is complete.
6. Consider streaming voice architecture later only if the MVP turn-based model proves too slow for field use.

---

## 13. Acceptance Statement

Flight Attendant voice session MVP is accepted as of Phase 6C.

The accepted implementation solves the original issue: Flight Attendant can now answer an initial voice command, reopen the mic, capture a follow-up voice command, transcribe it through the backend, route it to a FlightLine-only response, and speak the result back to the user.

The system also correctly rejects out-of-scope general assistant requests such as weather.

**Final Status:** GREEN / ACCEPTED
