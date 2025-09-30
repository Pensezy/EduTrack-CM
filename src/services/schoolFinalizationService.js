// Service pour finaliser la création d'école après confirmation email
// Ce service est appelé lors de la première connexion après confirmation

import { supabase } from '../lib/supabase.js';

/**
 * Finalise la création d'école avec les données sauvegardées
 * Appelé après que l'utilisateur a confirmé son email et se connecte
 */
export const finalizeSchoolCreation = async () => {
  try {
    console.log('🔄 Finalisation de la création d\'école...');

    // 1. Vérifier si l'utilisateur est connecté et confirmé
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Utilisateur non connecté');
    }

    if (!user.email_confirmed_at) {
      throw new Error('Email non confirmé. Vérifiez votre boîte mail.');
    }

    console.log('✅ Utilisateur confirmé:', user.email);

    // 2. Récupérer les données d'école sauvegardées
    const pendingDataStr = localStorage.getItem('pendingSchoolData');
    
    if (!pendingDataStr) {
      console.log('ℹ️ Aucune donnée d\'école en attente trouvée');
      return { success: false, message: 'Aucune donnée d\'école en attente' };
    }

    const pendingData = JSON.parse(pendingDataStr);
    
    // Vérifier que c'est pour le bon utilisateur
    if (pendingData.userId !== user.id) {
      console.warn('⚠️ Les données en attente ne correspondent pas à l\'utilisateur actuel');
      localStorage.removeItem('pendingSchoolData');
      return { success: false, message: 'Données d\'école invalides' };
    }

    console.log('📋 Données d\'école récupérées:', {
      schoolName: pendingData.schoolName,
      directorName: pendingData.directorName,
      timestamp: pendingData.timestamp
    });

    // 3. Vérifier si l'école n'a pas déjà été créée
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id, name')
      .eq('director_user_id', user.id)
      .single();

    if (existingSchool) {
      console.log('✅ École déjà créée:', existingSchool.name);
      localStorage.removeItem('pendingSchoolData');
      return { 
        success: true, 
        message: 'École déjà créée', 
        data: { school: existingSchool } 
      };
    }

    // 4. Créer l'école maintenant que l'utilisateur est confirmé
    const { createPrincipalSchool } = await import('./schoolService.js');
    
    const result = await createPrincipalSchool({
      directorName: pendingData.directorName,
      email: pendingData.email,
      phone: pendingData.phone,
      schoolName: pendingData.schoolName,
      schoolType: pendingData.schoolType,
      address: pendingData.address,
      city: pendingData.city,
      country: pendingData.country,
      availableClasses: pendingData.availableClasses,
      userId: user.id
    });

    if (result.success) {
      console.log('✅ École créée avec succès après confirmation !');
      localStorage.removeItem('pendingSchoolData');
      return result;
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('❌ Erreur finalisation école:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la finalisation',
      data: null
    };
  }
};

/**
 * Vérifie s'il y a des données d'école en attente pour l'utilisateur actuel
 */
export const hasPendingSchoolData = () => {
  try {
    const pendingDataStr = localStorage.getItem('pendingSchoolData');
    if (!pendingDataStr) return false;

    const pendingData = JSON.parse(pendingDataStr);
    
    // Vérifier que les données ne sont pas trop anciennes (7 jours max)
    const timestamp = new Date(pendingData.timestamp);
    const now = new Date();
    const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      localStorage.removeItem('pendingSchoolData');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur vérification données en attente:', error);
    return false;
  }
};

/**
 * Efface les données d'école en attente
 */
export const clearPendingSchoolData = () => {
  localStorage.removeItem('pendingSchoolData');
};

export default {
  finalizeSchoolCreation,
  hasPendingSchoolData,
  clearPendingSchoolData
};