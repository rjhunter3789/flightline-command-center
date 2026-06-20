  const mongoose = require('mongoose');

  const IncentiveSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['cash_rebate', 'apr_financing', 'lease_special', 'loyalty', 'conquest', 'military', 'college', 'dealer_cash']
    },
    cashAmount: { type: Number, default: 0 },
    manufacturer: { type: String, required: true },
    models: [String],
    modelYears: [Number],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    customerTypes: [String],
    stackable: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }, { timestamps: true });

  module.exports = mongoose.model('Incentive', IncentiveSchema);
