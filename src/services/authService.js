// Service de connexion compatible avec Prisma
// Utilise Supabase pour l'auth et vérifie les données Prisma

import { supabase } from '../lib/supabase.js';

/**
 * Service de connexion pour directeur d'établissement
 */
export const loginDirector = async (email, password) => {
  try {
    // 1. Authentification avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // Améliorer les messages d'erreur de Supabase
      console.error('Erreur d\'authentification Supabase:', authError);
      
      let friendlyMessage = authError.message;
      
      switch (authError.message) {
        case 'Invalid login credentials':
          friendlyMessage = 'Email ou mot de passe incorrect';
          break;
        case 'Email not confirmed':
          friendlyMessage = 'Votre email n\'a pas encore été confirmé. Vérifiez votre boîte mail.';
          break;
        case 'Too many requests':
          friendlyMessage = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
          break;
        case 'User not found':
          friendlyMessage = 'Aucun compte trouvé avec cette adresse email';
          break;
        default:
          if (authError.message?.includes('invalid credentials')) {
            friendlyMessage = 'Email ou mot de passe incorrect';
          } else if (authError.message?.includes('network')) {
            friendlyMessage = 'Problème de connexion internet. Vérifiez votre connexion.';
          }
      }
      
      throw new Error(friendlyMessage);
    }

    if (!authData.user) {
      throw new Error('Erreur d\'authentification - aucun utilisateur retourné');
    }

    console.log('✅ Connexion réussie pour:', authData.user.email);

    // 2. Vérifier s'il y a des données d'école en attente de création
    try {
      const { hasPendingSchoolData, finalizeSchoolCreation } = await import('./schoolFinalizationService.js');
      
      if (hasPendingSchoolData()) {
        console.log('🏫 Données d\'école en attente détectées, finalisation...');
        
        const finalizationResult = await finalizeSchoolCreation();
        
        if (finalizationResult.success) {
          console.log('✅ École créée avec succès lors de la connexion !');
        } else {
          console.warn('⚠️ Impossible de finaliser la création d\'école:', finalizationResult.message);
        }
      }
    } catch (finalizationError) {
      console.warn('⚠️ Erreur lors de la finalisation d\'école:', finalizationError);
    }

    // 3. Récupérer les données de l'école (structure Prisma)
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select(`
        id,
        name,
        code,
        type,
        director_name,
        phone,
        email,
        address,
        city,
        country,
        website,
        logo,
        description,
        available_classes,
        settings,
        status,
        director_user_id,
        created_at,
        updated_at
      `)
      .eq('director_user_id', authData.user.id)
      .single();

    if (schoolError) {
      // Gestion spécifique des erreurs
      if (schoolError.code === 'PGRST116') {
        throw new Error('Aucune école associée à ce compte. Vérifiez que votre compte a bien été créé comme directeur d\'établissement.');
      }
      throw new Error(`Erreur de récupération des données: ${schoolError.message}`);
    }

    if (!schoolData) {
      throw new Error('Aucune école trouvée pour ce compte');
    }

    // 3. Vérifier le statut du compte
    if (schoolData.status === 'pending') {
      throw new Error('Votre compte est en attente de validation par l\'administrateur');
    }

    if (schoolData.status === 'suspended') {
      throw new Error('Votre compte a été suspendu. Contactez l\'administrateur.');
    }

    if (schoolData.status !== 'active') {
      throw new Error(`Statut du compte: ${schoolData.status}. Contactez l\'administrateur.`);
    }

    // 4. Récupérer les données utilisateur (structure Prisma)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        current_school_id,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', authData.user.id)
      .single();

    // Si l'utilisateur n'existe pas dans la table users, on continue quand même
    // (peut arriver si la migration Prisma n'a pas encore créé l'enregistrement)
    if (userError && userError.code !== 'PGRST116') {
      console.warn('Utilisateur non trouvé dans la table users:', userError.message);
    }

    // 5. Retourner les données complètes
    return {
      success: true,
      user: authData.user,
      school: {
        id: schoolData.id,
        name: schoolData.name,
        code: schoolData.code,
        type: schoolData.type,
        directorName: schoolData.director_name,
        phone: schoolData.phone,
        email: schoolData.email,
        address: schoolData.address,
        city: schoolData.city,
        country: schoolData.country,
        website: schoolData.website,
        logo: schoolData.logo,
        description: schoolData.description,
        availableClasses: schoolData.available_classes,
        settings: schoolData.settings,
        status: schoolData.status,
        directorUserId: schoolData.director_user_id,
        createdAt: schoolData.created_at,
        updatedAt: schoolData.updated_at
      },
      profile: userData ? {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        currentSchoolId: userData.current_school_id,
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      } : null
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion',
      user: null,
      school: null,
      profile: null
    };
  }
};

/**
 * Service de déconnexion
 */
export const logoutDirector = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la déconnexion'
    };
  }
};

/**
 * Vérifier si un utilisateur est connecté et récupérer ses données
 */
export const getCurrentDirector = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { success: false, user: null, school: null };
    }

    // Récupérer les données de l'école
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', user.id)
      .single();

    if (schoolError || !schoolData) {
      return { success: false, user: null, school: null };
    }

    return {
      success: true,
      user,
      school: schoolData
    };

  } catch (error) {
    return {
      success: false,
      user: null,
      school: null,
      error: error.message
    };
  }
};