import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  '123456789': {
    id: 'demo-parent-2', 
    phone: '123456789',
    role: 'parent',
    full_name: 'Parent Mobile',
    pin: '123456',
    children: [
      {
        id: 'demo-student-3',
        full_name: 'Student Mobile',
        class_name: '3e A',
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
    current_year: '2024-2025'
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

  useEffect(() => {
    // Charger la session au démarrage
    const savedUser = localStorage.getItem('edutrack-user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserProfile(userData);
      } catch (e) {
        console.error('Erreur lors du chargement de la session:', e);
        localStorage.removeItem('edutrack-user');
      }
    }
    setLoading(false);
  }, []);

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

  const signOut = async () => {
    try {
      // Supprimer la session locale (pour démo et prod)
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