const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'overdue_test_drive',
      'finance_delay',
      'critical_deal',
      'stalled_deal',
      'customer_waiting',
      'approval_pending',
      'follow_up_required',
      'system',
      'custom'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  dealership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    duration: Number, // For time-based alerts
    threshold: Number, // For threshold-based alerts
    previousStage: String,
    currentStage: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  autoResolve: {
    type: Boolean,
    default: false
  },
  autoResolveAt: Date,
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
alertSchema.index({ dealership: 1, isActive: 1, acknowledged: 1 });
alertSchema.index({ deal: 1, type: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ severity: 1, isActive: 1 });

// Auto-resolve old alerts
alertSchema.pre('save', function(next) {
  if (this.autoResolve && !this.autoResolveAt) {
    // Set auto-resolve time based on alert type
    const autoResolveHours = {
      'info': 24,
      'warning': 12,
      'critical': 6
    };
    
    const hours = autoResolveHours[this.severity] || 24;
    this.autoResolveAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  next();
});

// Method to check if alert should be auto-resolved
alertSchema.methods.shouldAutoResolve = function() {
  return this.autoResolve && 
         this.autoResolveAt && 
         new Date() > this.autoResolveAt && 
         !this.resolvedAt;
};

// Method to resolve alert
alertSchema.methods.resolve = function(userId) {
  this.isActive = false;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

// Static method to create standard alerts
alertSchema.statics.createStandardAlert = async function(type, dealId, dealershipId, additionalData = {}) {
  const alertTemplates = {
    overdue_test_drive: {
      message: 'Test drive exceeds time limit',
      severity: 'warning'
    },
    finance_delay: {
      message: 'Deal stalled in finance office',
      severity: 'critical'
    },
    critical_deal: {
      message: 'Critical priority deal requires immediate attention',
      severity: 'critical'
    }
  };

  const template = alertTemplates[type];
  if (!template) {
    throw new Error(`Unknown alert type: ${type}`);
  }

  return this.create({
    type,
    message: additionalData.message || template.message,
    severity: template.severity,
    deal: dealId,
    dealership: dealershipId,
    metadata: additionalData.metadata || {},
    autoResolve: additionalData.autoResolve !== false
  });
};

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;