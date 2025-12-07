import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useParentDashboardData } from '../../hooks/useParentDashboardData';

import ChildSelector from './components/ChildSelector';
import ChildOverviewCard from './components/ChildOverviewCard';
import AttendanceTracker from './components/AttendanceTracker';
import GradesOverview from './components/GradesOverview';
import PaymentStatus from './components/PaymentStatus';
import CommunicationCenter from './components/CommunicationCenter';
import UpcomingEvents from './components/UpcomingEvents';
import MultiSchoolChildrenOverview from './components/MultiSchoolChildrenOverview';
import ManageChildModal from './components/ManageChildModal';

const ParentDashboard = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('traditional'); // 'traditional' ou 'multischool'
  const [managingChild, setManagingChild] = useState(null); // Pour le modal de gestion
  const [isTransitioning, setIsTransitioning] = useState(false); // Pour transition fluide entre enfants

  // Utiliser le hook unifié pour les données
  const {
    dataMode,
    isDemo,
    isProduction,
    parentProfile,
    children,
    selectedChild,
    selectedSchool,
    gradesData,
    attendanceData,
    paymentData,
    notificationsData,
    upcomingEvents,
    schools,
    loading,
    isLoading,
    handleChildSelect,
    handleSchoolChange,
    getAllNotifications,
    getUnreadCount,
    getChildrenBySchool
  } = useParentDashboardData();

  // Données parent pour compatibilité avec les composants existants
  const parentData = {
    id: parentProfile?.id || "parent-loading",
    name: parentProfile?.full_name || "Chargement...",
    phone: parentProfile?.phone || "",
    children: children.map(child => {
      return {
        id: child.id,
        user_id: child.user_id, // Pour ManageChildModal
        name: child.full_name || child.name,
        full_name: child.full_name || child.name, // Pour ManageChildModal
        matricule: child.matricule,
        class: typeof child.class === 'object' ? child.class?.name : child.class,
        class_name: typeof child.class === 'object' ? child.class?.name : child.class, // Pour ManageChildModal
        school: typeof child.school === 'object' ? child.school?.name : child.school,
        schoolId: typeof child.school === 'object' ? child.school?.id : child.schoolId,
        photo: child.photo_url || child.photo,
        email: child.email, // Pour ManageChildModal
        phone: child.phone, // Pour ManageChildModal
        averageGrade: child.averageGrade || 0,
        attendanceRate: child.attendanceRate || 0,
        unreadNotifications: child.unreadNotifications || 0,
        pendingPayments: child.pendingPayments || 0
      };
    })
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Fonction helper pour transformer les écoles
  const getSchools = () => {
    return schools.map(school => ({
      id: school.id,
      name: school.name
    }));
  };

  // Trouver l'enfant sélectionné transformé
  const selectedChildTransformed = parentData.children.find(c => c.id === selectedChild?.id);

  // Gestion de la transition entre enfants
  const handleChildSelectWithTransition = (child) => {
    setIsTransitioning(true);
    handleChildSelect(child);
    // Réduire le temps de transition visible
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'children':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Mes Enfants</h2>
            <ChildSelector
              children={parentData?.children}
              schools={getSchools()}
              selectedChild={selectedChild}
              selectedSchool={selectedSchool}
              onChildSelect={handleChildSelectWithTransition}
              onSchoolChange={handleSchoolChange}
              onManageChild={(child) => setManagingChild(child)}
            />
            
            <div className="relative">
              {isTransitioning && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-xl">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-3"></div>
                    <span className="text-indigo-900 font-body-bold text-sm">Chargement...</span>
                  </div>
                </div>
              )}
              
              <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                {selectedChildTransformed && (
                  <ChildOverviewCard child={selectedChildTransformed} />
                )}
              </div>
            </div>
          </div>
        );

      case 'grades':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Notes et Résultats</h2>
            {selectedChildTransformed ? (
              <GradesOverview 
                child={selectedChildTransformed}
                grades={gradesData?.[selectedChild?.id] || []}
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-10 text-center shadow-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Icon name="BookOpen" size={40} className="text-white" />
                </div>
                <p className="text-blue-900 font-display font-bold text-lg">Sélectionnez un enfant pour voir les notes</p>
              </div>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Présences et Absences</h2>
            {selectedChildTransformed ? (
              <AttendanceTracker 
                child={selectedChildTransformed}
                attendance={attendanceData?.[selectedChild?.id] || {}}
              />
            ) : (
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border-2 border-cyan-200 p-10 text-center shadow-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Icon name="Calendar" size={40} className="text-white" />
                </div>
                <p className="text-cyan-900 font-display font-bold text-lg">Sélectionnez un enfant pour voir les présences</p>
              </div>
            )}
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Paiements et Frais</h2>
            {selectedChildTransformed ? (
              <PaymentStatus 
                child={selectedChildTransformed}
                payments={paymentData?.[selectedChild?.id] || []}
              />
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-10 text-center shadow-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                  <Icon name="CreditCard" size={40} className="text-white" />
                </div>
                <p className="text-green-900 font-display font-bold text-lg">Sélectionnez un enfant pour voir les paiements</p>
              </div>
            )}
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">Communications</h2>
            {selectedChildTransformed ? (
              <CommunicationCenter 
                child={selectedChildTransformed}
                notifications={notificationsData?.[selectedChild?.id] || []}
              />
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-10 text-center shadow-md">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                  <Icon name="MessageCircle" size={40} className="text-white" />
                </div>
                <p className="text-purple-900 font-display font-bold text-lg">Sélectionnez un enfant pour voir les communications</p>
              </div>
            )}
          </div>
        );

      default: // 'dashboard'
        return (
          <>
            {/* Sélecteur de mode de vue - Modernisé */}
            <div className="flex items-center justify-between bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-md">
              <div>
                <h3 className="font-display font-bold text-xl text-gray-900">Mode d'affichage</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choisissez comment voir vos enfants
                </p>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
                <button
                  onClick={() => setViewMode('traditional')}
                  className={`px-5 py-3 rounded-lg font-body-bold transition-all duration-200 ${
                    viewMode === 'traditional'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Icon name="Users" size={18} className="mr-2 inline" />
                  Vue Traditionnelle
                </button>
                <button
                  onClick={() => setViewMode('multischool')}
                  className={`px-5 py-3 rounded-lg font-body-bold transition-all duration-200 ${
                    viewMode === 'multischool'
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Icon name="Globe" size={18} className="mr-2 inline" />
                  Multi-Établissements
                </button>
              </div>
            </div>

            {/* Vue Multi-Établissements */}
            {viewMode === 'multischool' && (
              <MultiSchoolChildrenOverview 
                parentGlobalId={parentProfile?.id || "global-parent-1"}
                children={parentData.children}
                schools={schools}
                isLoading={isLoading}
                isDemo={isDemo}
              />
            )}

            {/* Vue Traditionnelle */}
            {viewMode === 'traditional' && (
              <>
                {/* Multi-School Child Selector */}
                <ChildSelector
                  children={parentData?.children}
                  schools={getSchools()}
                  selectedChild={selectedChild}
                  selectedSchool={selectedSchool}
                  onChildSelect={handleChildSelectWithTransition}
                  onSchoolChange={handleSchoolChange}
                  onManageChild={(child) => setManagingChild(child)}
                />

                {/* Container avec transition fluide */}
                <div className="relative">
                  {/* Overlay de transition */}
                  {isTransitioning && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-xl">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-3"></div>
                        <span className="text-indigo-900 font-body-bold text-sm">Chargement...</span>
                      </div>
                    </div>
                  )}

                  {/* Contenu avec transition d'opacité */}
                  <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                    {/* Child Overview Card */}
                    {selectedChildTransformed && (
                      <ChildOverviewCard child={selectedChildTransformed} />
                    )}

                    {/* Main Dashboard Content */}
                    {selectedChildTransformed && (
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                        {/* Left Column - Grades and Attendance */}
                        <div className="xl:col-span-2 space-y-6">
                          <GradesOverview 
                            child={selectedChildTransformed}
                            grades={gradesData?.[selectedChild?.id] || []}
                          />
                          <AttendanceTracker 
                            child={selectedChildTransformed}
                            attendance={attendanceData?.[selectedChild?.id] || {}}
                          />
                        </div>

                        {/* Right Column - Payment and Communication */}
                        <div className="space-y-6">
                          <PaymentStatus 
                            child={selectedChildTransformed}
                            payments={paymentData?.[selectedChild?.id] || []}
                          />
                          <CommunicationCenter 
                            child={selectedChildTransformed}
                            notifications={notificationsData?.[selectedChild?.id] || []}
                          />
                        </div>
                      </div>
                    )}

                    {/* Upcoming Events */}
                    <UpcomingEvents events={upcomingEvents} />
                  </div>
                </div>
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Indicateur de mode - Modernisé */}
      {isDemo && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-amber-600 p-2.5 shadow-md">
            <div className="container mx-auto flex items-center justify-center space-x-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon name="AlertTriangle" size={18} className="text-white" />
              </div>
              <span className="font-body-bold text-white">
                Mode Démonstration - Les données affichées sont fictives
              </span>
            </div>
          </div>
        )}
        
        <Header 
          userRole="parent" 
          userName={parentData?.name}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Sidebar 
          userRole="parent"
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } ${isDemo ? 'mt-10' : ''}`}>
          <div className="p-4 lg:p-6 space-y-6">
            {/* Loading State - Modernisé */}
            {isLoading && children.length === 0 && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 border-2 border-indigo-200 shadow-xl">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
                  <p className="text-indigo-900 font-display font-bold text-xl">Chargement des données...</p>
                  <p className="text-indigo-600 text-sm mt-2">Veuillez patienter</p>
                </div>
              </div>
            )}

            {/* Welcome Section - Modernisé */}
            {!isLoading && (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                        👋
                      </div>
                      <div>
                        <h1 className="font-display font-bold text-3xl lg:text-4xl">
                          {getGreeting()}, M./Mme {parentData?.name?.split(' ')?.[1] || parentData?.name} !
                        </h1>
                        <p className="text-indigo-100 text-sm mt-1">
                          {currentTime?.toLocaleDateString('fr-FR', { 
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} • {currentTime?.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="font-body-medium text-white text-lg mt-4">
                      Suivez le parcours scolaire de vos enfants et restez informé(e) de leur progression.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-white/30">
                      <div className="text-2xl font-display font-bold">{parentData?.children?.length || 0}</div>
                      <div className="text-xs text-indigo-100 mt-1">Enfant{(parentData?.children?.length || 0) > 1 ? 's' : ''}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-white/30">
                      <div className="text-2xl font-display font-bold">{schools?.length || 0}</div>
                      <div className="text-xs text-indigo-100 mt-1">École{(schools?.length || 0) > 1 ? 's' : ''}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-white/30">
                      <div className="text-2xl font-display font-bold">{getUnreadCount()}</div>
                      <div className="text-xs text-indigo-100 mt-1">Notification{getUnreadCount() > 1 ? 's' : ''}</div>
                    </div>
                    {isDemo && (
                      <div className="bg-orange-500/40 border-2 border-orange-300 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md">
                        <div className="text-sm font-body-bold text-white">MODE DÉMO</div>
                        <div className="text-xs text-orange-100 mt-1">Données fictives</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {!isLoading && renderTabContent()}
          </div>
        </main>

        {/* Manage Child Modal */}
        <ManageChildModal
          child={managingChild}
          isOpen={!!managingChild}
          onClose={() => setManagingChild(null)}
          onUpdate={() => {
            // Recharger les données si nécessaire
            window.location.reload();
          }}
        />
      </div>
  );
};

export default ParentDashboard;