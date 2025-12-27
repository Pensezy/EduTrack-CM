import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// Import all tab components
import StudentManagementTab from './components/StudentManagementTab';
import TeacherManagementTab from './components/TeacherManagementTab';
import StudentCardTab from './components/StudentCardTab';
import JustificationTab from './components/JustificationTab';
import PaymentTab from './components/PaymentTab';
import NotificationCenter from './components/NotificationCenter';
import TransferWorkflow from './components/TransferWorkflow';
import DocumentsTab from './components/DocumentsTab';
import PlanningTab from './components/PlanningTab';
import TasksTab from './components/TasksTab';
import SchoolYearTab from './components/SchoolYearTab';

const SecretaryDashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Récupérer les informations de l'utilisateur connecté
  const { user, authMode } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [secretaryName, setSecretaryName] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingJustifications: 0,
    latePayments: 0,
    urgentCalls: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Déterminer si on est en mode démo et charger le nom de la secrétaire
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // 1. D'abord, récupérer l'utilisateur authentifié depuis Supabase
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          console.log('🔐 Utilisateur Supabase Auth:', authUser.email, 'ID:', authUser.id);
          
          // 2. Récupérer les données complètes depuis la table users
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              id,
              email,
              full_name,
              role,
              current_school_id,
              school:schools!users_current_school_id_fkey(id, name)
            `)
            .eq('id', authUser.id)
            .single();
            
          if (error) {
            console.error('❌ Erreur chargement données utilisateur:', error);
            // Fallback sur localStorage si erreur Supabase
            loadFromLocalStorage();
            return;
          }
          
          console.log('✅ Données utilisateur depuis Supabase:', userData);
          console.log('🎯 EMAIL ATTENDU: pensezy.si@gmail.com');
          console.log('📧 EMAIL TROUVÉ:', userData.email);
          console.log('👤 RÔLE ATTENDU: secretary');  
          console.log('🎭 RÔLE TROUVÉ:', userData.role);
          
          // 3. VÉRIFICATION CRITIQUE : Est-ce bien le bon compte ?
          if (userData.email !== 'pensezy.si@gmail.com') {
            console.error('❌ PROBLÈME MAJEUR: Mauvais utilisateur connecté !');
            console.error('   Attendu: pensezy.si@gmail.com');
            console.error('   Trouvé:', userData.email);
            console.error('   🔒 DÉCONNEXION REQUISE');
            
            // Forcer la déconnexion car mauvais compte
            await supabase.auth.signOut();
            localStorage.removeItem('edutrack-user');
            window.location.href = '/staff-login';
            return;
          }
          
          // 4. Vérifier que c'est bien un compte secrétaire
          if (userData.role !== 'secretary') {
            console.error('❌ RÔLE INCORRECT:', userData.role, 'au lieu de secretary');
          }
          
          // 5. Debug: Lister tous les secrétaires pour voir s'il en existe
          console.log('🔍 Liste de tous les secrétaires dans la base:');
          const { data: allSecretaries, error: secError } = await supabase
            .from('secretaries')
            .select('id, first_name, last_name, user_id, users:user_id(email, role)')
            .order('id');
            
          console.log('📋 Secrétaires trouvés:', allSecretaries);
          if (secError) console.error('❌ Erreur liste secrétaires:', secError);
          
          // 6. Debug: Lister tous les utilisateurs pour voir les emails
          const { data: allUsers, error: usersError } = await supabase
            .from('users')
            .select('id, email, role, full_name')
            .order('email');
            
          console.log('📋 Tous les utilisateurs:', allUsers);
          if (usersError) console.error('❌ Erreur liste utilisateurs:', usersError);
          
          setIsDemo(false);
          
          // 4. Charger le nom complet depuis la table secretaries
          if (userData.id) {
            console.log('🔍 Recherche secrétaire avec user_id:', userData.id);
            
            const { data: secretaryData, error: secretaryError } = await supabase
              .from('secretaries')
              .select('first_name, last_name, id')
              .eq('user_id', userData.id)
              .single();

            console.log('📊 Résultat requête secretaries:', { secretaryData, error: secretaryError });

            if (secretaryData && !secretaryError) {
              const fullName = `${secretaryData.first_name} ${secretaryData.last_name}`;
              setSecretaryName(fullName);
              console.log('👤 Nom secrétaire trouvé:', fullName);
            } else {
              // Fallback sur userData de la table users
              const fullName = userData.full_name || userData.email;
              setSecretaryName(fullName);
              console.log('� Nom depuis users:', fullName);
            }
          }
        } else {
          console.log('❌ Aucun utilisateur authentifié, fallback localStorage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('❌ Erreur loadUserData:', error);
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedUser = localStorage.getItem('edutrack-user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const isDemoAccount = userData.demoAccount === true || authMode === 'demo';
          setIsDemo(isDemoAccount);
          
          if (isDemoAccount) {
            console.log('🎭 Mode DÉMO (localStorage)');
            setSecretaryName('Secrétaire Démo');
          } else {
            console.log('✅ Mode PRODUCTION (localStorage):', userData.school_name || 'École', '- Rôle:', userData.role);
            setSecretaryName(userData.full_name || userData.email || 'Secrétaire');
          }
        } catch (e) {
          console.error('Erreur lecture session:', e);
          setSecretaryName('Secrétaire');
        }
      }
    };

    loadUserData();
  }, [authMode, user]);

  // Charger les statistiques réelles depuis Supabase
  useEffect(() => {
    const loadStats = async () => {
      if (isDemo) {
        // Données démo
        setStats({
          totalStudents: 127,
          pendingJustifications: 5,
          latePayments: 12,
          urgentCalls: 3
        });
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        const savedUser = localStorage.getItem('edutrack-user');
        const userData = savedUser ? JSON.parse(savedUser) : null;
        const schoolId = userData?.current_school_id;

        if (!schoolId) {
          console.warn('⚠️ Pas d\'école associée');
          setLoadingStats(false);
          return;
        }

        // Compter les élèves
        const { count: studentCount, error: studentError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('is_active', true);

        if (studentError) {
          console.error('Erreur chargement élèves:', studentError);
        }

        setStats({
          totalStudents: studentCount || 0,
          pendingJustifications: 0, // À implémenter quand table existe
          latePayments: 0, // À implémenter quand table existe
          urgentCalls: 0 // À implémenter quand table existe
        });

      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [isDemo]);

  // Gérer la navigation via les paramètres URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['students', 'teachers', 'cards', 'justifications', 'payments', 'communications', 'transfers', 'documents', 'planning', 'tasks', 'schoolyear'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    {
      id: 'tasks',
      label: 'Tâches',
      icon: 'CheckSquare',
      component: TasksTab,
      description: 'Actions du jour'
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: 'Users',
      component: StudentManagementTab,
      description: 'Inscriptions'
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      icon: 'GraduationCap',
      component: TeacherManagementTab,
      description: 'Comptes prof'
    },
    {
      id: 'cards',
      label: 'Cartes',
      icon: 'CreditCard',
      component: StudentCardTab,
      description: 'Cartes scolaires'
    },
    {
      id: 'justifications',
      label: 'Absences',
      icon: 'FileCheck',
      component: JustificationTab,
      description: 'Justificatifs'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: 'Banknote',
      component: PaymentTab,
      description: 'Frais scolaires'
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: 'Calendar',
      component: PlanningTab,
      description: 'Rendez-vous'
    },
    {
      id: 'schoolyear',
      label: 'Année Scolaire',
      icon: 'RotateCcw',
      component: SchoolYearTab,
      description: 'Transition d\'année'
    },
    {
      id: 'communications',
      label: 'Communication',
      icon: 'MessageCircle',
      component: NotificationCenter,
      description: 'SMS & emails'
    }
  ];

  const secondaryTabs = [
    {
      id: 'documents',
      label: 'Documents',
      icon: 'FileText',
      component: DocumentsTab,
      description: 'Certificats'
    },
    {
      id: 'transfers',
      label: 'Transferts',
      icon: 'ArrowRightLeft',
      component: TransferWorkflow,
      description: 'Changements d\'école'
    }
  ];

  const allTabs = [...tabs, ...secondaryTabs];
  const currentTab = allTabs?.find(tab => tab?.id === activeTab);
  const ActiveComponent = currentTab?.component;

  const quickStats = [
    {
      label: 'Élèves inscrits',
      value: loadingStats ? '...' : stats.totalStudents.toString(),
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Justificatifs en attente',
      value: loadingStats ? '...' : stats.pendingJustifications.toString(),
      icon: 'FileText',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Paiements en retard',
      value: loadingStats ? '...' : stats.latePayments.toString(),
      icon: 'CreditCard',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Appels parents urgents',
      value: loadingStats ? '...' : stats.urgentCalls.toString(),
      icon: 'Phone',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <Header 
        userRole={user?.role || "secretary"} 
        userName={secretaryName || user?.full_name || user?.name || "Secrétaire"}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {/* Sidebar */}
      <Sidebar 
        userRole={user?.role || "secretary"}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {/* Main Content */}
      <main className={`pt-20 sm:pt-16 transition-all duration-state ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 space-y-2 sm:space-y-3 w-full overflow-x-hidden">
          {/* Dashboard Header - Ultra Compact */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <div className="inline-flex items-center px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                    En ligne
                  </div>
                  <h1 className="font-heading font-heading-bold text-2xl mb-1">
                    Bienvenue, {secretaryName || 'Secrétaire'} 👋
                  </h1>
                  <p className="font-body font-body-normal text-blue-100 text-sm">
                    Tableau de Bord Secrétariat - Gestion administrative complète
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="font-body font-body-semibold text-xs mb-0.5">
                      {new Date()?.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-blue-200 flex items-center justify-end">
                      <Icon name="Calendar" size={12} className="mr-1" />
                      Année scolaire 2025-2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats - Modernisées avec gradients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {quickStats?.map((stat, index) => {
              const gradientColors = [
                'from-blue-50 to-indigo-50 border-blue-200',
                'from-green-50 to-emerald-50 border-green-200',
                'from-amber-50 to-orange-50 border-amber-200',
                'from-purple-50 to-pink-50 border-purple-200'
              ];
              const iconGradients = [
                'from-blue-600 to-indigo-600',
                'from-green-600 to-emerald-600',
                'from-amber-500 to-orange-500',
                'from-purple-600 to-pink-600'
              ];
              const textColors = [
                'text-blue-900',
                'text-green-900',
                'text-amber-900',
                'text-purple-900'
              ];
              const subtitleColors = [
                'text-blue-700',
                'text-green-700',
                'text-amber-700',
                'text-purple-700'
              ];
              
              return (
                <div 
                  key={index} 
                  className={`group bg-gradient-to-br ${gradientColors[index]} border-2 rounded-2xl p-3 sm:p-4 lg:p-5 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${iconGradients[index]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon name={stat?.icon} size={18} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${textColors[index]} mb-1`}>
                      {stat?.value}
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold ${subtitleColors[index]}`}>
                      {stat?.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tab Navigation - Modernisé & Sticky */}
          <div className="sticky top-16 z-40 bg-white rounded-2xl shadow-xl border-2 border-gray-200 mb-6 backdrop-blur-xl bg-white/95">
            {/* Desktop Tab Navigation - Compact Grid */}
            <div className="hidden lg:block p-4">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full mr-2"></div>
                <h2 className="font-heading font-heading-bold text-base text-text-primary">
                  Modules de Gestion
                </h2>
              </div>

              {/* Main Tabs - Compact Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-300 ${
                      activeTab === tab?.id
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Badge notification */}
                    {tab?.badge && (
                      <span className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                        activeTab === tab?.id 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {tab?.badge}
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        activeTab === tab?.id
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-white group-hover:bg-blue-50 shadow-sm'
                      }`}>
                        <Icon 
                          name={tab?.icon} 
                          size={20} 
                          className={activeTab === tab?.id ? 'text-white' : 'text-blue-600'}
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`font-body font-body-semibold text-sm truncate ${
                          activeTab === tab?.id ? 'text-white' : 'text-text-primary'
                        }`}>
                          {tab?.label}
                        </p>
                        <p className={`font-caption font-caption-normal text-xs truncate ${
                          activeTab === tab?.id ? 'text-blue-100' : 'text-text-secondary'
                        }`}>
                          {tab?.description}
                        </p>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeTab === tab?.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Secondary Tabs - Compact Pills */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <span className="text-xs font-medium text-text-secondary px-2 py-1 flex items-center">
                  <Icon name="Grid" size={14} className="mr-1" />
                  Autres modules :
                </span>
                {secondaryTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                      activeTab === tab?.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                        : 'bg-gray-100 hover:bg-gray-200 text-text-secondary hover:text-text-primary border border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-body font-body-medium">{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Navigation - Modernisé */}
            <div className="lg:hidden p-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Icon name="Layers" size={18} className="text-blue-600" />
                </div>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e?.target?.value)}
                  className="w-full appearance-none bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl pl-12 pr-10 py-3 font-body font-body-semibold text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <optgroup label="📋 Fonctions principales">
                    {tabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="⚙️ Autres fonctions">
                    {secondaryTabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Icon name="ChevronDown" size={18} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 animate-fadeIn">
              {ActiveComponent && <ActiveComponent isDemo={isDemo} />}
            </div>
          </div>

          {/* Quick Actions Footer - Modernisé */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <Icon name="Zap" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  Actions Rapides
                </h3>
                <p className="text-xs text-amber-700">Raccourcis pour vos tâches courantes</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                iconName="CheckSquare"
                iconPosition="left"
                onClick={() => setActiveTab('tasks')}
                className="justify-start bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 py-6 group rounded-xl"
              >
                <span className="font-semibold group-hover:text-green-700">
                  Mes tâches du jour
                </span>
              </Button>
              <Button
                variant="outline"
                iconName="Phone"
                iconPosition="left"
                onClick={() => setActiveTab('justifications')}
                className="justify-start bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all duration-300 py-6 group rounded-xl"
              >
                <span className="font-semibold group-hover:text-blue-700">
                  Appels parents urgents
                </span>
              </Button>
              <Button
                variant="outline"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => setActiveTab('planning')}
                className="justify-start bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300 py-6 group rounded-xl"
              >
                <span className="font-semibold group-hover:text-purple-700">
                  Planning rendez-vous
                </span>
              </Button>
              <Button
                variant="outline"
                iconName="FileText"
                iconPosition="left"
                onClick={() => setActiveTab('documents')}
                className="justify-start bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 py-6 group rounded-xl"
              >
                <span className="font-semibold group-hover:text-orange-700">
                  Certificats à imprimer
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaryDashboard;