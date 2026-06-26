const BaseConnector = require('./BaseConnector');

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
      id: deal.id + '-activity',
      dealId: deal.id,
      activityType: deal.stage,
      summary: deal.customerName + ' currently in ' + deal.stage,
      occurredAt: deal.lastActivityAt,
      assignedTo: deal.salesperson
    }));
  }
}

module.exports = MockConnector;
