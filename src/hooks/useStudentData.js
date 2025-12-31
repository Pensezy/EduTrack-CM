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
 * Hook personnalisé pour gérer les données de l'élève
 * Récupère les données depuis Supabase
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

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Récupérer les données depuis Supabase
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
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  return {
    loading,
    error,
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
