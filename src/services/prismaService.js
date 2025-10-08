// Service optimisé pour les opérations base de données
// Utilise Supabase client côté navigateur (Prisma est côté serveur seulement)

import { supabase } from '../lib/supabase.js';

/**
 * Service centralisé pour les opérations base de données
 */
class DatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Initialiser les données par défaut pour une école
   */
  async initializeSchoolDefaults(schoolId, academicYearId) {
    try {
      console.log('🏗️ Initialisation des données par défaut avec Prisma pour l\'école:', schoolId);
      
      const results = {
        success: true,
        created: [],
        errors: []
      };

      // 1. Créer les matières par défaut
      const defaultSubjects = [
        { name: 'Mathématiques', code: 'MATH', category: 'Sciences', coefficient: 4 },
        { name: 'Français', code: 'FR', category: 'Langues', coefficient: 4 },
        { name: 'Anglais', code: 'EN', category: 'Langues', coefficient: 3 },
        { name: 'Histoire-Géographie', code: 'HG', category: 'Sciences Humaines', coefficient: 3 },
        { name: 'Sciences Physiques', code: 'PC', category: 'Sciences', coefficient: 3 },
        { name: 'Sciences de la Vie et de la Terre', code: 'SVT', category: 'Sciences', coefficient: 2 },
        { name: 'Éducation Physique et Sportive', code: 'EPS', category: 'Sports', coefficient: 1 },
        { name: 'Arts Plastiques', code: 'ARTS', category: 'Arts', coefficient: 1 },
        { name: 'Musique', code: 'MUS', category: 'Arts', coefficient: 1 },
        { name: 'Technologie', code: 'TECH', category: 'Sciences', coefficient: 2 }
      ];

      try {
        const subjectsToInsert = defaultSubjects.map(subject => ({
          school_id: schoolId,
          name: subject.name,
          code: subject.code,
          category: subject.category,
          coefficient: subject.coefficient,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: subjectsData, error: subjectsError } = await this.supabase
          .from('subjects')
          .insert(subjectsToInsert)
          .select();

        if (subjectsError) {
          throw subjectsError;
        }

        console.log('✅ Matières créées:', subjectsData.length);
        results.created.push(`${subjectsData.length} matières`);
      } catch (error) {
        console.warn('⚠️ Erreur création matières:', error);
        results.errors.push(`Matières: ${error.message}`);
      }

      // 2. Créer les classes par défaut
      const defaultClasses = [
        { name: '6ème A', level: '6ème', section: 'A', capacity: 35 },
        { name: '6ème B', level: '6ème', section: 'B', capacity: 35 },
        { name: '5ème A', level: '5ème', section: 'A', capacity: 35 },
        { name: '5ème B', level: '5ème', section: 'B', capacity: 35 },
        { name: '4ème A', level: '4ème', section: 'A', capacity: 35 },
        { name: '4ème B', level: '4ème', section: 'B', capacity: 35 },
        { name: '3ème A', level: '3ème', section: 'A', capacity: 35 },
        { name: '3ème B', level: '3ème', section: 'B', capacity: 35 }
      ];

      try {
        const classesToInsert = defaultClasses.map(cls => ({
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: cls.name,
          level: cls.level,
          section: cls.section,
          capacity: cls.capacity,
          current_enrollment: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: classesData, error: classesError } = await this.supabase
          .from('classes')
          .insert(classesToInsert)
          .select();

        if (classesError) {
          throw classesError;
        }

        console.log('✅ Classes créées:', classesData.length);
        results.created.push(`${classesData.length} classes`);
      } catch (error) {
        console.warn('⚠️ Erreur création classes:', error);
        results.errors.push(`Classes: ${error.message}`);
      }

      return results;

    } catch (error) {
      console.error('❌ Erreur initialisation données par défaut:', error);
      return {
        success: false,
        created: [],
        errors: [error.message]
      };
    }
  }

  /**
   * Récupérer les statistiques d'une école
   */
  async getSchoolStatistics(schoolId) {
    try {
      const [studentsCount, teachersCount, classesCount, paymentsSum] = await Promise.all([
        this.supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('is_active', true),
        this.supabase
          .from('teachers')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
          .eq('is_active', true),
        this.supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId),
        this.supabase
          .from('payments')
          .select('amount')
          .eq('school_id', schoolId)
          .eq('status', 'completed')
      ]);

      const totalRevenue = paymentsSum.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      return {
        success: true,
        data: {
          students: studentsCount.count || 0,
          teachers: teachersCount.count || 0,
          classes: classesCount.count || 0,
          totalRevenue
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifier les données manquantes d'une école
   */
  async checkMissingData(schoolId) {
    try {
      const [subjectsCount, classesCount, academicYearsCount] = await Promise.all([
        this.supabase
          .from('subjects')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId),
        this.supabase
          .from('classes')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId),
        this.supabase
          .from('academic_years')
          .select('id', { count: 'exact' })
          .eq('school_id', schoolId)
      ]);

      const missingData = [];
      if ((subjectsCount.count || 0) === 0) missingData.push('subjects');
      if ((classesCount.count || 0) === 0) missingData.push('classes');
      if ((academicYearsCount.count || 0) === 0) missingData.push('academic_years');

      return {
        success: true,
        isComplete: missingData.length === 0,
        missingData,
        counts: {
          subjects: subjectsCount.count || 0,
          classes: classesCount.count || 0,
          academicYears: academicYearsCount.count || 0
        }
      };
    } catch (error) {
      console.error('❌ Erreur vérification données manquantes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Valider et corriger les données d'un directeur
   */
  async validateDirectorData(userId, directorEmail) {
    try {
      console.log('🔍 Validation des données directeur pour:', directorEmail);

      // Récupérer l'école du directeur
      const { data: school, error: schoolError } = await this.supabase
        .from('schools')
        .select(`
          *,
          users (*)
        `)
        .eq('director_user_id', userId)
        .single();

      if (schoolError || !school) {
        return { success: false, message: 'Aucune école trouvée' };
      }

      const corrections = [];

      // Vérifier le nom du directeur
      if (!school.director_name || school.director_name.trim() === '') {
        const directorName = school.users?.full_name || 
          directorEmail.split('@')[0].charAt(0).toUpperCase() + 
          directorEmail.split('@')[0].slice(1).replace(/[._]/g, ' ');

        const { error: updateError } = await this.supabase
          .from('schools')
          .update({ 
            director_name: directorName,
            updated_at: new Date().toISOString()
          })
          .eq('id', school.id);

        if (!updateError) {
          corrections.push(`Nom du directeur ajouté: ${directorName}`);
        }
      }

      // Vérifier les données utilisateur
      if (!school.users) {
        const { error: upsertError } = await this.supabase
          .from('users')
          .upsert({
            id: userId,
            email: directorEmail,
            full_name: school.director_name || 'Directeur',
            role: 'principal',
            current_school_id: school.id,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (!upsertError) {
          corrections.push('Données utilisateur créées/mises à jour');
        }
      }

      console.log(`✅ Validation terminée. ${corrections.length} corrections appliquées`);

      return {
        success: true,
        corrections,
        schoolData: school,
        message: corrections.length > 0 ? `${corrections.length} corrections appliquées` : 'Données valides'
      };

    } catch (error) {
      console.error('❌ Erreur validation directeur:', error);
      return {
        success: false,
        message: error.message,
        corrections: []
      };
    }
  }

  /**
   * Pas de déconnexion nécessaire pour Supabase client
   */
  async disconnect() {
    // Pas de déconnexion nécessaire pour Supabase client
  }
}

// Instance singleton
const databaseService = new DatabaseService();

export default databaseService;

// Exports nommés pour la compatibilité
export {
  databaseService as prismaService,
  DatabaseService as PrismaService
};