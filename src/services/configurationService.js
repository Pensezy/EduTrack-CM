import { supabase } from '../lib/supabase.js';

/**
 * Service pour initialiser les données de configuration par défaut pour une école
 */
export class ConfigurationService {
  
  /**
   * Initialise toutes les configurations par défaut pour une nouvelle école
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<Object>} - Résultats de l'initialisation
   */
  static async initializeSchoolConfigurations(schoolId) {
    try {
      console.log(`🔧 Initialisation des configurations pour l'école ${schoolId}`);

      const results = {
        gradeTypes: [],
        attendanceTypes: [],
        userRoles: [],
        errors: []
      };

      // Initialiser les types de notes
      try {
        results.gradeTypes = await this.initializeGradeTypes(schoolId);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des types de notes:', error);
        results.errors.push({ type: 'gradeTypes', error: error.message });
      }

      // Initialiser les types de présence
      try {
        results.attendanceTypes = await this.initializeAttendanceTypes(schoolId);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des types de présence:', error);
        results.errors.push({ type: 'attendanceTypes', error: error.message });
      }

      // Initialiser les rôles utilisateur
      try {
        results.userRoles = await this.initializeUserRoles(schoolId);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des rôles utilisateur:', error);
        results.errors.push({ type: 'userRoles', error: error.message });
      }

      console.log('✅ Initialisation des configurations terminée:', results);
      return results;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des configurations:', error);
      throw error;
    }
  }

  /**
   * Initialise les types de notes par défaut
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<Array>} - Types de notes créés
   */
  static async initializeGradeTypes(schoolId) {
    const defaultGradeTypes = [
      {
        school_id: schoolId,
        name: 'Interrogation',
        code: 'INT',
        coefficient: 1.0,
        description: 'Note d\'interrogation écrite ou orale',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Devoir',
        code: 'DEV',
        coefficient: 2.0,
        description: 'Note de devoir surveillé',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Composition',
        code: 'COMP',
        coefficient: 3.0,
        description: 'Note de composition trimestrielle',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Participation',
        code: 'PART',
        coefficient: 0.5,
        description: 'Note de participation en classe',
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from('grade_types')
      .upsert(defaultGradeTypes, { 
        onConflict: 'school_id,code',
        ignoreDuplicates: true 
      })
      .select();

    if (error) {
      console.error('Erreur lors de la création des types de notes:', error);
      // Ne pas lever d'erreur si la table n'existe pas encore
      if (error.code === '42P01') {
        console.warn('⚠️ Table grade_types non trouvée - migration nécessaire');
        return [];
      }
      throw error;
    }

    console.log(`✅ ${data?.length || 0} types de notes initialisés`);
    return data || [];
  }

  /**
   * Initialise les types de présence par défaut
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<Array>} - Types de présence créés
   */
  static async initializeAttendanceTypes(schoolId) {
    const defaultAttendanceTypes = [
      {
        school_id: schoolId,
        name: 'Présent',
        code: 'P',
        description: 'Élève présent en classe',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Absent',
        code: 'A',
        description: 'Élève absent non justifié',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Absent Justifié',
        code: 'AJ',
        description: 'Élève absent avec justification',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Retard',
        code: 'R',
        description: 'Élève en retard',
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Excusé',
        code: 'E',
        description: 'Élève excusé (dispense)',
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from('attendance_types')
      .upsert(defaultAttendanceTypes, { 
        onConflict: 'school_id,code',
        ignoreDuplicates: true 
      })
      .select();

    if (error) {
      console.error('Erreur lors de la création des types de présence:', error);
      if (error.code === '42P01') {
        console.warn('⚠️ Table attendance_types non trouvée - migration nécessaire');
        return [];
      }
      throw error;
    }

    console.log(`✅ ${data?.length || 0} types de présence initialisés`);
    return data || [];
  }

  /**
   * Initialise les rôles utilisateur par défaut
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<Array>} - Rôles créés
   */
  static async initializeUserRoles(schoolId) {
    const defaultUserRoles = [
      {
        school_id: schoolId,
        name: 'Directeur',
        code: 'DIRECTOR',
        permissions: [
          'manage_all',
          'view_reports',
          'manage_users',
          'manage_settings',
          'manage_finances',
          'view_analytics'
        ],
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Directeur Adjoint',
        code: 'VICE_DIRECTOR',
        permissions: [
          'manage_users',
          'view_reports',
          'manage_students',
          'manage_teachers',
          'view_analytics'
        ],
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Enseignant',
        code: 'TEACHER',
        permissions: [
          'manage_grades',
          'view_students',
          'manage_attendance',
          'create_assignments',
          'view_class_reports'
        ],
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Secrétaire',
        code: 'SECRETARY',
        permissions: [
          'manage_students',
          'manage_payments',
          'view_reports',
          'manage_documents',
          'create_notifications'
        ],
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Comptable',
        code: 'ACCOUNTANT',
        permissions: [
          'manage_finances',
          'manage_payments',
          'view_financial_reports',
          'manage_payment_types'
        ],
        is_active: true
      },
      {
        school_id: schoolId,
        name: 'Surveillant',
        code: 'SUPERVISOR',
        permissions: [
          'manage_attendance',
          'view_students',
          'create_disciplinary_reports'
        ],
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from('user_roles')
      .upsert(defaultUserRoles, { 
        onConflict: 'school_id,code',
        ignoreDuplicates: true 
      })
      .select();

    if (error) {
      console.error('Erreur lors de la création des rôles utilisateur:', error);
      if (error.code === '42P01') {
        console.warn('⚠️ Table user_roles non trouvée - migration nécessaire');
        return [];
      }
      throw error;
    }

    console.log(`✅ ${data?.length || 0} rôles utilisateur initialisés`);
    return data || [];
  }

  /**
   * Initialise les périodes d'évaluation pour une année académique
   * @param {string} schoolId - ID de l'école
   * @param {string} academicYearId - ID de l'année académique
   * @param {string} schoolType - Type d'école (primaire, secondaire, etc.)
   * @returns {Promise<Array>} - Périodes créées
   */
  static async initializeEvaluationPeriods(schoolId, academicYearId, schoolType = 'secondaire') {
    let defaultPeriods = [];

    if (schoolType === 'primaire') {
      // Système trimestriel pour le primaire
      defaultPeriods = [
        {
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: '1er Trimestre',
          start_date: new Date(new Date().getFullYear(), 8, 1), // Septembre
          end_date: new Date(new Date().getFullYear(), 11, 31), // Décembre
          is_current: true
        },
        {
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: '2ème Trimestre',
          start_date: new Date(new Date().getFullYear() + 1, 0, 1), // Janvier
          end_date: new Date(new Date().getFullYear() + 1, 3, 30), // Avril
          is_current: false
        },
        {
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: '3ème Trimestre',
          start_date: new Date(new Date().getFullYear() + 1, 4, 1), // Mai
          end_date: new Date(new Date().getFullYear() + 1, 6, 31), // Juillet
          is_current: false
        }
      ];
    } else {
      // Système semestriel pour le secondaire
      defaultPeriods = [
        {
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: '1er Semestre',
          start_date: new Date(new Date().getFullYear(), 8, 1), // Septembre
          end_date: new Date(new Date().getFullYear() + 1, 1, 31), // Février
          is_current: true
        },
        {
          school_id: schoolId,
          academic_year_id: academicYearId,
          name: '2ème Semestre',
          start_date: new Date(new Date().getFullYear() + 1, 2, 1), // Mars
          end_date: new Date(new Date().getFullYear() + 1, 6, 31), // Juillet
          is_current: false
        }
      ];
    }

    const { data, error } = await supabase
      .from('evaluation_periods')
      .upsert(defaultPeriods, { 
        onConflict: 'school_id,academic_year_id,name',
        ignoreDuplicates: true 
      })
      .select();

    if (error) {
      console.error('Erreur lors de la création des périodes d\'évaluation:', error);
      if (error.code === '42P01') {
        console.warn('⚠️ Table evaluation_periods non trouvée - migration nécessaire');
        return [];
      }
      throw error;
    }

    console.log(`✅ ${data?.length || 0} périodes d'évaluation initialisées`);
    return data || [];
  }

  /**
   * Récupère les configurations d'une école
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<Object>} - Configurations de l'école
   */
  static async getSchoolConfigurations(schoolId) {
    try {
      const [gradeTypes, attendanceTypes, userRoles] = await Promise.allSettled([
        supabase.from('grade_types').select('*').eq('school_id', schoolId).eq('is_active', true),
        supabase.from('attendance_types').select('*').eq('school_id', schoolId).eq('is_active', true),
        supabase.from('user_roles').select('*').eq('school_id', schoolId).eq('is_active', true)
      ]);

      return {
        gradeTypes: gradeTypes.status === 'fulfilled' ? gradeTypes.value.data || [] : [],
        attendanceTypes: attendanceTypes.status === 'fulfilled' ? attendanceTypes.value.data || [] : [],
        userRoles: userRoles.status === 'fulfilled' ? userRoles.value.data || [] : [],
        isConfigured: true
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error);
      return {
        gradeTypes: [],
        attendanceTypes: [],
        userRoles: [],
        isConfigured: false,
        error: error.message
      };
    }
  }

  /**
   * Vérifie si une école a ses configurations initialisées
   * @param {string} schoolId - ID de l'école
   * @returns {Promise<boolean>} - True si configurée
   */
  static async isSchoolConfigured(schoolId) {
    try {
      const configs = await this.getSchoolConfigurations(schoolId);
      return configs.gradeTypes.length > 0 && 
             configs.attendanceTypes.length > 0 && 
             configs.userRoles.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification des configurations:', error);
      return false;
    }
  }
}

export default ConfigurationService;