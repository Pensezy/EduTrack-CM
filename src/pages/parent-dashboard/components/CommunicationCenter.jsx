import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CommunicationCenter = ({ notifications, childName }) => {
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'grades': return <Icon name="BookOpen" size={16} className="text-success" />;
      case 'absences': return <Icon name="Calendar" size={16} className="text-error" />;
      case 'payments': return <Icon name="CreditCard" size={16} className="text-warning" />;
      case 'meetings': return <Icon name="Users" size={16} className="text-primary" />;
      case 'announcements': return <Icon name="Megaphone" size={16} className="text-accent-foreground" />;
      default: return <Icon name="Bell" size={16} className="text-muted-foreground" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'grades': return 'bg-success/10';
      case 'absences': return 'bg-error/10';
      case 'payments': return 'bg-warning/10';
      case 'meetings': return 'bg-primary/10';
      case 'announcements': return 'bg-accent/10';
      default: return 'bg-muted/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-error';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-success';
      default: return 'border-l-muted';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'grades': return 'Notes';
      case 'absences': return 'Absences';
      case 'payments': return 'Paiements';
      case 'meetings': return 'Réunions';
      case 'announcements': return 'Annonces';
      default: return 'Autre';
    }
  };

  const filteredNotifications = notifications?.filter(notif => 
    filter === 'all' || notif?.type === filter
  ) || [];

  const unreadCount = notifications?.filter(n => !n?.read)?.length || 0;

  const filters = [
    { value: 'all', label: 'Toutes', count: notifications?.length || 0 },
    { value: 'grades', label: 'Notes', count: notifications?.filter(n => n?.type === 'grades')?.length || 0 },
    { value: 'absences', label: 'Absences', count: notifications?.filter(n => n?.type === 'absences')?.length || 0 },
    { value: 'payments', label: 'Paiements', count: notifications?.filter(n => n?.type === 'payments')?.length || 0 },
    { value: 'meetings', label: 'Réunions', count: notifications?.filter(n => n?.type === 'meetings')?.length || 0 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Centre de Communication
        </h3>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Icon name="Bell" size={16} className="text-primary" />
          <span className="font-heading font-heading-semibold text-sm text-primary">
            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters?.map(filterOption => (
          <button
            key={filterOption?.value}
            onClick={() => setFilter(filterOption?.value)}
            className={`px-3 py-2 rounded-lg font-caption font-caption-semibold text-sm transition-all ${
              filter === filterOption?.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
            }`}
          >
            {filterOption?.label}
            {filterOption?.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === filterOption?.value
                  ? 'bg-white/20' :'bg-muted'
              }`}>
                {filterOption?.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications?.map(notification => (
          <div
            key={notification?.id}
            onClick={() => setSelectedNotification(
              selectedNotification?.id === notification?.id ? null : notification
            )}
            className={`border-l-4 ${getPriorityColor(notification?.priority)} bg-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              !notification?.read ? 'ring-2 ring-primary/20' : ''
            } ${
              selectedNotification?.id === notification?.id ? 'shadow-lg bg-primary/2' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(notification?.type)}`}>
                {getTypeIcon(notification?.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-heading-semibold text-base text-card-foreground truncate">
                    {notification?.title}
                  </h4>
                  <div className="flex items-center gap-2 ml-3">
                    {!notification?.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(notification?.date)}
                    </span>
                  </div>
                </div>

                <p className="font-body font-body-normal text-sm text-muted-foreground mb-3 line-clamp-2">
                  {notification?.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold ${getTypeColor(notification?.type)}`}>
                      {getTypeText(notification?.type)}
                    </span>
                    <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {notification?.school}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Icon 
                      name={selectedNotification?.id === notification?.id ? "ChevronUp" : "ChevronDown"} 
                      size={14} 
                      className="text-muted-foreground" 
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {selectedNotification?.id === notification?.id && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-body font-body-semibold text-muted-foreground">École:</span>
                        <span className="font-body font-body-normal text-card-foreground">{notification?.school}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body font-body-semibold text-muted-foreground">Priorité:</span>
                        <span className={`font-body font-body-normal capitalize ${
                          notification?.priority === 'high' ? 'text-error' :
                          notification?.priority === 'medium' ? 'text-warning' : 'text-success'
                        }`}>
                          {notification?.priority === 'high' ? 'Haute' :
                           notification?.priority === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-primary text-white font-caption font-caption-semibold py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors">
                        Marquer comme lu
                      </button>
                      <button className="px-3 py-2 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                        <Icon name="Archive" size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground">
              {filter === 'all' ? 'Aucune notification' : `Aucune notification de type "${filters?.find(f => f?.value === filter)?.label}"`}
            </p>
          </div>
        )}
      </div>

      {/* SMS History Note */}
      {notifications?.length > 0 && (
        <div className="mt-6 p-3 bg-muted/10 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Icon name="MessageSquare" size={14} className="text-primary" />
            <span className="font-caption font-caption-semibold text-sm text-primary">
              Historique SMS
            </span>
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
            Toutes les notifications importantes sont également envoyées par SMS au {childName ? `parent de ${childName}` : 'parent'}.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;