import { supabase } from "../lib/supabase.js";

export class ConfigurationService {
  static async initializeSchoolConfigurations(schoolId) {
    console.log("⚙️ Initialisation des configurations pour l'école: " + schoolId);
    
    const results = {
      gradeTypes: [],
      attendanceTypes: [],
      userRoles: [],
      errors: []
    };

    try {
      // 1. Initialiser les types de notes par défaut
      const defaultGradeTypes = [
        { school_id: schoolId, name: 'Devoir Surveillé', code: 'DS', coefficient: 1.0, description: 'Évaluation formelle en classe' },
        { school_id: schoolId, name: 'Devoir Maison', code: 'DM', coefficient: 0.5, description: 'Travail à faire à la maison' },
        { school_id: schoolId, name: 'Contrôle Continu', code: 'CC', coefficient: 1.0, description: 'Évaluation continue' },
        { school_id: schoolId, name: 'Examen Final', code: 'EF', coefficient: 2.0, description: 'Examen de fin de période' },
        { school_id: schoolId, name: 'Projet', code: 'PROJ', coefficient: 1.5, description: 'Travail de projet' }
      ];

      const { data: gradeTypesData, error: gradeTypesError } = await supabase
        .from('grade_types')
        .insert(defaultGradeTypes)
        .select();

      if (gradeTypesError) {
        console.warn('⚠️ Erreur création types de notes:', gradeTypesError);
        results.errors.push({ type: 'gradeTypes', error: gradeTypesError.message });
      } else {
        results.gradeTypes = gradeTypesData;
        console.log('✅ Types de notes créés:', gradeTypesData.length);
      }

      // 2. Initialiser les types de présence par défaut
      const defaultAttendanceTypes = [
        { school_id: schoolId, name: 'Présent', code: 'PRESENT', description: 'Élève présent en cours' },
        { school_id: schoolId, name: 'Absent', code: 'ABSENT', description: 'Élève absent non justifié' },
        { school_id: schoolId, name: 'Retard', code: 'LATE', description: 'Élève en retard' },
        { school_id: schoolId, name: 'Justifié', code: 'JUSTIFIED', description: 'Absence justifiée' },
        { school_id: schoolId, name: 'Exempté', code: 'EXEMPT', description: 'Élève exempté de cours' }
      ];

      const { data: attendanceTypesData, error: attendanceTypesError } = await supabase
        .from('attendance_types')
        .insert(defaultAttendanceTypes)
        .select();

      if (attendanceTypesError) {
        console.warn('⚠️ Erreur création types de présence:', attendanceTypesError);
        results.errors.push({ type: 'attendanceTypes', error: attendanceTypesError.message });
      } else {
        results.attendanceTypes = attendanceTypesData;
        console.log('✅ Types de présence créés:', attendanceTypesData.length);
      }

      // 3. Initialiser les rôles utilisateur par défaut
      const defaultUserRoles = [
        { school_id: schoolId, name: 'Enseignant', code: 'TEACHER', permissions: ['view_grades', 'view_students', 'manage_attendance'] },
        { school_id: schoolId, name: 'Secrétaire', code: 'SECRETARY', permissions: ['manage_students', 'manage_payments', 'manage_documents'] },
        { school_id: schoolId, name: 'Surveillant', code: 'MONITOR', permissions: ['view_students', 'manage_attendance'] },
        { school_id: schoolId, name: 'Coordinateur', code: 'COORDINATOR', permissions: ['manage_teachers', 'view_analytics', 'manage_classes'] }
      ];

      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .insert(defaultUserRoles)
        .select();

      if (userRolesError) {
        console.warn('⚠️ Erreur création rôles utilisateur:', userRolesError);
        results.errors.push({ type: 'userRoles', error: userRolesError.message });
      } else {
        results.userRoles = userRolesData;
        console.log('✅ Rôles utilisateur créés:', userRolesData.length);
      }

      results.success = results.errors.length === 0;
      return results;

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des configurations:', error);
      results.errors.push({ type: 'general', error: error.message });
      results.success = false;
      return results;
    }
  }

  static async getDefaultConfigurations() {
    return {
      gradeTypes: [
        { name: 'Devoir Surveillé', code: 'DS', coefficient: 1.0 },
        { name: 'Devoir Maison', code: 'DM', coefficient: 0.5 },
        { name: 'Contrôle Continu', code: 'CC', coefficient: 1.0 },
        { name: 'Examen Final', code: 'EF', coefficient: 2.0 }
      ],
      attendanceTypes: [
        { name: 'Présent', code: 'PRESENT' },
        { name: 'Absent', code: 'ABSENT' },
        { name: 'Retard', code: 'LATE' },
        { name: 'Justifié', code: 'JUSTIFIED' }
      ],
      userRoles: [
        { name: 'Enseignant', code: 'TEACHER' },
        { name: 'Secrétaire', code: 'SECRETARY' },
        { name: 'Surveillant', code: 'MONITOR' }
      ]
    };
  }

  static async initializeEvaluationPeriods(schoolId, academicYearId, schoolType) {
    console.log("📅 Initialisation des périodes d'évaluation pour:", schoolType);
    
    // Déterminer les périodes selon le type d'établissement
    let periods = [];
    const basePeriods = [
      { name: 'Premier Trimestre', start_date: '2024-09-01', end_date: '2024-11-30' },
      { name: 'Deuxième Trimestre', start_date: '2024-12-01', end_date: '2025-03-31' },
      { name: 'Troisième Trimestre', start_date: '2025-04-01', end_date: '2025-07-31' }
    ];

    if (schoolType.includes('lycée') || schoolType.includes('college') || schoolType.includes('secondaire')) {
      periods = basePeriods;
    } else if (schoolType.includes('primaire')) {
      periods = basePeriods;
    } else {
      // Par défaut, utiliser les trimestres
      periods = basePeriods;
    }

    // Ajouter l'ID de l'école et de l'année académique
    const periodsToInsert = periods.map(period => ({
      ...period,
      school_id: schoolId,
      academic_year_id: academicYearId,
      is_current: period.name === 'Premier Trimestre' // Premier trimestre actif par défaut
    }));

    const { data, error } = await supabase
      .from('evaluation_periods')
      .insert(periodsToInsert)
      .select();

    if (error) {
      console.warn('⚠️ Erreur création périodes d\'évaluation:', error);
      throw error;
    }

    console.log('✅ Périodes d\'évaluation créées:', data.length);
    return data;
  }
}

export default ConfigurationService;