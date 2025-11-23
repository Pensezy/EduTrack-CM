import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentData } from '../../hooks/useStudentData';

import ProfileCard from './components/ProfileCard';
import GradesPanel from './components/GradesPanel';
import AttendanceCalendar from './components/AttendanceCalendar';
import BehaviorAssessment from './components/BehaviorAssessment';
import NotificationsPanel from './components/NotificationsPanel';
import UpcomingAssignments from './components/UpcomingAssignments';
import AchievementBadges from './components/AchievementBadges';

const StudentDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { user } = useAuth();

  // Utiliser le hook pour récupérer les données (mode démo ou production)
  const {
    loading,
    error,
    isDemo,
    studentData: studentProfile,
    statsData,
    gradesData: fetchedGrades,
    attendanceData: fetchedAttendance,
    assignmentsData: fetchedAssignments,
    notificationsData: fetchedNotifications,
    achievementsData: fetchedAchievements
  } = useStudentData(user?.id);

  // Transformer les données pour correspondre au format attendu par les composants
  const studentData = studentProfile ? {
    name: `${studentProfile.first_name} ${studentProfile.last_name}`,
    studentId: studentProfile.id,
    class: studentProfile.classes?.name || 'Non assigné',
    academicYear: "2024-2025",
    photo: studentProfile.photo_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    stats: {
      averageGrade: statsData?.averageGrade || "0.00",
      attendanceRate: parseFloat(statsData?.attendanceRate || "0"),
      assignmentsDue: fetchedAssignments.filter(a => a.status === 'pending').length || 0
    }
  } : null;

  // Transformer les données de notes pour correspondre au format attendu
  const gradesData = fetchedGrades.length > 0 ? [
    {
      id: 1,
      name: "Mathématiques",
      average: fetchedGrades.filter(g => g.subject === 'Mathématiques')[0]?.grade || 0,
      coefficient: 7,
      assignments: fetchedGrades.filter(g => g.subject === 'Mathématiques').map(g => ({
        id: g.id,
        name: g.type,
        grade: g.grade,
        coefficient: g.coefficient,
        type: g.type,
        date: new Date(g.date).toLocaleDateString('fr-FR')
      })),
      feedback: "Continuez vos efforts"
    }
  ] : [
    {
      id: 1,
      name: "Mathématiques",
      average: 16.5,
      coefficient: 7,
      assignments: [
        { id: 1, name: "Contrôle Dérivées", grade: 18, coefficient: 3, type: "Contrôle", date: "15/11/2024" },
        { id: 2, name: "DM Intégrales", grade: 15, coefficient: 2, type: "Devoir", date: "08/11/2024" },
        { id: 3, name: "Interrogation Limites", grade: 17, coefficient: 1, type: "Interrogation", date: "01/11/2024" }
      ],
      feedback: "Excellent travail en analyse. Continue sur cette voie pour les probabilités."
    },
    {
      id: 2,
      name: "Physique-Chimie",
      average: 14.8,
      coefficient: 6,
      assignments: [
        { id: 4, name: "TP Optique", grade: 16, coefficient: 2, type: "TP", date: "12/11/2024" },
        { id: 5, name: "Contrôle Mécanique", grade: 13, coefficient: 3, type: "Contrôle", date: "05/11/2024" },
        { id: 6, name: "Exercices Thermodynamique", grade: 15, coefficient: 1, type: "Exercices", date: "29/10/2024" }
      ],
      feedback: "Bonne compréhension des concepts. Attention aux calculs en mécanique."
    },
    {
      id: 3,
      name: "Français",
      average: 13.2,
      coefficient: 5,
      assignments: [
        { id: 7, name: "Dissertation Baudelaire", grade: 12, coefficient: 3, type: "Dissertation", date: "10/11/2024" },
        { id: 8, name: "Commentaire Rimbaud", grade: 14, coefficient: 2, type: "Commentaire", date: "03/11/2024" },
        { id: 9, name: "Récitation", grade: 15, coefficient: 1, type: "Oral", date: "27/10/2024" }
      ],
      feedback: "Analyse littéraire en progrès. Travaille la structure de tes dissertations."
    }
  ];

  // Transformer les données de présence
  const attendanceData = fetchedAttendance.length > 0 
    ? fetchedAttendance.reduce((acc, item) => {
        acc[item.date] = item.status;
        return acc;
      }, {})
    : {
        "2024-11-01": "present",
        "2024-11-02": "present", 
        "2024-11-03": "absent",
        "2024-11-04": "present",
        "2024-11-05": "late",
        "2024-11-06": "present",
        "2024-11-07": "present",
        "2024-11-08": "present",
        "2024-11-09": "excused",
        "2024-11-10": "present",
        "2024-11-11": "present",
        "2024-11-12": "present"
      };

  // Mock behavior assessment data
  const behaviorData = {
    current: {
      overallScore: 4,
      categories: [
        { id: 1, name: "Participation en classe", score: 4, description: "Participe activement aux discussions" },
        { id: 2, name: "Respect des règles", score: 5, description: "Respecte parfaitement le règlement" },
        { id: 3, name: "Travail en équipe", score: 4, description: "Collabore bien avec ses camarades" },
        { id: 4, name: "Autonomie", score: 3, description: "Peut améliorer son organisation personnelle" }
      ],
      comments: [
        {
          id: 1,
          subject: "Mathématiques",
          teacher: "M. Martin",
          type: "positive",
          message: "Marie fait preuve d\'une excellente logique mathématique et aide souvent ses camarades.",
          date: "10/11/2024",
          suggestion: "Pourrait prendre plus d\'initiatives lors des exercices en groupe."
        },
        {
          id: 2,
          subject: "Français",
          teacher: "Mme Durand",
          type: "improvement",
          message: "Les analyses sont pertinentes mais la structure des dissertations peut être améliorée.",
          date: "08/11/2024",
          suggestion: "Revoir la méthodologie de la dissertation avec des exercices ciblés."
        }
      ],
      achievements: [
        { id: 1, title: "Élève du mois - Octobre", date: "01/11/2024" },
        { id: 2, title: "Mention Très Bien - Contrôle Maths", date: "15/11/2024" }
      ]
    }
  };

  // Utiliser les notifications récupérées ou les données de démo
  const notificationsData = fetchedNotifications.length > 0 
    ? fetchedNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: "medium",
        time: n.time,
        read: n.read,
        actionRequired: false
      }))
    : [
        {
          id: 1,
          title: "Nouvelle note disponible",
          message: "Votre note de contrôle de mathématiques est disponible : 18/20",
          type: "grades",
          priority: "medium",
          time: "Il y a 2 heures",
          read: false,
          actionRequired: false
        },
        {
          id: 2,
          title: "Devoir à rendre demain",
      message: "N\'oubliez pas de rendre votre dissertation de français sur Baudelaire",
      type: "assignments",
      priority: "high",
      time: "Il y a 4 heures",
      read: false,
      actionRequired: true
    },
    {
      id: 3,
      title: "Réunion parents-professeurs",
      message: "Réunion programmée le 20/11/2024 à 18h00 en salle 205",
      type: "meetings",
      priority: "medium",
      time: "Il y a 1 jour",
      read: true,
      actionRequired: false
    },
    {
      id: 4,
      title: "Sortie pédagogique",
      message: "Visite du musée des sciences le 25/11/2024. Autorisation parentale requise.",
      type: "announcements",
      priority: "low",
      time: "Il y a 2 jours",
      read: true,
      actionRequired: true
    }
  ];

  // Utiliser les devoirs récupérés ou les données de démo
  const assignmentsData = fetchedAssignments.length > 0
    ? fetchedAssignments.map(a => ({
        id: a.id,
        title: a.title,
        subject: a.subject,
        teacher: a.teacher,
        type: a.type,
        dueDate: a.dueDate,
        description: a.description,
        completed: a.status === 'completed',
        resources: []
      }))
    : [
        {
          id: 1,
          title: "Dissertation sur Les Fleurs du Mal",
      subject: "Français",
      teacher: "Mme Durand",
      type: "homework",
      dueDate: "2024-11-13",
      description: "Analyser le thème de la modernité chez Baudelaire à travers 3 poèmes au choix.",
      completed: false,
      resources: [
        { name: "Recueil Baudelaire.pdf", type: "pdf" },
        { name: "Méthodologie dissertation.docx", type: "doc" }
      ]
    },
    {
      id: 2,
      title: "Exercices sur les intégrales",
      subject: "Mathématiques", 
      teacher: "M. Martin",
      type: "homework",
      dueDate: "2024-11-15",
      description: "Résoudre les exercices 15 à 25 page 142 du manuel.",
      completed: false,
      resources: []
    },
    {
      id: 3,
      title: "Présentation TPE",
      subject: "TPE",
      teacher: "Mme Leclerc",
      type: "presentation",
      dueDate: "2024-11-20",
      description: "Présentation orale de 15 minutes sur le projet \'Énergies renouvelables\'.",
      completed: false,
      resources: [
        { name: "Grille évaluation TPE.pdf", type: "pdf" }
      ]
    },
    {
      id: 4,
      title: "Rapport de TP Optique",
      subject: "Physique",
      teacher: "M. Rousseau",
      type: "project",
      dueDate: "2024-11-18",
      description: "Rédiger le compte-rendu du TP sur la réfraction de la lumière.",
      completed: true,
      resources: []
    }
  ];

  // Mock achievements data
  const achievementsData = [
    {
      id: 1,
      name: "Premier de la classe",
      description: "Obtenir la meilleure moyenne de la classe",
      category: "academic",
      rarity: "rare",
      earned: true,
      earnedDate: "2024-10-15",
      criteria: "Moyenne générale supérieure à tous les autres élèves",
      progress: 100
    },
    {
      id: 2,
      name: "Participation exemplaire",
      description: "Participer activement pendant un mois complet",
      category: "participation",
      rarity: "common",
      earned: true,
      earnedDate: "2024-11-01",
      criteria: "Prendre la parole au moins une fois par cours pendant 4 semaines",
      progress: 100
    },
    {
      id: 3,
      name: "Mentor mathématique",
      description: "Aider 5 camarades en difficulté en mathématiques",
      category: "behavior",
      rarity: "epic",
      earned: false,
      criteria: "Apporter une aide significative à 5 élèves différents",
      progress: 60
    },
    {
      id: 4,
      name: "Perfectionniste",
      description: "Obtenir 5 notes supérieures à 18/20 consécutives",
      category: "academic",
      rarity: "legendary",
      earned: false,
      criteria: "Série de 5 évaluations avec note ≥ 18/20",
      progress: 80
    },
    {
      id: 5,
      name: "Présence parfaite",
      description: "Aucune absence pendant un trimestre",
      category: "behavior",
      rarity: "rare",
      earned: false,
      criteria: "0 absence et 0 retard pendant 3 mois",
      progress: 85
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePhotoUpdate = (newPhotoUrl) => {
    // Handle photo update logic here
    console.log('Photo updated:', newPhotoUrl);
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <ProfileCard 
              student={studentData}
              onPhotoUpdate={handlePhotoUpdate}
            />
            <BehaviorAssessment behaviorData={behaviorData} />
          </div>
        );
      
      case 'grades':
        return (
          <div className="space-y-6">
            <GradesPanel grades={gradesData} />
            <AchievementBadges achievements={achievementsData} />
          </div>
        );
      
      case 'assignments':
        return <UpcomingAssignments assignments={assignmentsData} />;
      
      case 'attendance':
        return <AttendanceCalendar attendanceData={attendanceData} />;
      
      case 'schedule':
        return (
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              📅 Emploi du temps
            </h3>
            <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
          </div>
        );
      
      case 'documents':
        return (
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              📄 Mes documents
            </h3>
            <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
          </div>
        );
      
      case 'messages':
        return (
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              💬 Messages
            </h3>
            <p className="text-muted-foreground">Fonctionnalité en cours de développement...</p>
          </div>
        );
      
      default:
        // Dashboard complet
        return (
          <>
            {/* Profile Card */}
            <ProfileCard 
              student={studentData}
              onPhotoUpdate={handlePhotoUpdate}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Grades and Assignments */}
              <div className="xl:col-span-2 space-y-6">
                <GradesPanel grades={gradesData} />
                <UpcomingAssignments assignments={assignmentsData} />
              </div>

              {/* Right Column - Attendance and Notifications */}
              <div className="space-y-6">
                <AttendanceCalendar attendanceData={attendanceData} />
                <NotificationsPanel notifications={notificationsData} />
              </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BehaviorAssessment behaviorData={behaviorData} />
              <AchievementBadges achievements={achievementsData} />
            </div>
          </>
        );
    }
  };

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userRole="student" 
          userName="Chargement..."
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Sidebar 
          userRole="student"
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={`pt-16 transition-all duration-state ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="p-4 lg:p-6 space-y-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Chargement de vos données...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="student" 
        userName={studentData?.name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar 
        userRole="student"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-state ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-4 lg:p-6 space-y-6">
          {/* Demo Mode Banner */}
          {isDemo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="alert-triangle" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-heading font-heading-semibold text-yellow-800 dark:text-yellow-400">
                    Mode Démonstration
                  </p>
                  <p className="font-body font-body-normal text-sm text-yellow-700 dark:text-yellow-500">
                    Vous consultez actuellement des données de démonstration. Connectez-vous pour accéder à vos vraies données.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="alert-circle" className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-heading font-heading-semibold text-red-800 dark:text-red-400">
                    Erreur de chargement
                  </p>
                  <p className="font-body font-body-normal text-sm text-red-700 dark:text-red-500">
                    {error} - Affichage des données de démonstration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, {studentData?.name?.split(' ')?.[0]} ! 👋
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Voici un aperçu de votre parcours scolaire aujourd'hui.
                </p>
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

          {/* Tab Content */}
          {renderTabContent()}

          {/* Quick Actions - Toujours visible */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/student-dashboard?tab=profile"
                className="flex flex-col items-center p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-micro group"
              >
                <Icon name="User" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Mon profil
                </span>
              </Link>
              
              <Link
                to="/student-dashboard?tab=grades"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="FileBarChart" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Mes notes
                </span>
              </Link>

              <Link
                to="/student-dashboard?tab=assignments"
                className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group"
              >
                <Icon name="FileText" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Mes devoirs
                </span>
              </Link>

              <Link
                to="/student-dashboard?tab=schedule"
                className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group"
              >
                <Icon name="Calendar" size={24} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Emploi du temps
                </span>
              </Link>

              <Link
                to="/student-dashboard?tab=messages"
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-micro group"
              >
                <Icon name="MessageSquare" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Messages
                </span>
              </Link>

              <Link
                to="/student-dashboard?tab=documents"
                className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group"
              >
                <Icon name="Library" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Documents
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;