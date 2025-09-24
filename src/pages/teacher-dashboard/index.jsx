
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/edutrackService';
import ClassSelector from './components/ClassSelector';
import AssignedClassesOverview from './components/AssignedClassesOverview';
import GradeEntryPanel from './components/GradeEntryPanel';
import DocumentManager from './components/DocumentManager';
import AttendanceManager from './components/AttendanceManager';
import StudentCommunication from './components/StudentCommunication';
import TeacherSchedule from './components/TeacherSchedule';

const TeacherDashboard = () => {

  const { userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [studentsData, setStudentsData] = useState({});
  const [documentsData, setDocumentsData] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teacher assignments and related data
  useEffect(() => {
    if (!userProfile?.id || userProfile?.role !== 'teacher') return;
    setLoading(true);
    const fetchData = async () => {
      // 1. Fetch assigned classes
      const assignmentsResult = await teacherService.getTeacherAssignments(userProfile.id, userProfile.current_school_id);
      const assignments = assignmentsResult?.success ? assignmentsResult.data : [];
      setAssignedClasses(assignments);

      // 2. Set default selected class
      if (assignments.length > 0 && !selectedClass) {
        setSelectedClass(assignments[0]);
        setSelectedSubject(assignments[0]?.subject);
      }

      // 3. Fetch students for each class
      const studentsByClass = {};
      for (const cls of assignments) {
        // Fetch students for this class
        const { data: students } = await studentService.getStudents();
        studentsByClass[cls.class_name] = students.filter(s => s.current_class === cls.class_name);
      }
      setStudentsData(studentsByClass);

      // 4. Fetch documents for each class
      const docsByClass = {};
      for (const cls of assignments) {
        const docsResult = await teacherService.getTeacherDocuments(userProfile.id, { class_name: cls.class_name, subject: cls.subject });
        docsByClass[cls.class_name] = docsResult?.success ? docsResult.data : [];
      }
      setDocumentsData(docsByClass);

      // 5. Build schedule (flatten all class schedules)
      // For now, fake schedule based on assignments (should be fetched from DB if available)
      const weekSchedule = assignments.flatMap(cls =>
        (cls.schedule || []).map(slot => ({
          ...slot,
          className: cls.class_name,
          subject: cls.subject,
          // Add more fields as needed
        }))
      );
      setSchedule(weekSchedule);

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

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    setSelectedSubject(classData?.subject);
  };

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getTotalStudents = () => {
    return assignedClasses?.reduce((total, cls) => total + (studentsData?.[cls.class_name]?.length || 0), 0);
  };

  const getCurrentWeekSchedule = () => {
    // For now, just return all schedule items (should be filtered by week)
    return schedule;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="teacher"
        userName={userProfile?.full_name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar
        userRole="teacher"
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
                  {getGreeting()}, {userProfile?.full_name} ! 👩‍🏫
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  Gérez vos classes, évaluations et documents pédagogiques efficacement.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {assignedClasses?.length} classe{assignedClasses?.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {getTotalStudents()} élèves
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {userProfile?.specialty || userProfile?.subject || ''}
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

          {/* Class Selector */}
          <ClassSelector
            classes={assignedClasses}
            selectedClass={selectedClass}
            onClassSelect={handleClassSelect}
          />

          {/* Assigned Classes Overview */}
          <AssignedClassesOverview
            classes={assignedClasses}
            selectedClass={selectedClass}
          />

          {/* Main Dashboard Content */}
          {selectedClass && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Grade Entry and Attendance */}
              <div className="xl:col-span-2 space-y-6">
                <GradeEntryPanel
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.class_name] || []}
                />
                <AttendanceManager
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.class_name] || []}
                />
              </div>

              {/* Right Column - Documents and Communication */}
              <div className="space-y-6">
                <DocumentManager
                  classData={selectedClass}
                  documents={documentsData?.[selectedClass?.class_name] || []}
                />
                <StudentCommunication
                  classData={selectedClass}
                  students={studentsData?.[selectedClass?.class_name] || []}
                />
              </div>
            </div>
          )}

          {/* Teacher Schedule */}
          <TeacherSchedule
            schedule={getCurrentWeekSchedule()}
            teacherName={userProfile?.full_name}
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
                  Saisie Notes
                </span>
              </Link>

              <Link
                to="/document-management-hub"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="FileText" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Documents
                </span>
              </Link>

              <button className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group">
                <Icon name="Calendar" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Présences
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group">
                <Icon name="MessageSquare" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Messages
                </span>
              </button>

              <button className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group">
                <Icon name="BarChart3" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Statistiques
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

export default TeacherDashboard;