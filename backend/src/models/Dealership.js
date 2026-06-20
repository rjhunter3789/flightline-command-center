const mongoose = require('mongoose');

const dealershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String,
    fax: String
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  settings: {
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0 },
    docFee: { type: Number, default: 0 },
    packAmount: { type: Number, default: 0 },
    holdbackPercentage: { type: Number, default: 0 },
    testDriveTimeout: { type: Number, default: 45 }, // minutes
    financeTimeout: { type: Number, default: 120 }, // minutes
    alertSettings: {
      overdueTestDrive: { type: Boolean, default: true },
      financeDelay: { type: Boolean, default: true },
      criticalDeal: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: true }
    }
  },
  integrations: {
    dms: {
      provider: String,
      apiKey: String,
      apiSecret: String,
      isActive: { type: Boolean, default: false }
    },
    crm: {
      provider: String,
      apiKey: String,
      apiSecret: String,
      isActive: { type: Boolean, default: false }
    }
  },
  branding: {
    logo: String,
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#10B981' }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'trial'],
      default: 'trial'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    seats: { type: Number, default: 5 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
dealershipSchema.index({ code: 1 });
dealershipSchema.index({ 'subscription.status': 1 });

// Virtual for full address
dealershipSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zip}`;
});

// Method to check if dealership is within business hours
dealershipSchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
  
  const hours = this.businessHours[dayOfWeek];
  if (!hours || !hours.open || !hours.close) return false;
  
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Method to check subscription status
dealershipSchema.methods.hasActiveSubscription = function() {
  return this.subscription.status === 'active' || 
         (this.subscription.status === 'trial' && (!this.subscription.endDate || this.subscription.endDate > new Date()));
};

const Dealership = mongoose.model('Dealership', dealershipSchema);

module.exports = Dealership;