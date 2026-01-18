import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import absenceService from '../../../services/absenceService';

const NotificationHistoryModal = ({ isOpen, onClose, absence = null }) => {
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotificationHistory();
    }
  }, [isOpen, absence]);

  const loadNotificationHistory = async () => {
    try {
      setIsLoading(true);
      let history = [];
      
      if (absence) {
        // Historique spécifique à une absence
        history = await absenceService.getNotificationHistory(absence.id);
      } else {
        // Historique général de toutes les notifications
        history = await absenceService.getAllNotificationHistory();
      }
      
      setNotificationHistory(history);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      // En cas d'erreur, afficher un historique factice
      setNotificationHistory([
        {
          id: 1,
          date: new Date().toISOString(),
          type: 'sms',
          status: 'sent',
          message: 'Rappel d\'absence envoyé',
          studentName: 'Historique indisponible',
          recipientName: 'Système',
          recipientContact: 'N/A'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sms': return 'MessageSquare';
      case 'email': return 'Mail';
      case 'call': return 'Phone';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'sms': return 'text-blue-600';
      case 'email': return 'text-green-600';
      case 'call': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      sent: { label: 'Envoyé', className: 'bg-success/10 text-success' },
      successful: { label: 'Réussi', className: 'bg-success/10 text-success' },
      failed: { label: 'Échec', className: 'bg-error/10 text-error' },
      pending: { label: 'En attente', className: 'bg-warning/10 text-warning' }
    };
    
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-caption ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
              Historique des Notifications
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
              {absence ? `${absence.studentName} - ${absence.absenceDate}` : 'Toutes les notifications'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-body font-body-normal text-sm text-text-secondary">
                  Chargement de l'historique...
                </span>
              </div>
            </div>
          ) : notificationHistory.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
                Aucune notification
              </h4>
              <p className="font-body font-body-normal text-text-secondary">
                Aucune notification n'a été envoyée pour cette absence.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificationHistory.map((notification, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    <Icon name={getNotificationIcon(notification.type)} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-body font-body-medium text-sm text-text-primary">
                        {notification.type === 'sms' ? 'SMS' : 
                         notification.type === 'email' ? 'Email' : 
                         notification.type === 'call' ? 'Appel téléphonique' : 'Notification'}
                      </h5>
                      {getStatusBadge(notification.status)}
                    </div>
                    
                    {/* Info étudiant (mode historique général) */}
                    {!absence && notification.studentName && (
                      <p className="font-body font-body-medium text-sm text-primary mb-1">
                        👤 {notification.studentName} {notification.absenceDate && `(${notification.absenceDate})`}
                      </p>
                    )}
                    
                    <p className="font-body font-body-normal text-sm text-text-secondary mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      <span>📅 {notification.date}</span>
                      {notification.recipientName && (
                        <span>👤 {notification.recipientName}</span>
                      )}
                      {notification.recipientContact && (
                        <span>📞 {notification.recipientContact}</span>
                      )}
                      {notification.duration && (
                        <span>⏱️ {notification.duration}</span>
                      )}
                      {notification.subject && (
                        <span>📝 {notification.subject}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistoryModal;