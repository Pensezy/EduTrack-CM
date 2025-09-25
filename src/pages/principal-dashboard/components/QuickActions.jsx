import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const [activeAction, setActiveAction] = useState(null);
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'notifications',
      title: 'Envoyer une notification',
      description: 'Diffuser un message à toute l\'école',
      icon: 'Bell',
      color: 'bg-primary',
      path: '/notification-management'
    },
    {
      id: 'reports',
      title: 'Générer un rapport',
      description: 'Créer des rapports personnalisés',
      icon: 'FileBarChart',
      color: 'bg-success',
      path: '/report-generation'
    },
    {
      id: 'staff',
      title: 'Gestion du personnel',
      description: 'Accéder aux profils du personnel',
      icon: 'Users',
      color: 'bg-warning',
      path: '/staff-management'
    },
    {
      id: 'settings',
      title: 'Paramètres école',
      description: 'Configurer les paramètres généraux',
      icon: 'Settings',
      color: 'bg-secondary',
      path: '/school-settings'
    },
    {
      id: 'calendar',
      title: 'Calendrier scolaire',
      description: 'Gérer les événements et vacances',
      icon: 'Calendar',
      color: 'bg-accent',
      path: '/school-calendar'
    },
    {
      id: 'backup',
      title: 'Sauvegarde données',
      description: 'Exporter et sauvegarder',
      icon: 'Download',
      color: 'bg-muted',
      path: '/data-backup'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Rapport mensuel généré',
      description: 'Rapport de performance de septembre',
      time: '2 heures',
      icon: 'FileText',
      type: 'success'
    },
    {
      id: 2,
      title: 'Notification envoyée',
      description: 'Rappel réunion parents d\'élèves',
      time: '4 heures',
      icon: 'Bell',
      type: 'info'
    },
    {
      id: 3,
      title: 'Nouveau personnel ajouté',
      description: 'Mme Dubois - Professeur de français',
      time: '1 jour',
      icon: 'UserPlus',
      type: 'success'
    },
    {
      id: 4,
      title: 'Sauvegarde effectuée',
      description: 'Données sauvegardées automatiquement',
      time: '2 jours',
      icon: 'Shield',
      type: 'info'
    }
  ];

  const getActivityIcon = (type) => {
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

  const getActivityColor = (type) => {
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
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Actions rapides
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Accès direct aux fonctions principales
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => navigate(action?.path)}
              className={`p-4 rounded-lg border border-border hover:border-primary transition-micro text-left group hover:bg-muted/50`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 ${action?.color}/10 rounded-lg flex items-center justify-center group-hover:${action?.color}/20 transition-micro`}>
                  <Icon name={action?.icon} size={20} className={`${action?.color?.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-body-semibold text-sm text-card-foreground group-hover:text-primary transition-micro">
                    {action?.title}
                  </h3>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
                    {action?.description}
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-micro" />
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Recent Activities */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Activités récentes
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Historique des dernières actions
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Icon name="ExternalLink" size={14} className="mr-2" />
            Voir tout
          </Button>
        </div>

        <div className="space-y-4">
          {recentActivities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-micro"
            >
              <div className={`flex-shrink-0 mt-1 ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-body font-body-semibold text-sm text-card-foreground">
                    {activity?.title}
                  </h3>
                  <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                    Il y a {activity?.time}
                  </span>
                </div>
                <p className="font-body font-body-normal text-sm text-muted-foreground mt-1">
                  {activity?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center mt-6 pt-4 border-t border-border">
          <Button variant="ghost" size="sm">
            <Icon name="RefreshCw" size={14} className="mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;