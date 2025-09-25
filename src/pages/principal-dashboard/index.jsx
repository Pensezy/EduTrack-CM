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
import TeacherManagement from './components/TeacherManagement';
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
    if (tabParam && ['overview', 'analytics', 'teachers', 'actions', 'system'].includes(tabParam)) {
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
    { id: 'teachers', label: 'Enseignants', icon: 'Users' },
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
          <div className="space-y-8">
            {/* Key Metrics - Réduit à 3 métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {keyMetrics?.slice(0, 3)?.map((metric, index) => (
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
            
            {/* Charts Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Aperçu des performances</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ClassAverageChart />
                <AttendanceChart />
              </div>
            </div>
            
            {/* Payment Status - Plus compact */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">État des paiements</h3>
              <PaymentStatusChart />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Analyses Détaillées
                  </h2>
                  <p className="text-gray-600">
                    Rapports et tendances de performance scolaire
                  </p>
                </div>
              </div>
            </div>
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <ClassAverageChart />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <AttendanceChart />
              </div>
            </div>
            
            {/* Payment Analytics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <PaymentStatusChart />
            </div>
          </div>
        );
      case 'teachers':
        return <TeacherManagement />;
      case 'actions':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions Rapides</h3>
            <QuickActions />
          </div>
        );
      case 'system':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">État du Système</h3>
            <SystemStatus />
          </div>
        );
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
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Page Header - Simplifié */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Dashboard Principal
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <NotificationCenter userRole="principal" />
                <AccessibilityControls />
              </div>
            </div>

            {/* Tab Navigation - Simplifié */}
            <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
              {tabOptions?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => handleTabChange(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                    activeTab === tab?.id
                      ? 'bg-white text-blue-600 shadow-sm font-medium' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
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