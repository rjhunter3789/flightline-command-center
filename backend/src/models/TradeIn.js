  const mongoose = require('mongoose');

  const TradeInSchema = new mongoose.Schema({
    // Link to the deal
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
      index: true
    },

    // Vehicle Information
    vin: {
      type: String,
      uppercase: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    trim: {
      type: String,
      trim: true
    },
    mileage: {
      type: Number,
      required: true,
      min: 0
    },
    exteriorColor: {
      type: String,
      trim: true
    },
    interiorColor: {
      type: String,
      trim: true
    },

    // Condition Assessment
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    },
    conditionNotes: {
      type: String,
      maxlength: 1000
    },

    // Book Values (Manual Entry)
    bookValues: {
      nada: {
        clean: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
        rough: { type: Number, default: 0 },
        dateChecked: { type: Date }
      },
      kbb: {
        tradein: { type: Number, default: 0 },
        private: { type: Number, default: 0 },
        dealer: { type: Number, default: 0 },
        dateChecked: { type: Date }
      },
      blackbook: {
        clean: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
        rough: { type: Number, default: 0 },
        dateChecked: { type: Date }
      },
      vauto: {
        marketValue: { type: Number, default: 0 },
        avgMarketPrice: { type: Number, default: 0 },
        daysSupply: { type: Number },
        dateChecked: { type: Date }
      }
    },

    // Dealership Values
    acv: { // Actual Cash Value - what dealer thinks it's worth
      type: Number,
      required: true,
      default: 0
    },
    allowance: { // What customer is getting for trade
      type: Number,
      required: true,
      default: 0
    },
    payoff: { // What customer owes on trade
      type: Number,
      default: 0
    },

    // Calculated Fields
    overAllowance: { // allowance - acv (positive means losing money)
      type: Number,
      default: 0
    },
    equity: { // allowance - payoff (negative means customer owes more than trade worth)
      type: Number,
      default: 0
    },

    // Photos and Documentation
    photos: [{
      url: { type: String },
      caption: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],

    // Inspection Items
    inspection: {
      tires: {
        condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] },
        treadDepth: { type: String }
      },
      brakes: {
        condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] }
      },
      engine: {
        condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
        notes: { type: String }
      },
      transmission: {
        condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
        notes: { type: String }
      },
      interior: {
        condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
        notes: { type: String }
      },
      exterior: {
        condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
        notes: { type: String }
      }
    },

    // Flags and Alerts
    flags: {
      overAllowanceAlert: { type: Boolean, default: false },
      payoffAlert: { type: Boolean, default: false },
      conditionAlert: { type: Boolean, default: false },
      priceVarianceAlert: { type: Boolean, default: false }
    },

    // Metadata
    evaluatedBy: {
      type: String, // User who evaluated the trade
      required: true
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    },
    lastUpdatedBy: {
      type: String
    }
  }, {
    timestamps: true
  });

  // Calculate over-allowance before saving
  TradeInSchema.pre('save', function(next) {
    // Calculate over-allowance
    this.overAllowance = this.allowance - this.acv;

    // Calculate equity
    this.equity = this.allowance - this.payoff;

    // Set flags
    this.flags.overAllowanceAlert = this.overAllowance > 500; // Alert if over $500
    this.flags.payoffAlert = this.equity < -1000; // Alert if negative equity > $1000
    this.flags.conditionAlert = this.condition === 'poor';

    // Check for price variance between books
    const bookPrices = [
      this.bookValues.nada.average,
      this.bookValues.kbb.tradein,
      this.bookValues.blackbook.average,
      this.bookValues.vauto.marketValue
    ].filter(price => price > 0);

    if (bookPrices.length >= 2) {
      const avgBookValue = bookPrices.reduce((a, b) => a + b, 0) / bookPrices.length;
      const variance = Math.abs(this.acv - avgBookValue) / avgBookValue;
      this.flags.priceVarianceAlert = variance > 0.15; // Alert if ACV varies >15% from book average
    }

    next();
  });

  // Virtual to get average book value
  TradeInSchema.virtual('averageBookValue').get(function() {
    const bookPrices = [
      this.bookValues.nada.average,
      this.bookValues.kbb.tradein,
      this.bookValues.blackbook.average,
      this.bookValues.vauto.marketValue
    ].filter(price => price > 0);

    if (bookPrices.length === 0) return 0;
    return Math.round(bookPrices.reduce((a, b) => a + b, 0) / bookPrices.length);
  });

  // Method to check if trade needs manager approval
  TradeInSchema.methods.needsApproval = function() {
    return (
      this.overAllowance > 1000 || // Over-allowing by more than $1000
      this.equity < -5000 || // Negative equity more than $5000
      this.flags.priceVarianceAlert || // ACV varies significantly from books
      this.condition === 'poor' // Poor condition vehicle
    );
  };

  module.exports = mongoose.model('TradeIn', TradeInSchema);
