import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';

import ChildSelector from './components/ChildSelector';
import ChildOverviewCard from './components/ChildOverviewCard';
import AttendanceTracker from './components/AttendanceTracker';
import GradesOverview from './components/GradesOverview';
import PaymentStatus from './components/PaymentStatus';
import CommunicationCenter from './components/CommunicationCenter';
import UpcomingEvents from './components/UpcomingEvents';

const ParentDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock parent data with multi-school children
  const parentData = {
    id: "parent-001",
    name: "Kamga Geraldo",
    phone: "+237 677 11 22 33",
    children: [
      {
        id: "child-001",
        name: "Paul Kamga",
        matricule: "CM-E-2025-0002",
        class: "Terminale C",
        school: "Lycée Bilingue Biyem-Assi",
        schoolId: "school-001",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        averageGrade: 14.8,
        attendanceRate: 92,
        unreadNotifications: 3,
        pendingPayments: 1
      },
      {
        id: "child-002",
        name: "Aminata Kamga",
        matricule: "CM-E-2025-0003", 
        class: "2nde A",
        school: "Collège La Rochelle Douala",
        schoolId: "school-002",
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        averageGrade: 16.2,
        attendanceRate: 96,
        unreadNotifications: 1,
        pendingPayments: 0
      }
    ]
  };

  // Mock grades data by child
  const gradesData = {
    "child-001": [
      { 
        id: 1, 
        subject: "Mathématiques", 
        average: 15.5, 
        coefficient: 7,
        lastGrade: { value: 16, date: "12/11/2024", type: "Contrôle" },
        trend: "up"
      },
      { 
        id: 2, 
        subject: "Physique", 
        average: 14.2, 
        coefficient: 6,
        lastGrade: { value: 13, date: "08/11/2024", type: "TP" },
        trend: "down"
      },
      { 
        id: 3, 
        subject: "Français", 
        average: 13.8, 
        coefficient: 5,
        lastGrade: { value: 14, date: "05/11/2024", type: "Dissertation" },
        trend: "stable"
      }
    ],
    "child-002": [
      { 
        id: 4, 
        subject: "Mathématiques", 
        average: 17.2, 
        coefficient: 6,
        lastGrade: { value: 18, date: "10/11/2024", type: "Contrôle" },
        trend: "up"
      },
      { 
        id: 5, 
        subject: "Histoire", 
        average: 15.8, 
        coefficient: 4,
        lastGrade: { value: 16, date: "07/11/2024", type: "Exposé" },
        trend: "up"
      },
      { 
        id: 6, 
        subject: "Anglais", 
        average: 16.5, 
        coefficient: 4,
        lastGrade: { value: 17, date: "04/11/2024", type: "Expression" },
        trend: "stable"
      }
    ]
  };

  // Mock attendance data by child
  const attendanceData = {
    "child-001": {
      "2024-11-01": "present",
      "2024-11-02": "present",
      "2024-11-03": "absent",
      "2024-11-04": "present", 
      "2024-11-05": "late",
      "2024-11-06": "present",
      "2024-11-07": "present",
      "2024-11-08": "present",
      "2024-11-09": "absent",
      "2024-11-10": "present",
      "2024-11-11": "present",
      "2024-11-12": "present"
    },
    "child-002": {
      "2024-11-01": "present",
      "2024-11-02": "present",
      "2024-11-03": "present",
      "2024-11-04": "present", 
      "2024-11-05": "present",
      "2024-11-06": "present",
      "2024-11-07": "present",
      "2024-11-08": "late",
      "2024-11-09": "present",
      "2024-11-10": "present",
      "2024-11-11": "present",
      "2024-11-12": "present"
    }
  };

  // Mock payment data by child
  const paymentData = {
    "child-001": [
      {
        id: "pay-001",
        type: "Frais de scolarité",
        amount: 150000,
        status: "pending",
        dueDate: "2024-11-30",
        provider: "MTN Mobile Money",
        description: "Frais scolaires T1 2024-2025"
      }
    ],
    "child-002": [
      {
        id: "pay-002",
        type: "Frais de scolarité",
        amount: 120000,
        status: "completed",
        paidDate: "2024-10-15",
        provider: "Orange Money",
        description: "Frais scolaires T1 2024-2025"
      }
    ]
  };

  // Mock notifications data by child
  const notificationsData = {
    "child-001": [
      {
        id: "notif-001",
        title: "Nouvelle note disponible",
        message: "Note de contrôle de mathématiques : 16/20",
        type: "grades",
        school: "Lycée Bilingue Biyem-Assi",
        date: "2024-11-12",
        read: false,
        priority: "medium"
      },
      {
        id: "notif-002",
        title: "Absence non justifiée",
        message: "Absence du 03/11/2024 nécessite une justification",
        type: "absences",
        school: "Lycée Bilingue Biyem-Assi",
        date: "2024-11-03",
        read: false,
        priority: "high"
      }
    ],
    "child-002": [
      {
        id: "notif-003",
        title: "Réunion parents-professeurs",
        message: "Réunion programmée le 20/11/2024 à 16h00",
        type: "meetings",
        school: "Collège La Rochelle Douala",
        date: "2024-11-10",
        read: false,
        priority: "medium"
      }
    ]
  };

  // Mock upcoming events data
  const upcomingEvents = [
    {
      id: "event-001",
      title: "Réunion parents-professeurs",
      school: "Lycée Bilingue Biyem-Assi",
      child: "Paul Kamga",
      date: "2024-11-20",
      time: "16:00",
      location: "Salle des conférences",
      type: "meeting"
    },
    {
      id: "event-002", 
      title: "Remise des bulletins",
      school: "Collège La Rochelle Douala",
      child: "Aminata Kamga",
      date: "2024-11-25",
      time: "10:00",
      location: "Cour principale",
      type: "ceremony"
    },
    {
      id: "event-003",
      title: "Sortie pédagogique - Musée",
      school: "Lycée Bilingue Biyem-Assi", 
      child: "Paul Kamga",
      date: "2024-12-02",
      time: "08:00",
      location: "Musée National",
      type: "excursion"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set first child as selected by default
    if (parentData?.children?.length > 0 && !selectedChild) {
      setSelectedChild(parentData?.children?.[0]);
      setSelectedSchool(parentData?.children?.[0]?.schoolId);
    }
  }, []);

  const handleChildSelect = (child) => {
    setSelectedChild(child);
    setSelectedSchool(child?.schoolId);
  };

  const handleSchoolChange = (schoolId) => {
    setSelectedSchool(schoolId);
    // If the current selected child is not from this school, 
    // select the first child from this school
    const childrenFromSchool = parentData?.children?.filter(child => child?.schoolId === schoolId);
    if (childrenFromSchool?.length > 0 && selectedChild?.schoolId !== schoolId) {
      setSelectedChild(childrenFromSchool?.[0]);
    }
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getAllNotifications = () => {
    return Object?.values(notificationsData)?.flat()?.sort((a, b) => new Date(b?.date) - new Date(a?.date));
  };

  const getUnreadCount = () => {
    return getAllNotifications()?.filter(n => !n?.read)?.length;
  };

  const getSchools = () => {
    const schools = [...new Set(parentData?.children?.map(child => ({
      id: child?.schoolId,
      name: child?.school
    })))];
    return schools?.reduce((acc, school) => {
      const existing = acc?.find(s => s?.id === school?.id);
      if (!existing) acc?.push(school);
      return acc;
    }, []);
  };

  const getChildrenBySchool = (schoolId) => {
    return parentData?.children?.filter(child => child?.schoolId === schoolId) || [];
  };

  return (
    <div className="min-h-screen bg-background">
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
      }`}>
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, M./Mme {parentData?.name?.split(' ')?.[1]} ! 👋
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Suivez le parcours scolaire de vos enfants et restez informé(e) de leur progression.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {parentData?.children?.length} enfant{parentData?.children?.length > 1 ? 's' : ''}
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

          {/* Multi-School Child Selector */}
          <ChildSelector
            children={parentData?.children}
            schools={getSchools()}
            selectedChild={selectedChild}
            selectedSchool={selectedSchool}
            onChildSelect={handleChildSelect}
            onSchoolChange={handleSchoolChange}
            getChildrenBySchool={getChildrenBySchool}
          />

          {/* Selected Child Overview */}
          {selectedChild && (
            <ChildOverviewCard child={selectedChild} />
          )}

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
                <Icon name="Users" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Profils enfants
                </span>
              </Link>
              
              <Link
                to="/grade-management-system"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="FileBarChart" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Notes et bulletins
                </span>
              </Link>

              <Link
                to="/parent-dashboard?tab=payments"
                className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group"
              >
                <Icon name="CreditCard" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Paiements
                </span>
              </Link>

              <Link
                to="/parent-dashboard?tab=messages"
                className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group"
              >
                <Icon name="MessageSquare" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Messages
                </span>
              </Link>

              <Link
                to="/parent-dashboard?tab=calendar"
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-micro group"
              >
                <Icon name="Calendar" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Calendrier
                </span>
              </Link>

              <Link
                to="/parent-dashboard?tab=attendance"
                className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group"
              >
                <Icon name="UserCheck" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Présences
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;