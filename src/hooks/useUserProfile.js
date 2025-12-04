import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDataMode } from './useDataMode';
import { supabase } from '../lib/supabase';
import demoDataService from '../services/demoDataService';
import productionDataService from '../services/productionDataService';

/**
 * Hook optimisé pour charger SEULEMENT les données de profil utilisateur
 * Plus rapide que useDashboardData pour les pages qui n'ont besoin que du profil
 * @param {object} providedUser - Utilisateur à charger (optionnel, sinon utilise AuthContext)
 */
export const useUserProfile = (providedUser = null) => {
  const { user: authUser } = useAuth();
  const { dataMode, isLoading: modeLoading } = useDataMode();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utiliser l'utilisateur fourni ou celui du contexte
  const user = providedUser || authUser;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || modeLoading) return;
      
      console.log('👤 useUserProfile - Chargement profil pour:', user.email, '(ID:', user.id, ')');
      
      setLoading(true);
      setError(null);

      try {
        // 🎯 DÉTECTION SIMPLE : Compte démo ou réel
        const isDemoAccount = user.email?.includes('@demo.com');

        if (isDemoAccount) {
          // ============ PROFIL DÉMO ============
          console.log('🎭 Mode DÉMO détecté');
          const demoProfile = getDemoProfile(user.role, user);
          setProfile(demoProfile);
        } else {
          // ============ PROFIL RÉEL ============
          console.log('✅ Mode PRODUCTION détecté');
          const realProfile = await getRealProfile(user);
          console.log('📋 Profil chargé:', realProfile);
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

    // Charger SEULEMENT les données spécifiques au rôle (pas toutes les données)
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
              experience: 'Non défini', // À remplir manuellement ou depuis un champ dédié
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
        console.log('📚 Student ID:', studentData?.id);

        if (studentData) {
          // Charger les informations du parent via la table de liaison parent_students
          let parentInfo = null;
          
          // Chercher d'abord dans parent_students (nouvelle structure)
          const { data: parentStudentLink, error: linkError } = await supabase
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
          
          console.log('🔗 Lien parent-étudiant:', parentStudentLink);
          console.log('🔗 Erreur lien:', linkError);
          
          if (parentStudentLink && parentStudentLink.parents && parentStudentLink.parents.users) {
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
            console.log('✅ Parent info extraite:', parentInfo);
          } else {
            // Fallback : essayer avec l'ancienne structure (parent_id dans students)
            console.log('⚠️ Pas de lien dans parent_students, essai avec parent_id...');
            
            if (studentData.parent_id) {
              const { data: parentData, error: parentError } = await supabase
                .from('parents')
                .select(`
                  *,
                  users!inner(id, full_name, phone, email)
                `)
                .eq('id', studentData.parent_id)
                .maybeSingle();
              
              console.log('👨‍👩‍👧 Parent via parent_id:', parentData);
              
              if (parentData && parentData.users) {
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
                console.log('✅ Parent info extraite (fallback):', parentInfo);
              }
            } else {
              console.warn('⚠️ Aucun parent trouvé pour cet étudiant');
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
            // Ces champs seront calculés dynamiquement
            average_grade: 'À calculer',
            attendance_rate: 'À calculer',
            subjects: [] // À charger depuis le programme de la classe
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