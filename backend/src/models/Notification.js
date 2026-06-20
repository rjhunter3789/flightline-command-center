  const mongoose = require('mongoose');

  const NotificationSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['deal_alert', 'customer_waiting', 'incentive_expiring', 'hot_lead', 'system'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    title: String,
    message: String,
    dealId: String,
    userId: String,
    read: { type: Boolean, default: false },
    actionUrl: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Notification', NotificationSchema);
