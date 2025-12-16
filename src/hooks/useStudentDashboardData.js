/**
 * Hook unifié pour gérer les données du dashboard étudiant
 * Bascule automatiquement entre mode démo et production
 */

import { useState, useEffect } from 'react';
import { useDataMode } from './useDataMode';
import studentDemoDataService from '../services/studentDemoDataService';
import studentProductionDataService from '../services/studentProductionDataService';
import { computeSubjectAverage, computeOverallAverage } from '../utils/grading';

export const useStudentDashboardData = (studentId) => {
  const { dataMode } = useDataMode();
  const isDemo = dataMode === 'demo';

  // États pour les données
  const [studentProfile, setStudentProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [behavior, setBehavior] = useState(null);
  const [schedule, setSchedule] = useState(null);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sélectionner le service approprié
  const service = isDemo ? studentDemoDataService : studentProductionDataService;

  /**
   * Charger toutes les données du dashboard
   */
  const loadDashboardData = async () => {
    if (!studentId && !isDemo) {
      setError('ID étudiant non fourni');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Réinitialiser toutes les données avant de charger les nouvelles
      setStudentProfile(null);
      setStats(null);
      setGrades([]);
      setAttendance([]);
      setAssignments([]);
      setNotifications([]);
      setAchievements([]);
      setBehavior(null);
      setSchedule(null);

      console.log(`📚 Chargement données étudiant en mode ${isDemo ? 'DÉMO' : 'PRODUCTION'}...`);
      console.log(`👤 ID étudiant:`, studentId);

      // Définir le contexte pour le mode production
      if (!isDemo && studentId) {
        studentProductionDataService.setUserContext(studentId);
      }

      // Charger toutes les données en parallèle
      const [
        profileResult,
        statsResult,
        gradesResult,
        attendanceResult,
        assignmentsResult,
        notificationsResult,
        achievementsResult,
        behaviorResult,
        scheduleResult
      ] = await Promise.all([
        service.getStudentProfile(studentId),
        service.getStudentStats(studentId),
        service.getStudentGrades(studentId),
        service.getStudentAttendance(studentId),
        service.getStudentAssignments(studentId),
        service.getStudentNotifications(studentId),
        service.getStudentAchievements(studentId),
        service.getStudentBehavior(studentId),
        service.getStudentSchedule(studentId)
      ]);

      console.log('📋 Profile Result:', profileResult);
      console.log('📊 Stats Result:', statsResult);
      console.log('📝 Grades Result:', gradesResult);

      // Mettre à jour les états avec les résultats
      setStudentProfile(profileResult.data);
      setStats(statsResult.data);
      setGrades(gradesResult.data || []);
      setAttendance(attendanceResult.data || []);
      setAssignments(assignmentsResult.data || []);
      setNotifications(notificationsResult.data || []);
      setAchievements(achievementsResult.data || []);
      setBehavior(behaviorResult.data);
      setSchedule(scheduleResult.data);

      // Calculer une moyenne dérivée plus précise à partir des notes récupérées
      try {
        const rawGrades = gradesResult.data || [];
        const schoolType = profileResult?.data?.school?.type;

        // Grouper par matière
        const subjMap = {};
        rawGrades.forEach(g => {
          const name = g.subject || 'Matière inconnue';
          if (!subjMap[name]) subjMap[name] = { grades: [] };
          subjMap[name].grades.push(g);
        });

        const subjectsArray = Object.keys(subjMap).map(name => ({
          subject: name,
          average: computeSubjectAverage(subjMap[name].grades, { schoolType }),
          coefficient: (subjMap[name].grades.reduce((acc, x) => acc + (Number(x.coefficient) || 1), 0) / Math.max(1, subjMap[name].grades.length))
        }));

        const derivedAverage = computeOverallAverage(subjectsArray, 1);
        setStats(prev => ({ ...(prev || {}), averageGrade: derivedAverage }));
      } catch (err) {
        console.warn('⚠️ Impossible de calculer moyenne dérivée:', err);
      }

      // Vérifier s'il y a des erreurs
      const hasError = [
        profileResult,
        statsResult,
        gradesResult,
        attendanceResult,
        assignmentsResult,
        notificationsResult,
        achievementsResult,
        behaviorResult,
        scheduleResult
      ].some(result => result.error);

      if (hasError) {
        console.warn('⚠️ Certaines données n\'ont pas pu être chargées');
      }

      console.log(`✅ Données étudiant chargées avec succès`);
    } catch (err) {
      console.error('❌ Erreur chargement données dashboard étudiant:', err);
      setError(err.message || 'Erreur de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recharger toutes les données
   */
  const refreshData = () => {
    loadDashboardData();
  };

  /**
   * Marquer une notification comme lue
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      const result = await service.markNotificationAsRead(notificationId);
      
      if (!result.error) {
        // Mettre à jour l'état local
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }

      return result;
    } catch (err) {
      console.error('❌ Erreur marquage notification:', err);
      return { data: null, error: err };
    }
  };

  /**
   * Obtenir les notes par matière
   */
  const getGradesBySubject = (options = {}) => {
    if (!grades || grades.length === 0) return [];

    const subjectMap = {};

    grades.forEach(grade => {
      const subjectName = grade.subject || 'Matière inconnue';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          subject: subjectName,
          subject_code: grade.subject_code,
          grades: [],
          average: 0,
          count: 0
        };
      }

      subjectMap[subjectName].grades.push(grade);
      subjectMap[subjectName].count += 1;
    });

    // Calculer les moyennes par matière en tenant compte des max_grade et coefficients
    Object.values(subjectMap).forEach(subject => {
      subject.average = computeSubjectAverage(subject.grades, { schoolType: options.schoolType });
      // Déterminer coefficient matière moyen si fournit
      const coefs = subject.grades.map(g => Number(g.coefficient) || 1);
      subject.coefficient = coefs.length > 0 ? (coefs.reduce((a,b)=>a+b,0)/coefs.length) : 1;
    });

    return Object.values(subjectMap);
  };

  /**
   * Obtenir les statistiques de présence
   */
  const getAttendanceStats = () => {
    if (!attendance || attendance.length === 0) {
      return {
        totalAbsences: 0,
        justified: 0,
        unjustified: 0,
        late: 0,
        rate: 100
      };
    }

    const totalAbsences = attendance.filter(a => a.status === 'absent').length;
    const justified = attendance.filter(a => a.justified).length;
    const unjustified = totalAbsences - justified;
    const late = attendance.filter(a => a.status === 'late').length;
    const totalDays = 30; // Jours du mois
    const rate = ((totalDays - totalAbsences) / totalDays * 100).toFixed(1);

    return {
      totalAbsences,
      justified,
      unjustified,
      late,
      rate: parseFloat(rate)
    };
  };

  /**
   * Obtenir les devoirs par statut
   */
  const getAssignmentsByStatus = () => {
    if (!assignments || assignments.length === 0) {
      return {
        pending: [],
        in_progress: [],
        completed: []
      };
    }

    return {
      pending: assignments.filter(a => a.status === 'pending'),
      in_progress: assignments.filter(a => a.status === 'in_progress'),
      completed: assignments.filter(a => a.status === 'completed')
    };
  };

  /**
   * Obtenir les notifications non lues
   */
  const getUnreadNotifications = () => {
    if (!notifications || notifications.length === 0) return [];
    return notifications.filter(n => !n.is_read);
  };

  // Charger les données au montage et lors du changement de mode
  useEffect(() => {
    loadDashboardData();
  }, [studentId, dataMode]);

  return {
    // Données
    studentProfile,
    stats,
    grades,
    attendance,
    assignments,
    notifications,
    achievements,
    behavior,
    schedule,

    // États
    loading,
    error,
    isDemo,

    // Actions
    refreshData,
    markNotificationAsRead,

    // Utilitaires
    getGradesBySubject,
    getAttendanceStats,
    getAssignmentsByStatus,
    getUnreadNotifications
  };
};

export default useStudentDashboardData;
