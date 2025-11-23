import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import prismaService from '../services/prismaService';
import { getCurrentAcademicYear } from '../utils/academicYear';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const demoAccounts = {
  // Parents
  'parent@demo.com': {
    id: 'demo-parent-1',
    email: 'parent@demo.com',
    role: 'parent',
    full_name: 'Parent Demo',
    pin: '123456',
    children: [
      {
        id: 'demo-student-1',
        full_name: 'Student Demo',
        class_name: '6e A',
        school_id: 'demo-school-1'
      },
      {
        id: 'demo-student-2',
        full_name: 'Student Demo 2',
        class_name: '4e B',
        school_id: 'demo-school-1'
      }
    ]
  },

  // Élèves
  'student@demo.com': {
    id: 'demo-student-1',
    email: 'student@demo.com', 
    role: 'student',
    full_name: 'Student Demo',
    pin: '123456',
    current_school_id: 'demo-school-1',
    class_name: '6e A',
    photo: '/assets/images/no_image.png',
    student_id: 'STU2024001',
    current_year: getCurrentAcademicYear()
  },

  // Enseignants  
  'teacher@demo.com': {
    id: 'demo-teacher-1',
    email: 'teacher@demo.com',
    role: 'teacher', 
    full_name: 'Teacher Demo',
    pin: '123456',
    current_school_id: 'demo-school-1',
    specialty: 'Mathématiques',
    subject: 'Mathématiques',
    assigned_classes: ['6e A', '6e B', '5e A'],
    teacher_id: 'TCH2024001',
    photo: '/assets/images/no_image.png'
  },

  // Administration
  'admin@demo.com': {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    role: 'admin',
    full_name: 'Admin Demo',
    pin: '123456',
    photo: '/assets/images/no_image.png',
    admin_id: 'ADM2024001',
    permissions: ['all']
  },
  'principal@demo.com': {
    id: 'demo-principal-1', 
    email: 'principal@demo.com',
    role: 'principal',
    full_name: 'Principal Demo',
    pin: '123456',
    current_school_id: 'demo-school-1',
    photo: '/assets/images/no_image.png',
    principal_id: 'PRI2024001',
    school_name: 'École Démo'
  },
  'secretary@demo.com': {
    id: 'demo-secretary-1',
    email: 'secretary@demo.com', 
    role: 'secretary',
    full_name: 'Secretary Demo',
    pin: '123456',
    current_school_id: 'demo-school-1',
    photo: '/assets/images/no_image.png',
    secretary_id: 'SEC2024001',
    school_name: 'École Démo'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authMode, setAuthMode] = useState('standard'); // 'standard' or 'demo'

  useEffect(() => {
    // Charger la session au démarrage
    const savedUser = localStorage.getItem('edutrack-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if it's a demo account
        if (demoAccounts[userData.email]) {
          setAuthMode('demo');
          setUser(userData);
          setUserProfile(userData);
        } else {
          // For real accounts, verify with Supabase
          setAuthMode('standard');
          checkSupabaseSession(userData);
        }
      } catch (e) {
        console.error('Erreur lors du chargement de la session:', e);
        localStorage.removeItem('edutrack-user');
        checkSupabaseSession();
      }
    } else {
      checkSupabaseSession();
    }
  }, []);

  const checkSupabaseSession = async (localUser = null) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user) {
        // We have a Supabase session, ensure user exists in users table
        await ensureUserInDatabase(session.user);
        setUser(session.user);
        setUserProfile(session.user);
        setAuthMode('standard');
        
        // Save to localStorage
        localStorage.setItem('edutrack-user', JSON.stringify(session.user));
      } else if (localUser) {
        // Try to restore from local user if session is invalid
        setUser(localUser);
        setUserProfile(localUser);
      }
    } catch (err) {
      console.warn('⚠️ Error checking Supabase session:', err);
      // Continue without blocking
    } finally {
      setLoading(false);
    }
  };

  const ensureUserInDatabase = async (authUser) => {
    try {
      // Ensure user exists in users table with proper permissions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          role: authUser.user_metadata?.role || 'student',
          phone: authUser.user_metadata?.phone || '',
          is_active: true,
          active: true,
          photo: '/assets/images/no_image.png',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.warn('⚠️ Could not ensure user in database:', userError);
        // Don't throw error, continue
      } else {
        console.log('✅ User ensured in database:', userData);
      }
      
      return userData;
    } catch (err) {
      console.warn('⚠️ Exception ensuring user in database:', err);
      return null;
    }
  };

  const signInWithPin = async (pin, identifier) => {
    try {
      setError(null);
      if (!identifier || !pin) {
        throw new Error('Identifiant et code PIN requis');
      }

      // 1. Vérifier si c'est un compte de démo
      const demoUser = demoAccounts[identifier];
      if (demoUser && demoUser.pin === pin) {
        const userData = { ...demoUser };
        // Sauvegarder en local pour la démo
        localStorage.setItem('edutrack-user', JSON.stringify(userData));
        setUser(userData);
        setUserProfile(userData);
        setAuthMode('demo');
        return { user: userData, error: null };
      }

      // 2. Sinon, vérifier avec Supabase
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
      // If the returned user_id looks like a legacy numeric id (e.g. 1),
      // attempt to resolve a proper UUID from the `users` table by email.
      // If none exists, create a new users row with a generated UUID.
      try {
        const { data: existingUser, error: existingError } = await supabase
          .from('users')
          .select('id')
          .eq('email', authenticatedUser.email)
          .single();

        if (existingError) {
          // If the select failed because no row, existingUser will be null.
          console.warn('⚠️ No existing users row found by email (or select error):', existingError?.message || existingError);
        }

        if (existingUser && existingUser.id) {
          authenticatedUser.id = existingUser.id;
        } else {
          // If the RPC returned a numeric id or no matching users row exists,
          // generate a UUID for the new users entry to match the DB schema.
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
            // As a fallback, keep the original id but log a warning
            console.warn('⚠️ No id returned after upsert; keeping original id:', authenticatedUser.id);
          }
        }
      } catch (resolveErr) {
        console.warn('⚠️ Exception while resolving user id for sign-in:', resolveErr);
      }

      await ensureUserInDatabase(authenticatedUser);

      // Valider et corriger les données au moment de la connexion (pour les directeurs)
      if (authenticatedUser.role === 'principal') {
        try {
          const validationResult = await prismaService.validateDirectorData(authenticatedUser.id, authenticatedUser.email);
          if (validationResult.corrections && validationResult.corrections.length > 0) {
            console.log('✅ Données corrigées lors de la connexion:', validationResult.corrections);
          }
          
          // Mettre à jour les données utilisateur si des corrections ont été apportées
          if (validationResult.schoolData && validationResult.schoolData.director_name) {
            authenticatedUser.full_name = validationResult.schoolData.director_name;
          }
        } catch (validationError) {
          console.warn('⚠️ Erreur validation données:', validationError);
          // Ne pas bloquer la connexion pour une erreur de validation
        }
      }

      // Sauvegarder les données complètes dans le localStorage
      localStorage.setItem('edutrack-user', JSON.stringify(authenticatedUser));
      
      setUser(authenticatedUser);
      setUserProfile(authenticatedUser);
      setAuthMode('standard');
      return { user: authenticatedUser, error: null };

    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error?.message || 'Erreur de connexion');
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Supprimer la session locale (pour démo et prod)
      localStorage.removeItem('edutrack-user');
      localStorage.removeItem('edutrack-session');
      setUser(null);
      setUserProfile(null);
      setAuthMode('standard');
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
    signOut,
    error,
    setError,
    authMode // Expose auth mode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;