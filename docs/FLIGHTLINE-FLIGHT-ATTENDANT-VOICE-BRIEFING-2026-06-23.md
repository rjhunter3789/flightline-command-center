# Flightline Flight Attendant Voice Briefing - June 23, 2026

## Purpose

This document records the first working Flight Attendant voice briefing milestone inside Flightline Mobile.

The feature allows Flightline Mobile to generate short read-only status board briefings from the current dashboard data and read them back using browser speech synthesis.

## Confirmed Working State

| Area | Status |
|---|---|
| Flight Attendant panel | Confirmed visible in Flightline Mobile |
| Active Deal Summary | Confirmed working |
| Deal Flow Summary | Confirmed working |
| Today's Snapshot briefing | Confirmed working |
| What Needs Attention briefing | Confirmed working |
| Speak Briefing button | Confirmed working |
| Browser speech readout | Confirmed working |
| Native browser voice quality | Not acceptable for production |
| Microphone input | Not implemented yet |
| Write actions | Not implemented and intentionally excluded |

## What This Version Does

Flight Attendant v1 is a read-only voice briefing layer for Flightline Mobile.

It can generate and read back preset summaries for:

- Active Deals
- Deal Flow Pipeline
- Today's Snapshot
- What Needs Attention

The output is based on the same active deal data used by the mobile dashboard.

## What This Version Does Not Do

Flight Attendant v1 does not:

- Listen for spoken commands.
- Change deal status.
- Send messages.
- Update CRM records.
- Access external systems.
- Use ElevenLabs or a premium voice model.
- Replace Nova.

This version proves the status-board briefing concept only.

## Current User Experience

Expected user flow:

1. Open Flightline Mobile on iPhone.
2. Review the Flight Attendant panel near the top of the screen.
3. Tap one of the briefing buttons.
4. Confirm the written briefing updates.
5. Tap Speak Briefing.
6. Confirm the phone reads the current briefing out loud.

## Voice Quality Finding

Browser speech readout works, but the native browser voice quality is not acceptable for production.

The current voice is useful as a technical proof of concept only. It confirms that Flightline can generate and speak status-board briefings, but the final product should use a higher-quality voice layer.

## Production Voice Direction

Recommended next voice path:

1. Improve native browser voice selection where possible.
2. Tune rate, pitch, and summary length.
3. Shorten spoken scripts for quick manager briefings.
4. Prepare a premium TTS path such as ElevenLabs or a Nova-quality voice service.
5. Add microphone input only after the read-only briefing layer is stable.

## MVP Guardrails

Flight Attendant should remain read-only until authenticated pilot access and safety rules are defined.

Current guardrails:

- Read dashboard data only.
- Summarize status only.
- No dealer/customer data changes.
- No outbound communications.
- No CRM writeback.
- No external tool access.

## Real-World Use Case

The target use case is a dealer or manager who wants a quick status board briefing without manually reviewing every card on the dashboard.

Example request:

```text
Flight Attendant, what's the Active Deal Summary?
```

Expected style of response:

```text
You currently have 12 active deals. Showroom has 4, Test Drive has 3, Negotiation has 3, and F&I has 2. Two deals are high urgency. The first deal I would check is the highest-priority negotiation opportunity.
```

## Next Pass

Recommended next development pass:

- Improve native voice selection and fallback behavior.
- Add a shorter manager briefing mode.
- Add a stop speaking button.
- Add optional auto-speak after selecting a briefing.
- Prepare premium TTS integration.
- Create a voice command intake plan for later microphone support.

## Current Status

Flight Attendant Voice Briefing v1 is confirmed working as a read-only mobile proof of concept.

The feature should be considered successful at the proof-of-concept level, but the current native browser voice should not be considered production quality.
