import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentDashboardData } from '../../hooks/useStudentDashboardData';

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
  const [messageTab, setMessageTab] = useState('received'); // 'received', 'sent', 'archived'
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [documentTab, setDocumentTab] = useState('received'); // 'received', 'assignments', 'admin'
  const { user } = useAuth();

  console.log('🔑 AuthContext user:', user);
  console.log('💾 localStorage user:', JSON.parse(localStorage.getItem('edutrack-user') || 'null'));

  // Utiliser le nouveau hook unifié pour récupérer les données (mode démo ou production)
  const {
    loading,
    error,
    isDemo,
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
  const gradesBySubject = getGradesBySubject();
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
        return (
          <div className="space-y-6">
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">
              📅 Emploi du temps
            </h2>
            
            {/* Weekly Schedule */}
            <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary p-4">
                <h3 className="font-heading font-heading-semibold text-lg text-white">
                  Semaine du {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Horaire</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Lundi</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Mardi</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Mercredi</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Jeudi</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Vendredi</th>
                      <th className="px-4 py-3 text-left font-heading font-heading-medium text-sm">Samedi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* 08:00 - 09:30 */}
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-caption font-caption-semibold text-sm whitespace-nowrap">08:00 - 09:30</td>
                      <td className="px-4 py-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-blue-900">Mathématiques</div>
                          <div className="text-xs text-blue-700">M. Nkolo - Salle 12</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-purple-900">Français</div>
                          <div className="text-xs text-purple-700">Mme Djomo - Salle 8</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-green-900">Physique-Chimie</div>
                          <div className="text-xs text-green-700">M. Fouda - Labo 2</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-orange-900">Histoire-Géo</div>
                          <div className="text-xs text-orange-700">M. Kamga - Salle 5</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-blue-900">Mathématiques</div>
                          <div className="text-xs text-blue-700">M. Nkolo - Salle 12</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-red-900">Anglais</div>
                          <div className="text-xs text-red-700">Mme Ebelle - Salle 3</div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* 10:00 - 11:30 */}
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-caption font-caption-semibold text-sm whitespace-nowrap">10:00 - 11:30</td>
                      <td className="px-4 py-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-red-900">Anglais</div>
                          <div className="text-xs text-red-700">Mme Ebelle - Salle 3</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-blue-900">Mathématiques</div>
                          <div className="text-xs text-blue-700">M. Nkolo - Salle 12</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground text-sm">-</td>
                      <td className="px-4 py-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-green-900">Physique (TP)</div>
                          <div className="text-xs text-green-700">M. Fouda - Labo 2</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-purple-900">Français</div>
                          <div className="text-xs text-purple-700">Mme Djomo - Salle 8</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-orange-900">Histoire-Géo</div>
                          <div className="text-xs text-orange-700">M. Kamga - Salle 5</div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* 12:00 - 13:30 - Pause déjeuner */}
                    <tr className="bg-yellow-50">
                      <td className="px-4 py-3 font-caption font-caption-semibold text-sm whitespace-nowrap">12:00 - 13:30</td>
                      <td colSpan="6" className="px-4 py-3 text-center text-yellow-800 font-body font-body-medium">
                        🍽️ Pause déjeuner
                      </td>
                    </tr>
                    
                    {/* 14:00 - 15:30 */}
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-caption font-caption-semibold text-sm whitespace-nowrap">14:00 - 15:30</td>
                      <td className="px-4 py-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-green-900">SVT</div>
                          <div className="text-xs text-green-700">Mme Bessala - Salle 10</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-orange-900">Histoire-Géo</div>
                          <div className="text-xs text-orange-700">M. Kamga - Salle 5</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground text-sm">-</td>
                      <td className="px-4 py-4">
                        <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-purple-900">Français</div>
                          <div className="text-xs text-purple-700">Mme Djomo - Salle 8</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-pink-50 border-l-4 border-pink-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-pink-900">Philosophie</div>
                          <div className="text-xs text-pink-700">M. Abega - Salle 15</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground text-sm">-</td>
                    </tr>
                    
                    {/* 16:00 - 17:30 */}
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-caption font-caption-semibold text-sm whitespace-nowrap">16:00 - 17:30</td>
                      <td className="px-4 py-4">
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-indigo-900">EPS</div>
                          <div className="text-xs text-indigo-700">M. Onana - Terrain</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-green-900">SVT (TP)</div>
                          <div className="text-xs text-green-700">Mme Bessala - Labo 1</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground text-sm">-</td>
                      <td className="px-4 py-4">
                        <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-red-900">Anglais</div>
                          <div className="text-xs text-red-700">Mme Ebelle - Salle 3</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-2 rounded">
                          <div className="font-body font-body-semibold text-sm text-indigo-900">EPS</div>
                          <div className="text-xs text-indigo-700">M. Onana - Terrain</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground text-sm">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Legend */}
            <div className="bg-card rounded-lg shadow-card border border-border p-4">
              <h4 className="font-heading font-heading-semibold text-base mb-3">Légende des matières</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Mathématiques</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Français</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Sciences (PC/SVT)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Histoire-Géographie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Anglais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  <span className="text-sm">Philosophie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                  <span className="text-sm">EPS</span>
                </div>
              </div>
            </div>
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
            {/* En-tête */}
            <div className="bg-card rounded-lg shadow-card border border-border p-6">
              <div>
                <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">📄 Mes Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Documents reçus, devoirs à rendre et documents administratifs
                </p>
              </div>
            </div>

            {/* Onglets */}
            <div className="bg-card rounded-lg shadow-card border border-border">
              <div className="border-b border-border">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setDocumentTab('received')}
                    className={`px-6 py-4 text-sm font-body font-body-medium border-b-2 transition-colors ${
                      documentTab === 'received'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="BookOpen" size={18} />
                      <span>Documents reçus</span>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {receivedDocuments.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setDocumentTab('assignments')}
                    className={`px-6 py-4 text-sm font-body font-body-medium border-b-2 transition-colors ${
                      documentTab === 'assignments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Upload" size={18} />
                      <span>Mes devoirs</span>
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                        {assignments.filter(a => !a.hasSubmitted).length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setDocumentTab('admin')}
                    className={`px-6 py-4 text-sm font-body font-body-medium border-b-2 transition-colors ${
                      documentTab === 'admin'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-card-foreground hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Shield" size={18} />
                      <span>Documents administratifs</span>
                      <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
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
                  <div className="space-y-4">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Bulletins, certificats et documents officiels
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-purple-50 rounded-lg">
                              <Icon name="FileText" size={24} className="text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-body font-body-semibold text-card-foreground mb-1 truncate">
                                {doc.title}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  <span className="inline-block px-2 py-0.5 bg-muted rounded">
                                    {doc.type}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.date).toLocaleDateString('fr-FR')} • {doc.size}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <button className="flex-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                                  <Icon name="Eye" size={14} />
                                  Voir
                                </button>
                                <button className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
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
        // Messages data
        const receivedMessages = [
          {
            id: 1,
            from: "M. Nkolo (Mathématiques)",
            subject: "Résultats du contrôle de mathématiques",
            preview: "Bonjour, les résultats du contrôle du 15 novembre sont disponibles. Félicitations pour votre excellent travail avec 18/20...",
            time: "Il y a 2h",
            read: false,
            category: "Notes",
            categoryColor: "blue",
            avatar: "User"
          },
          {
            id: 2,
            from: "Administration",
            subject: "Rappel : Frais de scolarité T2",
            preview: "Cher(e) élève, nous vous rappelons que les frais de scolarité du 2ème trimestre sont à régler avant le 30 novembre...",
            time: "Hier",
            read: false,
            category: "Important",
            categoryColor: "orange",
            avatar: "AlertCircle",
            tags: ["Important", "Administration"]
          },
          {
            id: 3,
            from: "Mme Djomo (Français)",
            subject: "Correction dissertation Baudelaire",
            preview: "Votre dissertation sur Les Fleurs du Mal montre une bonne compréhension du symbolisme baudelairien...",
            time: "3 jours",
            read: true,
            category: "Devoirs",
            categoryColor: "purple",
            avatar: "User"
          },
          {
            id: 4,
            from: "M. Fouda (Physique-Chimie)",
            subject: "Support de cours - Optique géométrique",
            preview: "Bonjour, vous trouverez en pièce jointe le support de cours sur l'optique géométrique que nous avons vu en TP...",
            time: "1 semaine",
            read: true,
            category: "Cours",
            categoryColor: "green",
            avatar: "User",
            attachment: { name: "cours_optique.pdf", size: "2.3 MB" }
          },
          {
            id: 5,
            from: "Vie scolaire",
            subject: "Sortie pédagogique - Musée National",
            preview: "Une sortie pédagogique au Musée National est organisée le 2 décembre. Autorisation parentale requise...",
            time: "2 semaines",
            read: true,
            category: "Événement",
            categoryColor: "pink",
            avatar: "Calendar"
          }
        ];

        const sentMessages = [
          {
            id: 6,
            to: "M. Nkolo (Mathématiques)",
            subject: "Question sur les dérivées",
            preview: "Bonjour Monsieur, j'aurais une question concernant l'exercice 5 du chapitre sur les dérivées...",
            time: "Il y a 3h",
            category: "Question",
            categoryColor: "blue",
            avatar: "User"
          },
          {
            id: 7,
            to: "Administration",
            subject: "Demande de certificat de scolarité",
            preview: "Bonjour, je souhaiterais obtenir un certificat de scolarité pour mon dossier de candidature...",
            time: "2 jours",
            category: "Administratif",
            categoryColor: "gray",
            avatar: "FileText"
          }
        ];

        const archivedMessages = [
          {
            id: 8,
            from: "M. Kamga (Histoire-Géo)",
            subject: "Correction contrôle d'histoire",
            preview: "Votre travail sur la guerre froide est satisfaisant. Attention aux dates clés...",
            time: "1 mois",
            read: true,
            category: "Notes",
            categoryColor: "orange",
            avatar: "User"
          }
        ];

        const getMessagesToShow = () => {
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
            {/* New Message Modal */}
            {showNewMessageModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card rounded-lg shadow-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-heading font-heading-bold text-xl text-card-foreground">
                        Nouveau message
                      </h3>
                      <button 
                        onClick={() => setShowNewMessageModal(false)}
                        className="text-muted-foreground hover:text-card-foreground transition-colors"
                      >
                        <Icon name="X" size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-body font-body-semibold mb-2">Destinataire</label>
                        <select className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary">
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
                        <label className="block text-sm font-body font-body-semibold mb-2">Objet</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Entrez l'objet du message..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-body font-body-semibold mb-2">Message</label>
                        <textarea 
                          rows="8"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Écrivez votre message ici..."
                        ></textarea>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-muted text-card-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2">
                          <Icon name="Paperclip" size={18} />
                          Joindre un fichier
                        </button>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <button 
                          onClick={() => {
                            setShowNewMessageModal(false);
                            // Logique d'envoi ici
                          }}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                          <Icon name="Send" size={18} />
                          Envoyer
                        </button>
                        <button 
                          onClick={() => setShowNewMessageModal(false)}
                          className="px-6 py-2 bg-muted text-card-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="font-heading font-heading-bold text-2xl text-card-foreground">
                💬 Mes Messages
              </h2>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Icon name="Plus" size={18} />
                Nouveau message
              </button>
            </div>

            {/* Messages Tabs */}
            <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
              <div className="border-b border-border">
                <div className="flex">
                  <button 
                    onClick={() => setMessageTab('received')}
                    className={`px-6 py-3 font-body text-sm border-b-2 transition-colors ${
                      messageTab === 'received' 
                        ? 'font-body-semibold border-primary text-primary' 
                        : 'font-body-medium border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    Reçus ({receivedMessages.filter(m => !m.read).length})
                  </button>
                  <button 
                    onClick={() => setMessageTab('sent')}
                    className={`px-6 py-3 font-body text-sm border-b-2 transition-colors ${
                      messageTab === 'sent' 
                        ? 'font-body-semibold border-primary text-primary' 
                        : 'font-body-medium border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    Envoyés ({sentMessages.length})
                  </button>
                  <button 
                    onClick={() => setMessageTab('archived')}
                    className={`px-6 py-3 font-body text-sm border-b-2 transition-colors ${
                      messageTab === 'archived' 
                        ? 'font-body-semibold border-primary text-primary' 
                        : 'font-body-medium border-transparent text-muted-foreground hover:text-card-foreground'
                    }`}
                  >
                    Archivés ({archivedMessages.length})
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="divide-y divide-border">
                {messagesToShow.length === 0 ? (
                  <div className="p-12 text-center">
                    <Icon name="Mail" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun message dans cette catégorie</p>
                  </div>
                ) : (
                  messagesToShow.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !message.read && messageTab === 'received' ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.avatar === 'AlertCircle' ? 'bg-orange-100' :
                          message.avatar === 'Calendar' ? 'bg-pink-100' :
                          message.avatar === 'FileText' ? 'bg-gray-100' :
                          message.categoryColor === 'purple' ? 'bg-purple-100' :
                          message.categoryColor === 'green' ? 'bg-green-100' :
                          'bg-primary/10'
                        }`}>
                          <Icon 
                            name={message.avatar} 
                            size={20} 
                            className={
                              message.avatar === 'AlertCircle' ? 'text-orange-600' :
                              message.avatar === 'Calendar' ? 'text-pink-600' :
                              message.avatar === 'FileText' ? 'text-gray-600' :
                              message.categoryColor === 'purple' ? 'text-purple-600' :
                              message.categoryColor === 'green' ? 'text-green-600' :
                              'text-primary'
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${
                                !message.read && messageTab === 'received' ? 'font-body-bold' : 'font-body-medium'
                              } text-card-foreground`}>
                                {messageTab === 'sent' ? message.to : message.from}
                              </span>
                              {!message.read && messageTab === 'received' && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{message.time}</span>
                          </div>
                          <h4 className={`text-sm mb-1 flex items-center gap-2 ${
                            !message.read && messageTab === 'received' ? 'font-body-semibold' : 'font-body-medium'
                          } text-card-foreground`}>
                            {message.subject}
                            {message.attachment && (
                              <Icon name="Paperclip" size={14} className="text-muted-foreground" />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.preview}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {message.tags ? (
                              message.tags.map((tag, idx) => (
                                <span key={idx} className={`px-2 py-1 text-xs rounded ${
                                  tag === 'Important' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className={`px-2 py-1 text-xs rounded bg-${message.categoryColor}-100 text-${message.categoryColor}-700`}>
                                {message.category}
                              </span>
                            )}
                            {message.attachment && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="File" size={12} />
                                <span>{message.attachment.name} ({message.attachment.size})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg shadow-card border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Messages non lus</span>
                  <Icon name="Mail" size={18} className="text-blue-500" />
                </div>
                <div className="font-heading font-heading-bold text-2xl text-card-foreground">
                  {receivedMessages.filter(m => !m.read).length}
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-card border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total reçus</span>
                  <Icon name="Inbox" size={18} className="text-green-500" />
                </div>
                <div className="font-heading font-heading-bold text-2xl text-card-foreground">
                  {receivedMessages.length}
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-card border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Messages envoyés</span>
                  <Icon name="Send" size={18} className="text-purple-500" />
                </div>
                <div className="font-heading font-heading-bold text-2xl text-card-foreground">
                  {sentMessages.length}
                </div>
              </div>
            </div>
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