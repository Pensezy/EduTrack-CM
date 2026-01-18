/**
 * Service de gestion multi-établissements pour les parents (Production)
 * Gère la recherche et la vérification des parents à travers plusieurs établissements
 */

import { supabase } from '../lib/supabase';

const parentMultiSchoolService = {
  /**
   * Recherche les parents existants par terme (nom, email, téléphone)
   * @param {string} term - Terme de recherche
   * @returns {Promise<Array>} Liste des parents trouvés avec leurs relations
   */
  async searchExistingParents(term) {
    try {
      const searchLower = term.toLowerCase();

      // Rechercher les parents dans la base de données
      const { data: parents, error } = await supabase
        .from('parents')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          profession,
          user_id,
          created_at
        `)
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
        .limit(10);

      if (error) {
        console.error('Erreur recherche Supabase parents:', error);
        return [];
      }

      // Charger les relations enfants pour chaque parent
      const parentsWithRelations = await Promise.all(
        (parents || []).map(async (parent) => {
          // Charger les élèves de ce parent
          const { data: students, error: studentsError } = await supabase
            .from('students')
            .select(`
              id,
              first_name,
              last_name,
              current_class,
              school_id,
              schools (
                id,
                name,
                city,
                type
              )
            `)
            .eq('parent_id', parent.id)
            .eq('is_active', true);

          if (studentsError) {
            console.error('Erreur chargement élèves:', studentsError);
          }

          // Formater les relations
          const relations = (students || []).map(student => ({
            student: {
              id: student.id,
              firstName: student.first_name,
              lastName: student.last_name,
              className: student.current_class
            },
            school: student.schools ? {
              id: student.schools.id,
              name: student.schools.name,
              city: student.schools.city || 'Non renseigné',
              type: student.schools.type
            } : null
          }));

          return {
            id: parent.id,
            globalParentId: parent.id,
            firstName: parent.first_name,
            lastName: parent.last_name,
            email: parent.email,
            phone: parent.phone,
            address: parent.address,
            profession: parent.profession,
            userId: parent.user_id,
            createdAt: parent.created_at,
            studentRelations: relations
          };
        })
      );

      return parentsWithRelations;
    } catch (error) {
      console.error('Erreur lors de la recherche de parents:', error);
      return [];
    }
  },

  /**
   * Vérifie si un parent existe déjà selon l'email ou le téléphone
   * @param {string} email - Email du parent
   * @param {string} phone - Téléphone du parent
   * @returns {Promise<Object|null>} Parent trouvé ou null
   */
  async checkExistingParent(email, phone) {
    try {
      let query = supabase.from('parents').select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        profession,
        user_id,
        created_at
      `);

      // Construire la condition OR pour email ou phone
      const conditions = [];
      if (email) {
        conditions.push(`email.eq.${email}`);
      }
      if (phone) {
        conditions.push(`phone.eq.${phone}`);
      }

      if (conditions.length === 0) {
        return null;
      }

      const { data: parents, error } = await query.or(conditions.join(','));

      if (error) {
        console.error('Erreur vérification parent:', error);
        return null;
      }

      if (!parents || parents.length === 0) {
        return null;
      }

      // Récupérer le premier parent trouvé avec ses relations
      const parent = parents[0];
      const { data: students } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          current_class,
          school_id,
          schools (
            id,
            name,
            city,
            type
          )
        `)
        .eq('parent_id', parent.id)
        .eq('is_active', true);

      const relations = (students || []).map(student => ({
        student: {
          id: student.id,
          firstName: student.first_name,
          lastName: student.last_name,
          className: student.current_class
        },
        school: student.schools ? {
          id: student.schools.id,
          name: student.schools.name,
          city: student.schools.city || 'Non renseigné',
          type: student.schools.type
        } : null
      }));

      return {
        id: parent.id,
        globalParentId: parent.id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        email: parent.email,
        phone: parent.phone,
        address: parent.address,
        profession: parent.profession,
        userId: parent.user_id,
        createdAt: parent.created_at,
        studentRelations: relations
      };
    } catch (error) {
      console.error('Exception lors de la vérification du parent:', error);
      return null;
    }
  }
};

export { parentMultiSchoolService };
