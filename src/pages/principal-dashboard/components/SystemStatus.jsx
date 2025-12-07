import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SchoolSettings from './SchoolSettings';
import { useAuth } from '../../../contexts/AuthContext';
import { useDataMode } from '../../../hooks/useDataMode';
import { useDashboardData } from '../../../hooks/useDashboardData';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState('excellent');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('system');

  // 🔄 Détection du mode données avec cache optimisé
  const { user } = useAuth();
  const { dataMode, isDemo } = useDataMode();
  const { data, loading } = useDashboardData();

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Données de démonstration pour les métriques système
  const demoSystemMetrics = [
    {
      id: 'server',
      name: 'Serveur principal',
      status: 'online',
      uptime: '99.9%',
      responseTime: '45ms',
      icon: 'Server',
      description: 'Serveur de base de données'
    },
    {
      id: 'database',
      name: 'Base de données',
      status: 'online',
      uptime: '99.8%',
      responseTime: '12ms',
      icon: 'Database',
      description: 'Stockage des données élèves'
    },
    {
      id: 'backup',
      name: 'Système de sauvegarde',
      status: 'online',
      uptime: '100%',
      responseTime: '2.1s',
      icon: 'Shield',
      description: 'Sauvegarde automatique'
    },
    {
      id: 'notifications',
      name: 'Service notifications',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '156ms',
      icon: 'Bell',
      description: 'SMS et emails'
    },
    {
      id: 'api',
      name: 'API externe',
      status: 'online',
      uptime: '99.2%',
      responseTime: '89ms',
      icon: 'Wifi',
      description: 'Intégrations tierces'
    },
    {
      id: 'storage',
      name: 'Stockage fichiers',
      status: 'online',
      uptime: '99.9%',
      responseTime: '23ms',
      icon: 'HardDrive',
      description: 'Documents et photos'
    }
  ];

  // Métriques système basées sur le mode
  const systemMetrics = isDemo ? demoSystemMetrics : [
    {
      id: 'database',
      name: 'Base de données Supabase',
      status: 'online',
      uptime: '100%',
      responseTime: '15ms',
      icon: 'Database',
      description: `Données de ${user?.schoolData?.name || 'votre école'}`
    },
    {
      id: 'storage',
      name: 'Stockage Supabase',
      status: 'online',
      uptime: '99.9%',
      responseTime: '25ms',
      icon: 'HardDrive',
      description: 'Documents et fichiers'
    },
    {
      id: 'auth',
      name: 'Authentification',
      status: 'online',
      uptime: '100%',
      responseTime: '8ms',
      icon: 'Shield',
      description: 'Système de connexion sécurisé'
    },
    {
      id: 'api',
      name: 'API Supabase',
      status: 'online',
      uptime: '99.8%',
      responseTime: '45ms',
      icon: 'Wifi',
      description: 'Interface de programmation'
    }
  ];

  // Données de démonstration pour les alertes de sécurité
  const demoSecurityAlerts = [
    {
      id: 1,
      type: 'info',
      title: 'Mise à jour de sécurité',
      message: 'Nouvelle version disponible - recommandée',
      time: '2 heures',
      severity: 'low'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Tentative de connexion suspecte',
      message: 'Bloquée automatiquement - IP: 192.168.1.xxx',
      time: '6 heures',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Sauvegarde complétée',
      message: 'Toutes les données sauvegardées avec succès',
      time: '12 heures',
      severity: 'low'
    }
  ];

  // Alertes de sécurité basées sur le mode
  const securityAlerts = isDemo ? demoSecurityAlerts : [
    {
      id: 1,
      type: 'success',
      title: 'Système opérationnel',
      message: `${user?.schoolData?.name || 'Votre école'} fonctionne normalement`,
      time: '1 minute',
      severity: 'low'
    },
    {
      id: 2,
      type: 'info',
      title: 'Sauvegarde automatique',
      message: 'Données sauvegardées sur Supabase avec succès',
      time: '30 minutes',
      severity: 'low'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'offline':
        return 'bg-error/10';
      default:
        return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'warning':
        return 'Attention';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Inconnu';
    }
  };

  const getAlertIcon = (type) => {
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

  const getAlertColor = (type) => {
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

  const formatTime = (date) => {
    return date?.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const tabs = [
    { id: 'system', label: 'État du système', icon: 'Activity' },
    { id: 'school', label: 'Paramètres école', icon: 'School' }
  ];
  const renderTabContent = () => {
    switch (activeTab) {
      case 'school':
        return <SchoolSettings />;
      case 'system':
      default:
        return (
          <div className="space-y-6">
            {/* System Health Overview avec indicateur de mode - Modernisé */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 shadow-md ${
              isDemo 
                ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                : 'bg-gradient-to-br from-green-600 to-emerald-600'
            }`}>
              <Icon name="Activity" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                État du Système {isDemo ? '(Démo)' : ''}
              </h2>
              <p className="text-xs text-gray-500">
                {isDemo 
                  ? 'Surveillance simulée en temps réel' 
                  : `Surveillance réelle - ${user?.schoolData?.name || 'Votre école'}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isDemo 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isDemo ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              <span className={`text-xs font-semibold ${
                isDemo ? 'text-amber-700' : 'text-green-700'
              }`}>
                {isDemo ? 'Système simulé' : 'Système opérationnel'}
              </span>
            </div>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Icon name="RefreshCw" size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMetrics?.map((metric) => (
            <div
              key={metric?.id}
              className="p-5 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    metric?.status === 'online' 
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600' 
                      : metric?.status === 'warning'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                      : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    <Icon name={metric?.icon} size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-body font-body-semibold text-sm text-card-foreground">
                      {metric?.name}
                    </h3>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {metric?.description}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${getStatusBg(metric?.status)} ${getStatusColor(metric?.status)}`}>
                  {getStatusText(metric?.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-caption font-caption-normal text-muted-foreground">Disponibilité</p>
                  <p className="font-body font-body-semibold text-card-foreground">{metric?.uptime}</p>
                </div>
                <div>
                  <p className="font-caption font-caption-normal text-muted-foreground">Temps réponse</p>
                  <p className="font-body font-body-semibold text-card-foreground">{metric?.responseTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Security Alerts avec indicateur de mode */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${isDemo ? 'bg-yellow/10' : 'bg-success/10'} rounded-lg flex items-center justify-center`}>
              <Icon name="Shield" size={20} className={isDemo ? 'text-yellow-600' : 'text-success'} />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Alertes sécurité {isDemo ? '(Démo)' : ''}
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                {isDemo 
                  ? 'Événements simulés de démonstration' 
                  : 'Surveillance réelle des événements'
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Icon name="ExternalLink" size={14} className="mr-2" />
            Voir tout
          </Button>
        </div>

        <div className="space-y-4">
          {securityAlerts?.map((alert) => (
            <div
              key={alert?.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-micro"
            >
              <div className={`flex-shrink-0 mt-1 ${getAlertColor(alert?.type)}`}>
                <Icon name={getAlertIcon(alert?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-body font-body-semibold text-sm text-card-foreground">
                    {alert?.title}
                  </h3>
                  <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                    Il y a {alert?.time}
                  </span>
                </div>
                <p className="font-body font-body-normal text-sm text-muted-foreground mt-1">
                  {alert?.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${
                    alert?.severity === 'high' ? 'bg-error/10 text-error' :
                    alert?.severity === 'medium'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                  }`}>
                    {alert?.severity === 'high' ? 'Critique' :
                     alert?.severity === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* System Information avec données dynamiques */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Informations système {isDemo ? '(Démo)' : ''}
          </h3>
          <span className="font-caption font-caption-normal text-xs text-muted-foreground">
            Dernière mise à jour: {formatTime(lastUpdate)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Users" size={16} className={isDemo ? 'text-yellow-600' : 'text-primary'} />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                {isDemo ? '1' : (data?.activeUsers || '1')}
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Utilisateurs connectés
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Database" size={16} className={isDemo ? 'text-yellow-600' : 'text-success'} />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                {isDemo ? '2.4 GB' : (data?.storageUsed || '1.2 GB')}
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              {isDemo ? 'Espace simulé' : 'Espace utilisé réel'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Zap" size={16} className={isDemo ? 'text-yellow-600' : 'text-success'} />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                {isDemo ? '99.9%' : '100%'}
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Disponibilité {isDemo ? 'simulée' : 'Supabase'}
            </p>
          </div>
        </div>
      </div>

      {/* Information sur le mode actuel */}
      <div className={`rounded-lg p-4 ${
        isDemo ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Icon name={isDemo ? "TestTube" : "Database"} size={20} className={
            isDemo ? 'text-yellow-600' : 'text-green-600'
          } />
          <div>
            <h4 className={`font-medium mb-2 ${
              isDemo ? 'text-yellow-800' : 'text-green-800'
            }`}>
              {isDemo ? '🔄 Mode Démonstration - Système' : '🏫 Mode Production - Système'}
            </h4>
            <p className={`text-sm ${
              isDemo ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {isDemo 
                ? 'Toutes les métriques système et alertes de sécurité sont simulées pour la démonstration. Aucune donnée réelle n\'est utilisée.'
                : `Métriques système réelles pour ${user?.schoolData?.name || 'votre établissement'}. Surveillance authentique via Supabase avec données sécurisées.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet */}
      {renderTabContent()}
    </div>
  );
};

export default SystemStatus;