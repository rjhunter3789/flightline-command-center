const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  secondaryPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  dateOfBirth: Date,
  driversLicense: {
    number: String,
    state: String,
    expiration: Date
  },
  dealership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealership',
    required: true
  },
  source: {
    type: String,
    enum: ['walk-in', 'phone', 'internet', 'referral', 'repeat', 'other'],
    default: 'walk-in'
  },
  preferredContact: {
    type: String,
    enum: ['phone', 'email', 'text'],
    default: 'phone'
  },
  creditScore: Number,
  notes: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
customerSchema.index({ dealership: 1, email: 1 }, { unique: true });
customerSchema.index({ dealership: 1, phone: 1 });
customerSchema.index({ lastName: 1, firstName: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to mask sensitive data
customerSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.driversLicense;
  delete obj.creditScore;
  return obj;
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;