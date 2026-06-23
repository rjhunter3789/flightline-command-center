# Flightline Flight Attendant Premium TTS Plan - June 23, 2026

## Purpose

This document defines the recommended premium voice path for Flight Attendant after v1.1 confirmed that browser speech readout works but is not production quality.

Flight Attendant v1.1 is the stable native-browser baseline. The next major voice improvement should move premium voice generation behind the Flightline backend instead of continuing to tune browser speech.

## Current Baseline

| Area | Current State |
|---|---|
| Flight Attendant v1.1 | Confirmed working |
| Short mode | Working |
| Standard mode | Working |
| Speak Briefing | Working |
| Stop Speaking | Working |
| Voice/status line | Working |
| Native browser voice | Usable for proof of concept only |
| Premium voice | Not implemented |
| Microphone input | Not implemented |
| Write actions | Not implemented and intentionally excluded |

## Core Decision

Do not place premium voice provider credentials in the React frontend.

The correct architecture is:

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

Flightline backend should own all premium voice provider interaction.

Backend responsibilities:

- Keep provider configuration on the server.
- Accept only approved Flight Attendant briefing requests.
- Enforce maximum text length.
- Enforce usage limits.
- Call the selected premium voice provider.
- Return playable audio to the frontend.
- Log only operational metadata unless a later privacy policy approves more detail.

### Provider Layer

The premium voice provider should be isolated behind a small backend module so Flightline can switch providers later without rewriting the frontend.

Recommended provider abstraction:

```text
voiceProvider.generateSpeech(text, options)
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

Status: current.

- Confirm premium voice architecture.
- Keep sensitive provider configuration server-side.
- Define privacy and cost rules.
- Keep v1.1 as fallback.

### Phase 2 - Backend Voice Stub

- Add backend voice route.
- Add provider module stub.
- Return clear provider-not-configured response when premium voice is not configured.
- Confirm frontend fallback still works.

### Phase 3 - Provider Integration

- Add selected provider integration.
- Return playable audio to frontend.
- Test short and standard briefings.
- Add usage limits.

### Phase 4 - Frontend Premium Playback

- Add Premium Voice option.
- Play returned audio.
- Keep Stop Speaking behavior.
- Fall back to browser speech on provider failure.

### Phase 5 - Pilot Controls

- Add authenticated pilot access.
- Add privacy mode toggle.
- Add usage logging.
- Add cost monitoring.

## Recommended Next Build Step

The next build step should be Phase 2: backend voice stub.

This allows Flightline to prepare the correct architecture without committing to a provider.

Phase 2 acceptance criteria:

- Backend voice route exists.
- Route rejects oversized text.
- Route returns a clear provider-not-configured response when premium voice is unavailable.
- No secrets are committed.
- Frontend still uses native browser speech as fallback.
- Backend runtime remains stable.

## Current Recommendation

Proceed with backend voice stub before integrating ElevenLabs, OpenAI, or any other premium voice provider.

The stub gives Flightline a safe foundation and prevents a rushed provider integration from creating security, privacy, or cost problems.
