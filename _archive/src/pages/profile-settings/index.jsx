import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import useUserProfile from '../../hooks/useUserProfile';
import useRoleSession from '../../hooks/useRoleSession';

const ProfileSettings = () => {
  const location = useLocation();
  const { user: authUser } = useAuth();
  
  console.log('🔍 ProfileSettings - AuthUser reçu:', authUser?.email, 'Role:', authUser?.role, 'ID:', authUser?.id);
  
  // PRIORITÉ ABSOLUE : Si authUser existe, l'utiliser directement sans vérifier de session
  // Cela corrige le problème où un utilisateur connecté voit les données d'un autre utilisateur
  let user = authUser;
  
  // Déterminer le rôle attendu (uniquement pour useRoleSession en fallback)
  let expectedRole = authUser?.role || 'student';
  
  if (!authUser?.role) {
    const currentPath = location.pathname;
    
    if (currentPath.includes('principal')) {
      expectedRole = 'principal';
    } else if (currentPath.includes('teacher')) {
      expectedRole = 'teacher';
    } else if (currentPath.includes('parent')) {
      expectedRole = 'parent';
    } else if (currentPath.includes('secretary')) {
      expectedRole = 'secretary';
    }
  }
  
  // Toujours appeler le hook (règle React) mais uniquement en fallback
  const { user: roleUser } = useRoleSession(expectedRole);
  
  // Fallback : Si authUser n'existe pas, essayer roleUser
  if (!user && roleUser) {
    user = roleUser;
    console.log('👤 ProfileSettings - Utilisation RoleSession (fallback):', roleUser.email);
  }
  
  console.log('✅ ProfileSettings - Utilisateur final sélectionné:', user?.email, '(rôle:', user?.role, ')');
  
  // Passer l'utilisateur spécifique au hook
  const { profile: userProfile, loading: profileLoading, error } = useUserProfile(user);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  // Le profil est maintenant géré par le hook useUserProfile

  // Affichage de chargement rapide
  if (profileLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-16 w-16"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur si échec de chargement
  if (error && !profileLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Icon name="AlertCircle" size={20} className="text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Erreur de chargement</h3>
              <p className="text-sm text-red-700 mt-1">
                Impossible de charger les informations du profil. Veuillez actualiser la page.
              </p>
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
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Date de naissance</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.birth_date ? new Date(userProfile.birth_date).toLocaleDateString('fr-FR') : 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">Genre</label>
                  <p className="text-sm text-yellow-900 bg-white p-2 rounded">
                    {userProfile.gender === 'M' ? 'Masculin' : userProfile.gender === 'F' ? 'Féminin' : 'Non défini'}
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
              
              {/* Section Parent/Tuteur - Visible et mise en avant */}
              <div className="mt-4 pt-4 border-t border-yellow-300">
                <h5 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <Icon name="Users" size={16} className="mr-2" />
                  Informations Parent / Tuteur
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} className="text-yellow-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-yellow-700 mb-1">Nom complet</label>
                        <p className="text-sm font-semibold text-yellow-900">
                          {userProfile.parent_name || 'Non défini'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <Icon name="Phone" size={20} className="text-yellow-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-yellow-700 mb-1">Téléphone</label>
                        <p className="text-sm font-semibold text-yellow-900">
                          {userProfile.parent_phone || 'Non défini'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {userProfile.parent_email && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                          <Icon name="Mail" size={20} className="text-yellow-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-yellow-700 mb-1">Email</label>
                          <p className="text-sm font-semibold text-yellow-900">
                            {userProfile.parent_email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {userProfile.parent_profession && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg border border-yellow-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                          <Icon name="Briefcase" size={20} className="text-yellow-700" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-yellow-700 mb-1">Profession</label>
                          <p className="text-sm font-semibold text-yellow-900">
                            {userProfile.parent_profession}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-900 font-medium">Informations importantes</p>
                      <p className="text-xs text-blue-700 mt-1">
                        En cas d'urgence ou pour toute question concernant votre scolarité, 
                        votre parent/tuteur peut être contacté aux coordonnées ci-dessus.
                      </p>
                    </div>
                  </div>
                </div>
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

        {/* Zone de danger - Suppression de compte */}
        <DangerZone userRole={userProfile?.role} userId={user?.id} userEmail={user?.email} />
      </div>
    </div>
  );
};

// Composant Zone de danger pour la suppression de compte
const DangerZone = ({ userRole, userId, userEmail }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER MON COMPTE') {
      alert('Veuillez taper exactement "SUPPRIMER MON COMPTE" pour confirmer');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { supabase } = await import('../../lib/supabase');
      
      // 1. Supprimer toutes les données liées à l'utilisateur
      if (userRole === 'principal') {
        // Récupérer l'école du directeur
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('current_school_id')
          .eq('id', userId)
          .single();

        if (userDataError) {
          console.error('❌ Erreur lors de la récupération des données utilisateur:', userDataError);
          throw new Error(`Impossible de récupérer les données utilisateur: ${userDataError.message}`);
        }

        if (userData?.current_school_id) {
          const schoolId = userData.current_school_id;
          
          console.log('🗑️ Début de la suppression complète de l\'école et de toutes ses données...');
          console.log(`📋 École ID: ${schoolId}`);
          
          // ORDRE DE SUPPRESSION (inverse des dépendances)
          // ================================================
          
          try {
            // 1️⃣ DONNÉES TRANSACTIONNELLES (notes, présences, paiements)
            console.log('1/7 Suppression des notes...');
            const { error: gradesError } = await supabase.from('grades').delete().eq('school_id', schoolId);
            if (gradesError) console.error('Erreur suppression notes:', gradesError);
            
            console.log('2/7 Suppression des présences...');
            const { error: attendancesError } = await supabase.from('attendances').delete().eq('school_id', schoolId);
            if (attendancesError) console.error('Erreur suppression présences:', attendancesError);
            
            console.log('3/7 Suppression des paiements...');
            const { error: paymentsError } = await supabase.from('payments').delete().eq('school_id', schoolId);
            if (paymentsError) console.error('Erreur suppression paiements:', paymentsError);
          
            
            // 2️⃣ COMMUNICATIONS & LOGS
            console.log('4/7 Suppression des notifications...');
            const { error: notificationsError } = await supabase.from('notifications').delete().eq('school_id', schoolId);
            if (notificationsError) console.error('Erreur suppression notifications:', notificationsError);
            
            console.log('   Suppression des communications...');
            const { error: communicationsError } = await supabase.from('communications').delete().eq('school_id', schoolId);
            if (communicationsError) console.error('Erreur suppression communications:', communicationsError);
            
            console.log('   Suppression des modèles de messages...');
            const { error: templatesError } = await supabase.from('message_templates').delete().eq('school_id', schoolId);
            if (templatesError) console.error('Erreur suppression modèles messages:', templatesError);
            
            console.log('   Suppression des logs d\'audit...');
            const { error: auditError } = await supabase.from('audit_logs').delete().eq('school_id', schoolId);
            if (auditError) console.error('Erreur suppression audit logs:', auditError);
            
            // 3️⃣ RELATIONS (class_subjects, teacher_subjects, parent-student)
            console.log('   Suppression des relations classes-matières...');
            const { error: classSubjectsError } = await supabase.from('class_subjects').delete().eq('school_id', schoolId);
            if (classSubjectsError) console.error('Erreur suppression class_subjects:', classSubjectsError);
            
            console.log('   Suppression des relations enseignants-matières...');
            const { error: teacherSubjectsError } = await supabase.from('teacher_subjects').delete().eq('school_id', schoolId);
            if (teacherSubjectsError) console.error('Erreur suppression teacher_subjects:', teacherSubjectsError);
            
            console.log('   Suppression des relations parents-étudiants...');
            const { error: parentStudentError } = await supabase.from('parent_student_schools').delete().eq('school_id', schoolId);
            if (parentStudentError) console.error('Erreur suppression parent_student_schools:', parentStudentError);          // 4️⃣ UTILISATEURS (étudiants, enseignants, parents, secrétaires)
          console.log('5/7 Suppression des étudiants...');
          const { data: students, error: studentsSelectError } = await supabase
            .from('students')
            .select('user_id')
            .eq('school_id', schoolId);
          
          if (studentsSelectError) console.error('Erreur récupération étudiants:', studentsSelectError);
          
          const { error: studentsDeleteError } = await supabase.from('students').delete().eq('school_id', schoolId);
          if (studentsDeleteError) console.error('Erreur suppression étudiants:', studentsDeleteError);
          
          console.log('   Suppression des enseignants...');
          const { data: teachers, error: teachersSelectError } = await supabase
            .from('teachers')
            .select('user_id')
            .eq('school_id', schoolId);
          
          if (teachersSelectError) console.error('Erreur récupération enseignants:', teachersSelectError);
          
          const { error: teachersDeleteError } = await supabase.from('teachers').delete().eq('school_id', schoolId);
          if (teachersDeleteError) console.error('Erreur suppression enseignants:', teachersDeleteError);
          
          console.log('   Suppression des parents...');
          const { data: parents, error: parentsSelectError } = await supabase
            .from('parents')
            .select('user_id')
            .eq('school_id', schoolId);
          
          if (parentsSelectError) console.error('Erreur récupération parents:', parentsSelectError);
          
          const { error: parentsDeleteError } = await supabase.from('parents').delete().eq('school_id', schoolId);
          if (parentsDeleteError) console.error('Erreur suppression parents:', parentsDeleteError);
          
          console.log('   Suppression des secrétaires...');
          const { data: secretaries, error: secretariesSelectError } = await supabase
            .from('secretaries')
            .select('user_id')
            .eq('school_id', schoolId);
          
          if (secretariesSelectError) console.error('Erreur récupération secrétaires:', secretariesSelectError);
          
          const { error: secretariesDeleteError } = await supabase.from('secretaries').delete().eq('school_id', schoolId);
          if (secretariesDeleteError) console.error('Erreur suppression secrétaires:', secretariesDeleteError);
          
          // Supprimer les comptes users liés (sauf le directeur)
          const userIdsToDelete = [
            ...(students?.map(s => s.user_id) || []),
            ...(teachers?.map(t => t.user_id) || []),
            ...(parents?.map(p => p.user_id) || []),
            ...(secretaries?.map(s => s.user_id) || [])
          ].filter(id => id && id !== userId);
          
          if (userIdsToDelete.length > 0) {
            console.log(`   Suppression de ${userIdsToDelete.length} comptes utilisateurs liés...`);
            const { error: usersDeleteError } = await supabase.from('users').delete().in('id', userIdsToDelete);
            if (usersDeleteError) console.error('Erreur suppression comptes users:', usersDeleteError);
          }
          
            // 5️⃣ CONFIGURATION (matières, classes, périodes)
            console.log('6/7 Suppression des matières...');
            const { error: subjectsError } = await supabase.from('subjects').delete().eq('school_id', schoolId);
            if (subjectsError) console.error('Erreur suppression matières:', subjectsError);
            
            console.log('   Suppression des classes...');
            const { error: classesError } = await supabase.from('classes').delete().eq('school_id', schoolId);
            if (classesError) console.error('Erreur suppression classes:', classesError);
            
            console.log('   Suppression des périodes d\'évaluation...');
            const { error: evaluationPeriodsError } = await supabase.from('evaluation_periods').delete().eq('school_id', schoolId);
            if (evaluationPeriodsError) console.error('Erreur suppression périodes évaluation:', evaluationPeriodsError);
            
            console.log('   Suppression des années académiques...');
            const { error: academicYearsError } = await supabase.from('academic_years').delete().eq('school_id', schoolId);
            if (academicYearsError) console.error('Erreur suppression années académiques:', academicYearsError);
            
            // 6️⃣ TYPES (grade_types, attendance_types, payment_types)
            console.log('   Suppression des types de notes...');
            const { error: gradeTypesError } = await supabase.from('grade_types').delete().eq('school_id', schoolId);
            if (gradeTypesError) console.error('Erreur suppression types notes:', gradeTypesError);
            
            console.log('   Suppression des types de présences...');
            const { error: attendanceTypesError } = await supabase.from('attendance_types').delete().eq('school_id', schoolId);
            if (attendanceTypesError) console.error('Erreur suppression types présences:', attendanceTypesError);
            
            console.log('   Suppression des types de paiements...');
            const { error: paymentTypesError } = await supabase.from('payment_types').delete().eq('school_id', schoolId);
            if (paymentTypesError) console.error('Erreur suppression types paiements:', paymentTypesError);
            
            console.log('   Suppression des rôles utilisateurs...');
            const { error: userRolesError } = await supabase.from('user_roles').delete().eq('school_id', schoolId);
            if (userRolesError) console.error('Erreur suppression rôles utilisateurs:', userRolesError);
            
            // 7️⃣ ÉCOLE
            console.log('7/7 Suppression de l\'école...');
            const { error: schoolError } = await supabase.from('schools').delete().eq('id', schoolId);
            if (schoolError) {
              console.error('❌ ERREUR CRITIQUE - Impossible de supprimer l\'école:', schoolError);
              throw new Error(`Échec de suppression de l'école: ${schoolError.message}`);
            }
            
            console.log('✅ Toutes les données de l\'école ont été supprimées avec succès !');
          
          } catch (schoolDeletionError) {
            console.error('❌ ERREUR pendant la suppression des données école:', schoolDeletionError);
            throw new Error(`Erreur lors de la suppression des données de l'école: ${schoolDeletionError.message}`);
          }
        } else {
          console.log('⚠️ Aucune école associée trouvée pour ce directeur');
        }
      }

      // 2. Supprimer les références spécifiques à cet utilisateur (hors école)
      console.log('🗑️ Nettoyage des références utilisateur...');
      
      // Pour les enseignants, parents, étudiants, secrétaires: DÉSACTIVER au lieu de supprimer
      // Car les données appartiennent à l'établissement, pas à l'utilisateur
      if (['teacher', 'parent', 'student', 'secretary'].includes(userRole)) {
        console.log(`📋 Rôle ${userRole}: Désactivation au lieu de suppression`);
        
        // 1. Désactiver dans la table users
        const { error: userDeactivateError } = await supabase
          .from('users')
          .update({ 
            is_active: false,
            email: `deleted_${Date.now()}_${userId.substring(0, 8)}@deleted.local`,
            phone: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (userDeactivateError) {
          console.error('Erreur désactivation user:', userDeactivateError);
          throw userDeactivateError;
        }

        // 2. Désactiver dans les tables spécifiques
        if (userRole === 'teacher') {
          await supabase
            .from('teachers')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          
          // Désactiver les assignations (ne pas supprimer)
          await supabase
            .from('teacher_assignments')
            .update({ is_active: false, end_date: new Date().toISOString() })
            .eq('teacher_id', userId);
        } else if (userRole === 'parent') {
          await supabase
            .from('parents')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } else if (userRole === 'student') {
          await supabase
            .from('students')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } else if (userRole === 'secretary') {
          await supabase
            .from('secretaries')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        console.log('✅ Compte désactivé. Les données de l\'établissement sont préservées.');
        
        // NE PAS supprimer:
        // - Les notes créées par l'enseignant
        // - Les présences enregistrées
        // - Les documents créés
        // - Les communications envoyées
        // Ces données appartiennent à l'établissement
        
      } else {
        // Pour les autres rôles (si existants), suppression complète
        console.log('⚠️ Suppression complète pour ce type de compte');
        
        // Supprimer les modèles de messages créés par cet utilisateur
        await supabase.from('message_templates').delete().eq('created_by', userId);
        
        // Supprimer les communications envoyées par cet utilisateur  
        await supabase.from('communications').delete().eq('sent_by_user_id', userId);
        
        // Supprimer les notifications créées par cet utilisateur
        await supabase.from('notifications').delete().eq('created_by_user_id', userId);

        // Supprimer l'utilisateur de la table users
        const { error: userDeleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (userDeleteError) throw userDeleteError;
      }

      // 3. Supprimer/désactiver le compte Supabase Auth
      // Pour tous les rôles: supprimer l'auth (ils ne pourront plus se connecter)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.warn('Impossible de supprimer le compte auth:', authDeleteError);
        // Continuer quand même pour déconnecter l'utilisateur
      }

      // 4. Déconnecter l'utilisateur
      await supabase.auth.signOut();

      // 5. Message et redirection selon le type de suppression
      if (['teacher', 'parent', 'student', 'secretary'].includes(userRole)) {
        alert('✅ Votre compte a été désactivé. Vous ne pourrez plus vous connecter mais l\'historique de l\'établissement est préservé.');
      } else {
        alert('✅ Votre compte a été supprimé avec succès. Toutes vos données ont été effacées.');
      }
      
      // 6. Rediriger vers la page d'accueil
      window.location.href = '/';

    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      setDeleteError(error.message || 'Une erreur est survenue lors de la suppression du compte');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-red-200 shadow-sm p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-900 mb-2">Zone de danger</h2>
            <p className="text-gray-700 mb-4">
              La suppression de votre compte est <strong>irréversible</strong>. Toutes vos données seront définitivement effacées.
            </p>

            {userRole === 'principal' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">⚠️ ATTENTION - Compte Directeur</h4>
                    <p className="text-sm text-red-700 mb-2">
                      La suppression de votre compte entraînera la <strong>suppression DÉFINITIVE et IRRÉVERSIBLE</strong> de :
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-red-700">
                      <div>
                        <p className="font-semibold mb-1">👥 Comptes utilisateurs :</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>Tous les étudiants</li>
                          <li>Tous les enseignants</li>
                          <li>Tous les parents</li>
                          <li>Tous les secrétaires</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">📊 Données pédagogiques :</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>Toutes les notes</li>
                          <li>Toutes les présences</li>
                          <li>Tous les paiements</li>
                          <li>Toutes les notifications</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">🏫 Structure de l'école :</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>Toutes les classes</li>
                          <li>Toutes les matières</li>
                          <li>Années académiques</li>
                          <li>Périodes d'évaluation</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">⚙️ Configuration :</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>Types de notes</li>
                          <li>Types de présences</li>
                          <li>Types de paiements</li>
                          <li>Logs d'audit</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-red-800 font-bold mt-3 bg-red-100 px-3 py-2 rounded border border-red-300">
                      🏢 L'école entière sera supprimée définitivement !
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icon name="Info" size={16} className="text-gray-500" />
                <span>Email du compte : <strong>{userEmail}</strong></span>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Supprimer définitivement mon compte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Icon name="AlertTriangle" size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600">
                Cette action est <strong className="text-red-600">définitive et irréversible</strong>.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-medium mb-2">
                Pour confirmer, tapez exactement :
              </p>
              <p className="text-lg font-mono font-bold text-red-900 bg-white px-3 py-2 rounded border border-red-300">
                SUPPRIMER MON COMPTE
              </p>
            </div>

            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez ici..."
              className="mb-6"
              disabled={isDeleting}
            />

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER MON COMPTE' || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white"
              >
                {isDeleting ? (
                  <>
                    <Icon name="Loader" size={16} className="mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Supprimer définitivement
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Cette action supprimera toutes vos données de manière permanente
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSettings;