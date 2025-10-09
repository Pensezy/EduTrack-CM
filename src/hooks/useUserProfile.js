import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDataMode } from './useDataMode';
import demoDataService from '../services/demoDataService';
import productionDataService from '../services/productionDataService';

/**
 * Hook optimisé pour charger SEULEMENT les données de profil utilisateur
 * Plus rapide que useDashboardData pour les pages qui n'ont besoin que du profil
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const { dataMode, isLoading: modeLoading } = useDataMode();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || modeLoading) return;
      
      setLoading(true);
      setError(null);

      try {
        // 🎯 DÉTECTION SIMPLE : Compte démo ou réel
        const isDemoAccount = user.email?.includes('@demo.com');

        if (isDemoAccount) {
          // ============ PROFIL DÉMO ============
          const demoProfile = getDemoProfile(user.role, user);
          setProfile(demoProfile);
        } else {
          // ============ PROFIL RÉEL ============
          const realProfile = await getRealProfile(user);
          setProfile(realProfile);
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
        setError(err);
        // Fallback avec profil minimal
        setProfile(getMinimalProfile(user));
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, dataMode, modeLoading]);

  return { profile, loading, error };
};

// Profils de démo optimisés
const getDemoProfile = (role, user) => {
  const demoProfiles = {
    principal: {
      id: user.id,
      full_name: 'M. Jean-Claude Mbarga',
      email: user.email,
      phone: '+237 693 456 789',
      role: 'principal',
      school_name: 'Collège Moderne de Yaoundé',
      school_address: '123 Avenue de l\'Indépendance, Yaoundé',
      position: 'Directeur d\'Établissement',
      experience: '15 ans',
      specialization: 'Administration Scolaire',
      employees_count: 25,
      students_count: 400,
      classes_managed: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
      certifications: ['Diplôme de Directeur d\'École', 'Formation Management Éducatif']
    },
    teacher: {
      id: user.id,
      full_name: 'Mme Marie-Josée Nguema',
      email: user.email,
      phone: '+237 695 234 567',
      role: 'teacher',
      subject: 'Mathématiques',
      classes: ['6èmeA', '5èmeB', '4èmeC'],
      school_name: 'Collège Moderne de Yaoundé',
      experience: '8 ans',
      degree: 'Master en Mathématiques',
      specialization: 'Algèbre et Géométrie',
      students_count: 120,
      schedule: 'Lundi-Vendredi 8h-15h',
      certifications: ['CAPES Mathématiques', 'Formation Pédagogie Numérique']
    },
    secretary: {
      id: user.id,
      full_name: 'Mlle Catherine Fouda',
      email: user.email,
      phone: '+237 691 345 678',
      role: 'secretary',
      position: 'Secrétaire Principale',
      school_name: 'Collège Moderne de Yaoundé',
      experience: '6 ans',
      specialization: 'Gestion Administrative',
      permissions: ['Gestion Étudiants', 'Documents Administratifs', 'Planification'],
      schedule: 'Lundi-Vendredi 7h30-16h30',
      certifications: ['BTS Secrétariat', 'Formation Gestion Éducative']
    },
    student: {
      id: user.id,
      full_name: 'Kevin Essomba',
      email: user.email,
      phone: '+237 659 456 789',
      role: 'student',
      class_name: '3èmeA',
      school_name: 'Collège Moderne de Yaoundé',
      student_id: 'ETU2024001',
      birth_date: '2008-05-15',
      parent_phone: '+237 695 000 111',
      parent_name: 'M. André Owona',
      subjects: ['Mathématiques', 'Français', 'Anglais', 'Sciences', 'Histoire'],
      average_grade: '14.5/20',
      attendance_rate: '92%'
    },
    parent: {
      id: user.id,
      full_name: 'M. André Owona',
      email: user.email,
      phone: '+237 697 567 890',
      role: 'parent',
      children: [{ name: 'Kevin Essomba', class: '3èmeA', average: '14.5/20' }],
      school_name: 'Collège Moderne de Yaoundé',
      profession: 'Ingénieur',
      emergency_contact: '+237 695 000 222',
      address: '15 Rue de la Paix, Yaoundé'
    }
  };
  return demoProfiles[role] || demoProfiles.student;
};

// Profil réel optimisé (chargement rapide des données essentielles)
const getRealProfile = async (user) => {
  const service = productionDataService;
  
  // Base profile from auth
  let profile = {
    id: user.id,
    full_name: user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
    email: user.email,
    phone: user.phone || user.user_metadata?.phone,
    role: user.role || user.user_metadata?.role || 'student',
    avatar: user.avatar || user.user_metadata?.avatar,
    created_at: user.created_at
  };

  try {
    // Charger SEULEMENT les données spécifiques au rôle (pas toutes les données)
    switch (profile.role) {
      case 'principal':
        // Charger données école uniquement
        const schoolData = await service.getSchoolDetails();
        if (schoolData.data) {
          profile = {
            ...profile,
            school_name: schoolData.data.name || 'École non définie',
            school_address: schoolData.data.address || 'Adresse non définie',
            position: 'Directeur d\'Établissement',
            experience: 'Non défini',
            specialization: 'Administration Scolaire'
          };
        }
        break;

      case 'teacher':
        // Charger données enseignant uniquement
        const teacherData = await service.getPersonnel();
        const teacher = teacherData.data?.find(p => p.email === user.email && p.type === 'teacher');
        if (teacher) {
          profile = {
            ...profile,
            full_name: teacher.name || profile.full_name,
            phone: teacher.phone || profile.phone,
            subject: teacher.subject || 'Matière non définie',
            classes: teacher.classes || [],
            experience: teacher.experience || 'Non défini'
          };
        }
        break;
        
      // Autres rôles...
      default:
        // Pour les autres rôles, garder le profil de base
        break;
    }
  } catch (error) {
    console.warn('Erreur chargement données spécifiques:', error);
    // Continuer avec le profil de base
  }

  return profile;
};

// Profil minimal de fallback
const getMinimalProfile = (user) => ({
  id: user.id,
  full_name: user.full_name || user.email?.split('@')[0] || 'Utilisateur',
  email: user.email,
  role: user.role || 'student',
  phone: user.phone || 'Non défini'
});

export default useUserProfile;