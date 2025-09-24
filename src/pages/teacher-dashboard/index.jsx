import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';

import ClassSelector from './components/ClassSelector';
import AssignedClassesOverview from './components/AssignedClassesOverview';
import GradeEntryPanel from './components/GradeEntryPanel';
import DocumentManager from './components/DocumentManager';
import AttendanceManager from './components/AttendanceManager';
import StudentCommunication from './components/StudentCommunication';
import TeacherSchedule from './components/TeacherSchedule';

const TeacherDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock teacher data with assigned classes
  const teacherData = {
    id: "teacher-001",
    name: "Mme Tchoukoua Rose",
    email: "rose.tchoukoua@demo.cm",
    specialty: "Mathématiques",
    employeeId: "ENS-2024-001",
    assignedClasses: [
      {
        id: "class-001",
        name: "3ème A",
        level: "3ème",
        school: "Lycée Bilingue Biyem-Assi",
        subject: "Mathématiques",
        students: 28,
        schedule: [
          { day: "Lundi", time: "08:00-09:30", room: "Salle 12" },
          { day: "Mercredi", time: "10:00-11:30", room: "Salle 12" },
          { day: "Vendredi", time: "14:00-15:30", room: "Salle 15" }
        ]
      },
      {
        id: "class-002", 
        name: "Terminale D",
        level: "Terminale",
        school: "Lycée Bilingue Biyem-Assi",
        subject: "Mathématiques",
        students: 32,
        schedule: [
          { day: "Mardi", time: "08:00-09:30", room: "Salle 18" },
          { day: "Jeudi", time: "10:00-11:30", room: "Salle 18" },
          { day: "Samedi", time: "08:00-09:30", room: "Salle 20" }
        ]
      },
      {
        id: "class-003",
        name: "2nde C", 
        level: "2nde",
        school: "Lycée Bilingue Biyem-Assi",
        subject: "Mathématiques",
        students: 25,
        schedule: [
          { day: "Lundi", time: "10:00-11:30", room: "Salle 10" },
          { day: "Mercredi", time: "14:00-15:30", room: "Salle 10" },
          { day: "Vendredi", time: "08:00-09:30", room: "Salle 12" }
        ]
      }
    ]
  };

  // Mock students data by class
  const studentsData = {
    "class-001": [
      { 
        id: "student-001", 
        name: "Ngatcha Etienne", 
        matricule: "CM-E-2025-0001", 
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        recentGrades: [
          { subject: "Mathématiques", grade: 16, date: "2024-11-10", type: "Contrôle" },
          { subject: "Mathématiques", grade: 14, date: "2024-11-05", type: "DM" }
        ],
        attendance: { present: 22, absent: 2, late: 1 }
      },
      { 
        id: "student-002", 
        name: "Mballa Sarah", 
        matricule: "CM-E-2025-0002", 
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        recentGrades: [
          { subject: "Mathématiques", grade: 18, date: "2024-11-10", type: "Contrôle" },
          { subject: "Mathématiques", grade: 17, date: "2024-11-05", type: "DM" }
        ],
        attendance: { present: 24, absent: 1, late: 0 }
      }
    ],
    "class-002": [
      { 
        id: "student-003", 
        name: "Fotso Paul", 
        matricule: "CM-E-2025-0003", 
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        recentGrades: [
          { subject: "Mathématiques", grade: 15, date: "2024-11-12", type: "Contrôle" },
          { subject: "Mathématiques", grade: 16, date: "2024-11-08", type: "DM" }
        ],
        attendance: { present: 23, absent: 1, late: 1 }
      }
    ],
    "class-003": [
      { 
        id: "student-004", 
        name: "Onana Marie", 
        matricule: "CM-E-2025-0004", 
        photo: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
        recentGrades: [
          { subject: "Mathématiques", grade: 17, date: "2024-11-11", type: "Contrôle" },
          { subject: "Mathématiques", grade: 15, date: "2024-11-07", type: "DM" }
        ],
        attendance: { present: 25, absent: 0, late: 0 }
      }
    ]
  };

  // Mock documents data by class
  const documentsData = {
    "class-001": [
      {
        id: "doc-001",
        title: "Chapitre 5 - Fonctions Dérivées",
        subject: "Mathématiques",
        type: "Course",
        uploadDate: "2024-11-08",
        fileSize: "2.3 MB",
        downloads: 24,
        visibility: "students_parents"
      },
      {
        id: "doc-002", 
        title: "Contrôle N°2 - Corrigé",
        subject: "Mathématiques",
        type: "Correction",
        uploadDate: "2024-11-12",
        fileSize: "1.8 MB",
        downloads: 18,
        visibility: "students"
      }
    ],
    "class-002": [
      {
        id: "doc-003",
        title: "Préparation BAC - Intégrales",
        subject: "Mathématiques", 
        type: "Exercise",
        uploadDate: "2024-11-10",
        fileSize: "3.1 MB",
        downloads: 28,
        visibility: "students"
      }
    ],
    "class-003": [
      {
        id: "doc-004",
        title: "Trigonométrie - Exercices",
        subject: "Mathématiques",
        type: "Exercise", 
        uploadDate: "2024-11-09",
        fileSize: "1.5 MB",
        downloads: 22,
        visibility: "students_parents"
      }
    ]
  };

  // Mock upcoming schedule
  const upcomingSchedule = [
    {
      id: "schedule-001",
      className: "3ème A",
      subject: "Mathématiques",
      date: "2024-11-19",
      time: "08:00-09:30",
      room: "Salle 12",
      topic: "Fonctions Linéaires",
      type: "course"
    },
    {
      id: "schedule-002",
      className: "Terminale D", 
      subject: "Mathématiques",
      date: "2024-11-19",
      time: "10:00-11:30",
      room: "Salle 18", 
      topic: "Contrôle Intégrales",
      type: "evaluation"
    },
    {
      id: "schedule-003",
      className: "2nde C",
      subject: "Mathématiques",
      date: "2024-11-19", 
      time: "14:00-15:30",
      room: "Salle 10",
      topic: "Géométrie dans l\'espace",
      type: "course"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set first class as selected by default
    if (teacherData?.assignedClasses?.length > 0 && !selectedClass) {
      setSelectedClass(teacherData?.assignedClasses?.[0]);
      setSelectedSubject(teacherData?.assignedClasses?.[0]?.subject);
    }
  }, []);

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    setSelectedSubject(classData?.subject);
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";  
    return "Bonsoir";
  };

  const getTotalStudents = () => {
    return teacherData?.assignedClasses?.reduce((total, cls) => total + cls?.students, 0);
  };

  const getCurrentWeekSchedule = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek?.setDate(today?.getDate() - today?.getDay() + 1); // Monday
    
    return upcomingSchedule?.filter(schedule => {
      const scheduleDate = new Date(schedule?.date);
      const diffTime = scheduleDate - startOfWeek;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="teacher" 
        userName={teacherData?.name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar 
        userRole="teacher"
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
                  {getGreeting()}, {teacherData?.name} ! 👩‍🏫
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Gérez vos classes, évaluations et documents pédagogiques efficacement.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {teacherData?.assignedClasses?.length} classe{teacherData?.assignedClasses?.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {getTotalStudents()} élèves
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {teacherData?.specialty}
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

          {/* Class Selector */}
          <ClassSelector
            classes={teacherData?.assignedClasses}
            selectedClass={selectedClass}
            onClassSelect={handleClassSelect}
          />

          {/* Assigned Classes Overview */}
          <AssignedClassesOverview 
            classes={teacherData?.assignedClasses}
            selectedClass={selectedClass}
          />

          {/* Main Dashboard Content */}
          {selectedClass && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Grade Entry and Attendance */}
              <div className="xl:col-span-2 space-y-6">
                <GradeEntryPanel 
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.id] || []}
                />
                <AttendanceManager
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.id] || []}
                />
              </div>

              {/* Right Column - Documents and Communication */}
              <div className="space-y-6">
                <DocumentManager 
                  classData={selectedClass}
                  documents={documentsData?.[selectedClass?.id] || []}
                />
                <StudentCommunication 
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.id] || []}
                />
              </div>
            </div>
          )}

          {/* Teacher Schedule */}
          <TeacherSchedule 
            schedule={getCurrentWeekSchedule()}
            teacherName={teacherData?.name}
          />

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions Rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/grade-management-system"
                className="flex flex-col items-center p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-micro group"
              >
                <Icon name="BookOpen" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Notes et évaluations
                </span>
              </Link>
              
              <Link
                to="/document-management-hub"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="FileText" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Documents de cours
                </span>
              </Link>

              <Link
                to="/teacher-dashboard?tab=attendance"
                className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group"
              >
                <Icon name="Calendar" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Présences
                </span>
              </Link>

              <Link
                to="/teacher-dashboard?tab=schedule"
                className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group"
              >
                <Icon name="Clock" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Planning des cours
                </span>
              </Link>

              <Link
                to="/teacher-dashboard?tab=communication"
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-micro group"
              >
                <Icon name="MessageSquare" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Communication
                </span>
              </Link>

              <Link
                to="/teacher-dashboard?tab=reports"
                className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group"
              >
                <Icon name="FileBarChart" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Rapports
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;