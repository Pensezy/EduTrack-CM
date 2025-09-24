
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { studentService, gradeService, absenceService, notificationService } from '../../services/edutrackService';
import ProfileCard from './components/ProfileCard';
import GradesPanel from './components/GradesPanel';
import AttendanceCalendar from './components/AttendanceCalendar';
import BehaviorAssessment from './components/BehaviorAssessment';
import NotificationsPanel from './components/NotificationsPanel';
import UpcomingAssignments from './components/UpcomingAssignments';
import AchievementBadges from './components/AchievementBadges';

const StudentDashboard = () => {

  const { userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentData, setStudentData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [behaviorData, setBehaviorData] = useState(null);
  const [notificationsData, setNotificationsData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [achievementsData, setAchievementsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id || userProfile?.role !== 'student') return;
    setLoading(true);
    const fetchData = async () => {
      // 1. Student info
      const { data: student } = await studentService.getStudentById(userProfile.id);
      setStudentData(student);

      // 2. Grades
      const { data: grades } = await gradeService.getGradesByStudent(userProfile.id);
      setGradesData(grades);

      // 3. Attendance
      const { data: absences } = await absenceService.getAbsencesByStudent(userProfile.id);
      // Convert absences to attendanceData format
      const attendance = {};
      absences?.forEach(a => {
        attendance[a.date_absence] = a.justified ? 'excused' : (a.justified === false && a.justified_by ? 'absent' : 'present');
      });
      setAttendanceData(attendance);

      // 4. Notifications
      const { data: notifications } = await notificationService.getNotificationsByUser(userProfile.id);
      setNotificationsData(notifications);

      // 5. Assignments (simulate with grades for now, or fetch from a dedicated table if exists)
      setAssignmentsData([]); // TODO: Replace with real assignments fetch if available

      // 6. Behavior & Achievements (simulate for now)
      setBehaviorData(null); // TODO: Replace with real behavior fetch if available
      setAchievementsData([]); // TODO: Replace with real achievements fetch if available

      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [userProfile]);

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
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName={studentData?.user?.full_name || studentData?.full_name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar
        userRole="student"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-state ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 lg:p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, {studentData?.user?.full_name?.split(' ')?.[0] || studentData?.full_name?.split(' ')?.[0]} ! 👋
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
                <Icon name="User" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Mon Profil
                </span>
              </Link>

              <Link
                to="/grade-management-system"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="BookOpen" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Mes Notes
                </span>
              </Link>

              <button className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group">
                <Icon name="Calendar" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Emploi du Temps
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group">
                <Icon name="MessageSquare" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Messages
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group">
                <Icon name="HelpCircle" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Aide
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-micro group">
                <Icon name="Settings" size={24} className="text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
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

export default StudentDashboard;