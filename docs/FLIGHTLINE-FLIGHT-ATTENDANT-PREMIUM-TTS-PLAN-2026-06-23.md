# FlightLine Flight Attendant Premium TTS Plan - June 23, 2026

## Purpose

This document defines the premium voice path for Flight Attendant after v1.1 confirmed that browser speech readout worked but was not production quality.

Flight Attendant is the voice/persona. FlightLine is the platform and operational command board.

Premium voice generation now runs through the FlightLine backend and plays through FlightLine Mobile.

## Current Baseline

| Area | Current State |
|---|---|
| Flight Attendant panel | Confirmed working in FlightLine Mobile |
| Short mode | Working |
| Standard mode | Working |
| Speak Briefing | Working with premium voice first |
| Stop Speaking | Working with premium audio and native fallback |
| Voice/status line | Working |
| Native browser voice | Available as fallback |
| Backend voice stub | Confirmed working |
| Premium voice provider | OpenAI path configured and verified server-side |
| Premium audio response | Confirmed `audio/mpeg` MP3 response |
| Frontend premium playback | Confirmed working on iPhone |
| Latency polish | Confirmed working with `Generating...` button state |
| Customer-facing naming | `FlightLine` for platform, `Flight Attendant` for voice/persona |
| Microphone input | Not implemented |
| Write actions | Not implemented and intentionally excluded |

## Naming Standard

Use this hierarchy in product copy and spoken briefings:

```text
FlightLine = platform / command board / operational system
Flight Attendant = voice assistant / persona
flightline.autoauditpro.io = lowercase domain
```

Examples:

```text
FlightLine active deal summary
FlightLine deal flow summary
FlightLine today's snapshot
FlightLine attention summary
```

Do not use `Flight Attendant active deal summary` because Flight Attendant is the speaker, not the board.

## Core Decision

Do not place premium voice provider configuration in the React frontend.

The architecture is:

```text
FlightLine Mobile
  -> FlightLine backend voice endpoint
  -> Premium voice provider
  -> Audio response
  -> Mobile browser playback
```

This keeps sensitive configuration server-side and allows FlightLine to enforce usage limits, privacy controls, fallback behavior, and future provider changes.

## Recommended Architecture

### Frontend

FlightLine Mobile keeps the existing Flight Attendant panel and uses backend premium playback when available.

Frontend responsibilities:

- Generate or request the selected briefing text.
- Send the selected briefing to the backend voice endpoint.
- Receive playable audio.
- Play the audio through the browser.
- Fall back to native browser speech if premium voice fails.
- Preserve Short and Standard mode.
- Preserve Stop Speaking.
- Show a clear generating state during premium voice preparation.

### Backend

FlightLine backend owns all premium voice provider interaction.

Backend responsibilities:

- Keep provider configuration on the server.
- Accept only approved Flight Attendant briefing requests.
- Enforce maximum text length.
- Enforce usage limits.
- Call the selected premium voice provider.
- Return playable audio to the frontend.
- Log only operational metadata unless a later privacy policy approves more detail.

### Provider Layer

The premium voice provider is isolated behind a backend service module so FlightLine can switch providers later without rewriting the frontend.

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
FlightLine text cap: 1200 characters
```

Frontend helper path:

```text
frontend/src/utils/flightAttendantAudio.js
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
- Do not pre-generate audio until usage and cost controls are defined.

## Failure Handling

If premium voice fails:

1. Show a friendly message in the Flight Attendant panel.
2. Fall back to native browser speech.
3. Do not block the rest of FlightLine Mobile.
4. Do not repeatedly retry without user action.

Expected fallback message:

```text
Premium voice unavailable. Using device voice.
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

Status: complete and confirmed working on iPhone.

Implemented:

- Added frontend premium audio helper.
- Wired `Speak Briefing` to call backend premium voice endpoint first.
- Played returned MP3 audio in mobile browser.
- Preserved Stop Speaking behavior.
- Preserved native browser speech fallback.
- Preserved Short and Standard modes.

Confirmed:

- Premium voice playback works smoothly.
- Voice quality is good.
- Short briefing works.
- Standard briefing works.
- Stop Speaking stops premium audio.
- Frontend production build passed with only existing non-blocking dashboard warnings.

### Phase 4.1 - Premium Voice Latency Polish

Status: complete and confirmed working on iPhone.

Implemented:

- Changed waiting status to `Generating premium voice...`.
- Changed Speak Briefing button to `Generating...` while premium audio is being prepared.
- Disabled Speak Briefing while audio generation is in progress.
- Re-enabled the button after audio starts, fails, or falls back.
- Kept Short mode as default.
- Did not add pre-generation to avoid unnecessary usage.

Confirmed:

- Standard briefing delay is clearer to the user.
- Button state behaves as expected.
- Premium voice still plays correctly.
- Stop Speaking still works.

### Phase 4.2 - Customer-Facing Naming Polish

Status: complete and confirmed working on iPhone.

Implemented:

- Changed visible product label from `Flightline` to `FlightLine`.
- Changed demo badge from `Flightline Demo` to `FlightLine Demo`.
- Changed standard spoken briefing labels to use `FlightLine`.
- Kept the domain lowercase.

Confirmed:

- Header displays `FlightLine`.
- Demo badge displays `FlightLine Demo`.
- Standard briefing text and speech use `FlightLine active deal summary`.

### Phase 5 - Pilot Controls

Status: future step.

- Add authenticated pilot access.
- Add privacy mode toggle.
- Add usage logging.
- Add cost monitoring.

## Current Recommendation

Phase 4, Phase 4.1, and Phase 4.2 are complete.

Flight Attendant now provides a working premium voice readout for FlightLine Mobile while keeping native browser speech as fallback.

The next major step should be pilot controls and usage/cost monitoring, not microphone input or write actions.
