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
    <div className="min-h-screen bg-background">
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
      <main className={`pt-16 transition-all duration-state ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="font-heading font-heading-bold text-3xl text-text-primary">
                  Bienvenue, {secretaryName || 'Secrétaire'}
                </h1>
                <p className="font-body font-body-normal text-text-secondary mt-2">
                  Tableau de Bord Secrétariat - Gestion administrative complète de l'établissement scolaire
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-body font-body-semibold text-sm text-text-primary">
                    {new Date()?.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Année scolaire 2025-2026
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats?.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon name={stat?.icon} size={24} className={stat?.color} />
                  </div>
                  <div>
                    <p className="font-heading font-heading-bold text-2xl text-text-primary">
                      {stat?.value}
                    </p>
                    <p className="font-caption font-caption-normal text-sm text-text-secondary">
                      {stat?.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="bg-card rounded-lg border border-border mb-6">
            {/* Desktop Tab Navigation - Compact Grid */}
            <div className="hidden lg:block p-6">
              {/* Main Tabs - Grid Layout */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeTab === tab?.id ? 'bg-primary/10' : 'bg-muted/30'
                    }`}>
                      <Icon name={tab?.icon} size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-body font-body-semibold text-sm">{tab?.label}</div>
                      <div className="font-caption font-caption-normal text-xs opacity-70">
                        {tab?.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Secondary Tabs - Inline */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                <span className="text-xs font-medium text-text-secondary px-2 py-1">Autres :</span>
                {secondaryTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-body font-body-medium">{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden p-4">
              <div className="relative mb-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e?.target?.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-4 py-2 pr-8 font-body font-body-normal text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <optgroup label="Fonctions principales">
                    {tabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Autres fonctions">
                    {secondaryTabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <Icon 
                  name="ChevronDown" 
                  size={16} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {ActiveComponent && <ActiveComponent isDemo={isDemo} />}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-accent/5 rounded-lg border border-accent/20 p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                iconName="CheckSquare"
                iconPosition="left"
                onClick={() => setActiveTab('tasks')}
                className="justify-start"
              >
                Mes tâches du jour
              </Button>
              <Button
                variant="outline"
                iconName="Phone"
                iconPosition="left"
                onClick={() => setActiveTab('justifications')}
                className="justify-start"
              >
                Appels parents urgents
              </Button>
              <Button
                variant="outline"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => setActiveTab('planning')}
                className="justify-start"
              >
                Planning rendez-vous
              </Button>
              <Button
                variant="outline"
                iconName="FileText"
                iconPosition="left"
                onClick={() => setActiveTab('documents')}
                className="justify-start"
              >
                Certificats à imprimer
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaryDashboard;