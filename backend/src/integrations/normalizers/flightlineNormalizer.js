const normalizeStage = (stage = '') => {
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
