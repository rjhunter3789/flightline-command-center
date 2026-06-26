# FlightLine Integration Layer Foundation — Phase 7

**Date:** 2026-06-25  
**Status:** Foundation patch prepared  
**Scope:** Read-only integration architecture  
**System:** FlightLine Command Center  

---

## 1. Purpose

Phase 7 establishes a clean integration layer so FlightLine can eventually connect to DMS, CRM, and inventory systems without hardwiring every vendor directly into the app.

The goal is simple:

```text
Provider connector → FlightLine normalizer → FlightLine canonical object → Dashboard / Flight Attendant
```

FlightLine should not care whether a deal, customer, vehicle, or activity came from Reynolds, VinSolutions, DriveCentric, Tekion, CDK, or a generic provider. Each connector is responsible for provider-specific details. FlightLine consumes normalized internal objects.

---

## 2. Phase 7 Rules

Phase 7 is read-only.

Explicitly not allowed:

- No CRM writeback
- No DMS writeback
- No customer messaging
- No stage changes
- No inventory edits
- No workflow triggers
- No destructive actions

This layer is for observing, normalizing, and exposing data to FlightLine.

---

## 3. New Backend Namespace

Phase 7 adds:

```text
/api/integrations
```

Initial read-only endpoints:

```text
GET /api/integrations/status
GET /api/integrations/providers
GET /api/integrations/:provider/health
GET /api/integrations/:provider/deals
GET /api/integrations/:provider/customers
GET /api/integrations/:provider/inventory
GET /api/integrations/:provider/activities
```

---

## 4. New Backend Files

```text
backend/src/routes/integrationRoutes.js
backend/src/integrations/integrationService.js
backend/src/integrations/registry.js
backend/src/integrations/connectors/BaseConnector.js
backend/src/integrations/connectors/MockConnector.js
backend/src/integrations/connectors/StubConnector.js
backend/src/integrations/normalizers/flightlineNormalizer.js
```

---

## 5. Registered Providers

Initial provider registry:

| Provider | Category | Status |
|---|---|---:|
| mock | demo | active |
| reynolds | DMS | stub |
| vinsolutions | CRM | stub |
| drivecentric | CRM | stub |
| tekion | DMS | stub |
| cdk | DMS | stub |
| generic_api | Generic | stub |

Only the mock connector returns sample data. Vendor connectors are placeholders until credentials and API contracts are available.

---

## 6. Canonical FlightLine Objects

Phase 7 creates normalizers for:

- Deal
- Customer
- Inventory Unit
- Activity

The most important object for Flight Attendant is the normalized deal object.

Example:

```json
{
  "type": "deal",
  "provider": "mock",
  "externalId": "mock-deal-1001",
  "customer": {
    "name": "John Smith"
  },
  "vehicle": {
    "model": "F-150"
  },
  "stage": "test_drive",
  "status": "active",
  "assignedTo": "Alex Demo",
  "ageInStageMinutes": 75
}
```

---

## 7. Why This Matters for Flight Attendant

Flight Attendant should not need vendor-specific logic.

Instead of asking individual systems directly, Flight Attendant should eventually query FlightLine normalized data:

```text
What deals need attention?
What is in test drive?
What has been sitting in negotiation too long?
Who has no recent activity?
```

This keeps Flight Attendant scoped, safer, and easier to maintain.

---

## 8. Verification Commands

After applying the patch:

```bash
cd /var/www/flightline/backend
node -c src/routes/integrationRoutes.js
node -c src/integrations/integrationService.js
node -c src/integrations/registry.js
node -c src/integrations/connectors/BaseConnector.js
node -c src/integrations/connectors/MockConnector.js
node -c src/integrations/connectors/StubConnector.js
node -c src/integrations/normalizers/flightlineNormalizer.js
node -c src/server.js
```

Restart backend after commit:

```bash
pm2 restart flightline-backend
```

Smoke tests:

```bash
curl -s http://localhost:3001/api/integrations/status | python3 -m json.tool
curl -s http://localhost:3001/api/integrations/providers | python3 -m json.tool
curl -s http://localhost:3001/api/integrations/mock/health | python3 -m json.tool
curl -s http://localhost:3001/api/integrations/mock/deals | python3 -m json.tool
```

Expected status response:

```json
{
  "success": true,
  "status": "available",
  "readOnly": true
}
```

---

## 9. Acceptance Criteria

Phase 7 foundation is accepted when:

- Backend syntax checks pass.
- Server starts with integration route mounted.
- `/api/integrations/status` returns success.
- `/api/integrations/providers` lists registered providers.
- `/api/integrations/mock/deals` returns normalized demo deals.
- All responses indicate `readOnly: true`.
- No write endpoints exist.

---

## 10. Next Steps After Foundation

Recommended Phase 7B:

1. Add integration event logging.
2. Add provider credential schema design.
3. Add encrypted credential storage plan.
4. Add dealership-to-provider mapping.
5. Add a generic API connector that can ingest a configured JSON endpoint.
6. Connect Flight Attendant attention logic to normalized integration data, still read-only.

---

## 11. Final Note

This is not a full enterprise integration platform yet. It is the foundation that prevents vendor-specific spaghetti.

The right architecture is now in place:

```text
One FlightLine data model. Many provider connectors.
```
