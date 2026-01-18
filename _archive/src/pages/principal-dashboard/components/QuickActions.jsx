import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useDashboardData from '../../../hooks/useDashboardData';

const QuickActions = () => {
  const [activeAction, setActiveAction] = useState(null);
  const navigate = useNavigate();

  const {
    data,
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

  const recentActivities = [
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
      title: 'Système actif',
      description: 'Données synchronisées',
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
      {/* Quick Actions Grid - Modernisé */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Icon name="Zap" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Actions Rapides
              </h2>
              <p className="text-xs text-gray-500">
                Accès direct aux fonctions principales pour {user?.schoolData?.name || 'votre école'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => navigate(action?.path)}
              className="group p-5 bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-400 rounded-2xl transition-all duration-300 text-left hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${action?.color?.replace('bg-', 'from-')} ${action?.color?.replace('bg-primary', 'to-blue-600').replace('bg-secondary', 'to-indigo-600').replace('bg-success', 'to-green-600').replace('bg-warning', 'to-amber-600').replace('bg-accent', 'to-purple-600')} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon name={action?.icon} size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700">
                    {action?.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {action?.description}
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Recent Activities - Modernisé */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <Icon name="Activity" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Activités Récentes
              </h2>
              <p className="text-xs text-gray-500">
                Historique des dernières actions
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1">
            <Icon name="ExternalLink" size={14} />
            <span>Voir tout</span>
          </button>
        </div>

        <div className="space-y-3">
          {recentActivities?.map((activity) => (
            <div
              key={activity?.id}
              className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
            >
              <div className={`flex-shrink-0 mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${
                activity?.type === 'success' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                activity?.type === 'warning' ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600' :
                activity?.type === 'error' ? 'bg-gradient-to-br from-red-100 to-pink-100 text-red-600' :
                'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
              }`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {activity?.title}
                  </h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    Il y a {activity?.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {activity?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-200">
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center space-x-2">
            <Icon name="RefreshCw" size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;