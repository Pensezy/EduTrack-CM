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
import PersonnelManagement from './components/PersonnelManagement';
import DatabaseDiagnostic from './components/DatabaseDiagnostic';
import ErrorBoundary from '../../components/ErrorBoundary';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import useDashboardData from '../../hooks/useDashboardData';

const PrincipalDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Hook pour les données avec switch automatique démo/production
  const { 
    data, 
    loading, 
    errors, 
    dataMode, 
    isDemo, 
    isProduction, 
    modeLoading,
    refresh,
    user  // Récupérer aussi l'utilisateur depuis useDataMode
  } = useDashboardData();

  // Récupérer les données de l'école - PRIORITÉ aux données de useDataMode
  const schoolDataFromState = location.state?.school;
  const schoolDataFromUser = user?.schoolData;
  const schoolData = schoolDataFromUser || schoolDataFromState;
  
  useEffect(() => {
    console.log('🏛️ PrincipalDashboard - État actuel:');
    console.log('  - Mode de données:', dataMode);
    console.log('  - Est en mode démo:', isDemo);
    console.log('  - Est en mode production:', isProduction);
    console.log('  - Chargement mode:', modeLoading);
    console.log('  - Utilisateur:', user);
    
    if (schoolDataFromUser) {
      console.log('✅ Données école depuis useDataMode (PRIORITÉ):', schoolDataFromUser);
    } else if (schoolDataFromState) {
      console.log('✅ Données école depuis location.state (FALLBACK):', schoolDataFromState);
    } else {
      console.log('❌ Aucune donnée école disponible');
    }
    
    if (schoolData) {
      console.log('🏫 École active:', schoolData.name);
      console.log('📊 Statut:', schoolData.status);
      console.log('👤 Directeur ID:', schoolData.director_id);
    }
  }, [schoolData, dataMode, isDemo, isProduction, modeLoading, user]);

  // Gérer les paramètres URL pour la navigation directe vers un onglet
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'analytics', 'personnel', 'actions', 'system', 'accounts'].includes(tabParam)) {
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

  // Les métriques proviennent maintenant du hook qui switch automatiquement
  const keyMetrics = data.metrics || [];

    const tabOptions = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'analytics', label: 'Analyses', icon: 'TrendingUp' },
    { id: 'personnel', label: 'Personnel', icon: 'Users' },
    { id: 'school-info', label: 'École', icon: 'School' },
    { id: 'actions', label: 'Actions', icon: 'Zap' },
    { id: 'system', label: 'Système', icon: 'Settings' },
    { id: 'accounts', label: 'Comptes', icon: 'UserCheck' },
    { id: 'schema', label: 'Schéma DB', icon: 'Database' },
    { id: 'debug', label: 'Debug DB', icon: 'Bug' }
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
            {/* Key Metrics - Toutes les métriques importantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
      case 'personnel':
        return <PersonnelManagement />;
      case 'actions':
        return (
          <div className="space-y-6">
            {/* Raccourcis directs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/principal-dashboard?tab=personnel')}
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="UserPlus" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Créer Personnel</h3>
                    <p className="text-sm text-blue-700">Ajouter enseignant/secrétaire</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/notification-management')}
                className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 rounded-xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon name="Bell" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Notification</h3>
                    <p className="text-sm text-green-700">Message à l'école</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/report-generation')}
                className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-xl transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon name="FileBarChart" size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Rapport</h3>
                    <p className="text-sm text-purple-700">Générer analyse</p>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Section complète */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Toutes les Actions</h3>
              <QuickActions />
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">État du Système</h3>
            <SystemStatus />
          </div>
        );
      case 'accounts':
        return (
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Diagnostic des Comptes</h3>
            <p className="text-gray-600">Fonctionnalité simplifiée avec Prisma. Les données sont maintenant gérées automatiquement.</p>
          </div>
        );
      case 'schema':
        return (
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Schéma de Base de Données</h3>
            <p className="text-gray-600">Le schéma est maintenant géré par Prisma et synchronisé automatiquement.</p>
          </div>
        );
      case 'school-info':
        return (
          <div className="space-y-6">
            {/* Informations générales de l'école */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🏛️ Informations de l'Établissement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">🏫</div>
                    <div>
                      <div className="text-sm text-gray-500">Nom de l'établissement</div>
                      <div className="font-medium">{schoolData?.name || 'Non défini'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">🎓</div>
                    <div>
                      <div className="text-sm text-gray-500">Type d'établissement</div>
                      <div className="font-medium">{schoolData?.type || 'Non défini'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">📍</div>
                    <div>
                      <div className="text-sm text-gray-500">Adresse</div>
                      <div className="font-medium">{schoolData?.address || 'Non définie'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">🌍</div>
                    <div>
                      <div className="text-sm text-gray-500">Localisation</div>
                      <div className="font-medium">{schoolData?.city ? `${schoolData.city}, ${schoolData.country || ''}` : 'Non définie'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">👤</div>
                    <div>
                      <div className="text-sm text-gray-500">Directeur</div>
                      <div className="font-medium">{schoolData?.director_name || schoolData?.users?.full_name || 'Non défini'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">📞</div>
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div className="font-medium">{schoolData?.phone || 'Non défini'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">🔢</div>
                    <div>
                      <div className="text-sm text-gray-500">Code établissement</div>
                      <div className="font-medium">{schoolData?.code || 'Non défini'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">⚡</div>
                    <div>
                      <div className="text-sm text-gray-500">Statut</div>
                      <div className={`font-medium px-2 py-1 rounded text-xs inline-block ${
                        schoolData?.status === 'active' ? 'bg-green-100 text-green-800' :
                        schoolData?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schoolData?.status === 'active' ? '✅ Actif' :
                         schoolData?.status === 'pending' ? '⏳ En attente' :
                         schoolData?.status || 'Non défini'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Classes disponibles */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📚 Classes Disponibles</h3>
              {schoolData?.available_classes && schoolData.available_classes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {schoolData.available_classes.map((classe, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-blue-800 font-medium">{classe}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Aucune classe définie
                </div>
              )}
            </div>
            
            {/* Statistiques rapides */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Aperçu Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{data?.stats?.totalStudents || 0}</div>
                  <div className="text-sm text-blue-600">Élèves inscrits</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{data?.stats?.totalTeachers || 0}</div>
                  <div className="text-sm text-green-600">Enseignants</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{data?.stats?.totalClasses || 0}</div>
                  <div className="text-sm text-purple-600">Classes actives</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'debug':
        return (
          <div className="space-y-6">
            {/* Debug du mode de données */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🔍 Debug Mode de Données</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div><strong>Mode actuel:</strong> <span className={`px-2 py-1 rounded ${dataMode === 'production' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{dataMode}</span></div>
                  <div><strong>Est démo:</strong> {isDemo ? '✅ Oui' : '❌ Non'}</div>
                  <div><strong>Est production:</strong> {isProduction ? '✅ Oui' : '❌ Non'}</div>
                  <div><strong>Chargement mode:</strong> {modeLoading ? '⏳ En cours' : '✅ Terminé'}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Utilisateur connecté:</strong> {user ? '✅ Oui' : '❌ Non'}</div>
                  <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
                  <div><strong>ID utilisateur:</strong> {user?.id || 'N/A'}</div>
                  <div><strong>École détectée:</strong> {user?.schoolData ? '✅ Oui' : '❌ Non'}</div>
                </div>
              </div>
              
              {user?.schoolData && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-900 mb-2">📊 Données École (useDataMode)</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div><strong>Nom:</strong> {user.schoolData.name}</div>
                    <div><strong>ID:</strong> {user.schoolData.id}</div>
                    <div><strong>Type:</strong> {user.schoolData.type || 'Non défini'}</div>
                    <div><strong>Statut:</strong> {user.schoolData.status}</div>
                    <div><strong>Adresse:</strong> {user.schoolData.address || 'Non définie'}</div>
                    <div><strong>Ville:</strong> {user.schoolData.city || 'Non définie'}</div>
                    <div><strong>Pays:</strong> {user.schoolData.country || 'Non défini'}</div>
                    <div><strong>Classes:</strong> {user.schoolData.available_classes ? user.schoolData.available_classes.join(', ') : 'Non définies'}</div>
                    <div><strong>Code école:</strong> {user.schoolData.code || 'Non défini'}</div>
                    <div><strong>Directeur ID:</strong> {user.schoolData.director_id}</div>
                  </div>
                </div>
              )}
              
              {schoolDataFromState && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-900 mb-2">📊 Données École (location.state)</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><strong>Nom:</strong> {schoolDataFromState.name}</div>
                    <div><strong>ID:</strong> {schoolDataFromState.id}</div>
                    <div><strong>Statut:</strong> {schoolDataFromState.status}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug de la base de données */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Diagnostic de la Base de Données</h3>
              <DatabaseDiagnostic />
            </div>
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
          userName={
            schoolData?.director_name || 
            schoolData?.directorName || 
            schoolData?.users?.full_name ||
            user?.schoolData?.users?.full_name ||
            user?.full_name ||
            user?.email?.split('@')[0] || 
            'Directeur'
          }
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
            {/* Page Header - Amélioré */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="BarChart3" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard Principal
                      </h1>
                      {/* Indicateur de mode */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDemo 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isDemo ? '🔄 Mode Démo' : '🏫 Données Réelles'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {/* Nom du directeur si disponible */}
                      {(schoolData?.director_name || schoolData?.directorName || schoolData?.users?.full_name) && (
                        <div className="text-sm text-green-600 font-medium">
                          👤 {schoolData.director_name || schoolData.directorName || schoolData.users?.full_name}
                        </div>
                      )}
                      {/* Nom de l'école si disponible */}
                      {schoolData && (
                        <span className="font-medium text-blue-600">
                          🏛️ {schoolData.name}
                        </span>
                      )}
                      <span>
                        📅 {new Date().toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Système opérationnel</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Indicateur du mode de données */}
                  <div className={`hidden md:flex items-center space-x-2 backdrop-blur-sm rounded-lg px-3 py-2 ${
                    isDemo 
                      ? 'bg-orange-50 border border-orange-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isDemo ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isDemo ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      {modeLoading ? 'Chargement...' : (isDemo ? 'Mode Démo' : 'Données Réelles')}
                    </span>
                    {isDemo && (
                      <Icon name="TestTube" size={14} className="text-orange-600" />
                    )}
                    {isProduction && (
                      <Icon name="Database" size={14} className="text-green-600" />
                    )}
                  </div>
                  
                  <div className="hidden md:flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Icon name="Users" size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {data.schoolStats?.totalStudents || (isDemo ? '400' : '0')} élèves
                    </span>
                  </div>
                  <NotificationCenter userRole="principal" />
                  <AccessibilityControls />
                </div>
              </div>
            </div>

            {/* Tab Navigation - Avec indicateurs */}
            <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
              {tabOptions?.map((tab) => {
                // Ajouter des indicateurs contextuels
                const getTabBadge = (tabId) => {
                  switch (tabId) {
                    case 'personnel':
                      return <div className="w-2 h-2 bg-green-500 rounded-full ml-1" title="25 membres actifs" />;
                    case 'system':
                      return <div className="w-2 h-2 bg-yellow-500 rounded-full ml-1" title="1 alerte mineure" />;
                    default:
                      return null;
                  }
                };
                
                return (
                  <button
                    key={tab?.id}
                    onClick={() => handleTabChange(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 relative ${
                      activeTab === tab?.id
                        ? 'bg-white text-blue-600 shadow-sm font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                    {getTabBadge(tab?.id)}
                  </button>
                );
              })}
            </div>

            {/* Notification mode démo */}
            {isDemo && (
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="AlertTriangle" size={20} className="text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      <strong>Mode Démonstration :</strong> Vous visualisez des données fictives à des fins de test.
                      Connectez-vous avec un compte réel pour accéder aux vraies données de votre école.
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <button
                      onClick={() => navigate('/school-management')}
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium underline"
                    >
                      Se connecter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Indicateur de chargement */}
            {modeLoading && (
              <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-blue-700">Détection du mode de données en cours...</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="transition-all duration-state">
              {renderTabContent()}
            </div>

            {/* Footer Info - Amélioré */}
            <div className="mt-12 pt-6 border-t border-border">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="font-medium">Système opérationnel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={14} className="text-blue-600" />
                      <span>400 élèves actifs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="GraduationCap" size={14} className="text-green-600" />
                      <span>25 enseignants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Shield" size={14} className="text-purple-600" />
                      <span>Sécurisé SSL</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Database" size={14} className="text-orange-600" />
                      <span>99.9% uptime</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Activity" size={14} className="text-green-500" />
                      <span>Données en temps réel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" size={14} />
                      <span>Sync: {currentTime?.toLocaleTimeString('fr-FR')}</span>
                    </div>
                  </div>
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