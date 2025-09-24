
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, gradeService, absenceService, paymentService, notificationService } from '../../services/edutrackService';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ChildSelector from './components/ChildSelector';
import ChildOverviewCard from './components/ChildOverviewCard';
import AttendanceTracker from './components/AttendanceTracker';
import GradesOverview from './components/GradesOverview';
import PaymentStatus from './components/PaymentStatus';
import CommunicationCenter from './components/CommunicationCenter';
import UpcomingEvents from './components/UpcomingEvents';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [gradesData, setGradesData] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [paymentData, setPaymentData] = useState({});
  const [notificationsData, setNotificationsData] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirection si non authentifié ou mauvais rôle
  useEffect(() => {
    console.log('État auth:', { authLoading, userProfile });
    
    // Attendons que l'authentification soit terminée avant de vérifier
    if (authLoading) {
      return;
    }
    
    // Si pas connecté, redirection vers login
    if (!userProfile?.id) {
      console.log('Utilisateur non authentifié, redirection vers login');
      navigate('/login-authentication');
      return;
    }
    
    // Vérification du rôle
    if (userProfile?.role !== 'parent') {
      console.log('Utilisateur non parent:', userProfile?.role);
      setError('Accès non autorisé. Ce tableau de bord est réservé aux parents.');
      setLoading(false);
      return;
    }
  }, [userProfile, authLoading, navigate]);

  // Fetch children and their data
  useEffect(() => {
    // Ne pas charger les données si l'utilisateur n'est pas un parent
    if (!userProfile?.id || userProfile?.role !== 'parent') {
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        console.log('Chargement des données pour le parent:', userProfile.id);
        
        // 1. Children
        const { data: students, error: studentsError } = await studentService.getStudentsByParent(userProfile.id);
        
        if (studentsError) {
          console.error('Erreur lors du chargement des enfants:', studentsError);
          throw new Error('Impossible de charger les informations des enfants');
        }

        console.log('Enfants chargés:', students);
        setChildren(students || []);
        
        if (students?.length > 0 && !selectedChild) {
          console.log('Sélection du premier enfant:', students[0]);
          setSelectedChild(students[0]);
          setSelectedSchool(students[0]?.school?.id || students[0]?.school_id);
        }

        // 2. For each child, fetch grades, attendance, payments, notifications
        const gradesObj = {};
        const attendanceObj = {};
        const paymentObj = {};
        const notificationsObj = {};

        for (const child of (students || [])) {
          try {
            console.log('Chargement des détails pour l\'enfant:', child.id);
            
            // Utiliser getStudentDetails pour obtenir toutes les données
            const { data: details, error: detailsError } = await studentService.getStudentDetails(child.id);
            
            if (detailsError) {
              console.error(`Erreur lors du chargement des détails pour l'enfant ${child.id}:`, detailsError);
              continue; // Passer à l'enfant suivant en cas d'erreur
            }

            gradesObj[child.id] = details.grades || [];
            
            // Convertir les absences au format attendu
            const attendance = {};
            details.absences?.forEach(a => {
              attendance[a.date_absence] = a.justified ? 'excused' : 
                (a.justified === false && a.justified_by ? 'absent' : 'present');
            });
            attendanceObj[child.id] = attendance;
            
            paymentObj[child.id] = details.payments || [];
            notificationsObj[child.id] = []; // À implémenter si nécessaire
          } catch (childError) {
            console.error(`Erreur pour l'enfant ${child.id}:`, childError);
          }
        }

        setGradesData(gradesObj);
        setAttendanceData(attendanceObj);
        setPaymentData(paymentObj);
        setNotificationsData(notificationsObj);
        setUpcomingEvents([]);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile, selectedChild]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Select first child if children change
  useEffect(() => {
    if (children?.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
      setSelectedSchool(children[0]?.school_id);
    }
  }, [children]);

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setSelectedSchool(child?.school_id);
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    // If the current selected child is not from this school, select the first child from this school
    const childrenFromSchool = children?.filter(child => child?.school_id === schoolId);
    if (childrenFromSchool?.length > 0 && selectedChild?.school_id !== schoolId) {
      setSelectedChild(childrenFromSchool?.[0]);
    }
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getAllNotifications = () => {
    return Object?.values(notificationsData)?.flat()?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  };

  const getUnreadCount = () => {
    return getAllNotifications()?.filter(n => !n?.read)?.length;
  };

  const getSchools = () => {
    const schools = [...new Set(children?.map(child => ({
      id: child?.school_id,
      name: child?.school?.name || child?.school_name
    })))];
    return schools?.reduce((acc, school) => {
      const existing = acc?.find(s => s?.id === school?.id);
      if (!existing) acc?.push(school);
      return acc;
    }, []);
  };

  const getChildrenBySchool = (schoolId) => {
    return children?.filter(child => child?.school_id === schoolId) || [];
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? "Chargement du tableau de bord parent..." : "Chargement du profil..."}
          </p>
          {error && (
            <p className="mt-2 text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Vérification du rôle
  if (userProfile?.role !== 'parent') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Accès non autorisé. Ce tableau de bord est réservé aux parents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="parent"
        userName={userProfile?.full_name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar
        userRole="parent"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, M./Mme {userProfile?.full_name?.split(' ')?.[1]} ! 👋
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Suivez le parcours scolaire de vos enfants et restez informé(e) de leur progression.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {children?.length} enfant{children?.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {getSchools()?.length} école{getSchools()?.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {getUnreadCount()} notification{getUnreadCount() > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-heading font-heading-bold text-xl">
                    {currentTime?.toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="font-caption font-caption-normal text-sm text-white/80">
                    {currentTime?.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-School Child Selector */}
          <ChildSelector
            children={children}
            schools={getSchools()}
            selectedChild={selectedChild}
            selectedSchool={selectedSchool}
            onChildSelect={handleChildSelect}
            onSchoolChange={handleSchoolChange}
            getChildrenBySchool={getChildrenBySchool}
          />

          {/* Selected Child Overview */}
          {selectedChild && <ChildOverviewCard child={selectedChild} />}

          {/* Main Dashboard Content */}
          {selectedChild && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Academic Info */}
              <div className="xl:col-span-2 space-y-6">
                <GradesOverview grades={gradesData?.[selectedChild?.id] || []} />
                <AttendanceTracker
                  attendance={attendanceData?.[selectedChild?.id] || {}}
                  childName={selectedChild?.name}
                />
              </div>

              {/* Right Column - Payments and Communications */}
              <div className="space-y-6">
                <PaymentStatus payments={paymentData?.[selectedChild?.id] || []} />
                <CommunicationCenter
                  notifications={notificationsData?.[selectedChild?.id] || []}
                  childName={selectedChild?.name}
                />
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <UpcomingEvents
            events={upcomingEvents}
            selectedSchool={selectedSchool}
            selectedChild={selectedChild}
          />

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/student-profile-management"
                className="flex flex-col items-center p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-micro group"
              >
                <AppIcon name="User" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Profils Enfants
                </span>
              </Link>

              <Link
                to="/grade-management-system"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <AppIcon name="BookOpen" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Notes & Bulletins
                </span>
              </Link>

              <button className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group">
                <AppIcon name="CreditCard" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Paiements
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group">
                <AppIcon name="MessageSquare" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Messages
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group">
                <AppIcon name="Calendar" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Calendrier
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-micro group">
                <AppIcon name="Settings" size={24} className="text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Paramètres
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;