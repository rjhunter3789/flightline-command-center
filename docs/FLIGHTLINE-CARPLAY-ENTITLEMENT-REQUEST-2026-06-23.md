# FlightLine CarPlay Entitlement Request - June 23, 2026

## Purpose

This document records the FlightLine CarPlay entitlement request submitted through Apple Developer on June 23, 2026.

The requested CarPlay app type is Voice-Based Conversational.

## Current Status

| Item | Status |
|---|---|
| Apple Developer account | Active |
| App ID description | FlightLine |
| Bundle ID | `io.autoauditpro.flightline` |
| Requested CarPlay app type | Voice-Based Conversational |
| Submission status | Submitted to Apple |
| Apple response | Pending review / status update |
| Expected wait | Unknown; monitor Apple Developer email and account |

## Product Positioning

FlightLine is the platform and operational command board.

Flight Attendant is the read-only voice assistant/persona used to speak concise operational briefings from FlightLine.

The CarPlay experience should expose Flight Attendant only. It should not expose the full FlightLine dashboard.

## Intended CarPlay Experience

FlightLine for CarPlay should be a voice-first, read-only briefing experience.

Supported briefing examples:

- Active Deal Summary
- Deal Flow Summary
- Today's Snapshot
- What Needs Attention

The intended user is a dealership manager, field consultant, or operator who wants short situational awareness while traveling between stores, dealership lots, or meetings.

## Safety and Distraction Positioning

The CarPlay version should avoid visual dashboard management while driving.

Required safety posture:

- Voice-first.
- Read-only.
- Short responses by default.
- No full dashboard UI in CarPlay.
- No customer/deal card browsing.
- No deal stage changes.
- No CRM or DMS writeback.
- No outbound messages.
- No workflow triggers.
- No video.
- No long-form visual content.
- Stop/end playback control available.

## Naming Standard

Use this hierarchy:

```text
FlightLine = platform / command board / operational system
Flight Attendant = voice assistant / persona
flightline.autoauditpro.io = lowercase domain
```

CarPlay should be described as:

```text
FlightLine - Flight Attendant read-only voice briefings for CarPlay
```

Avoid describing the CarPlay experience as a full FlightLine dashboard.

## Submission Notes

The Apple Developer form did not request detailed app-specific narrative during the submission flow. After selecting `Voice-Based Conversational`, Apple presented the CarPlay Entitlement Addendum and confirmation was submitted.

Confirmation screen text:

```text
Thank you for your submission.
We'll review your request and contact you soon with a status update.
```

## If Apple Requests More Detail

Use this positioning:

```text
FlightLine is an operational command board for dealership deal flow. The proposed CarPlay experience is limited to Flight Attendant, a read-only voice briefing layer that gives short spoken status summaries from FlightLine while the user is traveling.

The CarPlay experience allows a dealership manager, field consultant, or operator to hear short operational briefings without picking up the phone or visually reviewing the full FlightLine dashboard. The user can request read-only summaries such as Active Deal Summary, Deal Flow Summary, Today's Snapshot, or What Needs Attention.

The experience is voice-first and read-only. It does not expose the full dashboard UI in CarPlay, does not allow browsing customer/deal cards, and does not allow deal updates, CRM/DMS writeback, outbound messaging, workflow triggers, or other operational changes. Short briefing mode is the default. Stop/end playback is supported.

FlightLine is the platform and operational command board. Flight Attendant is the read-only voice assistant/persona used for spoken briefings.
```

## Next Steps

1. Monitor the Apple Developer account email for entitlement status.
2. Return to Certificates, Identifiers & Profiles after approval.
3. Confirm the FlightLine App ID has the CarPlay Voice-Based Conversational entitlement available or assigned.
4. Create or update the FlightLine provisioning profile.
5. Do not begin full CarPlay UI work until entitlement status is confirmed.
6. Keep CarPlay scope limited to Flight Attendant read-only voice briefings.

## Current Recommendation

Wait for Apple review.

Do not expand scope into dashboard browsing, write actions, microphone-driven operational commands, or CRM/DMS actions.
