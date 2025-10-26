// Service principal pour l'authentification et la gestion des écoles
// Utilise Supabase pour les opérations côté client (Prisma ne fonctionne que côté serveur)

import { supabase } from '../lib/supabase';
import prismaService from './prismaService';
import { getCurrentAcademicYear, getAcademicYearDates } from '../utils/academicYear';
import ConfigurationService from './configurationService';

/**
 * Service pour créer une école et lier un directeur
 */

/**
 * Service pour créer une école et lier un directeur
 * Utilise Supabase directement (compatible côté client)
 */
export const createPrincipalSchool = async ({
  directorName,
  email,
  phone,
  schoolName,
  schoolType,
  address,
  city = 'Yaoundé',
  country = 'Cameroun',
  availableClasses = [],
  userId = null // ID utilisateur Supabase Auth
}) => {
  try {
    console.log('🏫 Service createPrincipalSchool appelé avec:', {
      directorName,
      email,
      schoolName,
      schoolType,
      userId
    });

    let authUserId = userId;
    
    // 1. Si pas d'userId fourni, récupérer l'utilisateur actuel connecté
    if (!authUserId) {
      const { data: currentUser, error: currentUserError } = await supabase.auth.getUser();
      
      if (currentUserError || !currentUser?.user) {
        throw new Error('Aucun utilisateur connecté. Veuillez vous reconnecter.');
      }
      
      authUserId = currentUser.user.id;
    }

    console.log('👤 Utilisation de l\'ID utilisateur:', authUserId);

    // 2. Vérifier si l'utilisateur a déjà une école - avec gestion d'erreurs améliorée
    let existingSchools = [];
    let checkError = null;
    
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('director_user_id', authUserId);
      
      if (error) {
        console.warn('⚠️ Erreur vérification école existante (non bloquante):', error);
        checkError = error;
        // Ne pas lancer d'exception ici, continuer avec la création
      } else {
        existingSchools = data;
      }
    } catch (err) {
      console.warn('⚠️ Exception lors de la vérification école existante (non bloquante):', err);
      checkError = err;
    }

    // Si l'utilisateur a déjà une école, on continue quand même (mode dégradé)
    if (existingSchools && existingSchools.length > 0) {
      console.warn(`⚠️ Cet utilisateur a déjà une école associée: ${existingSchools[0].name}`);
      // On ne bloque plus ici, on continue la création
    }

    // 3. Générer un code unique pour l'école
    let schoolCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      const prefix = schoolName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      schoolCode = `${prefix}-${year}-${random}`;
      
      console.log(`🔍 Tentative ${attempts + 1}: Vérification unicité du code ${schoolCode}`);
      
      try {
        const { data: existing, error: existingError } = await supabase
          .from('schools')
          .select('id')
          .eq('code', schoolCode)
          .maybeSingle();
        
        if (existingError) {
          console.warn('⚠️ Erreur vérification code école:', existingError);
          if (existingError.code === '406' || existingError.status === 406) {
            console.log('💡 Erreur 406 détectée, on continue avec un autre code...');
            isUnique = false;
          } else {
            // Pour les autres erreurs, on assume que le code est unique
            isUnique = true;
          }
        } else {
          isUnique = !existing;
          console.log(`✅ Code ${schoolCode} ${isUnique ? 'disponible' : 'déjà utilisé'}`);
        }
      } catch (error) {
        console.warn('⚠️ Exception lors de la vérification:', error);
        // En cas d'exception, on assume que le code est unique
        isUnique = true;
      }
      
      attempts++;
    }

    if (!isUnique) {
      // Générer un code de secours basé sur timestamp pour éviter les conflits
      const timestamp = Date.now().toString().slice(-4);
      const prefix = schoolName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      schoolCode = `${prefix}-${new Date().getFullYear()}-${timestamp}`;
      console.log('🔄 Code de secours généré:', schoolCode);
    }

    console.log('🔢 Code école final:', schoolCode);

    // 4. Créer l'utilisateur dans la table users avec toutes les données par défaut
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUserId,
        email: email,
        full_name: directorName,
        phone: phone || '', // Valeur par défaut pour éviter les erreurs
        role: 'principal',
        is_active: true,
        photo: '/assets/images/no_image.png', // Photo par défaut
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur création utilisateur:', userError);
      throw new Error(`Erreur lors de la création de l'utilisateur: ${userError.message}`);
    }

    console.log('✅ Utilisateur créé/mis à jour:', userData.id);

    // 5. Créer l'école
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: schoolName,
        code: schoolCode,
        type: schoolType,
        director_name: directorName,
        phone: phone,
        address: address,
        city: city,
        country: country,
        available_classes: availableClasses,
        status: 'active',
        director_user_id: authUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (schoolError) {
      console.error('❌ Erreur création école:', schoolError);
      // Si l'école existe déjà, essayer de la récupérer
      if (schoolError.code === '23505') { // Violation de contrainte unique
        console.log('🔄 Tentative de récupération de l\'école existante...');
        const { data: existingSchool, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .eq('director_user_id', authUserId)
          .single();
        
        if (fetchError) {
          throw new Error(`Erreur lors de la récupération de l'école existante: ${fetchError.message}`);
        }
        
        schoolData = existingSchool;
        console.log('✅ École récupérée:', schoolData.id);
      } else {
        throw new Error(`Erreur lors de la création de l'école: ${schoolError.message}`);
      }
    } else {
      console.log('✅ École créée:', schoolData.id);
    }

    // 6. Mettre à jour l'utilisateur avec l'ID de l'école
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        current_school_id: schoolData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', authUserId);

    if (updateUserError) {
      console.warn('⚠️ Impossible de lier l\'école à l\'utilisateur:', updateUserError.message);
    }

    // 7. Créer l'année académique par défaut
    const currentYear = getCurrentAcademicYear();
    const { startDate, endDate } = getAcademicYearDates(currentYear);
    
    const { data: academicYearData, error: academicYearError } = await supabase
      .from('academic_years')
      .insert({
        school_id: schoolData.id,
        name: currentYear,
        start_date: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],
        is_current: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (academicYearError) {
      console.warn('⚠️ Impossible de créer l\'année académique:', academicYearError.message);
    } else {
      console.log('✅ Année académique créée:', currentYear, '-', academicYearData.id);
    }

    // 8. Initialiser toutes les données par défaut de l'école
    let initializationResult = null;
    let configurationResult = null;
    
    if (academicYearData) {
      console.log('🏗️ Initialisation des données par défaut...');
      initializationResult = await prismaService.initializeSchoolDefaults(schoolData.id, academicYearData.id);
      
      if (initializationResult.success) {
        console.log('✅ Données par défaut initialisées:', initializationResult.created);
      } else {
        console.warn('⚠️ Erreurs lors de l\'initialisation:', initializationResult.errors);
      }

      // 8.1 Initialiser les configurations par défaut (types de notes, présence, rôles)
      console.log('⚙️ Initialisation des configurations par défaut...');
      try {
        configurationResult = await ConfigurationService.initializeSchoolConfigurations(schoolData.id);
        
        if (configurationResult.errors.length === 0) {
          console.log('✅ Configurations initialisées:', {
            gradeTypes: configurationResult.gradeTypes.length,
            attendanceTypes: configurationResult.attendanceTypes.length,
            userRoles: configurationResult.userRoles.length
          });
        } else {
          console.warn('⚠️ Certaines configurations ont échoué:', configurationResult.errors);
        }

        // 8.2 Initialiser les périodes d'évaluation
        try {
          const evaluationPeriods = await ConfigurationService.initializeEvaluationPeriods(
            schoolData.id, 
            academicYearData.id, 
            schoolType
          );
          configurationResult.evaluationPeriods = evaluationPeriods;
          console.log(`✅ ${evaluationPeriods.length} périodes d'évaluation créées`);
        } catch (periodError) {
          console.warn('⚠️ Erreur lors de la création des périodes d\'évaluation:', periodError.message);
          configurationResult.errors.push({ type: 'evaluationPeriods', error: periodError.message });
        }

      } catch (configError) {
        console.warn('⚠️ Erreur lors de l\'initialisation des configurations:', configError.message);
        configurationResult = { 
          gradeTypes: [], 
          attendanceTypes: [], 
          userRoles: [], 
          evaluationPeriods: [],
          errors: [{ type: 'general', error: configError.message }] 
        };
      }
    }

    // 9. Retourner le résultat
    const result = {
      school: schoolData,
      user: userData,
      academicYear: academicYearData,
      initialization: initializationResult,
      configuration: configurationResult
    };

    console.log('🎉 Service terminé avec succès !', result);

    return {
      success: true,
      message: 'École créée et liée avec succès',
      data: result
    };

  } catch (error) {
    console.error('❌ Erreur dans createPrincipalSchool:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la création de l\'école',
      data: null
    };
  }
};

/**
 * Service pour récupérer les informations d'une école
 */
export const getSchoolByDirector = async (userId) => {
  try {
    const { data: school, error } = await supabase
      .from('schools')
      .select(`
        *,
        director:users!director_user_id(*),
        academic_years!inner(*),
        classes(*),
        students(*),
        teachers(*)
      `)
      .eq('director_user_id', userId)
      .eq('academic_years.is_current', true)
      .single();

    if (error) {
      console.error('Erreur récupération école:', error);
      return null;
    }

    return school;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'école:', error);
    throw error;
  }
};

/**
 * Service pour mettre à jour les informations d'une école
 */
export const updateSchool = async (schoolId, updateData) => {
  try {
    const { data: school, error } = await supabase
      .from('schools')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId)
      .select(`
        *,
        director:users!director_user_id(*),
        academic_years(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return school;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'école:', error);
    throw error;
  }
};

/**
 * Service pour récupérer les statistiques d'une école
 */
export const getSchoolStats = async (schoolId) => {
  try {
    const [
      { count: studentsCount },
      { count: teachersCount },
      { count: classesCount },
      { count: paymentsCount }
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('teachers').select('*', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
      supabase.from('classes').select('*', { count: 'exact' }).eq('school_id', schoolId),
      supabase.from('payments').select('*', { count: 'exact' }).eq('school_id', schoolId).eq('status', 'completed')
    ]);

    return {
      students: studentsCount || 0,
      teachers: teachersCount || 0,
      classes: classesCount || 0,
      payments: paymentsCount || 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export default {
  createPrincipalSchool,
  getSchoolByDirector,
  updateSchool,
  getSchoolStats
};