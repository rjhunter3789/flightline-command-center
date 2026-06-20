import React, { useState, useEffect } from 'react';
  import { Bell, X, AlertCircle, Users, DollarSign, Clock } from 'lucide-react';
  import './NotificationCenter.css';

  const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/unread');
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.data.length);

          // Play sound for urgent notifications
          if (data.data.some(n => n.priority === 'urgent' || n.priority === 'high')) {
            playNotificationSound();
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    const markAsRead = async (id) => {
      try {
        await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        setNotifications(notifications.filter(n => n._id !== id));
        setUnreadCount(unreadCount - 1);
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    };

    const playNotificationSound = () => {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
    };

    const getIcon = (type) => {
      const icons = {
        hot_lead: <DollarSign className="notification-icon" />,
        customer_waiting: <Clock className="notification-icon" />,
        incentive_expiring: <AlertCircle className="notification-icon" />,
        deal_alert: <Users className="notification-icon" />,
      };
      return icons[type] || <Bell className="notification-icon" />;
    };

    const getPriorityColor = (priority) => {
      const colors = {
        urgent: '#DC2626',
        high: '#F59E0B',
        medium: '#3B82F6',
        low: '#6B7280'
      };
      return colors[priority] || '#6B7280';
    };

    return (
      <>
        <div className="notification-trigger" onClick={() => setShowPanel(!showPanel)}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>

        {showPanel && (
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowPanel(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  No new notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className="notification-item"
                    style={{ borderLeftColor: getPriorityColor(notification.priority) }}
                  >
                    <div className="notification-content">
                      {getIcon(notification.type)}
                      <div className="notification-text">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="mark-read-btn"
                      onClick={() => markAsRead(notification._id)}
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  export default NotificationCenter;
