import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase/client';
// Import databaseService - à migrer ultérieurement
// import databaseService from '../services/databaseService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // PRIORITÉ : Toujours vérifier la session Supabase d'abord
    // Cela évite qu'un compte local (étudiant) ne masque un compte principal connecté
    const initializeAuth = async () => {
      try {
        console.log('🔍 Vérification de la session Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();

        // Si erreur de refresh token, nettoyer et ignorer
        if (error && error.message?.includes('Invalid Refresh Token')) {
          console.warn('⚠️ Token invalide détecté, nettoyage...');
          await supabase.auth.signOut();
          localStorage.removeItem('edutrack-user');
          setLoading(false);
          return;
        }

        if (session?.user) {
          // ✅ Session Supabase active (Principal) - PRIORITÉ ABSOLUE
          console.log('✅ Session Supabase trouvée:', session.user.email);
          const dbUser = await ensureUserInDatabase(session.user);

          // Utiliser les données de la DB si disponibles (contient le rôle)
          const userData = dbUser || session.user;
          console.log('👤 Utilisateur avec rôle:', userData.email, '- Rôle:', userData.role);

          setUser(userData);
          setUserProfile(userData);
          localStorage.setItem('edutrack-user', JSON.stringify(userData));
          setLoading(false);
          return;
        }

        console.log('ℹ️ Pas de session Supabase, vérification localStorage...');

        // Pas de session Supabase, vérifier localStorage
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('🔄 Utilisateur depuis localStorage:', userData.email);

          if (userData.sessionId) {
            // Compte local (enseignant, étudiant, parent, secrétaire)
            console.log('✅ Compte local détecté, utilisation directe des données');
            setUser(userData);
            setUserProfile(userData);
            setLoading(false);
          } else {
            // Données invalides dans localStorage
            console.warn('⚠️ Données localStorage invalides');
            localStorage.removeItem('edutrack-user');
            setLoading(false);
          }
        } else {
          console.log('ℹ️ Aucune session trouvée');
          setLoading(false);
        }
      } catch (e) {
        console.error('❌ Erreur lors de l\'initialisation:', e);
        localStorage.removeItem('edutrack-user');
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements de session Supabase (connexion/déconnexion principal)
    let isProcessingAuth = false;
    let lastProcessedUserId = null; // Tracker le dernier utilisateur traité

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Changement d\'état Supabase:', event, session?.user?.email);

      // Ignorer les événements TOKEN_REFRESHED, USER_UPDATED, etc. si l'utilisateur est déjà connecté
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'INITIAL_SESSION') {
        console.log('⏭️ Événement ignoré (type non géré):', event);
        return;
      }

      // Éviter les appels multiples simultanés
      if (isProcessingAuth) {
        console.log('⏭️ Événement ignoré (traitement en cours)');
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        // Vérifier si on a déjà traité cet utilisateur
        if (lastProcessedUserId === session.user.id) {
          console.log('✅ Utilisateur déjà traité, ignorer l\'événement');
          return;
        }

        // Principal connecté - Ne traiter que si ce n'est pas déjà fait
        const currentUser = localStorage.getItem('edutrack-user');
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            if (userData.id === session.user.id) {
              console.log('✅ Utilisateur déjà défini dans localStorage, ignorer');
              lastProcessedUserId = session.user.id;
              return;
            }
          } catch (e) {
            // Continuer si erreur de parsing
          }
        }

        isProcessingAuth = true;
        try {
          const dbUser = await ensureUserInDatabase(session.user);

          // Utiliser les données de la DB si disponibles (contient le rôle)
          const userData = dbUser || session.user;
          console.log('👤 Utilisateur avec rôle:', userData.email, '- Rôle:', userData.role);

          setUser(userData);
          setUserProfile(userData);
          localStorage.setItem('edutrack-user', JSON.stringify(userData));
          lastProcessedUserId = session.user.id;
          console.log('✅ Utilisateur configuré avec succès');
        } finally {
          isProcessingAuth = false;
        }
      } else if (event === 'SIGNED_OUT') {
        // Principal déconnecté
        console.log('👋 Déconnexion Supabase');
        lastProcessedUserId = null;

        // Ne pas nettoyer si un compte local est actif
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (!userData.sessionId) {
              // C'était un compte Supabase, le supprimer
              localStorage.removeItem('edutrack-user');
              setUser(null);
              setUserProfile(null);
            }
          } catch (e) {
            console.error('Erreur parsing user:', e);
          }
        }
      }
    });

    // Écouter les changements dans le localStorage (changement de compte)
    // Note: storage event ne marche que pour les autres fenêtres
    const handleStorageChange = (e) => {
      if (e.key === 'edutrack-user') {
        console.log('🔄 Changement de compte détecté dans localStorage (autre fenêtre)');
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            console.log('👤 Nouveau compte:', userData.email);
            setUser(userData);
            setUserProfile(userData);
          } catch (err) {
            console.error('Erreur parsing nouveau user:', err);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    };

    // Écouter les événements personnalisés pour les changements dans la même fenêtre
    const handleUserChange = (e) => {
      console.log('🔄 Changement de compte détecté (événement personnalisé)');
      const userData = e.detail;
      if (userData) {
        console.log('👤 Nouveau compte:', userData.email);
        setUser(userData);
        setUserProfile(userData);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('edutrack-user-changed', handleUserChange);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('edutrack-user-changed', handleUserChange);
    };
  }, []);

  const ensureUserInDatabase = async (authUser) => {
    try {
      const supabase = getSupabaseClient();

      // Vérifier d'abord si l'utilisateur existe déjà (lecture seule, pas d'écriture)
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingUser && !fetchError) {
        console.log('✅ User already exists in database:', existingUser.email);
        return existingUser;
      }

      // Si l'utilisateur n'existe pas, ne PAS essayer de l'ajouter ici
      // Le trigger handle_new_user_automatic() s'en charge automatiquement
      console.log('ℹ️ User not found in database, will be created by trigger');
      return null;
    } catch (err) {
      console.warn('⚠️ Exception checking user in database:', err);
      return null;
    }
  };

  const signInWithPin = async (pin, identifier) => {
    try {
      const supabase = getSupabaseClient();
      setError(null);

      if (!identifier || !pin) {
        throw new Error('Identifiant et code PIN requis');
      }

      // Vérifier avec Supabase
      const { data, error } = await supabase.rpc('verify_pin', {
        identifier,
        pin_input: pin
      });

      if (error || !data || data.length === 0) {
        throw new Error('Identifiant ou code PIN incorrect');
      }

      // Transformer les données reçues dans le format attendu
      const authenticatedUser = {
        id: data[0].user_id,
        full_name: data[0].user_full_name,
        role: data[0].user_role,
        phone: data[0].user_phone,
        email: data[0].user_email
      };

      // Ensure user exists in database with proper permissions
      try {
        const { data: existingUser, error: existingError } = await supabase
          .from('users')
          .select('id')
          .eq('email', authenticatedUser.email)
          .single();

        if (existingError) {
          console.warn('⚠️ No existing users row found by email:', existingError?.message || existingError);
        }

        if (existingUser && existingUser.id) {
          authenticatedUser.id = existingUser.id;
        } else {
          // Generate UUID for the new users entry
          const newUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : null;
          const generatedId = newUuid || `gen-${Date.now()}-${Math.floor(Math.random()*1000)}`;

          // Upsert the users row with a valid id
          const { data: upserted, error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: generatedId,
              email: authenticatedUser.email,
              full_name: authenticatedUser.full_name || authenticatedUser.email.split('@')[0],
              role: authenticatedUser.role || 'student',
              phone: authenticatedUser.phone || '',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (upsertError) {
            console.warn('⚠️ Could not create users row with generated UUID:', upsertError);
          } else if (upserted && upserted.id) {
            authenticatedUser.id = upserted.id;
          } else {
            console.warn('⚠️ No id returned after upsert; keeping original id:', authenticatedUser.id);
          }
        }
      } catch (resolveErr) {
        console.warn('⚠️ Exception while resolving user id for sign-in:', resolveErr);
      }

      await ensureUserInDatabase(authenticatedUser);

      // TODO: Valider et corriger les données au moment de la connexion (pour les directeurs)
      // Nécessite migration de databaseService
      // if (authenticatedUser.role === 'principal') {
      //   try {
      //     const validationResult = await databaseService.validateDirectorData(authenticatedUser.id, authenticatedUser.email);
      //     if (validationResult.corrections && validationResult.corrections.length > 0) {
      //       console.log('✅ Données corrigées lors de la connexion:', validationResult.corrections);
      //     }
      //
      //     if (validationResult.schoolData && validationResult.schoolData.director_name) {
      //       authenticatedUser.full_name = validationResult.schoolData.director_name;
      //     }
      //   } catch (validationError) {
      //     console.warn('⚠️ Erreur validation données:', validationError);
      //   }
      // }

      // Sauvegarder les données complètes dans le localStorage
      localStorage.setItem('edutrack-user', JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setUserProfile(authenticatedUser);
      return { user: authenticatedUser, error: null };

    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error?.message || 'Erreur de connexion');
      return { user: null, error };
    }
  };

  const signInWithPassword = async (email, password) => {
    try {
      const supabase = getSupabaseClient();
      setError(null);

      if (!email || !password) {
        return {
          success: false,
          error: 'Email et mot de passe requis',
          user: null
        };
      }

      // Authentification avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (authError) {
        console.error('Erreur d\'authentification:', authError);
        return {
          success: false,
          error: authError.message === 'Invalid login credentials'
            ? 'Email ou mot de passe invalide'
            : authError.message,
          user: null
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Authentification échouée',
          user: null
        };
      }

      // Récupérer le profil utilisateur depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        console.error('Erreur récupération profil:', userError);
        return {
          success: false,
          error: 'Impossible de récupérer le profil utilisateur',
          user: null
        };
      }

      // Construire l'objet utilisateur
      const authenticatedUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone,
        school_id: userData.school_id,
        is_active: userData.is_active
      };

      // Sauvegarder dans localStorage
      localStorage.setItem('edutrack-user', JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setUserProfile(authenticatedUser);

      return {
        success: true,
        user: authenticatedUser,
        error: null
      };

    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error?.message || 'Erreur de connexion');
      return {
        success: false,
        error: error?.message || 'Erreur de connexion',
        user: null
      };
    }
  };

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient();

      // Supprimer la session locale
      localStorage.removeItem('edutrack-user');
      localStorage.removeItem('edutrack-session');
      setUser(null);
      setUserProfile(null);
      setError(null);

      // Déconnexion Supabase uniquement si une session existe
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setError(error?.message);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithPin,
    signInWithPassword,
    signOut,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
