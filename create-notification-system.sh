#!/bin/bash
  echo "=== Creating Notification System ==="

  # Create Notification model
  cat > backend/src/models/Notification.js << 'EOF'
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
  EOF

  # Create notification routes
  cat > backend/src/routes/notificationRoutes.js << 'EOF'
  const express = require('express');
  const router = express.Router();
  const Notification = require('../models/Notification');

  // Get unread notifications
  router.get('/unread', async (req, res) => {
    try {
      const notifications = await Notification.find({
        read: false,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      }).sort('-createdAt').limit(10);

      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mark as read
  router.put('/:id/read', async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create test notification
  router.post('/test', async (req, res) => {
    const notification = new Notification({
      type: 'hot_lead',
      priority: 'high',
      title: 'Hot Lead Alert!',
      message: 'John Smith is back for the F-150 - 95% close probability',
      dealId: 'DEAL-1001',
      actionUrl: '/deals/DEAL-1001'
    });

    await notification.save();
    res.json({ success: true, data: notification });
  });

  module.exports = router;
  EOF

  echo "=== Backend files created ==="
  echo "Next: Update server.js and create frontend component"
