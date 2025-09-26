import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import SchoolSettings from './SchoolSettings';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState('excellent');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const systemMetrics = [
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

  const securityAlerts = [
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
            {/* System Health Overview */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="Activity" size={20} className="text-success" />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                État du système
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Surveillance en temps réel
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="font-caption font-caption-normal text-xs text-success">
                Système opérationnel
              </span>
            </div>
            <Button variant="ghost" size="icon">
              <Icon name="RefreshCw" size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMetrics?.map((metric) => (
            <div
              key={metric?.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-micro"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getStatusBg(metric?.status)} rounded-lg flex items-center justify-center`}>
                    <Icon name={metric?.icon} size={16} className={getStatusColor(metric?.status)} />
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
      {/* Security Alerts */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-warning" />
            </div>
            <div>
              <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Alertes sécurité
              </h2>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                Surveillance des événements
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
      {/* System Information */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Informations système
          </h3>
          <span className="font-caption font-caption-normal text-xs text-muted-foreground">
            Dernière mise à jour: {formatTime(lastUpdate)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                400
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Utilisateurs connectés
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Database" size={16} className="text-success" />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                2.4 GB
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Espace utilisé
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon name="Zap" size={16} className="text-warning" />
              <span className="font-heading font-heading-bold text-xl text-card-foreground">
                99.9%
              </span>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Disponibilité globale
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