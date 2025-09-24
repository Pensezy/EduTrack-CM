import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationsPanel = ({ notifications }) => {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const filters = [
    { value: 'all', label: 'Toutes', icon: 'Bell' },
    { value: 'grades', label: 'Notes', icon: 'BookOpen' },
    { value: 'assignments', label: 'Devoirs', icon: 'FileText' },
    { value: 'meetings', label: 'Réunions', icon: 'Calendar' },
    { value: 'announcements', label: 'Annonces', icon: 'Megaphone' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'grades':
        return 'BookOpen';
      case 'assignments':
        return 'FileText';
      case 'meetings':
        return 'Calendar';
      case 'announcements':
        return 'Megaphone';
      case 'payment':
        return 'CreditCard';
      case 'attendance':
        return 'Clock';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error bg-error/10 border-error/20';
    
    switch (type) {
      case 'grades':
        return 'text-success bg-success/10 border-success/20';
      case 'assignments':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'meetings':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'announcements':
        return 'text-accent-foreground bg-accent/10 border-accent/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error text-error-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications?.filter(notification => notification?.type === filter);

  const displayedNotifications = showAll 
    ? filteredNotifications 
    : filteredNotifications?.slice(0, 5);

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-accent text-accent-foreground text-xs font-caption font-caption-normal px-2 py-1 rounded-full">
                {unreadCount} nouvelles
              </span>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Settings" size={16} className="mr-2" />
            Préférences
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters?.map((filterOption) => (
            <button
              key={filterOption?.value}
              onClick={() => setFilter(filterOption?.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-body font-body-normal transition-micro ${
                filter === filterOption?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-card-foreground'
              }`}
            >
              <Icon name={filterOption?.icon} size={14} />
              <span>{filterOption?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {displayedNotifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="font-body font-body-normal text-muted-foreground">
              Aucune notification pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedNotifications?.map((notification) => (
              <div
                key={notification?.id}
                className={`p-4 rounded-lg border transition-micro hover:shadow-sm ${
                  notification?.read ? 'opacity-75' : ''
                } ${getNotificationColor(notification?.type, notification?.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon name={getNotificationIcon(notification?.type)} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-body font-body-semibold text-sm text-card-foreground">
                        {notification?.title}
                      </h5>
                      <div className="flex items-center space-x-2">
                        {notification?.priority && (
                          <span className={`text-xs font-caption font-caption-normal px-2 py-1 rounded-full ${getPriorityBadge(notification?.priority)}`}>
                            {notification?.priority === 'high' ? 'Urgent' : 
                             notification?.priority === 'medium' ? 'Important' : 'Normal'}
                          </span>
                        )}
                        {!notification?.read && (
                          <div className="w-2 h-2 bg-accent rounded-full" />
                        )}
                      </div>
                    </div>
                    <p className="font-body font-body-normal text-sm text-card-foreground mb-2">
                      {notification?.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                        {notification?.time}
                      </span>
                      {notification?.actionRequired && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Icon name="ExternalLink" size={12} className="mr-1" />
                          Action requise
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotifications?.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="text-sm"
            >
              {showAll ? (
                <>
                  <Icon name="ChevronUp" size={16} className="mr-2" />
                  Voir moins
                </>
              ) : (
                <>
                  <Icon name="ChevronDown" size={16} className="mr-2" />
                  Voir toutes ({filteredNotifications?.length - 5} de plus)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;