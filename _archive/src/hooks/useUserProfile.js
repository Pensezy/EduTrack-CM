import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import productionDataService from '../services/productionDataService';

/**
 * Hook optimisé pour charger SEULEMENT les données de profil utilisateur depuis Supabase
 * Plus rapide que useDashboardData pour les pages qui n'ont besoin que du profil
 * @param {object} providedUser - Utilisateur à charger (optionnel, sinon utilise AuthContext)
 */
export const useUserProfile = (providedUser = null) => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utiliser l'utilisateur fourni ou celui du contexte
  const user = providedUser || authUser;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('👤 useUserProfile - Chargement profil pour:', user.email, '(ID:', user.id, ')');

      setLoading(true);
      setError(null);

      try {
        const realProfile = await getRealProfile(user);
        console.log('📋 Profil chargé:', realProfile);
        setProfile(realProfile);
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
  }, [user]);

  return { profile, loading, error };
};

// Profil réel optimisé (chargement rapide des données essentielles depuis Supabase)
const getRealProfile = async (user) => {
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
    // Initialiser le contexte pour productionDataService si nécessaire
    if (user.current_school_id) {
      productionDataService.setUserContext(user.id, user.current_school_id);
    }

    // Charger SEULEMENT les données spécifiques au rôle
    switch (profile.role) {
      case 'principal':
        // Charger données école complètes
        if (user.current_school_id || user.schoolData?.id) {
          const schoolId = user.current_school_id || user.schoolData?.id;

          // Charger les détails de l'école
          const schoolData = await productionDataService.getSchoolDetails();

          if (schoolData.data) {
            // Compter le personnel et les étudiants
            const { data: employees } = await supabase
              .from('users')
              .select('id', { count: 'exact' })
              .eq('current_school_id', schoolId)
              .in('role', ['teacher', 'secretary']);

            const { data: students, count: studentsCount } = await supabase
              .from('students')
              .select('id', { count: 'exact', head: true })
              .eq('school_id', schoolId);

            profile = {
              ...profile,
              school_name: schoolData.data.name || 'École non définie',
              school_address: schoolData.data.address || 'Adresse non définie',
              school_city: schoolData.data.city || '',
              school_country: schoolData.data.country || '',
              school_phone: schoolData.data.phone || '',
              school_code: schoolData.data.code || '',
              position: 'Directeur d\'Établissement',
              experience: 'Non défini',
              specialization: 'Administration Scolaire',
              employees_count: employees?.length || 0,
              students_count: studentsCount || 0,
              classes_managed: schoolData.data.available_classes || [],
              school_type: schoolData.data.type || 'Non défini',
              school_status: schoolData.data.status || 'active'
            };
          }
        }
        break;

      case 'teacher':
        // Pour les enseignants, charger depuis la table teachers
        if (user.current_school_id) {
          const { data: teacherData } = await supabase
            .from('teachers')
            .select('*, classes(name)')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (teacherData) {
            profile = {
              ...profile,
              full_name: profile.full_name || `${teacherData.first_name} ${teacherData.last_name}`,
              subject: teacherData.specialty || 'Matière non définie',
              degree: teacherData.degree || 'Non défini',
              experience: teacherData.hire_date ?
                `${new Date().getFullYear() - new Date(teacherData.hire_date).getFullYear()} ans` :
                'Non défini',
              classes: teacherData.classes?.map(c => c.name) || [],
              phone: teacherData.phone || profile.phone
            };

            // Compter les étudiants
            const { count: studentsCount } = await supabase
              .from('students')
              .select('id', { count: 'exact', head: true })
              .eq('school_id', user.current_school_id);

            profile.students_count = studentsCount || 0;
          }
        }
        break;

      case 'student':
        // Pour les étudiants, charger depuis la table students
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`
            *,
            classes(name),
            schools(name)
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('📚 Données étudiant chargées:', studentData);

        if (studentData) {
          // Charger les informations du parent
          let parentInfo = null;

          // Chercher via parent_students
          const { data: parentStudentLink } = await supabase
            .from('parent_students')
            .select(`
              parent_id,
              relationship,
              is_primary,
              parents!inner(
                id,
                user_id,
                profession,
                address,
                emergency_contact,
                users!inner(id, full_name, phone, email)
              )
            `)
            .eq('student_id', studentData.id)
            .eq('is_primary', true)
            .maybeSingle();

          if (parentStudentLink?.parents?.users) {
            const parentData = parentStudentLink.parents;
            const userData = parentData.users;

            parentInfo = {
              id: userData.id,
              name: userData.full_name || 'Non défini',
              phone: userData.phone || 'Non défini',
              email: userData.email || 'Non défini',
              profession: parentData.profession || null,
              address: parentData.address || null,
              emergency_contact: parentData.emergency_contact || null,
              relationship: parentStudentLink.relationship || 'Parent'
            };
          } else if (studentData.parent_id) {
            // Fallback : ancienne structure
            const { data: parentData } = await supabase
              .from('parents')
              .select(`
                *,
                users!inner(id, full_name, phone, email)
              `)
              .eq('id', studentData.parent_id)
              .maybeSingle();

            if (parentData?.users) {
              parentInfo = {
                id: parentData.users.id,
                name: parentData.users.full_name || 'Non défini',
                phone: parentData.users.phone || 'Non défini',
                email: parentData.users.email || 'Non défini',
                profession: parentData.profession || null,
                address: parentData.address || null,
                emergency_contact: parentData.emergency_contact || null,
                relationship: 'Parent'
              };
            }
          }

          profile = {
            ...profile,
            full_name: studentData.first_name && studentData.last_name
              ? `${studentData.first_name} ${studentData.last_name}`
              : profile.full_name,
            class_name: studentData.classes?.name || 'Non assigné',
            school_name: studentData.schools?.name || 'École non définie',
            student_id: studentData.student_number || 'Non défini',
            birth_date: studentData.birth_date || 'Non défini',
            parent_name: parentInfo?.name || 'Non défini',
            parent_phone: parentInfo?.phone || 'Non défini',
            parent_email: parentInfo?.email || null,
            parent_profession: parentInfo?.profession || null,
            parent_address: parentInfo?.address || null,
            parent_emergency_contact: parentInfo?.emergency_contact || null,
            parent_relationship: parentInfo?.relationship || null,
            phone: studentData.phone || profile.phone,
            gender: studentData.gender || 'Non défini',
            average_grade: 'À calculer',
            attendance_rate: 'À calculer',
            subjects: []
          };
        }
        break;

      case 'secretary':
        // Pour les secrétaires, charger depuis la table users
        if (user.current_school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('name, address')
            .eq('id', user.current_school_id)
            .maybeSingle();

          profile = {
            ...profile,
            position: 'Secrétaire',
            school_name: schoolData?.name || 'École non définie',
            specialization: 'Gestion Administrative',
            permissions: ['Gestion Étudiants', 'Documents Administratifs']
          };
        }
        break;

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
