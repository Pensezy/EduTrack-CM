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

    // 2. Données d'école gérées automatiquement par Prisma - pas besoin de finalisation manuelle

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

export const handlePostConfirmation = async (user) => {
  try {
    console.log('🔐 Post-confirmation handler for user:', user);
    
    // 1. Ensure user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        role: user.user_metadata?.role || 'student',
        is_active: true,
        active: true,
        photo: '/assets/images/no_image.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error ensuring user in users table:', userError);
      // Don't throw error, continue with process
    } else {
      console.log('✅ User ensured in users table:', userData);
    }

    // 2. Check if user is a principal and has a school
    if (user.user_metadata?.role === 'principal') {
      try {
        const { data: schools, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, status')
          .eq('director_user_id', user.id);

        if (schoolError) {
          console.warn('⚠️ Error checking existing schools:', schoolError);
        } else if (schools && schools.length > 0) {
          console.log('🏫 Existing school found:', schools[0]);
        } else {
          console.log('🆕 No existing school found for principal');
        }
      } catch (err) {
        console.warn('⚠️ Exception checking schools:', err);
      }
    }

    return { success: true, user: userData || user };
  } catch (error) {
    console.error('❌ Error in post-confirmation handler:', error);
    // Don't block the process even if there are errors
    return { success: true, user }; // Still return success to allow login
  }
};

// Enhanced login function with better error handling
export const loginWithPin = async (identifier, pin) => {
  try {
    console.log('🔐 Login attempt for:', identifier);
    
    // First, verify PIN using RPC
    const { data: verificationData, error: verificationError } = await supabase
      .rpc('verify_pin', {
        identifier,
        pin_input: pin
      });

    if (verificationError || !verificationData || verificationData.length === 0) {
      throw new Error('Identifiant ou code PIN incorrect');
    }

    // Get user data from verification
    const verifiedUser = verificationData[0];
    
    // Ensure user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: verifiedUser.user_id,
        email: verifiedUser.user_email,
        full_name: verifiedUser.user_full_name,
        role: verifiedUser.user_role,
        phone: verifiedUser.user_phone || '',
        is_active: true,
        active: true,
        photo: '/assets/images/no_image.png',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.warn('⚠️ Warning: Could not ensure user in users table:', userError);
      // Continue anyway as we have the verified data
    }

    // Build authenticated user object
    const authenticatedUser = {
      id: verifiedUser.user_id,
      email: verifiedUser.user_email,
      full_name: verifiedUser.user_full_name,
      role: verifiedUser.user_role,
      phone: verifiedUser.user_phone || '',
      ...(userData || {})
    };

    console.log('✅ Login successful for:', authenticatedUser.email);
    return { success: true, user: authenticatedUser };

  } catch (error) {
    console.error('❌ Login error:', error);
    return { 
      success: false, 
      user: null,
      error: error.message || 'Erreur de connexion'
    };
  }
};
