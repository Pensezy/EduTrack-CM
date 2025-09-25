import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import AccessibilityControls from '../../components/ui/AccessibilityControls';
import MetricCard from './components/MetricCard';
import ClassAverageChart from './components/ClassAverageChart';
import AttendanceChart from './components/AttendanceChart';
import PaymentStatusChart from './components/PaymentStatusChart';
import QuickActions from './components/QuickActions';
import SystemStatus from './components/SystemStatus';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PrincipalDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Gérer les paramètres URL pour la navigation directe vers un onglet
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'analytics', 'actions', 'system'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview'); // Par défaut si pas de paramètre ou paramètre invalide
    }
  }, [location.search]); // Se déclenche à chaque changement d'URL

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'overview') {
      navigate('/principal-dashboard');
    } else {
      navigate(`/principal-dashboard?tab=${tabId}`);
    }
  };

  const keyMetrics = [
    {
      title: 'Élèves inscrits',
      value: '400',
      change: 2.5,
      changeType: 'positive',
      icon: 'Users',
      description: 'Total des inscriptions',
      trend: 85
    },
    {
      title: 'Taux de présence',
      value: '94.2%',
      change: 1.2,
      changeType: 'positive',
      icon: 'UserCheck',
      description: 'Moyenne hebdomadaire',
      trend: 94
    },
    {
      title: 'Moyenne générale',
      value: '84.7/100',
      change: -0.8,
      changeType: 'negative',
      icon: 'BookOpen',
      description: 'Performance académique',
      trend: 85
    },
    {
      title: 'Paiements à jour',
      value: '85.5%',
      change: 3.2,
      changeType: 'positive',
      icon: 'CreditCard',
      description: 'Frais de scolarité',
      trend: 86
    }
  ];

  const tabOptions = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'analytics', label: 'Analyses', icon: 'TrendingUp' },
    { id: 'actions', label: 'Actions', icon: 'Zap' },
    { id: 'system', label: 'Système', icon: 'Settings' }
  ];

  const formatDateTime = (date) => {
    return date?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyMetrics?.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  changeType={metric?.changeType}
                  icon={metric?.icon}
                  description={metric?.description}
                  trend={metric?.trend}
                />
              ))}
            </div>
            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ClassAverageChart />
              <AttendanceChart />
            </div>
            <PaymentStatusChart />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
                    Analyses détaillées
                  </h2>
                  <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                    Rapports et tendances approfondis
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ClassAverageChart />
                <AttendanceChart />
              </div>
            </div>
            <PaymentStatusChart />
          </div>
        );
      case 'actions':
        return <QuickActions />;
      case 'system':
        return <SystemStatus />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Tableau de bord Principal - EduTrack CM</title>
        <meta name="description" content="Tableau de bord principal pour la supervision et l'administration de l'école avec analyses en temps réel" />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header
          userRole="principal"
          userName="M. Directeur"
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Sidebar */}
        <Sidebar
          userRole="principal"
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />

        {/* Main Content */}
        <main className={`pt-16 transition-all duration-state ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}>
          <div className="p-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-4 lg:mb-0">
                <h1 className="font-heading font-heading-bold text-3xl text-foreground mb-2">
                  Tableau de bord Principal
                </h1>
                <p className="font-body font-body-normal text-text-secondary">
                  {formatDateTime(currentTime)}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <NotificationCenter userRole="principal" />
                <AccessibilityControls />
                <Button variant="outline" size="sm">
                  <Icon name="Download" size={16} className="mr-2" />
                  Exporter
                </Button>
                <Button variant="default" size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Nouvelle action
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-card border border-border rounded-lg mb-6 shadow-card">
              <div className="flex overflow-x-auto">
                {tabOptions?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => handleTabChange(tab?.id)}
                    className={`flex items-center space-x-2 px-6 py-4 text-sm font-body font-body-normal whitespace-nowrap transition-micro border-b-2 ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-state">
              {renderTabContent()}
            </div>

            {/* Footer Info */}
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span>Système opérationnel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={14} />
                    <span>400 élèves actifs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Shield" size={14} />
                    <span>Sécurisé</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} />
                  <span>Dernière synchronisation: {currentTime?.toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PrincipalDashboard;