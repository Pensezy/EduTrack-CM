/**
 * Service de données de production pour le dashboard étudiant
 * Gère les requêtes Supabase pour récupérer les vraies données
 */

import { supabase } from '../lib/supabase';
import { computeSubjectAverage, computeOverallAverage } from '../utils/grading';

const studentProductionDataService = {
  /**
   * Contexte de sécurité (ID de l'étudiant connecté)
   */
  currentStudentId: null,

  /**
   * Définir le contexte utilisateur étudiant
   */
  setUserContext(studentId) {
    this.currentStudentId = studentId;
    console.log('🔐 Contexte étudiant défini:', studentId);
  },

  /**
   * Vérifier que le contexte est défini
   */
  ensureContext() {
    if (!this.currentStudentId) {
      throw new Error('Contexte utilisateur étudiant non défini');
    }
  },

  /**
   * Récupérer le profil de l'étudiant
   */
  getStudentProfile: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('👤 Récupération profil pour user_id:', studentProductionDataService.currentStudentId);

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          full_name,
          matricule,
          date_of_birth,
          gender,
          photo_url,
          is_active,
          user_id,
          class:classes (
            id,
            name,
            level,
            section
          ),
          school:schools (
            id,
            name,
            code,
            type,
            city,
            country
          )
        `)
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      console.log('👤 Résultat requête profil - data:', data);
      console.log('👤 Résultat requête profil - error:', error);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération profil étudiant:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer les statistiques de l'étudiant
   */
  getStudentStats: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('📊 Récupération stats pour étudiant:', studentProductionDataService.currentStudentId);

      // D'abord récupérer l'ID de l'étudiant depuis user_id
      const { data: studentInfo, error: studentError } = await supabase
        .from('students')
        .select('id, user_id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentInfo?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return {
          data: {
            averageGrade: '0.00',
            attendanceRate: '100.0',
            totalAbsences: 0,
            justifiedAbsences: 0,
            unjustifiedAbsences: 0,
            lateArrivals: 0,
            assignmentsDue: 0,
            assignmentsCompleted: 0,
            unreadNotifications: 0
          },
          error: null
        };
      }

      // Récupérer moyenne des notes
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select('grade')
        .eq('student_id', studentInfo.id);

      if (gradesError) throw gradesError;

      // Calculer une moyenne robuste en tenant compte de max_grade et coefficients
      let averageGrade = '0.00';
      try {
        if (gradesData && gradesData.length > 0) {
          const subjMap = {};
          gradesData.forEach(g => {
            const name = g.subject || 'Matière';
            if (!subjMap[name]) subjMap[name] = { grades: [] };
            subjMap[name].grades.push({ grade: g.grade, max_grade: g.max_grade, coefficient: g.coefficient });
          });

          const subjectsArray = Object.keys(subjMap).map(name => ({
            subject: name,
            average: computeSubjectAverage(subjMap[name].grades),
            coefficient: (subjMap[name].grades.reduce((acc, x) => acc + (Number(x.coefficient) || 1), 0) / Math.max(1, subjMap[name].grades.length))
          }));

          const overall = computeOverallAverage(subjectsArray, 1);
          averageGrade = overall ? overall.toFixed(2) : '0.00';
        }
      } catch (err) {
        console.warn('⚠️ Erreur calcul moyenne:', err);
        averageGrade = '0.00';
      }

      // Récupérer absences
      const { data: absencesData, error: absencesError } = await supabase
        .from('absences')
        .select('*')
        .eq('student_id', studentInfo.id);

      if (absencesError) throw absencesError;

      const totalAbsences = absencesData?.length || 0;
      const justifiedAbsences = absencesData?.filter(a => a.justified).length || 0;
      const unjustifiedAbsences = totalAbsences - justifiedAbsences;
      const lateArrivals = absencesData?.filter(a => a.absence_type === 'late').length || 0;

      // Récupérer devoirs
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('status')
        .eq('student_id', studentInfo.id);

      if (assignmentsError) console.warn('Erreur assignments:', assignmentsError);

      const assignmentsDue = assignmentsData?.filter(a => a.status === 'pending').length || 0;
      const assignmentsCompleted = assignmentsData?.filter(a => a.status === 'completed').length || 0;

      // Récupérer notifications non lues
      let unreadNotifications = 0;
      if (studentInfo?.user_id) {
        const { data: notifData } = await supabase
          .from('user_notifications')
          .select('id')
          .eq('user_id', studentInfo.user_id)
          .eq('is_read', false);

        unreadNotifications = notifData?.length || 0;
      }

      // Calculer taux de présence
      const totalDays = 30; // Mois en cours
      const attendanceRate = ((totalDays - totalAbsences) / totalDays * 100).toFixed(1);

      return {
        data: {
          averageGrade,
          attendanceRate,
          totalAbsences,
          justifiedAbsences,
          unjustifiedAbsences,
          lateArrivals,
          assignmentsDue,
          assignmentsCompleted,
          unreadNotifications
        },
        error: null
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer les notes de l'étudiant
   */
  getStudentGrades: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('📝 Récupération notes pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer l'ID de l'étudiant depuis user_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('grades')
        .select(`
          id,
          grade,
          max_grade,
          coefficient,
          grade_type,
          date,
          comment,
          term,
          subject:subjects (
            id,
            name,
            code
          ),
          teacher:users!grades_teacher_id_fkey (
            full_name
          )
        `)
        .eq('student_id', studentData.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transformer les données
      const grades = data?.map(grade => ({
        id: grade.id,
        subject: grade.subject?.name || 'Matière inconnue',
        subject_code: grade.subject?.code || '',
        grade: grade.grade,
        max_grade: grade.max_grade || 20,
        coefficient: grade.coefficient || 1,
        grade_type: grade.grade_type || 'Contrôle',
        date: grade.date,
        teacher_name: grade.teacher?.full_name || 'Enseignant',
        comment: grade.comment,
        term: grade.term || 'Trimestre 1'
      })) || [];

      console.log(`✅ ${grades.length} note(s) trouvée(s)`);
      return { data: grades, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération notes:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les présences/absences de l'étudiant
   */
  getStudentAttendance: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('📅 Récupération présences pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer l'ID de l'étudiant depuis user_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('absences')
        .select('*')
        .eq('student_id', studentData.id)
        .order('absence_date', { ascending: false });

      if (error) throw error;

      // Transformer les données
      const attendance = data?.map(record => ({
        id: record.id,
        date: record.absence_date,
        status: record.absence_type === 'late' ? 'late' : 'absent',
        absence_type: record.absence_type,
        justified: record.justified,
        justification: record.justification,
        created_at: record.created_at
      })) || [];

      console.log(`✅ ${attendance.length} enregistrement(s) de présence trouvé(s)`);
      return { data: attendance, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération présences:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les devoirs/assignments de l'étudiant
   */
  getStudentAssignments: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('📚 Récupération devoirs pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer l'ID de l'étudiant depuis user_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return { data: [], error: null };
      }

      // Vérifier si la table assignments existe
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          status,
          priority,
          subject:subjects (
            name,
            code
          )
        `)
        .eq('student_id', studentData.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.warn('⚠️ Table assignments non disponible:', error);
        return { data: [], error: null };
      }

      const assignments = data?.map(assign => ({
        id: assign.id,
        title: assign.title,
        subject: assign.subject?.name || 'Matière',
        subject_code: assign.subject?.code || '',
        description: assign.description,
        due_date: assign.due_date,
        status: assign.status,
        priority: assign.priority || 'medium'
      })) || [];

      console.log(`✅ ${assignments.length} devoir(s) trouvé(s)`);
      return { data: assignments, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération devoirs:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les notifications de l'étudiant
   */
  getStudentNotifications: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('🔔 Récupération notifications pour étudiant:', studentProductionDataService.currentStudentId);

      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          id,
          title,
          message,
          type,
          priority,
          is_read,
          metadata,
          created_at,
          school:schools (
            name
          )
        `)
        .eq('user_id', studentProductionDataService.currentStudentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transformer les données
      const notifications = data?.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority || 'medium',
        school_name: notif.school?.name || '',
        created_at: notif.created_at,
        is_read: notif.is_read || false,
        metadata: notif.metadata || {}
      })) || [];

      console.log(`✅ ${notifications.length} notification(s) trouvée(s)`);
      return { data: notifications, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les badges/achievements de l'étudiant
   */
  getStudentAchievements: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('🏆 Récupération achievements pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer l'ID de l'étudiant depuis user_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return { data: [], error: null };
      }

      // Vérifier si la table achievements existe
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', studentData.id)
        .order('earned_date', { ascending: false });

      if (error) {
        console.warn('⚠️ Table achievements non disponible:', error);
        return { data: [], error: null };
      }

      console.log(`✅ ${data?.length || 0} achievement(s) trouvé(s)`);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur récupération achievements:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer le comportement/discipline de l'étudiant
   */
  getStudentBehavior: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('🎯 Récupération comportement pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer l'ID de l'étudiant depuis user_id
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.id) {
        console.warn('⚠️ Aucun étudiant trouvé pour cet user_id');
        return {
          data: {
            overall_score: 0,
            participation: 0,
            discipline: 0,
            respect: 0,
            homework: 0,
            comments: [],
            positive_notes: []
          },
          error: null
        };
      }

      // Vérifier si la table behavior existe
      const { data, error } = await supabase
        .from('behavior')
        .select('*')
        .eq('student_id', studentData.id)
        .single();

      if (error) {
        console.warn('⚠️ Table behavior non disponible:', error);
        return {
          data: {
            overall_score: 0,
            participation: 0,
            discipline: 0,
            respect: 0,
            homework: 0,
            incidents: [],
            positive_notes: [],
            comments: []
          },
          error: null
        };
      }

      return { data: data || {}, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération comportement:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer l'emploi du temps de l'étudiant
   */
  getStudentSchedule: async (studentId) => {
    try {
      if (studentId) {
        studentProductionDataService.setUserContext(studentId);
      }
      studentProductionDataService.ensureContext();

      console.log('📆 Récupération emploi du temps pour étudiant:', studentProductionDataService.currentStudentId);

      // Récupérer la classe de l'étudiant
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('class_id')
        .eq('user_id', studentProductionDataService.currentStudentId)
        .single();

      if (studentError || !studentData?.class_id) {
        console.warn('⚠️ Classe non trouvée pour cet étudiant');
        return { data: null, error: null };
      }

      // Vérifier si la table schedule existe
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .eq('class_id', studentData.class_id);

      if (error) {
        console.warn('⚠️ Table schedule non disponible:', error);
        return { data: null, error: null };
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération emploi du temps:', error);
      return { data: null, error };
    }
  },

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      studentProductionDataService.ensureContext();

      const { data, error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      return { data: null, error };
    }
  }
};

export default studentProductionDataService;
