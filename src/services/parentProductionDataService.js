/**
 * Service de données de production pour le dashboard parent
 * Gère les requêtes Supabase pour récupérer les vraies données des enfants
 */

import { supabase } from '../lib/supabase';

const parentProductionDataService = {
  /**
   * Contexte de sécurité (ID du parent connecté)
   */
  currentParentId: null,

  /**
   * Définir le contexte utilisateur parent
   */
  setUserContext(parentId) {
    this.currentParentId = parentId;
    console.log('🔐 Contexte parent défini:', parentId);
  },

  /**
   * Vérifier que le contexte est défini
   */
  ensureContext() {
    if (!this.currentParentId) {
      throw new Error('Contexte utilisateur parent non défini');
    }
  },

  /**
   * Récupérer le profil du parent
   */
  getParentProfile: async (parentId) => {
    try {
      if (parentId) {
        parentProductionDataService.setUserContext(parentId);
      }
      parentProductionDataService.ensureContext();

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, role, is_active')
        .eq('id', parentProductionDataService.currentParentId)
        .eq('role', 'parent')
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération profil parent:', error);
      return { data: null, error };
    }
  },

  /**
   * Récupérer tous les enfants d'un parent
   */
  getChildren: async (parentId) => {
    try {
      if (parentId) {
        parentProductionDataService.setUserContext(parentId);
      }
      parentProductionDataService.ensureContext();

      console.log('📚 Récupération enfants pour parent:', parentProductionDataService.currentParentId);

      const { data, error } = await supabase
        .from('parent_students')
        .select(`
          relationship,
          is_primary,
          student:students (
            id,
            matricule,
            full_name,
            gender,
            birth_date,
            photo_url,
            is_active,
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
          )
        `)
        .eq('parent_id', parentProductionDataService.currentParentId)
        .eq('student.is_active', true);

      if (error) throw error;

      // Transformer les données pour avoir un format plat
      const children = data?.map(item => ({
        ...item.student,
        relationship: item.relationship,
        is_primary: item.is_primary
      })) || [];

      console.log(`✅ ${children.length} enfant(s) trouvé(s)`);
      return { data: children, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération enfants:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les notes d'un enfant
   */
  getChildGrades: async (childId) => {
    try {
      parentProductionDataService.ensureContext();

      console.log('📝 Récupération notes pour enfant:', childId);

      // Vérifier que l'enfant appartient bien au parent
      const { data: verifyData, error: verifyError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentProductionDataService.currentParentId)
        .eq('student_id', childId)
        .single();

      if (verifyError || !verifyData) {
        throw new Error('Accès non autorisé à cet enfant');
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
          subject:subjects (
            id,
            name,
            code
          ),
          teacher:users!grades_teacher_id_fkey (
            full_name
          )
        `)
        .eq('student_id', childId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transformer et enrichir les données
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
        average: grade.grade, // À calculer si besoin
        trend: 'stable' // À calculer si besoin
      })) || [];

      console.log(`✅ ${grades.length} note(s) trouvée(s)`);
      return { data: grades, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération notes:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les présences/absences d'un enfant
   */
  getChildAttendance: async (childId) => {
    try {
      parentProductionDataService.ensureContext();

      console.log('📅 Récupération présences pour enfant:', childId);

      // Vérifier que l'enfant appartient bien au parent
      const { data: verifyData, error: verifyError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentProductionDataService.currentParentId)
        .eq('student_id', childId)
        .single();

      if (verifyError || !verifyData) {
        throw new Error('Accès non autorisé à cet enfant');
      }

      const { data, error } = await supabase
        .from('absences')
        .select(`
          id,
          absence_date,
          absence_type,
          justified,
          justification,
          created_at
        `)
        .eq('student_id', childId)
        .order('absence_date', { ascending: false });

      if (error) throw error;

      // Transformer en objet avec dates comme clés
      const attendance = {};
      data?.forEach(absence => {
        const status = absence.justified 
          ? 'excused' 
          : absence.absence_type === 'late' 
            ? 'late' 
            : 'absent';
        
        attendance[absence.absence_date] = {
          status,
          justification: absence.justification
        };
      });

      console.log(`✅ ${Object.keys(attendance).length} enregistrement(s) de présence`);
      return { data: attendance, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération présences:', error);
      return { data: {}, error };
    }
  },

  /**
   * Récupérer les paiements d'un enfant
   */
  getChildPayments: async (childId) => {
    try {
      parentProductionDataService.ensureContext();

      console.log('💰 Récupération paiements pour enfant:', childId);

      // Vérifier que l'enfant appartient bien au parent
      const { data: verifyData, error: verifyError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentProductionDataService.currentParentId)
        .eq('student_id', childId)
        .single();

      if (verifyError || !verifyData) {
        throw new Error('Accès non autorisé à cet enfant');
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          type,
          description,
          amount,
          currency,
          status,
          due_date,
          paid_date,
          payment_method,
          created_at
        `)
        .eq('student_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log(`✅ ${data?.length || 0} paiement(s) trouvé(s)`);
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Erreur récupération paiements:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer les notifications d'un enfant
   */
  getChildNotifications: async (childId) => {
    try {
      parentProductionDataService.ensureContext();

      console.log('🔔 Récupération notifications pour enfant:', childId);

      // Vérifier que l'enfant appartient bien au parent
      const { data: verifyData, error: verifyError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentProductionDataService.currentParentId)
        .eq('student_id', childId)
        .single();

      if (verifyError || !verifyData) {
        throw new Error('Accès non autorisé à cet enfant');
      }

      // Récupérer l'user_id de l'étudiant
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', childId)
        .single();

      if (studentError || !studentData?.user_id) {
        console.warn('⚠️ Aucun user_id trouvé pour cet étudiant');
        return { data: [], error: null };
      }

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
        .eq('user_id', studentData.user_id)
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
        read: notif.is_read || false,
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
   * Récupérer les événements à venir
   */
  getUpcomingEvents: async (parentId) => {
    try {
      if (parentId) {
        parentProductionDataService.setUserContext(parentId);
      }
      parentProductionDataService.ensureContext();

      console.log('📆 Récupération événements pour parent:', parentProductionDataService.currentParentId);

      // Récupérer d'abord les IDs des enfants
      const { data: childrenData, error: childrenError } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', parentProductionDataService.currentParentId);

      if (childrenError) throw childrenError;

      const childIds = childrenData?.map(item => item.student_id) || [];

      if (childIds.length === 0) {
        return { data: [], error: null };
      }

      // Récupérer les événements pour ces enfants
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          location,
          type,
          status,
          school:schools (
            name
          ),
          student:students (
            full_name
          )
        `)
        .in('student_id', childIds)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(20);

      if (error) throw error;

      // Transformer les données
      const events = data?.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        school_name: event.school?.name || '',
        child_name: event.student?.full_name || '',
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        type: event.type,
        status: event.status || 'upcoming'
      })) || [];

      console.log(`✅ ${events.length} événement(s) à venir`);
      return { data: events, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération événements:', error);
      return { data: [], error };
    }
  },

  /**
   * Récupérer toutes les écoles des enfants
   */
  getSchools: async (parentId) => {
    try {
      if (parentId) {
        parentProductionDataService.setUserContext(parentId);
      }
      parentProductionDataService.ensureContext();

      console.log('🏫 Récupération écoles pour parent:', parentProductionDataService.currentParentId);

      const { data, error } = await supabase
        .from('parent_students')
        .select(`
          student:students (
            school:schools (
              id,
              name,
              code,
              type,
              city,
              country
            )
          )
        `)
        .eq('parent_id', parentProductionDataService.currentParentId);

      if (error) throw error;

      // Dédupliquer les écoles
      const schoolsMap = new Map();
      data?.forEach(item => {
        const school = item.student?.school;
        if (school && !schoolsMap.has(school.id)) {
          schoolsMap.set(school.id, {
            ...school,
            childrenCount: 1
          });
        } else if (school) {
          const existing = schoolsMap.get(school.id);
          existing.childrenCount += 1;
        }
      });

      const schools = Array.from(schoolsMap.values());

      console.log(`✅ ${schools.length} école(s) trouvée(s)`);
      return { data: schools, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération écoles:', error);
      return { data: [], error };
    }
  },

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      parentProductionDataService.ensureContext();

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

export default parentProductionDataService;
