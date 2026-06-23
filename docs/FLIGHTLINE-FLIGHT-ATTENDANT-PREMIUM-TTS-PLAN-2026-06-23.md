# Flightline Flight Attendant Premium TTS Plan - June 23, 2026

## Purpose

This document defines the recommended premium voice path for Flight Attendant after v1.1 confirmed that browser speech readout works but is not production quality.

Flight Attendant v1.1 is the stable native-browser baseline. Premium voice generation now runs through the Flightline backend.

## Current Baseline

| Area | Current State |
|---|---|
| Flight Attendant v1.1 | Confirmed working |
| Short mode | Working |
| Standard mode | Working |
| Speak Briefing | Working |
| Stop Speaking | Working |
| Voice/status line | Working |
| Native browser voice | Usable fallback baseline |
| Backend voice stub | Confirmed working |
| Premium voice provider | OpenAI path configured and verified server-side |
| Premium audio response | Confirmed `audio/mpeg` MP3 response |
| Microphone input | Not implemented |
| Write actions | Not implemented and intentionally excluded |

## Core Decision

Do not place premium voice provider credentials in the React frontend.

The architecture is:

```text
Flightline Mobile
  -> Flightline backend voice endpoint
  -> Premium voice provider
  -> Audio response
  -> Mobile browser playback
```

This keeps sensitive configuration server-side and allows Flightline to enforce usage limits, privacy controls, fallback behavior, and future provider changes.

## Recommended Architecture

### Frontend

Flightline Mobile should keep the existing Flight Attendant panel and add premium playback only after the backend voice endpoint exists.

Frontend responsibilities:

- Generate or request the selected briefing text.
- Send the selected briefing to the backend voice endpoint.
- Receive playable audio.
- Play the audio through the browser.
- Fall back to native browser speech if premium voice fails.
- Preserve Short and Standard mode.
- Preserve Stop Speaking.

### Backend

Flightline backend owns all premium voice provider interaction.

Backend responsibilities:

- Keep provider configuration on the server.
- Accept only approved Flight Attendant briefing requests.
- Enforce maximum text length.
- Enforce usage limits.
- Call the selected premium voice provider.
- Return playable audio to the frontend.
- Log only operational metadata unless a later privacy policy approves more detail.

### Provider Layer

The premium voice provider is isolated behind a backend service module so Flightline can switch providers later without rewriting the frontend.

Current provider path:

```text
backend/src/services/openaiVoiceProvider.js
```

Current defaults:

```text
Provider: OpenAI
Model: gpt-4o-mini-tts
Voice: nova
Format: mp3
Speed: 0.95
Flightline text cap: 1200 characters
```

## Guardrails

Premium voice must remain read-only.

Hard guardrails:

- No deal updates.
- No CRM writeback.
- No customer messaging.
- No external workflow triggers.
- No microphone input in this phase.
- No sensitive provider configuration in frontend code.
- No environment files committed to Git.

## Privacy Rules

The safest default is to support two speech modes later:

### Manager Mode

May include dashboard-visible deal details.

### Privacy Mode

Avoids customer names and speaks only operational context.

Recommended default for a premium voice pilot:

```text
Privacy Mode ON by default.
```

Manager Mode should be opt-in.

## Cost Controls

Premium voice can become expensive if every tap generates new audio.

Recommended controls:

- Short mode should remain the default.
- Maximum text length per request.
- Usage limit per user/session.
- No auto-speak by default in early pilot.
- Track provider, character count, and request count.
- Keep native browser speech as fallback.

## Failure Handling

If premium voice fails:

1. Show a friendly message in the Flight Attendant panel.
2. Fall back to native browser speech.
3. Do not block the rest of Flightline Mobile.
4. Do not repeatedly retry without user action.

Expected fallback message:

```text
Premium voice is unavailable right now. Using device voice.
```

## Implementation Phases

### Phase 1 - Planning / Documentation

Status: complete.

- Confirm premium voice architecture.
- Keep sensitive provider configuration server-side.
- Define privacy and cost rules.
- Keep v1.1 as fallback.

### Phase 2 - Backend Voice Stub

Status: complete and confirmed working.

Implemented:

- Added backend route file: `backend/src/routes/flightAttendantRoutes.js`.
- Registered route under `/api/flight-attendant`.
- Added voice status endpoint.
- Added voice generation endpoint.
- Added validation for briefing text.
- Added oversized-text rejection.
- Added unsupported briefing type rejection.
- Added unsupported mode rejection.
- Added provider-not-configured response.
- Preserved fallback behavior.

Confirmed:

- Route syntax check passed.
- Server syntax check passed.
- PM2 restart succeeded.
- Status endpoint returned configured false and fallback allowed.
- POST endpoint returned premium voice not configured and fallback allowed.
- Unsupported briefing type was rejected.
- Oversized briefing text was rejected.
- Backend remained online.

### Phase 3 - OpenAI Provider Integration

Status: complete and confirmed working server-side.

Implemented:

- Added OpenAI voice provider service.
- Wired Flight Attendant route to provider service.
- Added server-side provider configuration.
- Kept native browser speech fallback behavior.
- Kept provider configuration out of React and Git.

Confirmed:

- Status endpoint returns configured true.
- Provider reports openai.
- Model reports gpt-4o-mini-tts.
- Voice reports nova.
- Format reports mp3.
- POST endpoint returns HTTP 200 when configured.
- Response content type is audio/mpeg.
- Test file generated as MP3.
- Backend remained online.

### Phase 4 - Frontend Premium Playback

Status: next build step.

- Add Premium Voice option or make Speak Briefing prefer backend voice when configured.
- Play returned audio in mobile browser.
- Keep Stop Speaking behavior.
- Fall back to browser speech on provider failure.
- Avoid auto-speak by default.

### Phase 5 - Pilot Controls

- Add authenticated pilot access.
- Add privacy mode toggle.
- Add usage logging.
- Add cost monitoring.

## Current Recommendation

Phase 3 is complete server-side. Flightline can now generate OpenAI premium voice audio from the backend.

The next build step should be Phase 4: frontend premium playback.

Do not add microphone input or write actions yet.
