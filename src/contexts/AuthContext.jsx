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
    pin: '123456'
  },
  '123456789': {
    id: 'demo-parent-2', 
    phone: '123456789',
    role: 'parent',
    full_name: 'Parent Mobile',
    pin: '123456'
  },

  // Élèves
  'student@demo.com': {
    id: 'demo-student-1',
    email: 'student@demo.com', 
    role: 'student',
    full_name: 'Student Demo',
    pin: '123456'
  },

  // Enseignants  
  'teacher@demo.com': {
    id: 'demo-teacher-1',
    email: 'teacher@demo.com',
    role: 'teacher', 
    full_name: 'Teacher Demo',
    pin: '123456'
  },

  // Administration
  'admin@demo.com': {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    role: 'admin',
    full_name: 'Admin Demo',
    pin: '123456' 
  },
  'principal@demo.com': {
    id: 'demo-principal-1', 
    email: 'principal@demo.com',
    role: 'principal',
    full_name: 'Principal Demo',
    pin: '123456'
  },
  'secretary@demo.com': {
    id: 'demo-secretary-1',
    email: 'secretary@demo.com', 
    role: 'secretary',
    full_name: 'Secretary Demo',
    pin: '123456'
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

      const authenticatedUser = data[0];
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