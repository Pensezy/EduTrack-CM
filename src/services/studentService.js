import { supabase } from '../lib/supabase';

/**
 * Service pour gérer les données des élèves depuis Supabase
 */

/**
 * Récupère le profil complet d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Object>} Profil de l'élève
 */
export const getStudentProfile = async (studentId) => {
  try {
    // Utiliser la vue normalisée qui mappe current_class → class_id
    const { data, error } = await supabase
      .from('students_normalized')
      .select(`
        *,
        classes:class_id (
          id,
          name,
          level,
          section
        )
      `)
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil élève:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Object>} Statistiques de l'élève
 */
export const getStudentStats = async (studentId) => {
  try {
    // Récupérer la moyenne générale (utiliser la vue normalisée)
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades_normalized')
      .select('grade')
      .eq('student_id', studentId);

    if (gradesError) throw gradesError;

    const averageGrade = gradesData.length > 0
      ? (gradesData.reduce((sum, g) => sum + parseFloat(g.grade), 0) / gradesData.length).toFixed(2)
      : '0.00';

    // Récupérer le taux de présence
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendances')
      .select('status')
      .eq('student_id', studentId);

    if (attendanceError) throw attendanceError;

    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(a => a.status === 'present').length;
    const attendanceRate = totalDays > 0
      ? ((presentDays / totalDays) * 100).toFixed(1)
      : '0.0';

    // Compter les devoirs
    const { count: assignmentsCount, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', studentId); // Cela devrait être lié à la classe de l'élève

    if (assignmentsError) throw assignmentsError;

    // Compter les accomplissements
    const { count: achievementsCount, error: achievementsError } = await supabase
      .from('student_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId);

    if (achievementsError) throw achievementsError;

    return {
      averageGrade,
      attendanceRate,
      assignmentsCount: assignmentsCount || 0,
      achievementsCount: achievementsCount || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

/**
 * Récupère les notes d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Array>} Liste des notes
 */
export const getStudentGrades = async (studentId) => {
  try {
    // Utiliser la vue normalisée qui mappe value→grade, description→comment
    const { data, error } = await supabase
      .from('grades_normalized')
      .select(`
        *,
        subjects (
          name,
          code
        ),
        teachers (
          first_name,
          last_name
        )
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(grade => ({
      id: grade.id,
      subject: grade.subjects?.name || 'Matière inconnue',
      subjectCode: grade.subjects?.code || '',
      grade: parseFloat(grade.grade),
      maxGrade: parseFloat(grade.max_grade || 20),
      coefficient: parseFloat(grade.coefficient || 1),
      type: grade.grade_type || 'evaluation',
      date: grade.date,
      teacher: grade.teachers
        ? `${grade.teachers.first_name} ${grade.teachers.last_name}`
        : 'Enseignant inconnu',
      comment: grade.comment || ''
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

/**
 * Récupère l'historique de présence d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Array>} Historique de présence
 */
export const getStudentAttendance = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(30); // Limiter aux 30 derniers jours

    if (error) throw error;

    return data.map(attendance => ({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      reason: attendance.reason || '',
      period: attendance.period || 'full_day'
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de la présence:', error);
    throw error;
  }
};

/**
 * Récupère les devoirs assignés à un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Array>} Liste des devoirs
 */
export const getStudentAssignments = async (studentId) => {
  try {
    // Récupérer d'abord la classe de l'élève (via current_class)
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('current_class')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    if (!studentData?.current_class) {
      return [];
    }

    // Récupérer les devoirs de la classe
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        subjects (
          name,
          code
        ),
        teachers (
          first_name,
          last_name
        )
      `)
      .eq('class_id', studentData.current_class)
      .order('due_date', { ascending: true });

    if (error) throw error;

    return data.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description || '',
      subject: assignment.subjects?.name || 'Matière inconnue',
      subjectCode: assignment.subjects?.code || '',
      teacher: assignment.teachers
        ? `${assignment.teachers.first_name} ${assignment.teachers.last_name}`
        : 'Enseignant inconnu',
      dueDate: assignment.due_date,
      status: new Date(assignment.due_date) < new Date() ? 'passed' : 'pending',
      type: assignment.assignment_type || 'homework'
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs:', error);
    throw error;
  }
};

/**
 * Récupère les notifications d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Array>} Liste des notifications
 */
export const getStudentNotifications = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      date: notification.created_at,
      read: notification.read || false,
      time: getTimeAgo(notification.created_at)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

/**
 * Récupère les accomplissements d'un élève
 * @param {string} studentId - ID de l'élève
 * @returns {Promise<Array>} Liste des accomplissements
 */
export const getStudentAchievements = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description || '',
      category: achievement.category || 'academic',
      date: achievement.date,
      icon: getAchievementIcon(achievement.category)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des accomplissements:', error);
    throw error;
  }
};

/**
 * Utilitaire pour obtenir l'icône d'un accomplissement
 */
const getAchievementIcon = (category) => {
  const icons = {
    academic: '🎓',
    sports: '⚽',
    arts: '🎨',
    behavior: '⭐',
    leadership: '👑',
    community: '🤝'
  };
  return icons[category] || '🏆';
};

/**
 * Utilitaire pour formater le temps écoulé
 */
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
  return date.toLocaleDateString('fr-FR');
};
