# FlightLine Native iOS / CarPlay Shell Acceptance

**Date:** 2026-06-24  
**Status:** GREEN / ACCEPTED  
**System:** FlightLine Command Center  
**Native App:** FlightLine iOS shell  
**Bundle Identifier:** `io.autoauditpro.flightline`  
**Apple Developer Team:** `JEFFREY LEE ROBINSON`  
**CarPlay Capability:** CarPlay Voice Based Conversation  

---

## 1. Executive Summary

The Apple and Xcode foundation for a native FlightLine iOS / CarPlay path is now established.

The following work was completed and validated:

- Apple approved the account-level managed capability for **CarPlay Voice Based Conversation**.
- A dedicated FlightLine App ID was created in Apple Developer.
- The FlightLine App ID uses the explicit bundle identifier `io.autoauditpro.flightline`.
- The CarPlay Voice Based Conversation capability was enabled for the FlightLine App ID.
- A FlightLine development provisioning profile was generated for the test iPhone.
- A clean native Xcode iOS project was created for FlightLine.
- Xcode signing was configured under the `JEFFREY LEE ROBINSON` team.
- The Xcode project bundle identifier was confirmed as `io.autoauditpro.flightline`.
- The **CarPlay Voice Based Conversation** capability was added in Xcode.
- The native iOS shell successfully built with `Command + B`.

This does not mean the full CarPlay product is complete. It means the native shell, signing, bundle identity, and CarPlay entitlement foundation are valid and ready for the next implementation phase.

---

## 2. Accepted State

| Item | Status |
|---|---:|
| Apple account entitlement approved | PASS |
| FlightLine App ID created | PASS |
| Explicit bundle identifier configured | PASS |
| CarPlay Voice Based Conversation enabled in Apple Developer | PASS |
| Development provisioning profile generated | PASS |
| Test iPhone included in development profile | PASS |
| Xcode Apple Developer account configured | PASS |
| Native FlightLine iOS shell created | PASS |
| Xcode team signing configured | PASS |
| Xcode bundle identifier correct | PASS |
| CarPlay Voice Based Conversation added in Xcode | PASS |
| Native shell build succeeded | PASS |

---

## 3. Apple Developer Configuration

### Account-Level Managed Capability

Apple Developer Relations confirmed that the account has been assigned the entitlement for:

```text
CarPlay Voice Based Conversation
```

This means the developer account/team is allowed to configure this capability for eligible apps.

### FlightLine App ID

A new explicit App ID was created:

```text
Name: FlightLine
Bundle ID: io.autoauditpro.flightline
Team ID Prefix: F7XXG82VAR
```

The existing NOVA App ID was not reused.

This separation is important because FlightLine and Nova serve different product roles:

- **FlightLine:** dealership deal-flow command platform
- **Flight Attendant:** scoped FlightLine voice assistant
- **Nova:** broader personal/consultant assistant

FlightLine and Nova must remain separate app identities.

---

## 4. Provisioning Profile

A FlightLine development provisioning profile was generated.

Accepted profile setup:

```text
Profile Type: iOS App Development
App ID: FlightLine — io.autoauditpro.flightline
Certificate: JEFFREY LEE ROBINSON Development
Device: Jeff's iPhone
Profile Name: FlightLine Development
```

Mac devices were not included because this profile is for iPhone development/testing.

---

## 5. Xcode Project Setup

A clean native iOS project was created in Xcode.

Accepted project settings:

```text
Product Name: flightline
Team: JEFFREY LEE ROBINSON
Organization Identifier: io.autoauditpro
Bundle Identifier: io.autoauditpro.flightline
Interface: SwiftUI
Language: Swift
Testing System: None
Storage: None
```

The lowercase product name was used to ensure the generated bundle identifier matched the Apple Developer App ID exactly.

The correct bundle identifier is:

```text
io.autoauditpro.flightline
```

The incorrect generated form would have been:

```text
io.autoauditpro.FlightLine
```

The correct lowercase version was confirmed in Xcode before proceeding.

---

## 6. Xcode Signing & Capabilities

The Xcode **Signing & Capabilities** pane showed:

```text
Team: JEFFREY LEE ROBINSON
Bundle Identifier: io.autoauditpro.flightline
Provisioning Profile: Xcode Managed Profile
Signing Certificate: Apple Development: JEFFREY LEE ROBINSON
```

No red signing errors were visible.

The following capability was added successfully in Xcode:

```text
CarPlay Voice Based Conversation
```

This confirms that Xcode sees the managed capability and can attach it to the native FlightLine app target.

---

## 7. Build Validation

The native iOS shell was built using:

```text
Command + B
```

Result:

```text
Build Succeeded
```

Acceptance meaning:

- Native iOS shell compiles.
- Team signing is valid.
- Bundle identifier matches the Apple Developer App ID.
- CarPlay Voice Based Conversation capability is attached.
- The project is ready for implementation work.

---

## 8. Relationship to Flight Attendant Voice MVP

The native iOS / CarPlay shell is separate from the already-accepted Flight Attendant mobile web voice MVP.

Current accepted Flight Attendant voice session:

```text
Accepted Build: Phase 6C
Accepted Commit: 331804d
Status: GREEN / ACCEPTED
```

Phase 6C established that Flight Attendant can:

- Accept a spoken FlightLine question.
- Capture follow-up turns with a fresh mic stream.
- Transcribe speech through the backend.
- Route the transcript to FlightLine-only intents.
- Respond through premium OpenAI TTS.
- Reject out-of-scope general-assistant requests.

The iOS / CarPlay shell now provides the Apple-native foundation for a future native wrapper or native implementation path.

---

## 9. Important Scope Boundaries

The native shell does not change Flight Attendant scope.

Flight Attendant remains:

- FlightLine-only
- Deal-activity focused
- Read-only
- Not Nova
- Not a general assistant
- Not a workflow automation engine

The CarPlay capability does not authorize scope creep into general assistant behavior.

Flight Attendant must continue to reject out-of-scope requests such as:

- Weather
- Sports
- News
- Calendar/email management
- General web questions
- Personal assistant tasks

Accepted behavior for out-of-scope requests is to redirect the user back to FlightLine deal activity.

---

## 10. Current Known Limitations

This checkpoint validates the native shell foundation only.

Not yet implemented:

- Native Flight Attendant UI
- Native microphone session logic
- Native backend transcription integration
- CarPlay scene templates
- CarPlay session lifecycle handling
- Native voice session state management
- App Store submission package
- TestFlight distribution
- Production provisioning profile

The current accepted build is a native shell that compiles with the correct signing and entitlement configuration.

---

## 11. Recommended Next Phase

Recommended next phase:

```text
Phase 7 — Native FlightLine iOS Shell Integration
```

Suggested goals:

1. Add a simple native landing screen:
   - FlightLine branding
   - Flight Attendant status
   - Connection target: `flightline.autoauditpro.io`
2. Decide whether the first native shell uses:
   - WebView wrapper around the validated mobile web MVP, or
   - Native SwiftUI voice interface calling the existing backend endpoints
3. Add a privacy/support note:
   - Flight Attendant only listens during active sessions.
   - Voice turns are scoped to FlightLine activity.
   - No background listening.
4. Add native network calls for:
   - `/api/flight-attendant/conversation/status`
   - `/api/flight-attendant/conversation/transcribe`
   - `/api/flight-attendant/tts`
5. Evaluate CarPlay-specific interface requirements after the native iOS shell is stable.
6. Do not begin CarPlay behavior until the base iOS app is functional and testable on the phone.

---

## 12. End-of-Day State

End-of-day accepted state:

```text
Flight Attendant web/mobile voice MVP: GREEN
Apple CarPlay account entitlement: APPROVED
FlightLine App ID: CREATED
FlightLine development profile: CREATED
Native FlightLine iOS shell: CREATED
CarPlay Voice Based Conversation capability in Xcode: ADDED
Native shell build: SUCCEEDED
```

Final status:

```text
GREEN / ACCEPTED
```
