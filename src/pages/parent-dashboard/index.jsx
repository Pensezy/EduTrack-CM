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
              onChildSelect={handleChildSelect}
              onSchoolChange={handleSchoolChange}
              onManageChild={(child) => setManagingChild(child)}
            />
            {selectedChildTransformed && (
              <ChildOverviewCard child={selectedChildTransformed} />
            )}
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
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Sélectionnez un enfant pour voir les notes</p>
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
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Sélectionnez un enfant pour voir les présences</p>
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
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Sélectionnez un enfant pour voir les paiements</p>
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
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-text-secondary">Sélectionnez un enfant pour voir les communications</p>
              </div>
            )}
          </div>
        );

      default: // 'dashboard'
        return (
          <>
            {/* Sélecteur de mode de vue */}
            <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-800">Mode d'affichage</h3>
                <p className="text-sm text-gray-600">
                  Choisissez comment voir vos enfants
                </p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('traditional')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'traditional'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon name="Users" size={16} className="mr-2 inline" />
                  Vue Traditionnelle
                </button>
                <button
                  onClick={() => setViewMode('multischool')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'multischool'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon name="Globe" size={16} className="mr-2 inline" />
                  Multi-Établissements
                </button>
              </div>
            </div>

            {/* Vue Multi-Établissements */}
            {viewMode === 'multischool' && (
              <MultiSchoolChildrenOverview parentGlobalId="global-parent-1" />
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
                  onChildSelect={handleChildSelect}
                  onSchoolChange={handleSchoolChange}
                  onManageChild={(child) => setManagingChild(child)}
                />

                {/* Child Overview Card */}
                {selectedChildTransformed && (
                  <ChildOverviewCard child={selectedChildTransformed} />
                )}

                {/* Main Dashboard Content */}
                {selectedChildTransformed && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
              </>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Indicateur de mode */}
      {isDemo && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-orange-50 border-b border-orange-200 p-2">
            <div className="container mx-auto flex items-center justify-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
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
            {/* Loading State */}
            {isLoading && children.length === 0 && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement des données...</p>
                </div>
              </div>
            )}

            {/* Welcome Section */}
            {!isLoading && (
              <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                      {getGreeting()}, M./Mme {parentData?.name?.split(' ')?.[1] || parentData?.name} ! 👋
                    </h1>
                    <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                      Suivez le parcours scolaire de vos enfants et restez informé(e) de leur progression.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="bg-white/20 rounded-lg px-3 py-1">
                        <span className="font-caption font-caption-semibold text-sm">
                          {parentData?.children?.length || 0} enfant{(parentData?.children?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1">
                        <span className="font-caption font-caption-semibold text-sm">
                          {schools?.length || 0} école{(schools?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="bg-white/20 rounded-lg px-3 py-1">
                        <span className="font-caption font-caption-semibold text-sm">
                          {getUnreadCount()} notification{getUnreadCount() > 1 ? 's' : ''}
                        </span>
                      </div>
                      {isDemo && (
                        <div className="bg-orange-500/30 border border-orange-300/50 rounded-lg px-3 py-1">
                          <span className="font-caption font-caption-semibold text-sm">
                            MODE DÉMO
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-heading font-heading-bold text-xl">
                        {currentTime?.toLocaleDateString('fr-FR', { 
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                      <div className="font-caption font-caption-normal text-sm text-white/80">
                        {currentTime?.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
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