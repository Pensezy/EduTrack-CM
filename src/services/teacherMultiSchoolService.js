/**
 * Service de gestion multi-établissements pour les enseignants (Production)
 * Gère la recherche et la gestion des enseignants à travers plusieurs établissements
 */

import { supabase } from '../lib/supabase';

const teacherMultiSchoolService = {
  /**
   * Recherche les enseignants existants par terme (nom, email, matière)
   * @param {string} term - Terme de recherche
   * @returns {Promise<Array>} Liste des enseignants trouvés avec leurs assignations
   */
  async searchExistingTeachers(term) {
    try {
      // Rechercher les enseignants dans la base de données
      const { data: teachers, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          created_at,
          teacher_assignments (
            id,
            class_name,
            subject,
            school_id,
            is_active,
            schools (
              id,
              name,
              city,
              type
            )
          )
        `)
        .eq('role', 'teacher')
        .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10);

      if (error) {
        console.error('Erreur recherche Supabase enseignants:', error);
        return [];
      }

      // Transformer les données
      return (teachers || []).map(teacher => ({
        id: teacher.id,
        globalTeacherId: teacher.id,
        fullName: teacher.full_name,
        email: teacher.email,
        phone: teacher.phone,
        avatar: teacher.avatar_url,
        createdAt: teacher.created_at,
        assignments: (teacher.teacher_assignments || []).map(assignment => ({
          id: assignment.id,
          className: assignment.class_name,
          subject: assignment.subject,
          schoolId: assignment.school_id,
          isActive: assignment.is_active,
          school: assignment.schools ? {
            id: assignment.schools.id,
            name: assignment.schools.name,
            city: assignment.schools.city || 'Non renseigné',
            type: assignment.schools.type
          } : null
        }))
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche d\'enseignants:', error);
      return [];
    }
  },

  /**
   * Vérifie si un enseignant existe déjà selon l'email
   * @param {string} email - Email de l'enseignant
   * @returns {Promise<Object|null>} Enseignant trouvé ou null
   */
  async checkExistingTeacher(email) {
    try {
      const { data: teachers, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          phone,
          avatar_url,
          created_at,
          teacher_assignments (
            id,
            class_name,
            subject,
            school_id,
            is_active,
            schools (
              id,
              name,
              city,
              type
            )
          )
        `)
        .eq('role', 'teacher')
        .eq('email', email);

      if (error) {
        console.error('Erreur vérification enseignant:', error);
        return null;
      }

      if (!teachers || teachers.length === 0) {
        return null;
      }

      const teacher = teachers[0];
      return {
        id: teacher.id,
        globalTeacherId: teacher.id,
        fullName: teacher.full_name,
        email: teacher.email,
        phone: teacher.phone,
        avatar: teacher.avatar_url,
        createdAt: teacher.created_at,
        assignments: (teacher.teacher_assignments || []).map(assignment => ({
          id: assignment.id,
          className: assignment.class_name,
          subject: assignment.subject,
          schoolId: assignment.school_id,
          isActive: assignment.is_active,
          school: assignment.schools ? {
            id: assignment.schools.id,
            name: assignment.schools.name,
            city: assignment.schools.city || 'Non renseigné',
            type: assignment.schools.type
          } : null
        }))
      };
    } catch (error) {
      console.error('Exception lors de la vérification de l\'enseignant:', error);
      return null;
    }
  },

  /**
   * Récupère les assignations d'un enseignant
   * @param {string} teacherId - ID de l'enseignant
   * @returns {Promise<Array>} Liste des assignations
   */
  async getTeacherAssignments(teacherId) {
    try {
      const { data: assignments, error } = await supabase
        .from('teacher_assignments')
        .select(`
          id,
          class_name,
          subject,
          school_id,
          is_active,
          schools (
            id,
            name,
            city,
            type
          )
        `)
        .eq('teacher_id', teacherId);

      if (error) {
        console.error('Erreur récupération assignations:', error);
        return [];
      }

      return (assignments || []).map(assignment => ({
        id: assignment.id,
        className: assignment.class_name,
        subject: assignment.subject,
        schoolId: assignment.school_id,
        isActive: assignment.is_active,
        school: assignment.schools ? {
          id: assignment.schools.id,
          name: assignment.schools.name,
          city: assignment.schools.city || 'Non renseigné',
          type: assignment.schools.type
        } : null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des assignations:', error);
      return [];
    }
  }
};

export { teacherMultiSchoolService };
