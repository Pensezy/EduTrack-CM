import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationCenter = ({ userRole = 'student', className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications from Supabase
    // TODO: Implement Supabase integration to fetch real notifications
    setNotifications([]);
    setUnreadCount(0);
  }, [userRole]);

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev?.map(notification => 
        notification?.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev?.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-caption font-caption-normal animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-notification" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-modal z-notification">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-heading font-heading-semibold text-sm text-popover-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="p-8 text-center">
                  <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                  <p className="font-body font-body-normal text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications?.map((notification) => (
                  <div
                    key={notification?.id}
                    onClick={() => handleNotificationClick(notification?.id)}
                    className={`p-4 border-b border-border last:border-b-0 hover:bg-muted transition-micro cursor-pointer ${
                      !notification?.read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 mt-1 ${getNotificationColor(notification?.type)}`}>
                        <Icon name={getNotificationIcon(notification?.type)} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-body font-body-semibold text-sm text-popover-foreground">
                            {notification?.title}
                          </p>
                          {!notification?.read && (
                            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="font-body font-body-normal text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification?.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                            {notification?.time}
                          </p>
                          <span className="font-caption font-caption-normal text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {notification?.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications?.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full">
                  <Icon name="ExternalLink" size={14} className="mr-2" />
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;