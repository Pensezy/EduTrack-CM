/**
 * Hook unifié pour gérer les données du dashboard étudiant
 * Récupère les données depuis Supabase uniquement
 */

import { useState, useEffect } from 'react';
import studentProductionDataService from '../services/studentProductionDataService';
import { computeSubjectAverage, computeOverallAverage } from '../utils/grading';

export const useStudentDashboardData = (studentId) => {
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

  /**
   * Charger toutes les données du dashboard
   */
  const loadDashboardData = async () => {
    if (!studentId) {
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

      console.log(`📚 Chargement données étudiant depuis Supabase...`);
      console.log(`👤 ID étudiant:`, studentId);

      // Définir le contexte utilisateur
      studentProductionDataService.setUserContext(studentId);

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
        studentProductionDataService.getStudentProfile(studentId),
        studentProductionDataService.getStudentStats(studentId),
        studentProductionDataService.getStudentGrades(studentId),
        studentProductionDataService.getStudentAttendance(studentId),
        studentProductionDataService.getStudentAssignments(studentId),
        studentProductionDataService.getStudentNotifications(studentId),
        studentProductionDataService.getStudentAchievements(studentId),
        studentProductionDataService.getStudentBehavior(studentId),
        studentProductionDataService.getStudentSchedule(studentId)
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
   * Marquer une notification comme lue
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      await studentProductionDataService.markNotificationAsRead(notificationId);

      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('❌ Erreur marquage notification:', err);
    }
  };

  /**
   * Rafraîchir toutes les données
   */
  const refresh = () => {
    loadDashboardData();
  };

  // Charger les données au montage et quand studentId change
  useEffect(() => {
    if (studentId) {
      loadDashboardData();
    }
  }, [studentId]);

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

    // État
    loading,
    error,

    // Actions
    markNotificationAsRead,
    refresh,
    reload: refresh
  };
};

export default useStudentDashboardData;
