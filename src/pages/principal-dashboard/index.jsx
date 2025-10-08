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
  
  // États pour la gestion des classes personnalisées
  const [newClassName, setNewClassName] = useState('');
  const [addingClass, setAddingClass] = useState(false);
  const [classError, setClassError] = useState('');
  const [classSuccess, setClassSuccess] = useState('');
  
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

  // Récupérer les données de l'école - PRIORITÉ aux vraies données de la base de données
  const schoolDataFromDatabase = data.schoolDetails; // Vraies données depuis Supabase
  const schoolDataFromState = location.state?.school;
  const schoolDataFromUser = user?.schoolData;
  const schoolData = schoolDataFromDatabase || schoolDataFromUser || schoolDataFromState;
  
  useEffect(() => {
    console.log('🏛️ PrincipalDashboard - État actuel:');
    console.log('  - Mode de données:', dataMode);
    console.log('  - Est en mode démo:', isDemo);
    console.log('  - Est en mode production:', isProduction);
    console.log('  - Chargement mode:', modeLoading);
    console.log('  - Utilisateur:', user);
    
    if (schoolDataFromDatabase) {
      console.log('✅ Données école depuis SUPABASE (PRIORITÉ):', schoolDataFromDatabase);
    } else if (schoolDataFromUser) {
      console.log('✅ Données école depuis useDataMode (FALLBACK 1):', schoolDataFromUser);
    } else if (schoolDataFromState) {
      console.log('✅ Données école depuis location.state (FALLBACK 2):', schoolDataFromState);
    } else {
      console.log('❌ Aucune donnée école disponible');
    }
    
    if (schoolData) {
      console.log('🏫 École active:', schoolData.name);
      console.log('🎓 Type:', schoolData.type);
      console.log('📚 Classes disponibles:', schoolData.available_classes);
      console.log('📊 Statut:', schoolData.status);
      console.log('👤 Directeur ID:', schoolData.director_id);
    }
  }, [schoolData, dataMode, isDemo, isProduction, modeLoading, user]);

  // Gérer les paramètres URL pour la navigation directe vers un onglet
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'analytics', 'personnel', 'school-info', 'actions', 'system', 'accounts', 'schema', 'debug'].includes(tabParam)) {
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

  // Fonction générique pour ajouter une classe
  const handleAddClass = async (className) => {
    const classNameTrimmed = className.trim();
    
    // Validation
    if (!classNameTrimmed) {
      setClassError('Nom de classe invalide');
      return false;
    }
    
    // Vérifier si la classe existe déjà
    const currentClasses = schoolData?.available_classes || [];
    if (currentClasses.includes(classNameTrimmed)) {
      setClassError('Cette classe existe déjà dans votre établissement');
      return false;
    }
    
    setAddingClass(true);
    setClassError('');
    setClassSuccess('');
    
    try {
      // Importer supabase pour la mise à jour
      const { supabase } = await import('../../lib/supabase');
      
      // Ajouter la nouvelle classe au tableau existant
      const updatedClasses = [...currentClasses, classNameTrimmed];
      
      // Mettre à jour en base de données
      const { error } = await supabase
        .from('schools')
        .update({ available_classes: updatedClasses })
        .eq('id', schoolData.id);
      
      if (error) {
        throw error;
      }
      
      // Succès
      setClassSuccess(`Classe "${classNameTrimmed}" ajoutée avec succès !`);
      
      // Recharger les données pour mettre à jour l'affichage
      setTimeout(() => {
        refresh();
        setClassSuccess('');
      }, 2000);
      
      return true;
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la classe:', error);
      setClassError('Erreur lors de l\'ajout de la classe. Veuillez réessayer.');
      return false;
    } finally {
      setAddingClass(false);
    }
  };

  // Fonction pour ajouter une classe personnalisée
  const handleAddCustomClass = async () => {
    const className = newClassName.trim();
    
    // Validations spécifiques à la saisie personnalisée
    if (!className) {
      setClassError('Veuillez saisir un nom de classe');
      return;
    }
    
    if (className.length < 2) {
      setClassError('Le nom de classe doit contenir au moins 2 caractères');
      return;
    }
    
    if (className.length > 50) {
      setClassError('Le nom de classe ne peut pas dépasser 50 caractères');
      return;
    }
    
    // Utiliser la fonction générique pour ajouter la classe
    const success = await handleAddClass(className);
    if (success) {
      setNewClassName('');
    }
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
            
            {/* Gestion intelligente des classes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📚 Classes de l'École</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  + Ajouter une classe
                </button>
              </div>
              
              {/* Classes actives de l'école */}
              {schoolData?.available_classes && schoolData.available_classes.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    🎯 Vos Classes Actives ({schoolData.available_classes.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {schoolData.available_classes.map((classe, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors cursor-pointer">
                        <div className="text-green-800 font-semibold text-lg">{classe}</div>
                        <div className="text-xs text-green-600 mt-1">Prête à utiliser</div>
                        <div className="mt-2 flex justify-center space-x-1">
                          <button className="p-1 text-green-600 hover:bg-green-200 rounded">
                            <Icon name="Users" size={14} />
                          </button>
                          <button className="p-1 text-green-600 hover:bg-green-200 rounded">
                            <Icon name="Settings" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-center text-yellow-700">
                    <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
                    <div className="font-medium">Aucune classe active</div>
                    <div className="text-sm">Configurez vos classes pour commencer</div>
                  </div>
                </div>
              )}

              {/* Suggestions de classes selon le type d'établissement */}
              {schoolData?.type && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    💡 Classes Suggérées pour votre {schoolData.type}
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {schoolData.type}
                    </span>
                  </h4>
                  
                  {(() => {
                    const currentClasses = schoolData.available_classes || [];
                    let suggestions = [];
                    let levelDescription = '';
                    
                    // Suggestions STRICTEMENT selon le type d'établissement
                    const schoolType = schoolData.type?.toLowerCase().trim();
                    
                    if (schoolType === 'primaire' || schoolType === 'école primaire') {
                      levelDescription = 'Cycle primaire (6-11 ans)';
                      suggestions = [
                        'CP', 'CE1', 'CE2', 'CM1', 'CM2',
                        'CP A', 'CP B', 'CE1 A', 'CE1 B', 'CE2 A', 'CE2 B',
                        'CM1 A', 'CM1 B', 'CM2 A', 'CM2 B'
                      ];
                    } 
                    else if (schoolType === 'collège' || schoolType === 'college' || schoolType === 'collège d\'enseignement général') {
                      levelDescription = 'Cycle secondaire 1er degré (11-15 ans)';
                      suggestions = [
                        '6ème', '5ème', '4ème', '3ème',
                        '6ème A', '6ème B', '6ème C', 
                        '5ème A', '5ème B', '5ème C',
                        '4ème A', '4ème B', '4ème C',
                        '3ème A', '3ème B', '3ème C'
                      ];
                    }
                    else if (schoolType === 'lycée' || schoolType === 'lycee' || schoolType === 'lycée d\'enseignement général') {
                      levelDescription = 'Cycle secondaire 2nd degré (15-18 ans)';
                      suggestions = [
                        '2nde', '1ère', 'Terminale',
                        '2nde A', '2nde C', '2nde D',
                        '1ère A', '1ère C', '1ère D', '1ère L', '1ère S',
                        'Terminale A', 'Terminale C', 'Terminale D', 'Terminale L', 'Terminale S', 'Terminale Ti'
                      ];
                    }
                    else if (schoolType.includes('technique') || schoolType.includes('professionnel') || schoolType === 'lycée technique') {
                      levelDescription = 'Enseignement technique et professionnel';
                      suggestions = [
                        'CAP 1ère année', 'CAP 2ème année',
                        'BEP 1ère année', 'BEP 2ème année',
                        'BAC Pro 1ère', 'BAC Pro 2ème', 'BAC Pro Terminale',
                        'BTS 1ère année', 'BTS 2ème année',
                        'CAP Électricité', 'CAP Mécanique', 'CAP Menuiserie', 'CAP Couture',
                        'BEP Électronique', 'BEP Informatique', 'BEP Comptabilité',
                        'BAC Pro Électricité', 'BAC Pro Mécanique Auto', 'BAC Pro Secrétariat'
                      ];
                    }
                    else if (schoolType.includes('maternelle') || schoolType === 'école maternelle') {
                      levelDescription = 'Cycle préscolaire (3-6 ans)';
                      suggestions = [
                        'Petite Section', 'Moyenne Section', 'Grande Section',
                        'PS A', 'PS B', 'MS A', 'MS B', 'GS A', 'GS B'
                      ];
                    }
                    else if (schoolType.includes('supérieur') || schoolType.includes('université') || schoolType.includes('institut')) {
                      levelDescription = 'Enseignement supérieur';
                      suggestions = [
                        'Licence 1', 'Licence 2', 'Licence 3',
                        'Master 1', 'Master 2',
                        'L1 Informatique', 'L1 Mathématiques', 'L1 Économie',
                        'L2 Informatique', 'L2 Mathématiques', 'L2 Économie',
                        'L3 Informatique', 'L3 Mathématiques', 'L3 Économie'
                      ];
                    }
                    else {
                      // Type d'établissement non reconnu - suggestions génériques appropriées
                      levelDescription = 'Classes générales';
                      suggestions = [
                        '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
                      ];
                    }
                    
                    // Filtrer les classes déjà présentes
                    const availableSuggestions = suggestions.filter(
                      suggestion => !currentClasses.includes(suggestion)
                    );
                    
                    return (
                      <div>
                        <div className="mb-3 text-xs text-gray-600 italic">
                          {levelDescription}
                        </div>
                        {availableSuggestions.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableSuggestions.slice(0, 12).map((suggestion, index) => (
                              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100 transition-colors cursor-pointer group">
                                <div className="text-blue-800 font-medium">{suggestion}</div>
                                <div className="text-xs text-blue-600 mt-1">Appropriée</div>
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleAddClass(suggestion)}
                                    disabled={addingClass}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                  >
                                    + Ajouter
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            <Icon name="CheckCircle" size={20} className="mx-auto mb-2 text-green-500" />
                            <div className="text-sm">Toutes les classes appropriées pour un {schoolData.type} sont configurées !</div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Option pour créer une classe personnalisée */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">🎨 Classe Personnalisée</h4>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Ex: Ti, 1ère Anglophone, BTS Comptabilité..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomClass()}
                  />
                  <button 
                    onClick={handleAddCustomClass}
                    disabled={!newClassName.trim() || addingClass}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {addingClass ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Ajout...</span>
                      </>
                    ) : (
                      <span>Créer</span>
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Créez des classes avec des noms spécifiques à votre établissement
                </div>
                {classError && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                    {classError}
                  </div>
                )}
                {classSuccess && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
                    {classSuccess}
                  </div>
                )}
              </div>
            </div>
            
            {/* Statistiques rapides */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Aperçu Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">
                    {keyMetrics.find(m => m.title === 'Élèves')?.value || 0}
                  </div>
                  <div className="text-sm text-blue-600">Élèves inscrits</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {data?.schoolStats?.teachers || 0}
                  </div>
                  <div className="text-sm text-green-600">Enseignants</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">
                    {schoolData?.available_classes?.length || 0}
                  </div>
                  <div className="text-sm text-purple-600">Classes actives</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">
                    {(() => {
                      const schoolType = schoolData?.type?.toLowerCase().trim();
                      const currentClasses = schoolData?.available_classes || [];
                      let suggestions = [];
                      
                      // Même logique que dans la section suggestions
                      if (schoolType === 'primaire' || schoolType === 'école primaire') {
                        suggestions = [
                          'CP', 'CE1', 'CE2', 'CM1', 'CM2',
                          'CP A', 'CP B', 'CE1 A', 'CE1 B', 'CE2 A', 'CE2 B',
                          'CM1 A', 'CM1 B', 'CM2 A', 'CM2 B'
                        ];
                      } else if (schoolType === 'collège' || schoolType === 'college') {
                        suggestions = [
                          '6ème', '5ème', '4ème', '3ème',
                          '6ème A', '6ème B', '6ème C', 
                          '5ème A', '5ème B', '5ème C',
                          '4ème A', '4ème B', '4ème C',
                          '3ème A', '3ème B', '3ème C'
                        ];
                      } else if (schoolType === 'lycée' || schoolType === 'lycee') {
                        suggestions = [
                          '2nde', '1ère', 'Terminale',
                          '2nde A', '2nde C', '2nde D',
                          '1ère A', '1ère C', '1ère D', '1ère L', '1ère S',
                          'Terminale A', 'Terminale C', 'Terminale D', 'Terminale L', 'Terminale S', 'Terminale Ti'
                        ];
                      } else if (schoolType?.includes('technique') || schoolType?.includes('professionnel')) {
                        suggestions = [
                          'CAP 1ère année', 'CAP 2ème année',
                          'BEP 1ère année', 'BEP 2ème année',
                          'BAC Pro 1ère', 'BAC Pro 2ème', 'BAC Pro Terminale',
                          'BTS 1ère année', 'BTS 2ème année',
                          'CAP Électricité', 'CAP Mécanique', 'CAP Menuiserie', 'CAP Couture',
                          'BEP Électronique', 'BEP Informatique', 'BEP Comptabilité',
                          'BAC Pro Électricité', 'BAC Pro Mécanique Auto', 'BAC Pro Secrétariat'
                        ];
                      } else if (schoolType?.includes('maternelle')) {
                        suggestions = [
                          'Petite Section', 'Moyenne Section', 'Grande Section',
                          'PS A', 'PS B', 'MS A', 'MS B', 'GS A', 'GS B'
                        ];
                      } else if (schoolType?.includes('supérieur') || schoolType?.includes('université')) {
                        suggestions = [
                          'Licence 1', 'Licence 2', 'Licence 3',
                          'Master 1', 'Master 2',
                          'L1 Informatique', 'L1 Mathématiques', 'L1 Économie',
                          'L2 Informatique', 'L2 Mathématiques', 'L2 Économie',
                          'L3 Informatique', 'L3 Mathématiques', 'L3 Économie'
                        ];
                      } else {
                        suggestions = [
                          '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'
                        ];
                      }
                      
                      // Filtrer les suggestions qui ne sont pas déjà dans les classes actuelles
                      const availableSuggestions = suggestions.filter(
                        suggestion => !currentClasses.includes(suggestion)
                      );
                      
                      return availableSuggestions.length;
                    })()}
                  </div>
                  <div className="text-sm text-orange-600">Classes suggérées</div>
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
                      <span>{data?.schoolStats?.students || 0} élèves actifs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="GraduationCap" size={14} className="text-green-600" />
                      <span>{data?.schoolStats?.teachers || 0} enseignants</span>
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