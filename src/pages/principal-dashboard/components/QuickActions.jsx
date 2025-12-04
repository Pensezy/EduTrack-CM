import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useDashboardData from '../../../hooks/useDashboardData';

const QuickActions = () => {
  const [activeAction, setActiveAction] = useState(null);
  const navigate = useNavigate();
  
  // Hook pour récupérer les données selon le mode (démo/production)
  const { 
    data, 
    isDemo, 
    isProduction, 
    user 
  } = useDashboardData();

  const quickActions = [
    {
      id: 'staff-login',
      title: 'Connexion Personnel',
      description: 'Accès pour enseignants, élèves et parents',
      icon: 'LogIn',
      color: 'bg-primary',
      path: '/staff-login'
    },
    {
      id: 'notifications',
      title: 'Envoyer une notification',
      description: 'Diffuser un message à toute l\'école',
      icon: 'Bell',
      color: 'bg-secondary',
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
      description: 'Créer et gérer les comptes du personnel',
      icon: 'Users',
      color: 'bg-warning',
      path: '/principal-dashboard?tab=accounts'
    },
    {
      id: 'calendar',
      title: 'Calendrier scolaire',
      description: 'Gérer les événements et vacances',
      icon: 'Calendar',
      color: 'bg-accent',
      path: '/school-calendar'
    }
  ];

  // Activités récentes basées sur le mode de données
  const recentActivities = isDemo ? [
    {
      id: 1,
      title: 'Données de démonstration',
      description: 'Vous êtes en mode démonstration',
      time: 'maintenant',
      icon: 'TestTube',
      type: 'info'
    },
    {
      id: 2,
      title: 'Rapport mensuel généré (démo)',
      description: 'Rapport de performance de septembre (données fictives)',
      time: '2 heures',
      icon: 'FileText',
      type: 'success'
    },
    {
      id: 3,
      title: 'Notification envoyée (démo)',
      description: 'Rappel réunion parents d\'élèves (fictif)',
      time: '4 heures',
      icon: 'Bell',
      type: 'info'
    },
    {
      id: 4,
      title: 'Personnel ajouté (démo)',
      description: 'Mme Dubois - Professeur de français (fictif)',
      time: '1 jour',
      icon: 'UserPlus',
      type: 'success'
    }
  ] : [
    {
      id: 1,
      title: 'École configurée',
      description: `Configuration de ${user?.schoolData?.name || 'votre école'}`,
      time: 'récemment',
      icon: 'School',
      type: 'success'
    },
    {
      id: 2,
      title: 'Classes configurées',
      description: `${user?.schoolData?.available_classes?.length || 0} classes définies`,
      time: 'récemment',
      icon: 'BookOpen',
      type: 'success'
    },
    {
      id: 3,
      title: 'Système opérationnel',
      description: 'Connexion à la base de données établie',
      time: 'maintenant',
      icon: 'Database',
      type: 'success'
    },
    {
      id: 4,
      title: 'Mode production activé',
      description: 'Données réelles synchronisées',
      time: 'maintenant',
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
      {/* Indicateur de mode */}
      {isDemo && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Mode Démonstration</h3>
              <p className="text-sm text-orange-700">
                Les activités affichées sont fictives. Connectez-vous avec un compte réel pour voir vos vraies données.
              </p>
            </div>
          </div>
        </div>
      )}

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
                Accès direct aux fonctions principales {isProduction && `pour ${user?.schoolData?.name}`}
              </p>
            </div>
          </div>
          {isProduction && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Données réelles</span>
            </div>
          )}
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