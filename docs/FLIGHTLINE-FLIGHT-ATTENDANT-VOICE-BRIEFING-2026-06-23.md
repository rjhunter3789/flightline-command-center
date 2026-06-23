# Flightline Flight Attendant Voice Briefing - June 23, 2026

## Purpose

This document records the first working Flight Attendant voice briefing milestones inside Flightline Mobile.

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
| Short briefing mode | Confirmed working in v1.1 |
| Standard briefing mode | Confirmed working in v1.1 |
| Stop Speaking button | Confirmed working in v1.1 |
| Voice/status line | Confirmed working in v1.1 |
| Browser speech readout | Confirmed working |
| Native browser voice quality | Improved slightly, still not production-quality |
| Microphone input | Not implemented yet |
| Write actions | Not implemented and intentionally excluded |

## Version Summary

### v1.0

Flight Attendant v1.0 proved that Flightline Mobile could generate and read back preset status-board briefings.

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

## What This Version Does

Flight Attendant v1.1 is a read-only voice briefing layer for Flightline Mobile.

It can generate and read back preset summaries for:

- Active Deals
- Deal Flow Pipeline
- Today's Snapshot
- What Needs Attention

The output is based on the same active deal data used by the mobile dashboard.

## What This Version Does Not Do

Flight Attendant v1.1 does not:

- Listen for spoken commands.
- Change deal status.
- Send messages.
- Update CRM records.
- Access external systems.
- Use ElevenLabs or a premium voice model.
- Replace Nova.

This version proves the status-board briefing concept and basic native speech controls only.

## Current User Experience

Expected user flow:

1. Open Flightline Mobile on iPhone.
2. Review the Flight Attendant panel near the top of the screen.
3. Choose Short or Standard briefing mode.
4. Tap one of the briefing buttons.
5. Confirm the written briefing updates.
6. Tap Speak Briefing.
7. Confirm the phone reads the current briefing out loud.
8. Tap Stop Speaking to stop playback.
9. Confirm the voice/status line updates.

## Voice Quality Finding

Browser speech readout works, but the native browser voice quality is still not acceptable for production.

v1.1 improves the experience slightly by selecting the best available native voice, lowering pitch, slowing speech rate, and adding shorter scripts. This is still a proof-of-concept voice layer, not the final production Flight Attendant voice.

## Production Voice Direction

Recommended next voice path:

1. Keep v1.1 as the stable native-browser voice baseline.
2. Prepare premium TTS such as ElevenLabs or a Nova-quality voice service.
3. Add server-side or API-backed audio generation only after privacy and cost rules are defined.
4. Add microphone input only after the read-only briefing layer remains stable.
5. Keep all write actions disabled until authenticated pilot controls exist.

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
You currently have 12 active deals. Showroom has 4, Test Drive has 3, Negotiation has 3, and F&I has 2. Two deals are high urgency. The first deal I would check is the highest-priority negotiation opportunity.
```

## Next Pass

Recommended next development pass:

- Prepare premium TTS integration.
- Decide whether premium voice should be local, server-side, or API-based.
- Create cost and privacy rules for premium voice generation.
- Add optional auto-speak only after user experience is validated.
- Create a voice command intake plan for later microphone support.

## Current Status

Flight Attendant Voice Briefing v1.1 is confirmed working as a read-only mobile proof of concept.

The feature is now locked as the stable native-browser voice baseline. The next major improvement should be premium TTS, not more native browser voice tuning.
