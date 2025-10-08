import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useDataMode } from '../../hooks/useDataMode';
import useDashboardData from '../../hooks/useDashboardData';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { isDemo, isProduction } = useDataMode();
  const { data, loading } = useDashboardData();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Construire le profil utilisateur - SIMPLE : 2 cas seulement
  useEffect(() => {
    const buildUserProfile = () => {
      if (!user) return null;

      // 🎯 SIMPLE : Vérifier si c'est un compte de démo
      const isDemoAccount = user.email?.includes('@demo.com');

      if (isDemoAccount) {
        // ============ CAS 1: COMPTE DÉMO ============
        return getDemoProfile(user.role);
      } else {
        // ============ CAS 2: COMPTE SUPABASE RÉEL ============
        return getRealProfile();
      }
    };

    // Fonction pour profil de démo
    const getDemoProfile = (role) => {
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

    // Fonction pour profil réel
    const getRealProfile = () => {
      // Base : vraies données de l'utilisateur Supabase
      let profile = {
        id: user.id,
        full_name: user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
        email: user.email,
        phone: user.phone || user.user_metadata?.phone,
        role: user.role || user.user_metadata?.role || 'student',
        avatar: user.avatar || user.user_metadata?.avatar,
        created_at: user.created_at
      };

      // Chercher les données spécifiques selon le rôle
      let specificData = null;
      switch (profile.role) {
        case 'principal':
          specificData = data?.currentUser || user;
          const schoolData = data?.schoolData || user?.schoolData || data?.schoolDetails;
          if (specificData) {
            profile.full_name = specificData.full_name || specificData.name || profile.full_name;
            profile.phone = specificData.phone || profile.phone;
          }
          profile = {
            ...profile,
            school_name: schoolData?.name || 'École non définie',
            school_address: schoolData?.address || 'Adresse non définie',
            position: 'Directeur d\'Établissement',
            employees_count: data?.personnel?.length || 0,
            students_count: data?.students?.length || 0,
            classes_managed: schoolData?.available_classes || [],
            experience: specificData?.experience || 'Non défini',
            specialization: specificData?.specialization || 'Administration Scolaire',
            certifications: specificData?.certifications || []
          };
          break;

        case 'teacher':
          specificData = data?.personnel?.find(p => p.email === user.email && p.type === 'teacher');
          if (specificData) {
            profile.full_name = specificData.full_name || specificData.name || profile.full_name;
            profile.phone = specificData.phone || profile.phone;
          }
          profile = {
            ...profile,
            subject: specificData?.subject || 'Matière non définie',
            classes: specificData?.classes || [],
            experience: specificData?.experience || 'Non défini',
            students_count: specificData?.students_count || 0,
            degree: specificData?.degree || 'Diplôme non défini',
            specialization: specificData?.specialization || 'Non défini',
            schedule: specificData?.schedule || 'Horaires non définis',
            certifications: specificData?.certifications || []
          };
          break;

        case 'secretary':
          specificData = data?.personnel?.find(p => p.email === user.email && p.type === 'secretary');
          if (specificData) {
            profile.full_name = specificData.full_name || specificData.name || profile.full_name;
            profile.phone = specificData.phone || profile.phone;
          }
          profile = {
            ...profile,
            position: specificData?.role || 'Secrétaire',
            experience: specificData?.experience || 'Non défini',
            permissions: specificData?.permissions || [],
            specialization: specificData?.specialization || 'Gestion Administrative',
            schedule: specificData?.schedule || 'Horaires non définis',
            certifications: specificData?.certifications || []
          };
          break;

        case 'student':
          specificData = data?.students?.find(s => s.email === user.email);
          if (specificData) {
            profile.full_name = specificData.full_name || specificData.name || profile.full_name;
            profile.phone = specificData.phone || profile.phone;
          }
          profile = {
            ...profile,
            class_name: specificData?.class_name || 'Classe non définie',
            student_id: specificData?.student_id || 'ID non défini',
            birth_date: specificData?.birth_date || 'Date non définie',
            parent_phone: specificData?.parent_phone || 'Contact parent non défini',
            parent_name: specificData?.parent_name || 'Parent non défini',
            subjects: specificData?.subjects || [],
            average_grade: specificData?.average_grade || 'Non calculée',
            attendance_rate: specificData?.attendance_rate || 'Non calculé'
          };
          break;

        case 'parent':
          specificData = data?.parents?.find(p => p.email === user.email);
          if (specificData) {
            profile.full_name = specificData.full_name || specificData.name || profile.full_name;
            profile.phone = specificData.phone || profile.phone;
          }
          profile = {
            ...profile,
            children: specificData?.children || [],
            profession: specificData?.profession || 'Non définie',
            emergency_contact: specificData?.emergency_contact || 'Non défini',
            address: specificData?.address || 'Non définie'
          };
          break;
      }

      return profile;
    };

    setUserProfile(buildUserProfile());
  }, [user, data]);

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-16 w-16"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validation de la force du mot de passe
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
      criteria: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  };

  const passwordValidation = validatePassword(passwordData.newPassword);

  const handlePasswordChange = async () => {
    // Validation des champs
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (!passwordValidation.isValid) {
      alert('Le nouveau mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    try {
      // Ici, on intégrerait la logique de changement de mot de passe
      // avec l'API backend (Supabase, etc.)
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Mot de passe changé avec succès !');
      
      // Reset du formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      alert('Erreur lors du changement de mot de passe. Veuillez réessayer.');
    }
  };

  const generateSecurePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Assurer au moins un caractère de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Compléter jusqu'à 12 caractères
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setPasswordData(prev => ({
      ...prev,
      newPassword,
      confirmPassword: newPassword
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                userProfile.role === 'principal' ? 'bg-purple-100' :
                userProfile.role === 'teacher' ? 'bg-green-100' :
                userProfile.role === 'secretary' ? 'bg-blue-100' :
                userProfile.role === 'student' ? 'bg-yellow-100' :
                userProfile.role === 'parent' ? 'bg-pink-100' : 'bg-gray-100'
              }`}>
                <Icon 
                  name={
                    userProfile.role === 'principal' ? 'Crown' :
                    userProfile.role === 'teacher' ? 'GraduationCap' :
                    userProfile.role === 'secretary' ? 'UserCheck' :
                    userProfile.role === 'student' ? 'BookOpen' :
                    userProfile.role === 'parent' ? 'Users' : 'User'
                  } 
                  size={24} 
                  className={
                    userProfile.role === 'principal' ? 'text-purple-600' :
                    userProfile.role === 'teacher' ? 'text-green-600' :
                    userProfile.role === 'secretary' ? 'text-blue-600' :
                    userProfile.role === 'student' ? 'text-yellow-600' :
                    userProfile.role === 'parent' ? 'text-pink-600' : 'text-gray-600'
                  }
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{userProfile.full_name}</h2>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.role === 'principal' ? 'bg-purple-100 text-purple-800' :
                    userProfile.role === 'teacher' ? 'bg-green-100 text-green-800' :
                    userProfile.role === 'secretary' ? 'bg-blue-100 text-blue-800' :
                    userProfile.role === 'student' ? 'bg-yellow-100 text-yellow-800' :
                    userProfile.role === 'parent' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userProfile.role === 'principal' ? 'Directeur' :
                     userProfile.role === 'teacher' ? 'Enseignant' :
                     userProfile.role === 'secretary' ? 'Secrétaire' :
                     userProfile.role === 'student' ? 'Étudiant' :
                     userProfile.role === 'parent' ? 'Parent' : userProfile.role}
                  </span>
                  {userProfile.position && (
                    <span className="text-xs text-gray-500">• {userProfile.position}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Indicateur du mode */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              userProfile.email?.includes('@demo.com') ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
            }`}>
              <Icon name={userProfile.email?.includes('@demo.com') ? 'TestTube' : 'Database'} size={16} />
              <span className="text-sm font-medium">
                {userProfile.email?.includes('@demo.com') ? 'Profil Démo' : 'Profil Réel'}
              </span>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du profil</h3>
          
          {/* Informations de base communes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userProfile.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userProfile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {userProfile.phone || 'Non défini'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {userProfile.role === 'principal' ? 'Directeur d\'Établissement' :
                 userProfile.role === 'teacher' ? 'Enseignant' :
                 userProfile.role === 'secretary' ? 'Secrétaire' :
                 userProfile.role === 'student' ? 'Étudiant' :
                 userProfile.role === 'parent' ? 'Parent d\'Élève' : userProfile.role}
              </p>
            </div>
          </div>

          {/* Informations spécifiques selon le rôle */}
          {userProfile.role === 'principal' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                <Icon name="Crown" size={16} className="mr-2" />
                Informations Directeur
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Établissement</label>
                  <p className="text-sm text-purple-900 bg-white p-2 rounded">
                    {userProfile.school_name || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Expérience</label>
                  <p className="text-sm text-purple-900 bg-white p-2 rounded">
                    {userProfile.experience || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Personnel géré</label>
                  <p className="text-sm text-purple-900 bg-white p-2 rounded">
                    {userProfile.employees_count || 0} employés
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Élèves</label>
                  <p className="text-sm text-purple-900 bg-white p-2 rounded">
                    {userProfile.students_count || 0} étudiants
                  </p>
                </div>
                {userProfile.school_address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-700 mb-1">Adresse établissement</label>
                    <p className="text-sm text-purple-900 bg-white p-2 rounded">
                      {userProfile.school_address}
                    </p>
                  </div>
                )}
                {userProfile.classes_managed && userProfile.classes_managed.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-700 mb-1">Classes de l'établissement</label>
                    <div className="bg-white p-2 rounded">
                      <div className="flex flex-wrap gap-2">
                        {userProfile.classes_managed.map((classe, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {classe}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile.role === 'teacher' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-900 mb-3 flex items-center">
                <Icon name="GraduationCap" size={16} className="mr-2" />
                Informations Enseignant
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Matière enseignée</label>
                  <p className="text-sm text-green-900 bg-white p-2 rounded">
                    {userProfile.subject || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Expérience</label>
                  <p className="text-sm text-green-900 bg-white p-2 rounded">
                    {userProfile.experience || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Nombre d'élèves</label>
                  <p className="text-sm text-green-900 bg-white p-2 rounded">
                    {userProfile.students_count || 0} étudiants
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Diplôme</label>
                  <p className="text-sm text-green-900 bg-white p-2 rounded">
                    {userProfile.degree || 'Non défini'}
                  </p>
                </div>
                {userProfile.classes && userProfile.classes.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-700 mb-1">Classes enseignées</label>
                    <div className="bg-white p-2 rounded">
                      <div className="flex flex-wrap gap-2">
                        {userProfile.classes.map((classe, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {classe}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {userProfile.specialization && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-green-700 mb-1">Spécialisation</label>
                    <p className="text-sm text-green-900 bg-white p-2 rounded">
                      {userProfile.specialization}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile.role === 'secretary' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <Icon name="UserCheck" size={16} className="mr-2" />
                Informations Secrétaire
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Position</label>
                  <p className="text-sm text-blue-900 bg-white p-2 rounded">
                    {userProfile.position || 'Secrétaire'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Expérience</label>
                  <p className="text-sm text-blue-900 bg-white p-2 rounded">
                    {userProfile.experience || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Horaires</label>
                  <p className="text-sm text-blue-900 bg-white p-2 rounded">
                    {userProfile.schedule || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Spécialisation</label>
                  <p className="text-sm text-blue-900 bg-white p-2 rounded">
                    {userProfile.specialization || 'Non défini'}
                  </p>
                </div>
                {userProfile.permissions && userProfile.permissions.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Permissions</label>
                    <div className="bg-white p-2 rounded">
                      <div className="flex flex-wrap gap-2">
                        {userProfile.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile.role === 'student' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                <Icon name="BookOpen" size={16} className="mr-2" />
                Informations Étudiant
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Classe</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.class_name || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Numéro étudiant</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.student_id || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Moyenne générale</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.average_grade || 'Non calculée'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Taux de présence</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.attendance_rate || 'Non calculé'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Parent / Tuteur</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.parent_name || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Téléphone parent</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.parent_phone || 'Non défini'}
                  </p>
                </div>
                {userProfile.subjects && userProfile.subjects.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Matières étudiées</label>
                    <div className="bg-white p-2 rounded">
                      <div className="flex flex-wrap gap-2">
                        {userProfile.subjects.map((subject, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {userProfile.role === 'parent' && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-pink-900 mb-3 flex items-center">
                <Icon name="Users" size={16} className="mr-2" />
                Informations Parent
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Profession</label>
                  <p className="text-sm text-pink-900 bg-white p-2 rounded">
                    {userProfile.profession || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-pink-700 mb-1">Contact d'urgence</label>
                  <p className="text-sm text-pink-900 bg-white p-2 rounded">
                    {userProfile.emergency_contact || 'Non défini'}
                  </p>
                </div>
                {userProfile.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-pink-700 mb-1">Adresse</label>
                    <p className="text-sm text-pink-900 bg-white p-2 rounded">
                      {userProfile.address}
                    </p>
                  </div>
                )}
                {userProfile.children && userProfile.children.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-pink-700 mb-1">Enfants scolarisés</label>
                    <div className="bg-white p-2 rounded space-y-2">
                      {userProfile.children.map((child, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-pink-50 rounded">
                          <div>
                            <span className="font-medium text-pink-900">{child.name}</span>
                            <span className="text-sm text-pink-700 ml-2">Classe: {child.class}</span>
                          </div>
                          <span className="text-sm text-pink-600">Moyenne: {child.average}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications (si disponibles) */}
          {userProfile.certifications && userProfile.certifications.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Icon name="Award" size={16} className="mr-2" />
                Certifications & Formations
              </h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.certifications.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Changement de mot de passe */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sécurité du compte</h3>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="Lock" size={16} className="mr-2" />
                Changer le mot de passe
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-6">
              {/* Formulaire de changement de mot de passe */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="Info" size={20} className="text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-900">Changement de mot de passe</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Pour votre sécurité, votre nouveau mot de passe doit respecter tous les critères listés ci-dessous.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    label="Mot de passe actuel"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Saisissez votre mot de passe actuel"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Icon name={showPasswords.current ? "EyeOff" : "Eye"} size={16} />
                      </button>
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Nouveau mot de passe"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Saisissez votre nouveau mot de passe"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Icon name={showPasswords.new ? "EyeOff" : "Eye"} size={16} />
                      </button>
                    }
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGeneratePassword}
                    className="mt-2"
                  >
                    <Icon name="Shuffle" size={14} className="mr-2" />
                    Générer un mot de passe sécurisé
                  </Button>
                </div>

                <div>
                  <Input
                    label="Confirmer le nouveau mot de passe"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirmez votre nouveau mot de passe"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Icon name={showPasswords.confirm ? "EyeOff" : "Eye"} size={16} />
                      </button>
                    }
                  />
                </div>

                {/* Critères de sécurité */}
                {passwordData.newPassword && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Critères de sécurité</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'minLength', label: 'Au moins 8 caractères' },
                        { key: 'hasUpper', label: 'Au moins une lettre majuscule (A-Z)' },
                        { key: 'hasLower', label: 'Au moins une lettre minuscule (a-z)' },
                        { key: 'hasNumber', label: 'Au moins un chiffre (0-9)' },
                        { key: 'hasSpecial', label: 'Au moins un caractère spécial (!@#$...)' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Icon
                            name={passwordValidation.criteria[key] ? "CheckCircle" : "XCircle"}
                            size={16}
                            className={passwordValidation.criteria[key] ? "text-green-600" : "text-red-500"}
                          />
                          <span className={`text-sm ${passwordValidation.criteria[key] ? "text-green-700" : "text-red-600"}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correspondance des mots de passe */}
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={passwordData.newPassword === passwordData.confirmPassword ? "CheckCircle" : "XCircle"}
                      size={16}
                      className={passwordData.newPassword === passwordData.confirmPassword ? "text-green-600" : "text-red-500"}
                    />
                    <span className={`text-sm ${passwordData.newPassword === passwordData.confirmPassword ? "text-green-700" : "text-red-600"}`}>
                      Les mots de passe {passwordData.newPassword === passwordData.confirmPassword ? "correspondent" : "ne correspondent pas"}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={!passwordValidation.isValid || passwordData.newPassword !== passwordData.confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  <Icon name="Save" size={16} className="mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon name="Shield" size={20} className="text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Sécurité du compte</h4>
                    <p className="text-sm text-green-700">
                      Votre compte est sécurisé. Changez régulièrement votre mot de passe pour maintenir la sécurité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Recommandations de sécurité :</strong></p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Changez votre mot de passe tous les 3 mois</li>
                  <li>Utilisez un mot de passe unique pour cette plateforme</li>
                  <li>Ne partagez jamais vos identifiants</li>
                  <li>Déconnectez-vous après chaque session</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;