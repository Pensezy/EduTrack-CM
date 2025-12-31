import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';
import useRoleSession from '../../hooks/useRoleSession';

import ProfileCard from './components/ProfileCard';
import GradesPanel from './components/GradesPanel';
import AttendanceCalendar from './components/AttendanceCalendar';
import BehaviorAssessment from './components/BehaviorAssessment';
import NotificationsPanel from './components/NotificationsPanel';
import UpcomingAssignments from './components/UpcomingAssignments';
import AchievementBadges from './components/AchievementBadges';
import ParentInfoCard from './components/ParentInfoCard';

const StudentDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [messageTab, setMessageTab] = useState('received'); // 'received', 'sent', 'archived'
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [documentTab, setDocumentTab] = useState('received'); // 'received', 'assignments', 'admin'
  
  // NOUVEAU : Charger la session spécifique à l'étudiant
  const { user: studentUser, loading: sessionLoading, error: sessionError } = useRoleSession('student');
  const { user: authUser } = useAuth();
  
  // Utiliser prioritairement la session étudiant
  const user = studentUser || authUser;

  console.log('🔑 Student Session:', studentUser?.email || 'Non trouvée');
  console.log('🔑 AuthContext user:', authUser?.email);
  console.log('🔑 Utilisateur actif:', user?.email);

  // Utiliser le nouveau hook unifié pour récupérer les données
  const {
    loading,
    error,
    studentProfile,
    stats,
    grades: fetchedGrades,
    attendance: fetchedAttendance,
    assignments: fetchedAssignments,
    notifications: fetchedNotifications,
    achievements: fetchedAchievements,
    behavior: fetchedBehavior,
    schedule: fetchedSchedule,
    refreshData,
    markNotificationAsRead: markAsRead,
    getGradesBySubject,
    getAttendanceStats,
    getAssignmentsByStatus,
    getUnreadNotifications
  } = useStudentDashboardData(user?.id);

  // Transformer les données pour correspondre au format attendu par les composants
  const studentData = studentProfile ? {
    name: studentProfile.full_name || `${studentProfile.first_name} ${studentProfile.last_name}`,
    studentId: studentProfile.id,
    class: studentProfile.class?.name || 'Non assigné',
    academicYear: "2024-2025",
    photo: studentProfile.photo_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    stats: {
      averageGrade: stats?.averageGrade || "0.00",
      attendanceRate: parseFloat(stats?.attendanceRate || "0"),
      assignmentsDue: fetchedAssignments.filter(a => a.status === 'pending').length || 0
    }
  } : null;

  console.log('👤 Student Dashboard - User ID:', user?.id);
  console.log('👤 Student Dashboard - Student Profile:', studentProfile);
  console.log('👤 Student Dashboard - Student Data:', studentData);

  // Transformer les données de notes pour correspondre au format attendu
  const gradesBySubject = getGradesBySubject({ schoolType: studentProfile?.school?.type });
  const gradesData = gradesBySubject.map((subjectData, index) => ({
    id: index + 1,
    name: subjectData.subject,
    average: parseFloat(subjectData.average),
    coefficient: 5, // Default coefficient
    assignments: subjectData.grades.map(g => ({
      id: g.id,
      name: g.grade_type,
      grade: g.grade,
      coefficient: g.coefficient,
      type: g.grade_type,
      date: new Date(g.date).toLocaleDateString('fr-FR')
    })),
    feedback: subjectData.grades[0]?.comment || "Continuez vos efforts"
  }));

  // Transformer les données de présence
  const attendanceData = fetchedAttendance.reduce((acc, item) => {
    acc[item.date] = item.status;
    return acc;
  }, {});

  // Utiliser les données de comportement du hook
  const behaviorData = fetchedBehavior ? {
    current: {
      overallScore: fetchedBehavior.overall_score || 0,
      categories: [
        { id: 1, name: "Participation", score: fetchedBehavior.participation || 0, description: "Participation en classe" },
        { id: 2, name: "Discipline", score: fetchedBehavior.discipline || 0, description: "Respect des règles" },
        { id: 3, name: "Respect", score: fetchedBehavior.respect || 0, description: "Respect envers les autres" },
        { id: 4, name: "Devoirs", score: fetchedBehavior.homework || 0, description: "Assiduité dans les devoirs" }
      ],
      comments: fetchedBehavior.comments || [],
      achievements: fetchedBehavior.positive_notes || []
    }
  } : null;

  // Utiliser les notifications récupérées du hook
  const notificationsData = fetchedNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    priority: n.priority || "medium",
    time: new Date(n.created_at).toLocaleString('fr-FR'),
    read: n.is_read || false,
    actionRequired: n.priority === 'high'
  }));

  // Utiliser les devoirs récupérés du hook
  const assignmentsData = fetchedAssignments.map(a => ({
    id: a.id,
    title: a.title,
    subject: a.subject,
    teacher: a.teacher_name || 'Enseignant',
    type: 'homework',
    dueDate: a.due_date,
    description: a.description,
    completed: a.status === 'completed',
    resources: []
  }));

  // Utiliser les achievements récupérés du hook
  const achievementsData = fetchedAchievements.map(a => ({
    id: a.id,
    name: a.title,
    description: a.description,
    category: a.category || 'academic',
    rarity: a.level || 'common',
    earned: true,
    earnedDate: a.earned_date,
    criteria: a.description,
    progress: 100
  }));

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
        // Vérifier si on a des données d'emploi du temps
        const hasScheduleData = fetchedSchedule && Array.isArray(fetchedSchedule) && fetchedSchedule.length > 0;
        
        return (
          <div className="space-y-6">
            {/* Header modernisé */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                  📅
                </div>
                <div>
                  <h2 className="font-heading font-heading-bold text-2xl">
                    Emploi du temps
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {hasScheduleData ? 'Votre planning hebdomadaire' : 'Aucun emploi du temps disponible'}
                  </p>
                </div>
              </div>
            </div>
            
            {!hasScheduleData ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-200 mb-4">
                  <Icon name="Calendar" size={48} className="text-purple-600" />
                </div>
                <h3 className="font-body-bold text-xl text-gray-900 mb-2">
                  Aucun emploi du temps disponible
                </h3>
                <p className="text-gray-600 font-body-medium">
                  Votre emploi du temps sera disponible une fois que votre classe aura été configurée par l'administration.
                </p>
              </div>
            ) : (
              <>
            {/* Weekly Schedule - Modernisé */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-heading-semibold text-xl text-white">
                      Semaine du {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-purple-100 text-sm mt-1">Emploi du temps complet</p>
                  </div>
                  <button className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all flex items-center space-x-2">
                    <Icon name="Download" size={18} />
                    <span className="hidden sm:inline">Télécharger</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">⏰ Horaire</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Lundi</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Mardi</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Mercredi</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Jeudi</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Vendredi</th>
                      <th className="px-4 py-4 text-left font-heading font-heading-bold text-sm text-gray-900 border-b-2 border-gray-200">Samedi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {fetchedSchedule.map((slot, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 font-caption font-caption-bold text-sm whitespace-nowrap text-gray-700 bg-gray-50">
                          {slot.start_time} - {slot.end_time}
                        </td>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                          const course = slot[day];
                          if (!course) {
                            return <td key={day} className="px-4 py-4 text-center text-gray-400 text-sm">-</td>;
                          }
                          const colors = {
                            'Mathematiques': 'from-blue-50 to-indigo-50 border-blue-500 text-blue-900',
                            'Francais': 'from-purple-50 to-pink-50 border-purple-500 text-purple-900',
                            'Physique': 'from-green-50 to-emerald-50 border-green-500 text-green-900',
                            'Histoire': 'from-orange-50 to-amber-50 border-orange-500 text-orange-900',
                            'Anglais': 'from-red-50 to-rose-50 border-red-500 text-red-900',
                            'EPS': 'from-indigo-50 to-blue-50 border-indigo-500 text-indigo-900'
                          };
                          const colorClass = colors[course.subject] || 'from-gray-50 to-slate-50 border-gray-500 text-gray-900';
                          return (
                            <td key={day} className="px-4 py-4">
                              <div className={`bg-gradient-to-br ${colorClass} border-l-4 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="font-body font-body-semibold text-sm">{course.subject}</div>
                                <div className="text-xs mt-1 flex items-center gap-1">
                                  <Icon name="User" size={10} />
                                  {course.teacher} - {course.room}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}
          </div>
        );
      
      case 'documents':
        // Documents reçus des enseignants
        const receivedDocuments = [
          {
            id: 1,
            title: 'Cours de Mathématiques - Chapitre 5',
            subject: 'Mathématiques',
            type: 'Cours',
            teacher: 'M. Nkolo',
            date: '2025-11-25',
            size: '2.4 MB',
            format: 'PDF',
            new: true
          },
          {
            id: 2,
            title: 'Exercices de Français - Grammaire',
            subject: 'Français',
            type: 'Exercices',
            teacher: 'Mme Djomo',
            date: '2025-11-24',
            size: '1.8 MB',
            format: 'PDF',
            new: false
          },
          {
            id: 3,
            title: 'Correction Examen Math',
            subject: 'Mathématiques',
            type: 'Correction',
            teacher: 'M. Nkolo',
            date: '2025-11-19',
            size: '945 KB',
            format: 'PDF',
            new: false
          },
          {
            id: 4,
            title: 'TP Physique - Optique',
            subject: 'Physique',
            type: 'TP',
            teacher: 'M. Fouda',
            date: '2025-11-21',
            size: '1.2 MB',
            format: 'PDF',
            new: false
          },
          {
            id: 5,
            title: 'Cours - La Guerre Froide',
            subject: 'Histoire-Géographie',
            type: 'Cours',
            teacher: 'M. Kamga',
            date: '2025-11-22',
            size: '1.5 MB',
            format: 'PDF',
            new: true
          }
        ];

        // Devoirs à rendre
        const assignments = [
          {
            id: 1,
            title: 'Devoir de Mathématiques - Équations',
            subject: 'Mathématiques',
            teacher: 'M. Nkolo',
            dueDate: '2025-12-02',
            status: 'pending',
            hasSubmitted: false,
            maxSize: '5 MB',
            allowedFormats: ['PDF', 'DOCX']
          },
          {
            id: 2,
            title: 'Dissertation de Français',
            subject: 'Français',
            teacher: 'Mme Djomo',
            dueDate: '2025-12-05',
            status: 'pending',
            hasSubmitted: false,
            maxSize: '5 MB',
            allowedFormats: ['PDF', 'DOCX']
          },
          {
            id: 3,
            title: 'Compte-rendu TP Physique',
            subject: 'Physique',
            teacher: 'M. Fouda',
            dueDate: '2025-11-28',
            status: 'submitted',
            hasSubmitted: true,
            submittedDate: '2025-11-27',
            submittedFile: 'CR_Physique_Optique.pdf',
            maxSize: '5 MB',
            allowedFormats: ['PDF']
          }
        ];

        // Documents administratifs
        const adminDocuments = [
          {
            id: 1,
            title: 'Bulletin Scolaire - Trimestre 1',
            type: 'Bulletin',
            date: '2025-11-20',
            size: '320 KB',
            format: 'PDF'
          },
          {
            id: 2,
            title: 'Certificat de Scolarité 2025-2026',
            type: 'Certificat',
            date: '2025-09-15',
            size: '180 KB',
            format: 'PDF'
          },
          {
            id: 3,
            title: 'Calendrier Scolaire',
            type: 'Calendrier',
            date: '2025-09-01',
            size: '412 KB',
            format: 'PDF'
          }
        ];

        return (
          <div className="space-y-6">
            {/* Header modernisé */}
            <div className="bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    📄
                  </div>
                  <div>
                    <h2 className="font-heading font-heading-bold text-2xl">
                      Mes Documents
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                      Cours, devoirs et documents officiels
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs et contenu - Modernisé */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="border-b-2 border-gray-100">
                <nav className="flex -mb-0.5 px-2">
                  <button
                    onClick={() => setDocumentTab('received')}
                    className={`px-6 py-4 text-sm font-body font-body-semibold border-b-4 transition-all duration-300 ${
                      documentTab === 'received'
                        ? 'border-blue-600 text-blue-900 bg-blue-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="BookOpen" size={18} />
                      <span>Documents reçus</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        documentTab === 'received' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {receivedDocuments.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setDocumentTab('assignments')}
                    className={`px-6 py-4 text-sm font-body font-body-semibold border-b-4 transition-all duration-300 ${
                      documentTab === 'assignments'
                        ? 'border-orange-600 text-orange-900 bg-orange-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Upload" size={18} />
                      <span>Mes devoirs</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        documentTab === 'assignments'
                          ? 'bg-orange-600 text-white animate-pulse' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {assignments.filter(a => !a.hasSubmitted).length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setDocumentTab('admin')}
                    className={`px-6 py-4 text-sm font-body font-body-semibold border-b-4 transition-all duration-300 ${
                      documentTab === 'admin'
                        ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={18} />
                      <span>Documents administratifs</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        documentTab === 'admin' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {adminDocuments.length}
                      </span>
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {documentTab === 'received' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">
                        Documents mis à disposition par vos enseignants
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full">
                          {receivedDocuments.filter(d => d.new).length} nouveaux
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Document
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Enseignant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Taille
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-body font-body-medium text-muted-foreground uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {receivedDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
                                    <Icon name="FileText" size={20} className="text-blue-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-body font-body-medium text-card-foreground">{doc.title}</div>
                                      {doc.new && (
                                        <span className="px-2 py-1 text-xs font-body font-body-semibold text-green-600 bg-green-100 rounded-full">
                                          Nouveau
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{doc.subject}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-body font-body-semibold text-purple-600 bg-purple-100 rounded-full">
                                  {doc.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                                {doc.teacher}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {new Date(doc.date).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {doc.size}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Icon name="Eye" size={18} />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Icon name="Download" size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {documentTab === 'assignments' && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Déposez vos devoirs avant la date limite
                      </p>
                    </div>
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`border-2 rounded-lg p-6 ${
                            assignment.hasSubmitted
                              ? 'border-green-200 bg-green-50'
                              : 'border-orange-200 bg-orange-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
                                  {assignment.title}
                                </h3>
                                {assignment.hasSubmitted ? (
                                  <span className="px-3 py-1 text-xs font-body font-body-semibold text-green-700 bg-green-200 rounded-full flex items-center gap-1">
                                    <Icon name="CheckCircle" size={16} />
                                    Rendu
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs font-body font-body-semibold text-orange-700 bg-orange-200 rounded-full flex items-center gap-1">
                                    <Icon name="Clock" size={16} />
                                    À rendre
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-sm text-gray-700">
                                  <span className="flex items-center gap-1">
                                    <Icon name="BookOpen" size={16} />
                                    {assignment.subject}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="User" size={16} />
                                    {assignment.teacher}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Icon name="Calendar" size={16} />
                                    Date limite: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Formats acceptés: {assignment.allowedFormats.join(', ')} | Taille max: {assignment.maxSize}
                                </div>
                                {assignment.hasSubmitted && (
                                  <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                      <Icon name="FileCheck" size={20} className="text-green-600" />
                                      <div>
                                        <p className="text-sm font-body font-body-medium text-card-foreground">{assignment.submittedFile}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Soumis le {new Date(assignment.submittedDate).toLocaleDateString('fr-FR')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              {assignment.hasSubmitted ? (
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                  <Icon name="RefreshCw" size={18} />
                                  Modifier
                                </button>
                              ) : (
                                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                                  <Icon name="Upload" size={18} />
                                  Soumettre
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {documentTab === 'admin' && (
                  <div className="space-y-4 p-6">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-body-medium">
                        Bulletins, certificats et documents officiels
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {adminDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border-2 border-purple-200 rounded-2xl p-5 hover:shadow-xl transition-all hover:scale-105 group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-14 w-14 flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                              <Icon name="FileText" size={26} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-body-bold text-gray-900 mb-2 truncate">
                                {doc.title}
                              </h3>
                              <div className="space-y-2">
                                <p className="text-xs">
                                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                                    {doc.type}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-600 font-body-medium">
                                  {new Date(doc.date).toLocaleDateString('fr-FR')} • {doc.size}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <button className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                                  <Icon name="Eye" size={14} />
                                  Voir
                                </button>
                                <button className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                                  <Icon name="Download" size={14} />
                                  Télécharger
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'messages':
        // MODIFICATION: Utiliser les données de la base si disponibles, sinon afficher un message
        const receivedMessages = [];
        const sentMessages = [];
        const archivedMessages = [];
        
        const hasMessages = receivedMessages.length > 0 || sentMessages.length > 0 || archivedMessages.length > 0;        const getMessagesToShow = () => {
          switch (messageTab) {
            case 'sent':
              return sentMessages;
            case 'archived':
              return archivedMessages;
            default:
              return receivedMessages;
          }
        };

        const messagesToShow = getMessagesToShow();

        return (
          <div className="space-y-6">
            {/* New Message Modal - Modernisé */}
            {showNewMessageModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                          <Icon name="Mail" size={20} className="text-white" />
                        </div>
                        <h3 className="font-heading font-heading-bold text-xl text-gray-900">
                          Nouveau message
                        </h3>
                      </div>
                      <button 
                        onClick={() => setShowNewMessageModal(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                      >
                        <Icon name="X" size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-body font-body-semibold mb-2 text-gray-700">Destinataire</label>
                        <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition-all">
                          <option>Sélectionner un destinataire...</option>
                          <option>M. Nkolo (Mathématiques)</option>
                          <option>Mme Djomo (Français)</option>
                          <option>M. Fouda (Physique-Chimie)</option>
                          <option>M. Kamga (Histoire-Géographie)</option>
                          <option>Administration</option>
                          <option>Vie scolaire</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-body font-body-semibold mb-2 text-gray-700">Objet</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 transition-all"
                          placeholder="Entrez l'objet du message..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-body font-body-semibold mb-2 text-gray-700">Message</label>
                        <textarea 
                          rows="8"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 resize-none transition-all"
                          placeholder="Écrivez votre message ici..."
                        ></textarea>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all flex items-center gap-2 border-2 border-gray-300">
                          <Icon name="Paperclip" size={18} />
                          Joindre un fichier
                        </button>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-100">
                        <button 
                          onClick={() => {
                            setShowNewMessageModal(false);
                            // Logique d'envoi ici
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl hover:from-cyan-700 hover:to-teal-700 hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                        >
                          <Icon name="Send" size={18} />
                          Envoyer
                        </button>
                        <button 
                          onClick={() => setShowNewMessageModal(false)}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header modernisé */}
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    💬
                  </div>
                  <div>
                    <h2 className="font-heading font-heading-bold text-2xl">
                      Mes Messages
                    </h2>
                    <p className="text-cyan-100 text-sm mt-1">
                      {hasMessages ? 'Communication avec vos enseignants' : 'Aucun message pour le moment'}
                    </p>
                  </div>
                </div>
                <button 
                onClick={() => setShowNewMessageModal(true)}
                className="px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Icon name="Plus" size={18} />
                <span className="hidden sm:inline">Nouveau message</span>
              </button>
            </div>
            </div>

            {!hasMessages ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-200 mb-4">
                  <Icon name="Mail" size={48} className="text-cyan-600" />
                </div>
                <h3 className="font-body-bold text-xl text-gray-900 mb-2">
                  Aucun message disponible
                </h3>
                <p className="text-gray-600 font-body-medium mb-6">
                  Vous n'avez pas encore de messages. Les communications avec vos enseignants apparaîtront ici.
                </p>
                <button 
                  onClick={() => setShowNewMessageModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center gap-2 font-semibold mx-auto shadow-lg hover:shadow-xl"
                >
                  <Icon name="Plus" size={18} />
                  Envoyer un message
                </button>
              </div>
            ) : (
            <>
            {/* Messages Tabs - Modernisé */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="border-b-2 border-gray-100">
                <div className="flex px-2">
                  <button 
                    onClick={() => setMessageTab('received')}
                    className={`px-6 py-4 font-body text-sm border-b-4 transition-all duration-300 ${
                      messageTab === 'received' 
                        ? 'font-body-bold border-cyan-600 text-cyan-900 bg-cyan-50/50' 
                        : 'font-body-medium border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Inbox" size={18} />
                      <span>Reçus</span>
                      {receivedMessages.filter(m => !m.read).length > 0 && (
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          messageTab === 'received'
                            ? 'bg-cyan-600 text-white animate-pulse'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {receivedMessages.filter(m => !m.read).length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button 
                    onClick={() => setMessageTab('sent')}
                    className={`px-6 py-4 font-body text-sm border-b-4 transition-all duration-300 ${
                      messageTab === 'sent' 
                        ? 'font-body-bold border-green-600 text-green-900 bg-green-50/50' 
                        : 'font-body-medium border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Send" size={18} />
                      <span>Envoyés</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        messageTab === 'sent'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {sentMessages.length}
                      </span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setMessageTab('archived')}
                    className={`px-6 py-4 font-body text-sm border-b-4 transition-all duration-300 ${
                      messageTab === 'archived' 
                        ? 'font-body-bold border-purple-600 text-purple-900 bg-purple-50/50' 
                        : 'font-body-medium border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Archive" size={18} />
                      <span>Archivés</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        messageTab === 'archived'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {archivedMessages.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Messages List - Modernisé */}
              <div className="divide-y-2 divide-gray-100">
                {messagesToShow.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                      <Icon name="Mail" size={48} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-body-medium text-lg">Aucun message dans cette catégorie</p>
                  </div>
                ) : (
                  messagesToShow.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-5 hover:bg-gradient-to-r transition-all duration-300 cursor-pointer group ${
                        !message.read && messageTab === 'received' 
                          ? 'bg-blue-50/50 hover:from-blue-50 hover:to-cyan-50 border-l-4 border-blue-500' 
                          : 'hover:from-gray-50 hover:to-gray-100/50 border-l-4 border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform group-hover:scale-110 ${
                          message.avatar === 'AlertCircle' ? 'bg-gradient-to-br from-orange-400 to-amber-500' :
                          message.avatar === 'Calendar' ? 'bg-gradient-to-br from-pink-400 to-rose-500' :
                          message.avatar === 'FileText' ? 'bg-gradient-to-br from-gray-400 to-slate-500' :
                          message.categoryColor === 'purple' ? 'bg-gradient-to-br from-purple-400 to-violet-500' :
                          message.categoryColor === 'green' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                          'bg-gradient-to-br from-blue-400 to-indigo-500'
                        }`}>
                          <Icon 
                            name={message.avatar} 
                            size={22} 
                            className="text-white"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${
                                !message.read && messageTab === 'received' ? 'font-body-bold text-gray-900' : 'font-body-medium text-gray-700'
                              }`}>
                                {messageTab === 'sent' ? message.to : message.from}
                              </span>
                              {!message.read && messageTab === 'received' && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full animate-pulse">Nouveau</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-body-medium">{message.time}</span>
                          </div>
                          <h4 className={`text-sm mb-1 flex items-center gap-2 ${
                            !message.read && messageTab === 'received' ? 'font-body-bold text-gray-900' : 'font-body-medium text-gray-800'
                          }`}>
                            {message.subject}
                            {message.attachment && (
                              <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 font-body">
                            {message.preview}
                          </p>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {message.tags ? (
                              message.tags.map((tag, idx) => (
                                <span key={idx} className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                  tag === 'Important' 
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                                message.categoryColor === 'purple' ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' :
                                message.categoryColor === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                              }`}>
                                {message.category}
                              </span>
                            )}
                            {message.attachment && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-body-medium">
                                <Icon name="File" size={14} />
                                <span>{message.attachment.name} ({message.attachment.size})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Statistics Cards - Modernisé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-body-medium">Messages non lus</span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                    <Icon name="Mail" size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{receivedMessages.filter(m => !m.read).length}</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-green-200 shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-body-medium">Messages envoyés</span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                    <Icon name="Send" size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-display font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{sentMessages.length}</p>
              </div>
              <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-body-medium">Messages archivés</span>
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-md">
                    <Icon name="Archive" size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-display font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{archivedMessages.length}</p>
              </div>
            </div>
            </>
            )}
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

              {/* Right Column - Attendance, Parent Info and Notifications */}
              <div className="space-y-6">
                <AttendanceCalendar attendanceData={attendanceData} />
                <ParentInfoCard parentInfo={studentProfile} />
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
        <main className={`pt-20 sm:pt-16 transition-all duration-state ${
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
      <main className={`pt-20 sm:pt-16 transition-all duration-state ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 space-y-2 sm:space-y-3 w-full overflow-x-hidden">
          {/* Error Banner - Modernisé */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Icon name="AlertCircle" size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-heading-semibold text-red-900 text-lg mb-1">
                    Erreur de chargement
                  </p>
                  <p className="text-sm text-red-800 leading-relaxed">
                    {error} - Affichage des données de démonstration.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Section - Modernisé */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                    👋
                  </div>
                  <div>
                    <h1 className="font-heading font-heading-bold text-2xl sm:text-3xl">
                      {getGreeting()}, {studentData?.name?.split(' ')?.[0]} !
                    </h1>
                    <p className="text-blue-100 text-sm mt-1">
                      {currentTime?.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-blue-100 text-base sm:text-lg mt-4 max-w-2xl">
                  Bienvenue sur votre espace personnel ! Consultez vos notes, devoirs et emploi du temps.
                </p>
              </div>
              <div className="hidden lg:block mt-4 lg:mt-0">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-6xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  🎓
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Quick Actions - Modernisé */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                  <Icon name="Zap" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
                  <p className="text-xs text-gray-500">Accès direct à vos outils</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <Link
                to="/student-dashboard?tab=profile"
                className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="User" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-blue-900">
                    Mon profil
                  </span>
                </div>
              </Link>
              
              <Link
                to="/student-dashboard?tab=grades"
                className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="FileBarChart" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-900">
                    Mes notes
                  </span>
                </div>
              </Link>

              <Link
                to="/student-dashboard?tab=assignments"
                className="group p-4 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-orange-200 hover:border-orange-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="FileText" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-orange-900">
                    Mes devoirs
                  </span>
                </div>
              </Link>

              <Link
                to="/student-dashboard?tab=schedule"
                className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="Calendar" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-purple-900">
                    Emploi du temps
                  </span>
                </div>
              </Link>

              <Link
                to="/student-dashboard?tab=messages"
                className="group p-4 bg-gradient-to-br from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 border-2 border-cyan-200 hover:border-cyan-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="MessageSquare" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-cyan-900">
                    Messages
                  </span>
                </div>
              </Link>

              <Link
                to="/student-dashboard?tab=documents"
                className="group p-4 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
                    <Icon name="Library" size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-red-900">
                    Documents
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;