const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicle: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: String,
    stockNumber: String,
    price: Number,
    type: { type: String, enum: ['new', 'used', 'certified'] }
  },
  stage: {
    type: String,
    enum: ['showroom', 'test_drive', 'negotiation', 'finance', 'delivery', 'completed'],
    default: 'showroom',
    required: true
  },
  urgency: {
    type: String,
    enum: ['normal', 'medium', 'high', 'critical'],
    default: 'normal'
  },
  salesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  tradeIn: {
    make: String,
    model: String,
    year: Number,
    value: Number,
    payoff: Number
  },
  financing: {
    type: String,
    bank: String,
    approved: Boolean,
    amount: Number,
    rate: Number,
    term: Number
  },
  gross: {
    front: { type: Number, default: 0 },
    back: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  notes: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  stageHistory: [{
    stage: String,
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }, // Duration in milliseconds
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  actionHistory: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    performedBy: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  closedDate: Date,
  deletedAt: Date,
  hasTradeIn: { type: Boolean, default: false },
    tradeInId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradeIn' },
    tradeInAllowance: { type: Number, default: 0 },
    tradeInACV: { type: Number, default: 0 },
    tradeInOverAllowance: { type: Number, default: 0 },
    adjustedGrossProfit: { type: Number, default: 0 }
  }, {
  timestamps: true
});

// Indexes for performance
dealSchema.index({ dealership: 1, stage: 1, isActive: 1 });
dealSchema.index({ customer: 1 });
dealSchema.index({ salesRep: 1 });
dealSchema.index({ createdAt: -1 });

// Virtual for current stage duration
dealSchema.virtual('currentStageDuration').get(function() {
  if (this.stageHistory && this.stageHistory.length > 0) {
    const currentStage = this.stageHistory[this.stageHistory.length - 1];
    return Date.now() - new Date(currentStage.timestamp).getTime();
  }
  return 0;
});

// Pre-save hook to calculate total gross
dealSchema.pre('save', function(next) {
  if (this.gross) {
    this.gross.total = (this.gross.front || 0) + (this.gross.back || 0);
  }
  next();
});

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
