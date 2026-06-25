#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const writeFile = (relativePath, content) => {
  const filePath = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`Wrote ${relativePath}`);
};

const patchServer = () => {
  const serverPath = path.join(repoRoot, 'backend/src/server.js');
  if (!fs.existsSync(serverPath)) {
    console.error('Missing backend/src/server.js');
    process.exit(1);
  }
  let source = fs.readFileSync(serverPath, 'utf8');
  if (!source.includes("const integrationRoutes = require('./routes/integrationRoutes');")) {
    source = source.replace(
      "const flightAttendantRoutes = require('./routes/flightAttendantRoutes');",
      "const flightAttendantRoutes = require('./routes/flightAttendantRoutes');\nconst integrationRoutes = require('./routes/integrationRoutes');"
    );
  }
  if (!source.includes("app.use('/api/integrations', integrationRoutes);")) {
    source = source.replace(
      "app.use('/api/flight-attendant', flightAttendantRoutes);",
      "app.use('/api/flight-attendant', flightAttendantRoutes);\napp.use('/api/integrations', integrationRoutes);"
    );
  }
  fs.writeFileSync(serverPath, source);
  console.log('Updated backend/src/server.js');
};

const connectorInterface = `class BaseConnector {
  constructor(config = {}) {
    this.config = config;
    this.provider = config.provider || 'unknown';
    this.capabilities = config.capabilities || [];
    this.readOnly = true;
  }

  getMetadata() {
    return {
      provider: this.provider,
      displayName: this.config.displayName || this.provider,
      status: this.config.status || 'stub',
      readOnly: true,
      capabilities: this.capabilities,
      notes: this.config.notes || []
    };
  }

  async healthCheck() {
    return {
      provider: this.provider,
      status: 'stub',
      readOnly: true,
      message: 'Connector is registered but no live provider credentials are configured.'
    };
  }

  async fetchDeals() {
    return [];
  }

  async fetchCustomers() {
    return [];
  }

  async fetchInventory() {
    return [];
  }

  async fetchActivities() {
    return [];
  }
}

module.exports = BaseConnector;
`;

const flightlineNormalizer = `const normalizeStage = (stage = '') => {
  const value = String(stage || '').trim().toLowerCase();
  const stageMap = {
    showroom: 'showroom',
    'test drive': 'test_drive',
    test_drive: 'test_drive',
    negotiation: 'negotiation',
    finance: 'finance',
    'f&i': 'finance',
    fi: 'finance',
    delivery: 'delivery',
    sold: 'sold',
    closed: 'closed'
  };
  return stageMap[value] || value || 'unknown';
};

const toIso = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeDeal = (raw = {}, context = {}) => {
  const provider = context.provider || raw.provider || 'unknown';
  const now = new Date();
  const enteredStageAt = toIso(raw.enteredStageAt || raw.stageEnteredAt || raw.updatedAt || raw.createdAt) || now.toISOString();
  const enteredDate = new Date(enteredStageAt);
  const ageInStageMinutes = raw.ageInStageMinutes !== undefined
    ? Number(raw.ageInStageMinutes)
    : Math.max(0, Math.round((now.getTime() - enteredDate.getTime()) / 60000));

  return {
    type: 'deal',
    provider,
    externalId: String(raw.externalId || raw.id || raw.dealId || ''),
    dealershipId: raw.dealershipId || context.dealershipId || null,
    customer: {
      externalId: raw.customerId || null,
      name: raw.customerName || raw.customer?.name || 'Unknown Customer',
      phone: raw.customerPhone || raw.customer?.phone || null,
      email: raw.customerEmail || raw.customer?.email || null
    },
    vehicle: {
      vin: raw.vin || raw.vehicle?.vin || null,
      year: raw.year || raw.vehicle?.year || null,
      make: raw.make || raw.vehicle?.make || null,
      model: raw.model || raw.vehicle?.model || raw.requestedModel || null,
      stockNumber: raw.stockNumber || raw.vehicle?.stockNumber || null,
      status: raw.vehicleStatus || raw.vehicle?.status || null
    },
    stage: normalizeStage(raw.stage),
    status: raw.status || 'active',
    assignedTo: raw.assignedTo || raw.salesperson || null,
    source: raw.source || context.source || provider,
    lastActivityAt: toIso(raw.lastActivityAt || raw.updatedAt || raw.createdAt),
    enteredStageAt,
    ageInStageMinutes,
    raw
  };
};

const normalizeCustomer = (raw = {}, context = {}) => ({
  type: 'customer',
  provider: context.provider || raw.provider || 'unknown',
  externalId: String(raw.externalId || raw.id || raw.customerId || ''),
  dealershipId: raw.dealershipId || context.dealershipId || null,
  name: raw.name || raw.customerName || 'Unknown Customer',
  phone: raw.phone || raw.mobilePhone || null,
  email: raw.email || null,
  status: raw.status || 'active',
  lastActivityAt: toIso(raw.lastActivityAt || raw.updatedAt || raw.createdAt),
  raw
});

const normalizeInventoryUnit = (raw = {}, context = {}) => ({
  type: 'inventory_unit',
  provider: context.provider || raw.provider || 'unknown',
  externalId: String(raw.externalId || raw.id || raw.inventoryId || raw.vin || ''),
  dealershipId: raw.dealershipId || context.dealershipId || null,
  vin: raw.vin || null,
  stockNumber: raw.stockNumber || raw.stock || null,
  year: raw.year || null,
  make: raw.make || null,
  model: raw.model || null,
  trim: raw.trim || null,
  status: raw.status || raw.inventoryStatus || 'unknown',
  location: raw.location || null,
  updatedAt: toIso(raw.updatedAt || raw.createdAt),
  raw
});

const normalizeActivity = (raw = {}, context = {}) => ({
  type: 'activity',
  provider: context.provider || raw.provider || 'unknown',
  externalId: String(raw.externalId || raw.id || raw.activityId || ''),
  dealershipId: raw.dealershipId || context.dealershipId || null,
  dealExternalId: raw.dealExternalId || raw.dealId || null,
  customerExternalId: raw.customerExternalId || raw.customerId || null,
  activityType: raw.activityType || raw.type || 'unknown',
  summary: raw.summary || raw.description || null,
  occurredAt: toIso(raw.occurredAt || raw.createdAt || raw.updatedAt),
  assignedTo: raw.assignedTo || raw.salesperson || null,
  raw
});

module.exports = {
  normalizeDeal,
  normalizeCustomer,
  normalizeInventoryUnit,
  normalizeActivity,
  normalizeStage
};
`;

const mockConnector = `const BaseConnector = require('./BaseConnector');

const sampleDeals = [
  {
    id: 'mock-deal-1001',
    customerName: 'John Smith',
    requestedModel: 'F-150',
    stage: 'test drive',
    status: 'active',
    salesperson: 'Alex Demo',
    source: 'Mock CRM',
    ageInStageMinutes: 75,
    lastActivityAt: new Date(Date.now() - 75 * 60000).toISOString()
  },
  {
    id: 'mock-deal-1002',
    customerName: 'Mary Johnson',
    requestedModel: 'Explorer',
    stage: 'negotiation',
    status: 'active',
    salesperson: 'Taylor Demo',
    source: 'Mock CRM',
    ageInStageMinutes: 42,
    lastActivityAt: new Date(Date.now() - 42 * 60000).toISOString()
  }
];

const sampleInventory = [
  {
    id: 'mock-unit-2001',
    vin: 'MOCKVIN0000000001',
    stockNumber: 'F1001',
    year: 2026,
    make: 'Ford',
    model: 'F-150',
    status: 'available'
  }
];

class MockConnector extends BaseConnector {
  constructor(config = {}) {
    super({
      provider: 'mock',
      displayName: 'Mock Demo Connector',
      status: 'active',
      capabilities: ['deals', 'customers', 'inventory', 'activities'],
      notes: ['Read-only demo connector used to validate FlightLine integration flow.'],
      ...config
    });
  }

  async healthCheck() {
    return {
      provider: this.provider,
      status: 'healthy',
      readOnly: true,
      message: 'Mock connector is available.'
    };
  }

  async fetchDeals() {
    return sampleDeals;
  }

  async fetchInventory() {
    return sampleInventory;
  }

  async fetchCustomers() {
    return sampleDeals.map((deal) => ({
      id: deal.id.replace('deal', 'customer'),
      name: deal.customerName,
      status: 'active',
      lastActivityAt: deal.lastActivityAt
    }));
  }

  async fetchActivities() {
    return sampleDeals.map((deal) => ({
      id: `${deal.id}-activity`,
      dealId: deal.id,
      activityType: deal.stage,
      summary: `${deal.customerName} currently in ${deal.stage}`,
      occurredAt: deal.lastActivityAt,
      assignedTo: deal.salesperson
    }));
  }
}

module.exports = MockConnector;
`;

const stubConnector = `const BaseConnector = require('./BaseConnector');

class StubConnector extends BaseConnector {
  constructor(config = {}) {
    super({
      status: 'stub',
      capabilities: config.capabilities || ['deals', 'customers', 'inventory', 'activities'],
      notes: [
        'Provider-specific connector placeholder.',
        'No live credentials or API contract configured yet.',
        'Read-only integration only.'
      ],
      ...config
    });
  }
}

module.exports = StubConnector;
`;

const registry = `const MockConnector = require('./connectors/MockConnector');
const StubConnector = require('./connectors/StubConnector');

const providerConfigs = {
  mock: {
    provider: 'mock',
    displayName: 'Mock Demo Connector',
    connectorClass: MockConnector,
    status: 'active',
    category: 'demo'
  },
  reynolds: {
    provider: 'reynolds',
    displayName: 'Reynolds & Reynolds',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  vinsolutions: {
    provider: 'vinsolutions',
    displayName: 'VinSolutions',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'crm'
  },
  drivecentric: {
    provider: 'drivecentric',
    displayName: 'DriveCentric',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'crm'
  },
  tekion: {
    provider: 'tekion',
    displayName: 'Tekion',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  cdk: {
    provider: 'cdk',
    displayName: 'CDK',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'dms'
  },
  generic_api: {
    provider: 'generic_api',
    displayName: 'Generic API Connector',
    connectorClass: StubConnector,
    status: 'stub',
    category: 'generic'
  }
};

const listProviders = () => Object.values(providerConfigs).map((config) => {
  const ConnectorClass = config.connectorClass;
  const connector = new ConnectorClass(config);
  return {
    ...connector.getMetadata(),
    category: config.category
  };
});

const getConnector = (provider = 'mock') => {
  const key = String(provider || 'mock').toLowerCase();
  const config = providerConfigs[key];
  if (!config) return null;
  const ConnectorClass = config.connectorClass;
  return new ConnectorClass(config);
};

module.exports = {
  listProviders,
  getConnector,
  providerConfigs
};
`;

const integrationService = `const { getConnector, listProviders } = require('./registry');
const {
  normalizeDeal,
  normalizeCustomer,
  normalizeInventoryUnit,
  normalizeActivity
} = require('./normalizers/flightlineNormalizer');

const providerContext = (provider, query = {}) => ({
  provider,
  dealershipId: query.dealershipId || null,
  source: provider
});

const listIntegrationProviders = () => listProviders();

const getIntegrationHealth = async (provider) => {
  const connector = getConnector(provider);
  if (!connector) {
    return {
      provider,
      status: 'not_found',
      readOnly: true,
      message: 'Unknown integration provider.'
    };
  }
  return connector.healthCheck();
};

const fetchNormalizedDeals = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error(`Unknown integration provider: ${provider}`);
  const rawDeals = await connector.fetchDeals(query);
  return rawDeals.map((deal) => normalizeDeal(deal, providerContext(provider, query)));
};

const fetchNormalizedCustomers = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error(`Unknown integration provider: ${provider}`);
  const rawCustomers = await connector.fetchCustomers(query);
  return rawCustomers.map((customer) => normalizeCustomer(customer, providerContext(provider, query)));
};

const fetchNormalizedInventory = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error(`Unknown integration provider: ${provider}`);
  const rawInventory = await connector.fetchInventory(query);
  return rawInventory.map((unit) => normalizeInventoryUnit(unit, providerContext(provider, query)));
};

const fetchNormalizedActivities = async (provider = 'mock', query = {}) => {
  const connector = getConnector(provider);
  if (!connector) throw new Error(`Unknown integration provider: ${provider}`);
  const rawActivities = await connector.fetchActivities(query);
  return rawActivities.map((activity) => normalizeActivity(activity, providerContext(provider, query)));
};

module.exports = {
  listIntegrationProviders,
  getIntegrationHealth,
  fetchNormalizedDeals,
  fetchNormalizedCustomers,
  fetchNormalizedInventory,
  fetchNormalizedActivities
};
`;

const routes = `const express = require('express');
const logger = require('../utils/logger');
const integrationService = require('../integrations/integrationService');

const router = express.Router();

const resolveProvider = (req) => req.params.provider || req.query.provider || 'mock';

router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'available',
    readOnly: true,
    message: 'FlightLine integration layer is available. All Phase 7 endpoints are read-only.'
  });
});

router.get('/providers', (req, res) => {
  res.json({
    success: true,
    readOnly: true,
    providers: integrationService.listIntegrationProviders()
  });
});

router.get('/:provider/health', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const health = await integrationService.getIntegrationHealth(provider);
    res.json({ success: true, readOnly: true, health });
  } catch (error) {
    logger.error('Integration health error:', error);
    res.status(500).json({ success: false, readOnly: true, error: 'Integration health check failed.' });
  }
});

router.get('/:provider/deals', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const deals = await integrationService.fetchNormalizedDeals(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: deals.length, deals });
  } catch (error) {
    logger.error('Integration deals error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/customers', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const customers = await integrationService.fetchNormalizedCustomers(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: customers.length, customers });
  } catch (error) {
    logger.error('Integration customers error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/inventory', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const inventory = await integrationService.fetchNormalizedInventory(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: inventory.length, inventory });
  } catch (error) {
    logger.error('Integration inventory error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

router.get('/:provider/activities', async (req, res) => {
  try {
    const provider = resolveProvider(req);
    const activities = await integrationService.fetchNormalizedActivities(provider, req.query);
    res.json({ success: true, readOnly: true, provider, count: activities.length, activities });
  } catch (error) {
    logger.error('Integration activities error:', error);
    res.status(400).json({ success: false, readOnly: true, error: error.message });
  }
});

module.exports = router;
`;

const docs = `# FlightLine Integration Layer Foundation — Phase 7

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
`;

patchServer();
writeFile('backend/src/integrations/connectors/BaseConnector.js', connectorInterface);
writeFile('backend/src/integrations/connectors/MockConnector.js', mockConnector);
writeFile('backend/src/integrations/connectors/StubConnector.js', stubConnector);
writeFile('backend/src/integrations/normalizers/flightlineNormalizer.js', flightlineNormalizer);
writeFile('backend/src/integrations/registry.js', registry);
writeFile('backend/src/integrations/integrationService.js', integrationService);
writeFile('backend/src/routes/integrationRoutes.js', routes);
writeFile('docs/FLIGHTLINE-INTEGRATION-LAYER-FOUNDATION-PHASE-7-2026-06-25.md', docs);

console.log('Applied FlightLine Phase 7 integration layer foundation patch.');
