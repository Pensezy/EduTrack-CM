import { useState, useEffect } from 'react';
import {
  getStudentProfile,
  getStudentStats,
  getStudentGrades,
  getStudentAttendance,
  getStudentAssignments,
  getStudentNotifications,
  getStudentAchievements
} from '../services/studentService';

/**
 * Hook pour détecter si on est en mode démo
 */
const useDataMode = () => {
  // En mode démo si pas d'ID utilisateur ou si l'URL contient 'demo'
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get('mode') === 'demo' || !localStorage.getItem('user');
  return isDemo;
};

/**
 * Données de démonstration pour l'élève
 */
const getDemoData = () => ({
  studentData: {
    id: 'demo-student',
    first_name: 'Jean',
    last_name: 'Dupont',
    date_of_birth: '2010-05-15',
    gender: 'male',
    enrollment_date: '2023-09-01',
    status: 'active',
    classes: {
      id: 'demo-class',
      name: '6ème A',
      level: '6ème',
      section: 'A'
    },
    parent_phone: '+237 6XX XX XX XX',
    parent_email: 'parent@example.com'
  },
  statsData: {
    averageGrade: '14.5',
    attendanceRate: '92.5',
    assignmentsCount: 12,
    achievementsCount: 5
  },
  gradesData: [
    {
      id: 1,
      subject: 'Mathématiques',
      subjectCode: 'MATH',
      grade: 15,
      maxGrade: 20,
      coefficient: 4,
      type: 'Devoir',
      date: '2024-11-15',
      teacher: 'M. Martin',
      comment: 'Bon travail'
    },
    {
      id: 2,
      subject: 'Français',
      subjectCode: 'FR',
      grade: 14,
      maxGrade: 20,
      coefficient: 3,
      type: 'Composition',
      date: '2024-11-10',
      teacher: 'Mme. Dubois',
      comment: 'Peut mieux faire'
    },
    {
      id: 3,
      subject: 'Anglais',
      subjectCode: 'ANG',
      grade: 16,
      maxGrade: 20,
      coefficient: 2,
      type: 'Devoir',
      date: '2024-11-08',
      teacher: 'M. Johnson',
      comment: 'Excellent'
    }
  ],
  attendanceData: [
    { id: 1, date: '2024-11-20', status: 'present', reason: '', period: 'full_day' },
    { id: 2, date: '2024-11-19', status: 'present', reason: '', period: 'full_day' },
    { id: 3, date: '2024-11-18', status: 'absent', reason: 'Maladie', period: 'full_day' },
    { id: 4, date: '2024-11-17', status: 'present', reason: '', period: 'full_day' },
    { id: 5, date: '2024-11-16', status: 'present', reason: '', period: 'full_day' }
  ],
  assignmentsData: [
    {
      id: 1,
      title: 'Exercices d\'algèbre',
      description: 'Résoudre les exercices 5 à 10 du livre',
      subject: 'Mathématiques',
      subjectCode: 'MATH',
      teacher: 'M. Martin',
      dueDate: '2024-11-25',
      status: 'pending',
      type: 'homework'
    },
    {
      id: 2,
      title: 'Dissertation',
      description: 'Rédiger une dissertation sur un thème au choix',
      subject: 'Français',
      subjectCode: 'FR',
      teacher: 'Mme. Dubois',
      dueDate: '2024-11-28',
      status: 'pending',
      type: 'essay'
    },
    {
      id: 3,
      title: 'Oral présentation',
      description: 'Préparer une présentation de 5 minutes',
      subject: 'Anglais',
      subjectCode: 'ANG',
      teacher: 'M. Johnson',
      dueDate: '2024-11-22',
      status: 'passed',
      type: 'presentation'
    }
  ],
  notificationsData: [
    {
      id: 1,
      title: 'Nouvelle note disponible',
      message: 'Votre note de mathématiques a été publiée',
      type: 'grade',
      date: '2024-11-20T10:30:00',
      read: false,
      time: 'Il y a 2h'
    },
    {
      id: 2,
      title: 'Réunion parents-professeurs',
      message: 'Une réunion est prévue le 30 novembre',
      type: 'event',
      date: '2024-11-19T14:00:00',
      read: false,
      time: 'Hier'
    },
    {
      id: 3,
      title: 'Devoir à rendre',
      message: 'N\'oubliez pas le devoir de français pour lundi',
      type: 'assignment',
      date: '2024-11-18T09:00:00',
      read: true,
      time: 'Il y a 2j'
    }
  ],
  achievementsData: [
    {
      id: 1,
      title: 'Meilleure note en mathématiques',
      description: 'Obtenu la meilleure note de la classe',
      category: 'academic',
      date: '2024-11-15',
      icon: '🎓'
    },
    {
      id: 2,
      title: 'Participation active',
      description: 'Participation exceptionnelle en classe',
      category: 'behavior',
      date: '2024-11-10',
      icon: '⭐'
    },
    {
      id: 3,
      title: 'Champion de course',
      description: 'Premier au cross de l\'école',
      category: 'sports',
      date: '2024-11-05',
      icon: '⚽'
    }
  ]
});

/**
 * Hook personnalisé pour gérer les données de l'élève
 * Gère automatiquement le mode démo et le mode production
 */
export const useStudentData = (studentId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [achievementsData, setAchievementsData] = useState([]);
  
  const isDemo = useDataMode();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isDemo || !studentId) {
          // Mode démo : utiliser les données factices
          const demoData = getDemoData();
          setStudentData(demoData.studentData);
          setStatsData(demoData.statsData);
          setGradesData(demoData.gradesData);
          setAttendanceData(demoData.attendanceData);
          setAssignmentsData(demoData.assignmentsData);
          setNotificationsData(demoData.notificationsData);
          setAchievementsData(demoData.achievementsData);
        } else {
          // Mode production : récupérer depuis Supabase
          const [
            profile,
            stats,
            grades,
            attendance,
            assignments,
            notifications,
            achievements
          ] = await Promise.all([
            getStudentProfile(studentId),
            getStudentStats(studentId),
            getStudentGrades(studentId),
            getStudentAttendance(studentId),
            getStudentAssignments(studentId),
            getStudentNotifications(studentId),
            getStudentAchievements(studentId)
          ]);

          setStudentData(profile);
          setStatsData(stats);
          setGradesData(grades);
          setAttendanceData(attendance);
          setAssignmentsData(assignments);
          setNotificationsData(notifications);
          setAchievementsData(achievements);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
        
        // En cas d'erreur, basculer sur les données de démo
        const demoData = getDemoData();
        setStudentData(demoData.studentData);
        setStatsData(demoData.statsData);
        setGradesData(demoData.gradesData);
        setAttendanceData(demoData.attendanceData);
        setAssignmentsData(demoData.assignmentsData);
        setNotificationsData(demoData.notificationsData);
        setAchievementsData(demoData.achievementsData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, isDemo]);

  return {
    loading,
    error,
    isDemo,
    studentData,
    statsData,
    gradesData,
    attendanceData,
    assignmentsData,
    notificationsData,
    achievementsData,
    // Fonction pour rafraîchir les données
    refresh: () => {
      setLoading(true);
      // Le useEffect se déclenchera automatiquement
    }
  };
};

export default useStudentData;
