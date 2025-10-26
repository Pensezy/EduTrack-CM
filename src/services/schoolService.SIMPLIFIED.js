// ==========================================
// VERSION SIMPLIFIEE - TOUT EST AUTOMATIQUE
// ==========================================
// Le trigger SQL fait TOUT le travail automatiquement
// On fait juste signUp avec les metadata

import { supabase } from '../lib/supabase';

/**
 * NOUVELLE VERSION SIMPLIFIEE
 * Creation automatique via trigger SQL
 */
export const createPrincipalSchool = async ({
  directorName,
  email,
  password,
  phone,
  schoolName,
  schoolType,
  address,
  city = 'Yaounde',
  country = 'Cameroun',
  availableClasses = []
}) => {
  try {
    console.log('🏫 Creation compte directeur (VERSION AUTOMATIQUE):', {
      directorName,
      email,
      schoolName,
      schoolType
    });

    // Generer un code unique pour l'ecole
    const prefix = schoolName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const schoolCode = `${prefix}-${year}-${random}`;

    console.log('🔢 Code ecole genere:', schoolCode);

    // C'EST TOUT ! Le trigger SQL fait le reste automatiquement
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: directorName,
          phone: phone || '',
          role: 'principal',
          // Donnees de l'ecole dans les metadata
          school: {
            name: schoolName,
            code: schoolCode,
            type: schoolType || 'public',
            phone: phone || '',
            address: address || '',
            city: city,
            country: country,
            available_classes: availableClasses
          }
        }
      }
    });

    if (error) {
      console.error('❌ Erreur signUp:', error);
      throw new Error(error.message);
    }

    console.log('✅ Compte cree avec succes !', data.user.id);
    console.log('📧 Email de confirmation envoye a:', email);
    console.log('🤖 Le trigger SQL va AUTOMATIQUEMENT:');
    console.log('   1. Inserer dans users');
    console.log('   2. Creer l\'ecole avec le code:', schoolCode);
    console.log('   3. Lier l\'utilisateur a l\'ecole');

    return {
      success: true,
      message: `Compte cree avec succes ! Verifiez l'email ${email} pour confirmer votre compte.`,
      data: {
        user: data.user,
        schoolCode: schoolCode
      }
    };

  } catch (error) {
    console.error('❌ Erreur:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la creation du compte',
      data: null
    };
  }
};

/**
 * Recuperer les informations d'une ecole
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
      console.error('Erreur recuperation ecole:', error);
      return null;
    }

    return school;
  } catch (error) {
    console.error('Erreur lors de la recuperation de l\'ecole:', error);
    throw error;
  }
};

/**
 * Mettre a jour les informations d'une ecole
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
    console.error('Erreur lors de la mise a jour de l\'ecole:', error);
    throw error;
  }
};

/**
 * Recuperer les statistiques d'une ecole
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
    console.error('Erreur lors de la recuperation des statistiques:', error);
    throw error;
  }
};

export default {
  createPrincipalSchool,
  getSchoolByDirector,
  updateSchool,
  getSchoolStats
};
