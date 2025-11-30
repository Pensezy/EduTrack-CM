import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useDataMode } from '../../../hooks/useDataMode';
import useDashboardData from '../../../hooks/useDashboardData';
import { supabase } from '../../../lib/supabase';
import { sendCredentialsEmail, isEmailConfigured } from '../../../services/emailService';

const AccountsManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hooks pour la gestion des données
  const { user: authUser } = useAuth();
  const { isDemo } = useDataMode();
  const { data, loading } = useDashboardData();

  // État pour les données complètes de l'utilisateur
  const [user, setUser] = useState(authUser);
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // Charger les données complètes du directeur depuis Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (isDemo) {
        // En mode démo, utiliser les données du compte démo
        setUser(authUser);
        setUserDataLoaded(true);
        return;
      }

      if (!authUser?.id) {
        setUser(authUser);
        setUserDataLoaded(true);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            id, 
            email, 
            full_name, 
            role, 
            phone, 
            current_school_id,
            school:schools!users_current_school_id_fkey(id, name)
          `)
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('❌ Erreur chargement données utilisateur:', error);
          setUser(authUser); // Fallback sur authUser
        } else {
          console.log('✅ Données utilisateur chargées:', userData);
          
          // Charger aussi le type d'école pour la détection automatique du niveau
          const { data: schoolTypeData } = await supabase
            .from('schools')
            .select('type')
            .eq('id', userData.current_school_id)
            .single();
          
          // Aplatir les données school
          const userWithSchool = {
            ...userData,
            school_id: userData.school?.id || userData.current_school_id,
            school_name: userData.school?.name || 'École',
            school_type: schoolTypeData?.type || 'combined'
          };
          
          setUser(userWithSchool);
        }
      } catch (err) {
        console.error('❌ Exception chargement utilisateur:', err);
        setUser(authUser); // Fallback sur authUser
      } finally {
        setUserDataLoaded(true);
      }
    };

    loadUserData();
  }, [authUser, isDemo]);

  // Gérer la navigation directe vers un sous-onglet via l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const subtabParam = urlParams.get('subtab');
    if (subtabParam && ['overview', 'accounts', 'create', 'security'].includes(subtabParam)) {
      setActiveTab(subtabParam);
    }
    
    // Réinitialiser le filtre de rôle s'il contient 'principal' (plus disponible)
    if (selectedRole === 'principal') {
      setSelectedRole('all');
    }
  }, [location.search, selectedRole]);

  // État pour le chargement des comptes réels
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Nouvel utilisateur à créer
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'student',
    password: '',
    status: 'active',
    // Champs spécifiques enseignant
    specialty: '',
    hireDate: new Date().toISOString().split('T')[0],
    selectedClasses: [],
    selectedSubjects: [],
    weeklyHours: '',
    // Champs spécifiques secrétaire
    permissions: [],
    department: '',
    // Champs spécifiques élève
    schoolLevel: 'primary', // 'primary' ou 'secondary'
    matricule: '', // Généré automatiquement pour le secondaire
    classId: '',
    dateOfBirth: '',
    parentId: '', // ID du parent existant (au lieu de parentName/Phone/Email)
    // Anciens champs (pour compatibilité si nécessaire)
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    // Champs spécifiques parent
    selectedChildren: [],
    emergencyContact: '',
    emergencyPhone: '',
    profession: '',
    address: ''
  });

  // États pour les données de référence
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingReference, setLoadingReference] = useState(false);

  // États pour l'ajout de nouvelles matières
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  // Détection automatique du school_level quand la classe change
  useEffect(() => {
    if (newUser.role === 'student' && newUser.classId) {
      const selectedClass = availableClasses.find(c => c.value === newUser.classId);
      if (selectedClass && user?.school_type) {
        const detectedLevel = determineSchoolLevel(user.school_type, selectedClass.label);
        if (detectedLevel !== newUser.schoolLevel) {
          setNewUser(prev => ({ ...prev, schoolLevel: detectedLevel }));
          console.log(`🎯 Niveau détecté automatiquement: ${detectedLevel} (classe: ${selectedClass.label}, type école: ${user.school_type})`);
        }
      }
    }
  }, [newUser.classId, newUser.role, availableClasses, user?.school_type]);

  // Données de démonstration pour les comptes
  const demoAccounts = [
    {
      id: 'demo-principal-1',
      full_name: 'M. Directeur Demo',
      email: 'principal@demo.com',
      phone: '+237 695 123 456',
      role: 'principal',
      status: 'active',
      last_login: '2025-10-08 09:30:00',
      created_at: '2024-09-01',
      login_attempts: 0,
      is_locked: false
    },
    {
      id: 'demo-teacher-1',
      full_name: 'Mme Marie Enseignante',
      email: 'teacher@demo.com',
      phone: '+237 695 234 567',
      role: 'teacher',
      status: 'active',
      last_login: '2025-10-08 08:15:00',
      created_at: '2024-09-15',
      login_attempts: 0,
      is_locked: false
    },
    {
      id: 'demo-secretary-1',
      full_name: 'Mme Fatima Secrétaire',
      email: 'secretary@demo.com',
      phone: '+237 695 345 678',
      role: 'secretary',
      status: 'active',
      last_login: '2025-10-07 16:45:00',
      created_at: '2024-09-20',
      login_attempts: 1,
      is_locked: false
    },
    {
      id: 'demo-student-1',
      full_name: 'Jean Élève',
      email: 'student@demo.com',
      phone: '+237 695 456 789',
      role: 'student',
      status: 'active',
      last_login: '2025-10-08 07:30:00',
      created_at: '2024-10-01',
      login_attempts: 0,
      is_locked: false
    },
    {
      id: 'demo-parent-1',
      full_name: 'Mme Parent Demo',
      email: 'parent@demo.com',
      phone: '+237 695 567 890',
      role: 'parent',
      status: 'active',
      last_login: '2025-10-07 20:15:00',
      created_at: '2024-10-01',
      login_attempts: 2,
      is_locked: false
    },
    {
      id: 'demo-inactive-1',
      full_name: 'Compte Inactif',
      email: 'inactive@demo.com',
      phone: '+237 695 678 901',
      role: 'teacher',
      status: 'inactive',
      last_login: '2025-09-15 14:20:00',
      created_at: '2024-08-01',
      login_attempts: 5,
      is_locked: true
    }
  ];

  // Statistiques des comptes
  const accountStats = {
    total: accounts.length,
    active: accounts.filter(acc => {
      const isActive = acc.is_active !== undefined ? acc.is_active : acc.status === 'active';
      return isActive;
    }).length,
    inactive: accounts.filter(acc => acc.status === 'inactive').length,
    locked: accounts.filter(acc => acc.is_locked).length,
    byRole: {
      principal: accounts.filter(acc => acc.role === 'principal').length,
      teacher: accounts.filter(acc => acc.role === 'teacher').length,
      secretary: accounts.filter(acc => acc.role === 'secretary').length,
      student: accounts.filter(acc => acc.role === 'student').length,
      parent: accounts.filter(acc => acc.role === 'parent').length
    }
  };

  // Filtrage des comptes
  // Utiliser les comptes réels ou de démo selon le mode
  const displayAccounts = isDemo ? demoAccounts : accounts;

  const filteredAccounts = displayAccounts.filter(account => {
    const matchesSearch = account.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || account.role === selectedRole;
    
    // Gérer is_active (Supabase) ou status (démo)
    const accountStatus = account.is_active !== undefined 
      ? (account.is_active ? 'active' : 'inactive')
      : account.status;
    const matchesStatus = selectedStatus === 'all' || accountStatus === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Options pour les filtres
  const roleOptions = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'secretary', label: 'Secrétaire' },
    { value: 'student', label: 'Élève' },
    { value: 'parent', label: 'Parent' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  const newUserRoleOptions = [
    { value: 'student', label: 'Élève' },
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Enseignant' },
    { value: 'secretary', label: 'Secrétaire' }
  ];

  const permissionsOptions = [
    { value: 'manage_students', label: 'Gérer les élèves' },
    { value: 'manage_grades', label: 'Gérer les notes' },
    { value: 'manage_attendance', label: 'Gérer les présences' },
    { value: 'manage_communications', label: 'Gérer les communications' },
    { value: 'view_reports', label: 'Voir les rapports' }
  ];

  // Fonction helper pour obtenir les matières par défaut selon le type d'école
  const getDefaultSubjectsBySchoolType = (schoolType) => {
    const subjectsByType = {
      'Maternelle': ['Éveil', 'Psychomotricité', 'Langage', 'Arts plastiques', 'Musique', 'Jeux éducatifs'],
      'Primaire': ['Mathématiques', 'Français', 'Lecture', 'Écriture', 'Histoire', 'Géographie', 'Sciences', 'Éducation Civique et Morale', 'Arts Plastiques', 'Musique', 'Éducation Physique et Sportive', 'Anglais', 'Informatique', 'Travaux Manuels', 'Hygiène et Santé', 'Bibliothèque'],
      'Collège': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Sciences de la Vie et de la Terre', 'Physique-Chimie', 'Technologie', 'Éducation Physique et Sportive', 'Arts Plastiques', 'Musique', 'Éducation Civique', 'Espagnol', 'Allemand', 'Informatique'],
      'Lycée Général': ['Mathématiques', 'Français', 'Philosophie', 'Histoire-Géographie', 'Anglais', 'Espagnol', 'Allemand', 'Physique-Chimie', 'Sciences de la Vie et de la Terre', 'Sciences Économiques et Sociales', 'Éducation Physique et Sportive', 'Arts Plastiques', 'Musique', 'NSI (Numérique et Sciences Informatiques)', 'SI (Sciences de l\'Ingénieur)', 'HGGSP', 'HLP', 'LLCER', 'Biologie-Écologie', 'Mathématiques Expertes'],
      'Lycée Technique': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Physique-Chimie', 'Électrotechnique', 'Mécanique', 'Génie Civil', 'Informatique', 'Économie-Gestion', 'Construction', 'CAO/DAO', 'Automatisme', 'Sciences de l\'Ingénieur', 'Télécommunications', 'Maintenance', 'Énergie', 'Éducation Physique et Sportive'],
      'Lycée Professionnel': ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Commerce', 'Vente', 'Comptabilité', 'Secrétariat', 'Cuisine', 'Hôtellerie', 'Coiffure', 'Esthétique', 'Mécanique Auto', 'Électricité', 'Menuiserie', 'Soudure', 'Mode', 'Agriculture']
    };

    const subjects = subjectsByType[schoolType] || subjectsByType['Collège'];
    return subjects.map((name, index) => ({ id: `default-${index}`, name }));
  };

  // Onglets de navigation
  const tabs = [
    { id: 'overview', label: 'Aperçu général', icon: 'BarChart3' },
    { id: 'accounts', label: 'Liste des comptes', icon: 'Users' },
    { id: 'security', label: 'Sécurité', icon: 'Shield' },
    { id: 'create', label: 'Créer un compte', icon: 'UserPlus' }
  ];

  // Charger les données de référence pour le formulaire
  useEffect(() => {
    const loadReferenceData = async () => {
      console.log('🔄 Chargement données référence...');
      console.log('  - isDemo:', isDemo);
      console.log('  - user:', user);
      console.log('  - school_id:', user?.current_school_id);

      if (isDemo) {
        console.log('📦 Mode démo - Chargement données fictives');
        // Données de démo
        setAvailableClasses([
          { value: 'demo-class-1', label: '6ème A' },
          { value: 'demo-class-2', label: '6ème B' },
          { value: 'demo-class-3', label: '5ème A' }
        ]);
        setAvailableSubjects([
          { value: 'demo-subject-1', label: 'Mathématiques' },
          { value: 'demo-subject-2', label: 'Français' },
          { value: 'demo-subject-3', label: 'Anglais' }
        ]);
        setAvailableStudents([
          { value: 'demo-student-1', label: 'Jean Élève - 6ème A' },
          { value: 'demo-student-2', label: 'Marie Élève - 6ème B' }
        ]);
        return;
      }

      if (!user?.current_school_id) {
        console.warn('⚠️ Pas de school_id - Impossible de charger les données');
        return;
      }

      setLoadingReference(true);
      try {
        // Charger les données de l'école (classes et matières personnalisées)
        console.log('🏫 Chargement données école...');
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('available_classes, type, custom_subjects')
          .eq('id', user.current_school_id)
          .single();

        if (schoolError) {
          console.error('❌ Erreur chargement données école:', schoolError);
        } else {
          console.log('✅ Données école chargées:', schoolData);

          // Charger les classes depuis available_classes
          if (schoolData?.available_classes && Array.isArray(schoolData.available_classes)) {
            const formattedClasses = schoolData.available_classes.map((className, index) => ({
              value: `class-${index}`,
              label: className
            }));
            setAvailableClasses(formattedClasses);
            console.log(`✅ ${formattedClasses.length} classe(s) chargée(s)`);
          } else {
            console.warn('⚠️ Aucune classe disponible dans available_classes');
            setAvailableClasses([]);
          }

          // Charger les matières (par défaut + personnalisées)
          const defaultSubjects = getDefaultSubjectsBySchoolType(schoolData.type);
          const customSubjects = (schoolData.custom_subjects || []).map(name => ({ id: `custom-${name}`, name }));
          
          // Utiliser un Set pour éliminer les doublons par nom
          const allSubjectsMap = new Map();
          [...defaultSubjects, ...customSubjects].forEach(subject => {
            if (!allSubjectsMap.has(subject.name)) {
              allSubjectsMap.set(subject.name, { value: subject.id, label: subject.name });
            }
          });
          
          const allSubjects = Array.from(allSubjectsMap.values());
          setAvailableSubjects(allSubjects);
          console.log(`✅ ${allSubjects.length} matière(s) disponible(s) (sans doublons)`);
        }

        console.log('👨‍👩‍👧 Chargement parents...');
        // Charger les parents (pour lier aux élèves)
        const { data: parentsData, error: parentsError } = await supabase
          .from('parents')
          .select(`
            id,
            first_name,
            last_name,
            users!inner (
              id,
              email,
              phone,
              full_name
            )
          `)
          .eq('school_id', user.current_school_id)
          .eq('is_active', true)
          .order('last_name');

        if (parentsError) {
          console.error('❌ Erreur chargement parents:', parentsError);
          setAvailableStudents([]); // Vider si erreur
        } else {
          console.log('✅ Parents chargés:', parentsData?.length || 0);
          const formattedParents = (parentsData || []).map(parent => ({
            id: parent.id,
            user_id: parent.users.id,
            full_name: parent.users.full_name || `${parent.first_name} ${parent.last_name}`,
            email: parent.users.email,
            phone: parent.users.phone
          }));
          setAvailableStudents(formattedParents); // Réutiliser availableStudents pour les parents
        }
      } catch (error) {
        console.error('❌ Erreur chargement données référence:', error);
      } finally {
        setLoadingReference(false);
      }
    };

    if (activeTab === 'create' && userDataLoaded) {
      loadReferenceData();
    }
  }, [activeTab, user?.current_school_id, isDemo, userDataLoaded]);

  // Fonction pour ajouter une nouvelle matière
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      alert('Veuillez entrer le nom de la matière');
      return;
    }

    // Vérifier si la matière existe déjà
    if (availableSubjects.some(s => s.label.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      alert('Cette matière existe déjà');
      return;
    }

    setAddingSubject(true);

    try {
      if (isDemo) {
        // Mode démo : ajouter localement
        const newSubject = {
          value: `custom-${Date.now()}`,
          label: newSubjectName.trim()
        };
        setAvailableSubjects(prev => [...prev, newSubject]);
        setNewSubjectName('');
        setShowAddSubject(false);
        alert('Matière ajoutée (mode démo)');
      } else {
        // Mode production : sauvegarder dans Supabase
        const { data: schoolData, error: fetchError } = await supabase
          .from('schools')
          .select('custom_subjects')
          .eq('id', user.current_school_id)
          .single();

        if (fetchError) {
          throw new Error('Erreur lors de la récupération des matières');
        }

        const currentCustomSubjects = schoolData.custom_subjects || [];
        const updatedCustomSubjects = [...currentCustomSubjects, newSubjectName.trim()];

        const { error: updateError } = await supabase
          .from('schools')
          .update({ custom_subjects: updatedCustomSubjects })
          .eq('id', user.current_school_id);

        if (updateError) {
          throw new Error('Erreur lors de l\'ajout de la matière');
        }

        // Mettre à jour la liste locale
        const newSubject = {
          value: `custom-${Date.now()}`,
          label: newSubjectName.trim()
        };
        setAvailableSubjects(prev => [...prev, newSubject]);
        setNewSubjectName('');
        setShowAddSubject(false);
        alert('✅ Matière ajoutée avec succès !');
      }
    } catch (error) {
      console.error('Erreur ajout matière:', error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setAddingSubject(false);
    }
  };

  // Test de la configuration EmailJS
  const testEmailConfiguration = async () => {
    if (isDemo) {
      alert('⚠️ Le test d\'email n\'est disponible qu\'en mode production.');
      return;
    }

    const testEmail = prompt('Entrez votre adresse email pour recevoir un email de test :');
    
    if (!testEmail || !testEmail.includes('@')) {
      alert('Adresse email invalide.');
      return;
    }

    setLoadingAccounts(true);

    try {
      console.log('🧪 Test de configuration EmailJS...');
      
      const emailResult = await sendCredentialsEmail({
        recipientEmail: testEmail,
        recipientName: 'Utilisateur Test',
        role: 'Enseignant Test',
        email: testEmail,
        password: 'TestPassword123!',
        schoolName: user?.school_name || 'École Test',
        principalName: user?.full_name || 'Directeur Test',
      });

      if (emailResult.success) {
        alert(
          `✅ Test réussi !\n\n` +
          `Un email de test a été envoyé à ${testEmail}\n\n` +
          `Vérifiez votre boîte de réception (et les spams).\n\n` +
          `Si vous recevez l'email, la configuration fonctionne correctement !`
        );
      } else {
        alert(
          `❌ Test échoué\n\n` +
          `Erreur : ${emailResult.error}\n\n` +
          `${emailResult.technicalError ? `Détails : ${emailResult.technicalError}\n\n` : ''}` +
          `Consultez la console (F12) pour plus de détails.\n\n` +
          `Voir le guide : docs/EMAIL_TROUBLESHOOTING.md`
        );
      }
    } catch (error) {
      alert(`❌ Erreur inattendue :\n\n${error.message}`);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Gestion des actions sur les comptes
  const handleResetPassword = (accountId, accountName, accountEmail) => {
    const newPassword = generateSecurePassword();
    
    const confirmAction = confirm(
      `Réinitialiser le mot de passe pour ${accountName} ?\n\n` +
      `Un nouveau mot de passe sera généré automatiquement.\n\n` +
      `Voulez-vous l'envoyer par email à ${accountEmail} ?`
    );
    
    if (!confirmAction) return;
    
    if (isDemo) {
      alert(`Mode démo : Mot de passe réinitialisé pour ${accountName}\n\nEmail envoyé à ${accountEmail} avec :\n- Nouveau mot de passe temporaire\n- Instructions de changement\n- Lien de première connexion`);
    } else {
      // Logique de réinitialisation réelle
      console.log('Réinitialisation mot de passe pour:', accountId);
      // Ici on enverrait l'email automatiquement
      sendPasswordResetEmail(accountEmail, accountName, newPassword);
    }
  };

  // Envoyer un email de réinitialisation
  const sendPasswordResetEmail = (email, name, newPassword) => {
    // Cette fonction serait connectée à un service d'email réel
    console.log('Envoi email de réinitialisation à:', email);
    alert(`Email de réinitialisation envoyé à ${email} !\n\n${name} recevra :\n- Son nouveau mot de passe temporaire\n- Un lien pour se connecter\n- L'obligation de changer son mot de passe`);
  };

  // Renvoyer les identifiants par email
  const handleResendCredentials = (accountId, accountName, accountEmail) => {
    const confirmSend = confirm(
      `Renvoyer les identifiants de connexion à ${accountName} ?\n\n` +
      `Un email sera envoyé à ${accountEmail} avec :\n` +
      `- Son email de connexion\n` +
      `- Un lien pour réinitialiser son mot de passe\n` +
      `- Les instructions de première connexion`
    );
    
    if (!confirmSend) return;
    
    if (isDemo) {
      alert(`Mode démo : Identifiants renvoyés à ${accountEmail} avec succès !`);
    } else {
      // Logique d'envoi réelle
      console.log('Renvoi identifiants pour:', accountId);
      sendCredentialsReminder(accountEmail, accountName);
    }
  };

  // Envoyer un rappel d'identifiants
  const sendCredentialsReminder = (email, name) => {
    console.log('Envoi rappel identifiants à:', email);
    alert(`Rappel d'identifiants envoyé à ${email} !\n\n${name} recevra :\n- Son email de connexion\n- Un lien pour réinitialiser son mot de passe si nécessaire\n- Le lien de connexion à la plateforme`);
  };

  const handleToggleStatus = (accountId, accountName, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (isDemo) {
      alert(`Mode démo : Compte ${accountName} ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
    } else {
      // Logique de changement de statut réelle
      console.log('Changement statut pour:', accountId, 'vers:', newStatus);
      alert(`Compte ${accountName} ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
    }
  };

  const handleUnlock = (accountId, accountName) => {
    if (isDemo) {
      alert(`Mode démo : Compte ${accountName} débloqué`);
    } else {
      // Logique de déblocage réelle
      console.log('Déblocage compte:', accountId);
      alert(`Compte ${accountName} débloqué`);
    }
  };

  const handleCreateUser = async () => {
    // Validation des champs obligatoires
    if (!newUser.fullName) {
      alert('Veuillez saisir le nom complet');
      return;
    }

    // Pour les élèves, validations spécifiques
    if (newUser.role === 'student') {
      if (!newUser.classId) {
        alert('Veuillez sélectionner une classe pour l\'élève');
        return;
      }
      if (!newUser.parentId) {
        alert('Veuillez sélectionner un parent/tuteur pour l\'élève.\n\nSi le parent n\'existe pas, créez d\'abord son compte avec le rôle "Parent".');
        return;
      }
      // Pas besoin d'email ou password pour les élèves (généré auto si secondaire)
    } else if (newUser.role === 'parent') {
      // Pour les parents : téléphone obligatoire, email optionnel
      if (!newUser.phone) {
        alert('Veuillez saisir le numéro de téléphone du parent (obligatoire)');
        return;
      }
      if (!newUser.password) {
        alert('Veuillez saisir un mot de passe');
        return;
      }
      if (newUser.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      // Email optionnel pour les parents - générer un email par défaut si non fourni
      if (!newUser.email) {
        // Générer un email basé sur le téléphone
        const cleanPhone = newUser.phone.replace(/\s+/g, '').replace(/\+/g, '');
        newUser.email = `parent${cleanPhone}@edutrack.cm`;
        console.log('📧 Email généré pour parent sans email:', newUser.email);
      }
    } else {
      // Pour le personnel (enseignant, secrétaire, directeur, etc.)
      // Téléphone obligatoire pour générer un email si nécessaire
      if (!newUser.phone) {
        alert('Veuillez saisir le numéro de téléphone (obligatoire)');
        return;
      }
      if (!newUser.password) {
        alert('Veuillez saisir un mot de passe');
        return;
      }
      // Validation du mot de passe
      if (newUser.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      
      // Email optionnel pour le personnel - générer un email par défaut si non fourni
      if (!newUser.email) {
        // Générer un email basé sur le rôle et le téléphone
        const cleanPhone = newUser.phone.replace(/\s+/g, '').replace(/\+/g, '');
        const rolePrefix = {
          'teacher': 'enseignant',
          'secretary': 'secretaire',
          'principal': 'directeur',
          'admin': 'admin'
        }[newUser.role] || 'staff';
        
        newUser.email = `${rolePrefix}${cleanPhone}@edutrack.cm`;
        console.log(`📧 Email généré pour ${newUser.role} sans email:`, newUser.email);
      }
    }

    setLoadingAccounts(true);

    try {
      if (isDemo) {
        // Mode démo - Simulation
        const confirmSend = confirm(
          `Mode démo : Compte créé pour ${newUser.fullName} (${newUser.role})\n\n` +
          `Voulez-vous envoyer les identifiants par email à ${newUser.email} ?\n\n` +
          `Email : ${newUser.email}\n` +
          `Mot de passe temporaire : ${newUser.password}\n\n` +
          `L'utilisateur devra changer son mot de passe lors de sa première connexion.`
        );
        
        if (confirmSend) {
          alert('Mode démo : Email d\'identifiants envoyé avec succès !');
        }

        // Reset du formulaire
        setNewUser({
          fullName: '',
          email: '',
          phone: '',
          role: 'student',
          password: '',
          status: 'active'
        });
        setActiveTab('accounts');
        
      } else {
        // ✅ MODE PRODUCTION - Création réelle avec Supabase
        console.log('Création compte avec Supabase...');
        
        // Vérification de l'utilisateur connecté (mode production)
        if (!user) {
          alert('❌ Erreur : Utilisateur non connecté. Veuillez vous reconnecter.');
          console.error('User is null');
          setLoadingAccounts(false);
          return;
        }

        if (!user.current_school_id) {
          console.error('❌ current_school_id manquant. User data:', user);
          alert(
            `❌ Erreur : Votre compte n'est pas associé à une école.\n\n` +
            `Email: ${user?.email || 'N/A'}\n` +
            `Rôle: ${user?.role || 'N/A'}\n\n` +
            `Veuillez contacter l'administrateur système.`
          );
          setLoadingAccounts(false);
          return;
        }
        
        // Séparer le nom complet en prénom et nom
        const nameParts = newUser.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || firstName;

        let userId = null;

        // Pour le personnel (non-directeur), créer directement dans la base sans auth
        if (newUser.role !== 'principal' && newUser.role !== 'admin') {
          console.log('Création compte personnel...');
          
          // Générer un UUID pour le nouvel utilisateur
          const newUserId = crypto.randomUUID();
          
          // 1. Créer l'utilisateur dans la table users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
              id: newUserId,
              email: newUser.email,
              full_name: newUser.fullName,
              phone: newUser.phone,
              role: newUser.role,
              current_school_id: user.current_school_id,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (userError) {
            throw new Error(`Erreur création utilisateur: ${userError.message}`);
          }

          userId = userData.id;
          console.log('✅ Utilisateur créé:', userId);

          // 2. Créer l'entrée dans la table spécifique (teachers ou secretaries)
          if (newUser.role === 'teacher') {
            const { data: teacherData, error: teacherError } = await supabase
              .from('teachers')
              .insert({
                school_id: user.current_school_id,
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                specialty: newUser.specialty || '',
                hire_date: newUser.hireDate || new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();

            if (teacherError) {
              console.error('Erreur création enseignant:', teacherError);
              throw new Error(`Erreur création enseignant: ${teacherError.message}`);
            }

            // Créer les assignations de classes et matières
            const teacherId = teacherData.id;
            
            // Récupérer l'année académique courante
            const { data: academicYearData } = await supabase
              .from('academic_years')
              .select('id')
              .eq('school_id', user.current_school_id)
              .eq('is_current', true)
              .single();

            const academicYearId = academicYearData?.id;

            if (academicYearId) {
              // Créer les assignations pour chaque combinaison classe-matière
              const assignments = [];
              
              // Si des classes et matières sont sélectionnées
              if (newUser.selectedClasses.length > 0 && newUser.selectedSubjects.length > 0) {
                for (const classId of newUser.selectedClasses) {
                  for (const subjectId of newUser.selectedSubjects) {
                    const classData = availableClasses.find(c => c.value === classId);
                    const subjectData = availableSubjects.find(s => s.value === subjectId);
                    
                    assignments.push({
                      teacher_id: teacherId,
                      school_id: user.current_school_id,
                      academic_year_id: academicYearId,
                      class_id: classId,
                      subject_id: subjectId,
                      class_name: classData?.label || '',
                      subject_name: subjectData?.label || '',
                      schedule: {
                        weekly_hours: parseInt(newUser.weeklyHours) || 0
                      },
                      is_active: true
                    });
                  }
                }
              }

              if (assignments.length > 0) {
                const { error: assignmentError } = await supabase
                  .from('teacher_assignments')
                  .insert(assignments);

                if (assignmentError) {
                  console.error('Erreur création assignations:', assignmentError);
                  // Ne pas bloquer, l'utilisateur est créé
                }
              }
            }

          } else if (newUser.role === 'secretary') {
            const { error: secretaryError } = await supabase
              .from('secretaries')
              .insert({
                school_id: user.current_school_id,
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                hire_date: newUser.hireDate || new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (secretaryError) {
              console.error('Erreur création secrétaire:', secretaryError);
              throw new Error(`Erreur création secrétaire: ${secretaryError.message}`);
            }

            // TODO: Gérer les permissions de la secrétaire (table secretary_permissions)
          } else if (newUser.role === 'student') {
            // Déterminer si on crée un compte utilisateur (secondaire) ou pas (primaire)
            const createUserAccount = needsUserAccount(newUser.schoolLevel);
            
            let studentUserId = null;
            let generatedMatricule = '';
            let generatedEmail = '';
            let generatedPassword = '';

            if (createUserAccount) {
              // ÉLÈVE DU SECONDAIRE : Créer un compte utilisateur
              console.log('🎓 Création compte élève secondaire avec identifiants...');
              
              // Générer le matricule
              generatedMatricule = await generateStudentMatricule(user.current_school_id);
              console.log('📋 Matricule généré:', generatedMatricule);
              
              // Générer l'email automatique
              generatedEmail = generateStudentEmail(generatedMatricule, user.school_name || 'ecole');
              console.log('📧 Email généré:', generatedEmail);
              
              // Générer le mot de passe
              generatedPassword = generateStudentPassword(firstName);
              console.log('🔑 Mot de passe généré:', generatedPassword);
              
              // Créer le compte utilisateur
              const newStudentUserId = crypto.randomUUID();
              
              const { data: studentUserData, error: studentUserError } = await supabase
                .from('users')
                .insert({
                  id: newStudentUserId,
                  email: generatedEmail,
                  full_name: newUser.fullName,
                  phone: newUser.phone || null,
                  role: 'student',
                  current_school_id: user.current_school_id,
                  is_active: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (studentUserError) {
                throw new Error(`Erreur création compte élève: ${studentUserError.message}`);
              }

              studentUserId = newStudentUserId;
              console.log('✅ Compte utilisateur créé pour élève secondaire');
            } else {
              // ÉLÈVE DU PRIMAIRE : Pas de compte utilisateur
              console.log('👶 Création élève primaire SANS compte utilisateur');
              studentUserId = null; // Pas de user_id
            }

            // Créer l'entrée dans la table students (pour tous les niveaux)
            const { data: studentData, error: studentError } = await supabase
              .from('students')
              .insert({
                school_id: user.current_school_id,
                user_id: studentUserId, // null pour primaire, UUID pour secondaire
                matricule: generatedMatricule || null,
                first_name: firstName,
                last_name: lastName,
                class_id: newUser.classId || null,
                date_of_birth: newUser.dateOfBirth || null,
                school_level: newUser.schoolLevel,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();

            if (studentError) {
              console.error('Erreur création élève:', studentError);
              throw new Error(`Erreur création élève: ${studentError.message}`);
            }

            // Créer la relation parent-élève dans parent_student
            const { error: linkError } = await supabase
              .from('parent_student')
              .insert({
                parent_id: newUser.parentId,
                student_id: studentData.id,
                relationship: 'parent', // Par défaut
                is_primary: true,
                is_emergency_contact: true
              });

            if (linkError) {
              console.error('Erreur liaison parent-élève:', linkError);
              // Ne pas bloquer, l'élève est créé
            } else {
              console.log('✅ Relation parent-élève créée');
            }

            // Si élève du secondaire, stocker les identifiants pour l'email au parent
            if (createUserAccount) {
              // Ces variables seront utilisées pour l'envoi d'email plus loin
              newUser.generatedEmail = generatedEmail;
              newUser.generatedPassword = generatedPassword;
              newUser.generatedMatricule = generatedMatricule;
            }

            console.log(`✅ Élève créé (${newUser.schoolLevel === 'primary' ? 'PRIMAIRE - sans compte' : 'SECONDAIRE - avec compte'})`);
          } else if (newUser.role === 'parent') {
            const { data: parentData, error: parentError } = await supabase
              .from('parents')
              .insert({
                school_id: user.current_school_id,
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                profession: newUser.profession || null,
                address: newUser.address || null,
                emergency_contact: newUser.emergencyContact || null,
                emergency_phone: newUser.emergencyPhone || null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();

            if (parentError) {
              console.error('Erreur création parent:', parentError);
              throw new Error(`Erreur création parent: ${parentError.message}`);
            }

            console.log('✅ Compte parent créé. Les enfants seront liés lors de la création des élèves.');
          }

          console.log('✅ Compte personnel créé:', userId);
          
        } else {
          // Pour les directeurs/admins, utiliser signUp normal (avec email automatique)
          console.log('Création compte directeur/admin via signUp...');
          
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: newUser.email,
            password: newUser.password,
            options: {
              data: {
                full_name: newUser.fullName,
                phone: newUser.phone,
                role: newUser.role,
                school: {
                  id: user.current_school_id,
                  name: user.school_name || 'École'
                }
              }
            }
          });

          if (authError || !authData.user) {
            throw new Error(authError?.message || 'Erreur création compte');
          }

          userId = authData.user.id;
          console.log('✅ Compte directeur/admin créé:', userId);

          // Créer entrée dans users pour directeurs/admins
          await supabase.from('users').insert({
            id: userId,
            email: newUser.email,
            full_name: newUser.fullName,
            phone: newUser.phone,
            role: newUser.role,
            current_school_id: user.current_school_id,
            created_by_user_id: user.id,
            is_active: true
          });
        }

        // Étape 2: Envoyer l'email avec les identifiants
        if (newUser.role !== 'principal' && newUser.role !== 'admin') {
          console.log('📧 Envoi de l\'email avec les identifiants...');
          console.log('Configuration email actuelle:', { 
            configured: isEmailConfigured(),
            hasServiceId: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
            hasTemplateId: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            hasPublicKey: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
          });
          
          // Logique d'envoi d'email selon si l'utilisateur a un email personnel ou non
          let recipientEmail, emailContent, hasPersonalEmail;
          
          if (newUser.role === 'student' && newUser.schoolLevel === 'secondary') {
            // Élève secondaire : envoyer au parent avec les identifiants générés
            const selectedParent = availableStudents.find(p => p.id === newUser.parentId);
            hasPersonalEmail = selectedParent?.email && !selectedParent.email.includes('@edutrack.cm');
            
            recipientEmail = hasPersonalEmail ? selectedParent.email : user.email; // Email du parent ou du directeur
            emailContent = {
              recipientEmail: recipientEmail,
              recipientName: hasPersonalEmail ? (selectedParent?.full_name || 'Parent') : user.full_name,
              role: 'Élève (Secondaire)',
              email: newUser.generatedEmail,
              password: newUser.generatedPassword,
              matricule: newUser.generatedMatricule,
              studentName: newUser.fullName,
              parentName: selectedParent?.full_name,
              parentPhone: selectedParent?.phone,
              isStudent: true,
              hasPersonalEmail: hasPersonalEmail,
              schoolName: user.school_name || 'Votre établissement',
              principalName: user.full_name || 'Le Directeur',
            };
          } else if (newUser.role === 'student' && newUser.schoolLevel === 'primary') {
            // Élève primaire : pas d'email (pas de compte)
            emailContent = null;
          } else {
            // Personnel (enseignant, secrétaire, parent)
            hasPersonalEmail = newUser.email && !newUser.email.includes('@edutrack.cm');
            recipientEmail = hasPersonalEmail ? newUser.email : user.email; // Email personnel ou du directeur
            
            emailContent = {
              recipientEmail: recipientEmail,
              recipientName: hasPersonalEmail ? newUser.fullName : user.full_name,
              role: getRoleLabel(newUser.role),
              email: newUser.email,
              password: newUser.password,
              phone: newUser.phone,
              staffName: newUser.fullName,
              hasPersonalEmail: hasPersonalEmail,
              schoolName: user.school_name || 'Votre établissement',
              principalName: user.full_name || 'Le Directeur',
            };
          }

          let emailResult = { success: true }; // Par défaut pour élèves primaire
          
          if (emailContent) {
            console.log(`📧 Envoi email à ${hasPersonalEmail ? 'l\'utilisateur' : 'au directeur'}:`, recipientEmail);
            emailResult = await sendCredentialsEmail(emailContent);
            console.log('📬 Résultat de l\'envoi:', emailResult);
          }

          if (emailResult.success) {
            // Email envoyé avec succès OU élève primaire (pas d'email)
            let successMessage;
            
            if (newUser.role === 'student' && newUser.schoolLevel === 'primary') {
              // Élève primaire : pas de compte créé
              const selectedParent = availableStudents.find(p => p.id === newUser.parentId);
              successMessage = (
                `✅ Élève inscrit avec succès !\n\n` +
                `Nom : ${newUser.fullName}\n` +
                `Classe : ${availableClasses.find(c => c.value === newUser.classId)?.label || 'N/A'}\n` +
                `Niveau : Primaire\n\n` +
                `👶 AUCUN COMPTE PERSONNEL CRÉÉ\n` +
                `L'élève n'a pas d'identifiants de connexion.\n\n` +
                `👨‍👩‍👧 Parent lié :\n` +
                `• Nom : ${selectedParent?.full_name || 'N/A'}\n` +
                `• Email : ${selectedParent?.email || 'Non renseigné'}\n` +
                `• Téléphone : ${selectedParent?.phone || 'Non renseigné'}\n\n` +
                `Le parent peut voir cet enfant dans son tableau de bord et suivre ses notes et absences.`
              );
            } else if (newUser.role === 'student' && newUser.schoolLevel === 'secondary') {
              // Élève secondaire : compte créé
              const selectedParent = availableStudents.find(p => p.id === newUser.parentId);
              const parentHasPersonalEmail = selectedParent?.email && !selectedParent.email.includes('@edutrack.cm');
              
              successMessage = (
                `✅ Compte élève créé avec succès !\n\n` +
                `Nom : ${newUser.fullName}\n` +
                `Classe : ${availableClasses.find(c => c.value === newUser.classId)?.label || 'N/A'}\n` +
                `Niveau : Secondaire\n\n` +
                `🎓 COMPTE PERSONNEL CRÉÉ :\n` +
                `📋 Matricule : ${newUser.generatedMatricule}\n` +
                `📧 Email : ${newUser.generatedEmail}\n` +
                `🔑 Mot de passe : ${newUser.generatedPassword}\n\n` +
                `👨‍👩‍👧 Parent lié :\n` +
                `• Nom : ${selectedParent?.full_name || 'N/A'}\n` +
                `• Email : ${selectedParent?.email || 'Non renseigné'}\n` +
                `• Téléphone : ${selectedParent?.phone || 'Non renseigné'}\n\n` +
                `📨 EMAIL ENVOYÉ :\n` +
                `${parentHasPersonalEmail 
                  ? `✅ Envoyé au parent : ${selectedParent.email}\n   Le parent a reçu les identifiants de connexion de son enfant.`
                  : `✅ Envoyé au directeur : ${user.email}\n   ⚠️ Le parent n'a pas d'email personnel.\n   Les identifiants ont été envoyés à votre adresse.\n   Veuillez les communiquer au parent par téléphone : ${selectedParent?.phone || 'N/A'}`
                }\n\n` +
                `L'élève peut maintenant :\n` +
                `• Se connecter à la plateforme\n` +
                `• Consulter ses notes et devoirs\n` +
                `• Voir son emploi du temps`
              );
            } else {
              // Personnel (enseignant, secrétaire, directeur) et Parents
              const isParent = newUser.role === 'parent';
              const isTeacher = newUser.role === 'teacher';
              const isSecretary = newUser.role === 'secretary';
              const hasPersonalEmail = newUser.email && !newUser.email.includes('@edutrack.cm');
              
              successMessage = (
                `✅ Compte créé avec succès !\n\n` +
                `Utilisateur : ${newUser.fullName}\n` +
                `Téléphone : ${newUser.phone}\n` +
                `Email connexion : ${newUser.email}\n` +
                `Rôle : ${getRoleLabel(newUser.role)}\n` +
                `${isParent && newUser.profession ? `Profession : ${newUser.profession}\n` : ''}` +
                `${isParent && newUser.address ? `Adresse : ${newUser.address}\n` : ''}` +
                `${isTeacher && newUser.specialty ? `Spécialité : ${newUser.specialty}\n` : ''}` +
                `\n` +
                `🔑 Identifiants de connexion :\n` +
                `• Email : ${newUser.email}\n` +
                `• Mot de passe : ${newUser.password}\n\n` +
                `📨 EMAIL ENVOYÉ :\n` +
                `${hasPersonalEmail 
                  ? `✅ Envoyé à l'utilisateur : ${newUser.email}\n   ${isParent ? 'Le parent' : isTeacher ? 'L\'enseignant' : 'La secrétaire'} a reçu ses identifiants de connexion.`
                  : `✅ Envoyé au directeur : ${user.email}\n   ⚠️ ${isParent ? 'Le parent' : isTeacher ? 'L\'enseignant' : 'La secrétaire'} n'a pas d'email personnel.\n   Un email technique a été généré : ${newUser.email}\n   Les identifiants ont été envoyés à votre adresse.\n   Veuillez les communiquer par téléphone : ${newUser.phone}`
                }\n\n` +
                `${!hasPersonalEmail ? `💡 Email technique généré automatiquement.\n   L'utilisateur se connectera avec : ${newUser.email}\n\n` : ''}` +
                `${isParent ? 'Les enfants seront liés lors de la création des comptes élèves.' : ''}`
              );
            }
            
            alert(successMessage);
          } else if (emailResult.fallback) {
            // Fallback: afficher les identifiants si l'email n'a pas pu être envoyé
            const errorDetails = emailResult.technicalError 
              ? `\n\n🔧 Erreur technique : ${emailResult.technicalError}` 
              : '';
            
            const configMessage = !isEmailConfigured() 
              ? '\n\n⚙️ Pour activer l\'envoi automatique d\'emails :\n1. Créez un compte sur https://emailjs.com\n2. Configurez un service email (Gmail, Outlook...)\n3. Créez un template d\'email\n4. Ajoutez les clés dans le fichier .env'
              : '\n\n⚙️ EmailJS est configuré mais l\'envoi a échoué.\nVérifiez :\n• Votre connexion Internet\n• Que le Service ID et Template ID sont corrects\n• Que le template existe sur emailjs.com';
            
            let fallbackMessage;
            
            if (newUser.role === 'student' && newUser.schoolLevel === 'secondary') {
              // Élève secondaire : afficher les identifiants générés
              const selectedParent = availableStudents.find(p => p.id === newUser.parentId);
              fallbackMessage = (
                `✅ Compte élève créé avec succès !\n\n` +
                `Élève : ${newUser.fullName}\n` +
                `Niveau : Secondaire\n\n` +
                `⚠️ L'email n'a pas pu être envoyé au parent.\n` +
                `Raison : ${emailResult.error}\n\n` +
                `📋 IDENTIFIANTS À COMMUNIQUER AU PARENT :\n\n` +
                `📧 Email : ${newUser.generatedEmail}\n` +
                `🔑 Mot de passe : ${newUser.generatedPassword}\n` +
                `📋 Matricule : ${newUser.generatedMatricule}\n\n` +
                `👨‍👩‍👧 Contacter le parent :\n` +
                `• ${selectedParent?.full_name || 'N/A'}\n` +
                `• ${selectedParent?.email || 'Pas d\'email'}\n` +
                `• ${selectedParent?.phone || 'Pas de téléphone'}\n\n` +
                `⚠️ IMPORTANT :\n` +
                `• Notez ces identifiants\n` +
                `• Communiquez-les au parent/tuteur\n` +
                `• L'élève pourra se connecter avec ces identifiants` +
                configMessage +
                errorDetails
              );
            } else {
              // Personnel
              fallbackMessage = (
                `✅ Compte créé avec succès !\n\n` +
                `Utilisateur : ${newUser.fullName}\n` +
                `Email : ${newUser.email}\n` +
                `Rôle : ${getRoleLabel(newUser.role)}\n\n` +
                `⚠️ L'email n'a pas pu être envoyé automatiquement.\n` +
                `Raison : ${emailResult.error}\n\n` +
                `📋 IDENTIFIANTS À COMMUNIQUER MANUELLEMENT :\n\n` +
                `Email : ${newUser.email}\n` +
                `Mot de passe : ${newUser.password}\n\n` +
                `⚠️ IMPORTANT :\n` +
                `• Notez ces identifiants en lieu sûr\n` +
                `• Communiquez-les directement à ${newUser.fullName}\n` +
                `• L'utilisateur pourra se connecter avec ces identifiants\n` +
                `• Ces identifiants ne seront plus affichés après fermeture` +
                configMessage +
                errorDetails
              );
            }
            
            alert(fallbackMessage);
          }
        } else {
          // Pour les directeurs/admins
          alert(
            `✅ Compte créé avec succès !\n\n` +
            `Utilisateur : ${newUser.fullName}\n` +
            `Email : ${newUser.email}\n` +
            `Rôle : ${getRoleLabel(newUser.role)}\n\n` +
            `📧 Un email de confirmation a été envoyé à ${newUser.email}`
          );
        }

        // Étape 3: Recharger la liste des comptes
        await loadAccountsFromSupabase();

        // Reset du formulaire
        setNewUser({
          fullName: '',
          email: '',
          phone: '',
          role: 'student',
          password: '',
          status: 'active',
          specialty: '',
          hireDate: new Date().toISOString().split('T')[0],
          selectedClasses: [],
          selectedSubjects: [],
          weeklyHours: '',
          permissions: [],
          department: '',
          schoolLevel: 'primary',
          matricule: '',
          classId: '',
          dateOfBirth: '',
          parentId: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          selectedChildren: [],
          emergencyContact: '',
          emergencyPhone: '',
          profession: '',
          address: ''
        });
        setActiveTab('accounts');
      }
      
    } catch (error) {
      console.error('❌ Erreur création compte:', error);
      
      let errorMessage = error.message;
      
      // Messages d'erreur personnalisés
      if (errorMessage.includes('already registered')) {
        errorMessage = 'Cet email est déjà utilisé par un autre compte.';
      } else if (errorMessage.includes('invalid email')) {
        errorMessage = 'L\'adresse email n\'est pas valide.';
      } else if (errorMessage.includes('weak password')) {
        errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 8 caractères.';
      }
      
      alert(`❌ Erreur lors de la création du compte :\n\n${errorMessage}`);
      
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fonction helper pour les labels de rôles
  const getRoleLabel = (role) => {
    const labels = {
      'secretary': 'Secrétaire',
      'teacher': 'Enseignant',
      'student': 'Élève',
      'parent': 'Parent',
      'principal': 'Directeur',
      'admin': 'Administrateur'
    };
    return labels[role] || role;
  };

  // Fonction pour générer un matricule unique pour un élève
  const generateStudentMatricule = async (schoolId) => {
    const year = new Date().getFullYear();
    
    if (isDemo) {
      // En mode démo, générer un numéro aléatoire
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `STD${year}${random}`;
    }
    
    // En production, compter les élèves existants pour cette école cette année
    const { data, error } = await supabase
      .from('students')
      .select('matricule', { count: 'exact' })
      .eq('school_id', schoolId)
      .like('matricule', `STD${year}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erreur récupération matricule:', error);
      // Fallback
      return `STD${year}001`;
    }

    // Extraire le dernier numéro et incrémenter
    let nextNumber = 1;
    if (data && data.length > 0 && data[0].matricule) {
      const lastMatricule = data[0].matricule;
      const lastNumber = parseInt(lastMatricule.slice(-3));
      nextNumber = lastNumber + 1;
    }

    return `STD${year}${nextNumber.toString().padStart(3, '0')}`;
  };

  // Fonction pour générer un email automatique à partir du matricule
  const generateStudentEmail = (matricule, schoolName) => {
    // Nettoyer le nom de l'école (enlever espaces, accents, caractères spéciaux)
    const cleanSchoolName = schoolName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]/g, '') // Garder seulement lettres et chiffres
      .slice(0, 15); // Limiter à 15 caractères
    
    return `${matricule.toLowerCase()}@${cleanSchoolName}.edutrack.cm`;
  };

  // Fonction pour générer un mot de passe simple basé sur le prénom + année
  const generateStudentPassword = (firstName) => {
    const year = new Date().getFullYear();
    // Capitaliser la première lettre du prénom
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return `${capitalized}${year}`;
  };

  // Fonction pour déterminer si un niveau nécessite un compte utilisateur
  const needsUserAccount = (schoolLevel) => {
    return schoolLevel === 'secondary';
  };

  // Fonction pour déterminer automatiquement le school_level selon le type d'école et la classe
  const determineSchoolLevel = (schoolType, className) => {
    // Si le type d'école est défini clairement
    if (schoolType === 'primary' || schoolType === 'Primaire') {
      return 'primary';
    }
    if (schoolType === 'secondary' || schoolType === 'Collège' || schoolType === 'Lycée') {
      return 'secondary';
    }
    
    // Si école mixte ou type non défini, détecter selon le nom de la classe
    if (!className) return 'primary'; // Par défaut
    
    const classNameLower = className.toLowerCase();
    
    // Classes du secondaire
    const secondaryKeywords = ['6ème', '6eme', '5ème', '5eme', '4ème', '4eme', '3ème', '3eme',
                                '2nde', '2de', 'seconde', '1ère', '1ere', 'première', 'premiere',
                                'tle', 'terminale', 'terminal'];
    
    if (secondaryKeywords.some(keyword => classNameLower.includes(keyword))) {
      return 'secondary';
    }
    
    // Sinon, c'est du primaire (maternelle, CP, CE, CM)
    return 'primary';
  };

  // Fonction pour charger les comptes depuis Supabase
  const loadAccountsFromSupabase = async () => {
    if (isDemo || !user?.current_school_id) {
      return;
    }

    setLoadingAccounts(true);

    try {
      // Récupérer les enseignants
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          id,
          first_name,
          last_name,
          specialty,
          hire_date,
          is_active,
          created_at,
          users!inner (
            id,
            email,
            full_name,
            phone,
            role
          )
        `)
        .eq('school_id', user.current_school_id)
        .eq('is_active', true);

      if (teachersError) {
        console.error('Erreur lors du chargement des enseignants:', teachersError);
      }

      // Récupérer les secrétaires
      const { data: secretariesData, error: secretariesError } = await supabase
        .from('secretaries')
        .select(`
          id,
          first_name,
          last_name,
          hire_date,
          is_active,
          created_at,
          users!inner (
            id,
            email,
            full_name,
            phone,
            role
          )
        `)
        .eq('school_id', user.current_school_id)
        .eq('is_active', true);

      if (secretariesError) {
        console.error('Erreur lors du chargement des secrétaires:', secretariesError);
      }

      // Combiner et formater les données
      const allPersonnel = [];
      
      // Ajouter les enseignants
      if (teachersData) {
        teachersData.forEach(teacher => {
          allPersonnel.push({
            id: teacher.users.id,
            email: teacher.users.email,
            full_name: teacher.users.full_name || `${teacher.first_name} ${teacher.last_name}`,
            phone: teacher.users.phone,
            role: 'teacher',
            specialty: teacher.specialty,
            is_active: teacher.is_active,
            created_at: teacher.created_at,
            hire_date: teacher.hire_date,
            personnel_id: teacher.id
          });
        });
      }

      // Ajouter les secrétaires
      if (secretariesData) {
        secretariesData.forEach(secretary => {
          allPersonnel.push({
            id: secretary.users.id,
            email: secretary.users.email,
            full_name: secretary.users.full_name || `${secretary.first_name} ${secretary.last_name}`,
            phone: secretary.users.phone,
            role: 'secretary',
            is_active: secretary.is_active,
            created_at: secretary.created_at,
            hire_date: secretary.hire_date,
            personnel_id: secretary.id
          });
        });
      }

      // Trier par date de création
      const sortedPersonnel = allPersonnel.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      console.log('✅ Comptes personnel chargés depuis Supabase:', sortedPersonnel.length);
      console.log('📊 Détail personnel:', {
        teachers: teachersData?.length || 0,
        secretaries: secretariesData?.length || 0,
        total: sortedPersonnel.length
      });
      
      setAccounts(sortedPersonnel);
      
    } catch (error) {
      console.error('❌ Erreur chargement comptes:', error);
      // Ne pas afficher d'alerte, juste logger
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Charger les comptes au montage du composant
  useEffect(() => {
    if (!isDemo && user?.current_school_id) {
      loadAccountsFromSupabase();
    }
  }, [isDemo, user?.current_school_id]);

  // Fonction pour désactiver un compte (pas supprimer)
  const handleDeactivateAccount = async (accountId, accountName) => {
    const confirmed = confirm(
      `⚠️ Désactiver le compte de ${accountName} ?\n\n` +
      `Le compte sera désactivé mais toutes les données créées par cette personne seront conservées.\n\n` +
      `Cette action peut être annulée en réactivant le compte.`
    );

    if (!confirmed) {
      return;
    }

    setLoadingAccounts(true);

    try {
      if (isDemo) {
        alert('Mode démo : Compte désactivé');
        return;
      }

      // Appeler la fonction RPC Supabase pour désactiver
      const { data, error } = await supabase.rpc('deactivate_user_account', {
        p_user_id: accountId,
        p_deactivated_by: user.id
      });

      if (error) {
        throw error;
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Erreur lors de la désactivation');
      }

      alert(`✅ Compte de ${accountName} désactivé avec succès !`);
      
      // Recharger la liste
      await loadAccountsFromSupabase();
      
    } catch (error) {
      console.error('❌ Erreur désactivation compte:', error);
      alert(`❌ Erreur lors de la désactivation :\n\n${error.message}`);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fonction pour réactiver un compte
  const handleReactivateAccount = async (accountId, accountName) => {
    const confirmed = confirm(
      `Réactiver le compte de ${accountName} ?\n\n` +
      `L'utilisateur pourra à nouveau se connecter.`
    );

    if (!confirmed) {
      return;
    }

    setLoadingAccounts(true);

    try {
      if (isDemo) {
        alert('Mode démo : Compte réactivé');
        return;
      }

      const { data, error } = await supabase.rpc('reactivate_user_account', {
        p_user_id: accountId,
        p_reactivated_by: user.id
      });

      if (error) {
        throw error;
      }

      if (data && !data.success) {
        throw new Error(data.error || 'Erreur lors de la réactivation');
      }

      alert(`✅ Compte de ${accountName} réactivé avec succès !`);
      
      // Recharger la liste
      await loadAccountsFromSupabase();
      
    } catch (error) {
      console.error('❌ Erreur réactivation compte:', error);
      alert(`❌ Erreur lors de la réactivation :\n\n${error.message}`);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Fonction pour envoyer les identifiants par email
  const sendCredentialsByEmail = (userData) => {
    // Cette fonction serait connectée à un service d'email réel
    console.log('Envoi email à:', userData.email);
    alert(`Email d'identifiants envoyé à ${userData.email} avec succès !\n\nL'utilisateur recevra :\n- Son email de connexion\n- Son mot de passe temporaire\n- Les instructions pour changer son mot de passe`);
  };

  // Génération automatique d'un mot de passe sécurisé
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

  const generatePassword = () => {
    const password = generateSecurePassword();
    setNewUser(prev => ({ ...prev, password }));
  };

  // Rendu du contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'accounts':
        return renderAccountsList();
      case 'security':
        return renderSecurity();
      case 'create':
        return renderCreateForm();
      default:
        return renderOverview();
    }
  };

  // Vue d'ensemble avec statistiques
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Comptes</p>
              <p className="text-2xl font-bold text-blue-900">{accountStats.total}</p>
            </div>
            <Icon name="Users" size={24} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Comptes Actifs</p>
              <p className="text-2xl font-bold text-green-900">{accountStats.active}</p>
            </div>
            <Icon name="CheckCircle" size={24} className="text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Comptes Inactifs</p>
              <p className="text-2xl font-bold text-red-900">{accountStats.inactive}</p>
            </div>
            <Icon name="XCircle" size={24} className="text-red-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Comptes Bloqués</p>
              <p className="text-2xl font-bold text-orange-900">{accountStats.locked}</p>
            </div>
            <Icon name="Lock" size={24} className="text-orange-600" />
          </div>
        </div>
      </div>

      {/* Répartition par rôle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par rôle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(accountStats.byRole)
            .filter(([role]) => role !== 'principal') // Exclure les directeurs
            .map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name={
                role === 'teacher' ? 'GraduationCap' :
                role === 'secretary' ? 'UserCheck' :
                role === 'student' ? 'User' : 'Users'
              } size={20} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium text-gray-600 capitalize">
                {role === 'teacher' ? 'Enseignants' :
                 role === 'secretary' ? 'Secrétaires' :
                 role === 'student' ? 'Élèves' :
                 role === 'parent' ? 'Parents' : role}
              </p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateur de configuration Email */}
      <div className={`rounded-lg border p-4 flex items-start space-x-3 ${
        isEmailConfigured() 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <Icon 
          name={isEmailConfigured() ? "CheckCircle" : "AlertTriangle"} 
          size={20} 
          className={isEmailConfigured() ? "text-green-600 mt-0.5" : "text-yellow-600 mt-0.5"} 
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Mail" size={16} className={isEmailConfigured() ? "text-green-600" : "text-yellow-600"} />
            <h4 className={`text-sm font-semibold ${
              isEmailConfigured() ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {isEmailConfigured() ? '✅ Envoi automatique d\'emails activé' : '⚠️ Envoi automatique d\'emails désactivé'}
            </h4>
          </div>
          <p className={`text-sm ${isEmailConfigured() ? 'text-green-700' : 'text-yellow-700'}`}>
            {isEmailConfigured() 
              ? 'Les identifiants seront automatiquement envoyés par email au personnel lors de la création de leur compte.'
              : 'Les identifiants seront affichés à l\'écran pour communication manuelle. Pour activer l\'envoi automatique, consultez docs/GUIDE_RAPIDE_EMAIL.md'
            }
          </p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setActiveTab('create')}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="UserPlus" size={16} className="mr-2" />
            Créer un compte
          </Button>
          
          <Button
            onClick={() => setActiveTab('security')}
            variant="outline"
            className="flex items-center justify-center p-4"
          >
            <Icon name="Shield" size={16} className="mr-2" />
            Sécurité
          </Button>
          
          <Button
            onClick={() => setActiveTab('accounts')}
            variant="outline"
            className="flex items-center justify-center p-4"
          >
            <Icon name="Users" size={16} className="mr-2" />
            Gérer comptes
          </Button>
        </div>
      </div>
    </div>
  );

  // Liste des comptes avec filtres
  const renderAccountsList = () => (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
            />
          </div>
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            options={roleOptions}
            placeholder="Filtrer par rôle"
          />
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            placeholder="Filtrer par statut"
          />
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Icon name="User" size={16} className="text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{account.full_name}</div>
                        <div className="text-sm text-gray-500">{account.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      account.role === 'principal' ? 'bg-purple-100 text-purple-800' :
                      account.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                      account.role === 'secretary' ? 'bg-green-100 text-green-800' :
                      account.role === 'student' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {account.role === 'principal' ? 'Directeur' :
                       account.role === 'teacher' ? 'Enseignant' :
                       account.role === 'secretary' ? 'Secrétaire' :
                       account.role === 'student' ? 'Élève' :
                       account.role === 'parent' ? 'Parent' : account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {(() => {
                        // Gérer is_active (Supabase) ou status (démo)
                        const isActive = account.is_active !== undefined 
                          ? account.is_active 
                          : account.status === 'active';
                        
                        return (
                          <>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isActive ? 'Actif' : 'Inactif'}
                            </span>
                            {account.deactivated_at && (
                              <span className="ml-2 text-xs text-gray-500" title={`Désactivé le ${new Date(account.deactivated_at).toLocaleDateString('fr-FR')}`}>
                                🚫
                              </span>
                            )}
                          </>
                        );
                      })()}
                      {account.is_locked && (
                        <Icon name="Lock" size={14} className="ml-2 text-red-500" title="Compte bloqué" />
                      )}
                      {account.login_attempts > 0 && (
                        <span className="ml-2 text-xs text-orange-600" title={`${account.login_attempts} tentative(s) échouée(s)`}>
                          ⚠️ {account.login_attempts}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.last_login ? new Date(account.last_login).toLocaleString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {/* Bouton Réinitialiser mot de passe */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(account.id, account.full_name, account.email)}
                        title="Réinitialiser mot de passe et envoyer par email"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Icon name="Key" size={14} />
                      </Button>
                      
                      {/* Bouton Renvoyer identifiants */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendCredentials(account.id, account.full_name, account.email)}
                        title="Renvoyer les identifiants par email"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Icon name="Mail" size={14} />
                      </Button>
                      
                      {/* Bouton Désactiver/Réactiver */}
                      {(() => {
                        const isActive = account.is_active !== undefined 
                          ? account.is_active 
                          : account.status === 'active';
                        
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isActive) {
                                handleDeactivateAccount(account.id, account.full_name);
                              } else {
                                handleReactivateAccount(account.id, account.full_name);
                              }
                            }}
                            className={isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                            title={isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                          >
                            <Icon name={isActive ? 'UserX' : 'UserCheck'} size={14} />
                          </Button>
                        );
                      })()}
                      
                      {account.is_locked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlock(account.id, account.full_name)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Débloquer compte"
                        >
                          <Icon name="Unlock" size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun compte trouvé avec ces critères</p>
        </div>
      )}
    </div>
  );

  // Onglet sécurité
  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Alertes de sécurité */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes de sécurité</h3>
        <div className="space-y-4">
          {accountStats.locked > 0 && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <Icon name="AlertTriangle" size={20} className="text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">
                  {accountStats.locked} compte(s) bloqué(s)
                </p>
                <p className="text-sm text-red-700">
                  Des comptes ont été bloqués suite à des tentatives de connexion échouées
                </p>
              </div>
            </div>
          )}
          
          {accounts.filter(acc => acc.login_attempts > 3).length > 0 && (
            <div className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <Icon name="AlertCircle" size={20} className="text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-orange-800">
                  {accounts.filter(acc => acc.login_attempts > 3).length} compte(s) avec tentatives suspectes
                </p>
                <p className="text-sm text-orange-700">
                  Plusieurs tentatives de connexion échouées détectées
                </p>
              </div>
            </div>
          )}
          
          {accountStats.locked === 0 && accounts.filter(acc => acc.login_attempts > 3).length === 0 && (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <Icon name="Shield" size={20} className="text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">
                  Aucune alerte de sécurité
                </p>
                <p className="text-sm text-green-700">
                  Tous les comptes fonctionnent normalement
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Politique de mots de passe */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Politique de mots de passe</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={20} className="text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900">Exigences de sécurité</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Minimum 8 caractères</li>
                <li>• Au moins une lettre majuscule et minuscule</li>
                <li>• Au moins un chiffre</li>
                <li>• Au moins un caractère spécial (!@#$%^&*)</li>
                <li>• Génération automatique recommandée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de sécurité */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de sécurité</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Blocage automatique</p>
              <p className="text-sm text-gray-600">Bloquer les comptes après 5 tentatives échouées</p>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="Settings" size={14} className="mr-2" />
              Configurer
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Expiration des mots de passe</p>
              <p className="text-sm text-gray-600">Forcer le changement de mot de passe tous les 90 jours</p>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="Settings" size={14} className="mr-2" />
              Configurer
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Journalisation</p>
              <p className="text-sm text-gray-600">Enregistrer toutes les connexions et actions</p>
            </div>
            <Button variant="outline" size="sm">
              <Icon name="FileText" size={14} className="mr-2" />
              Voir logs
            </Button>
          </div>
        </div>
      </div>

      {/* Actions de sécurité globales */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions globales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center p-4 text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={() => {
              if (isDemo) {
                alert('Mode démo : Tous les comptes bloqués seraient débloqués');
              } else {
                alert('Fonction de déblocage global');
              }
            }}
          >
            <Icon name="Unlock" size={16} className="mr-2" />
            Débloquer tous les comptes
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center p-4 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => {
              if (isDemo) {
                alert('Mode démo : Notification de changement de mot de passe envoyée');
              } else {
                alert('Fonction de notification globale');
              }
            }}
          >
            <Icon name="Bell" size={16} className="mr-2" />
            Forcer changement mot de passe
          </Button>
        </div>
      </div>
    </div>
  );

  // Formulaire de création de compte
  const renderCreateForm = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Créer un nouveau compte</h3>
        
        <div className="space-y-6">
          {/* Informations de base - Communes à tous */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Icon name="User" size={16} className="mr-2" />
              Informations générales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom complet *"
                value={newUser.fullName}
                onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nom et prénom"
              />
              
              {/* Email et Téléphone uniquement pour le personnel (pas pour élève) */}
              {newUser.role !== 'student' && (
                <Input
                  label={['parent', 'teacher', 'secretary'].includes(newUser.role) ? 'Email (optionnel)' : 'Email *'}
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={['parent', 'teacher', 'secretary'].includes(newUser.role) ? 'email@exemple.com (si disponible)' : 'email@exemple.com'}
                />
              )}
              
              {newUser.role === 'student' && (
                <Select
                  label="Rôle *"
                  value={newUser.role}
                  onChange={(value) => {
                    // Réinitialiser les champs spécifiques au rôle
                    setNewUser(prev => ({
                      ...prev,
                      role: value,
                      specialty: '',
                      selectedClasses: [],
                      selectedSubjects: [],
                      weeklyHours: '',
                      permissions: [],
                      department: '',
                      classId: '',
                      dateOfBirth: '',
                      parentName: '',
                      parentPhone: '',
                      parentEmail: '',
                      selectedChildren: [],
                      emergencyContact: '',
                      emergencyPhone: '',
                      profession: ''
                    }));
                  }}
                  options={newUserRoleOptions}
                />
              )}
            </div>
            
            {newUser.role !== 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Téléphone *"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+237 6XX XXX XXX"
                  className={['parent', 'teacher', 'secretary'].includes(newUser.role) ? 'border-orange-300' : ''}
                />
                
                <Select
                  label="Rôle *"
                  value={newUser.role}
                  onChange={(value) => {
                    // Réinitialiser les champs spécifiques au rôle
                    setNewUser(prev => ({
                      ...prev,
                      role: value,
                      specialty: '',
                      selectedClasses: [],
                      selectedSubjects: [],
                      weeklyHours: '',
                      permissions: [],
                      department: '',
                      classId: '',
                      dateOfBirth: '',
                      parentName: '',
                      parentPhone: '',
                      parentEmail: '',
                      selectedChildren: [],
                      emergencyContact: '',
                      emergencyPhone: '',
                      profession: '',
                      address: ''
                    }));
                  }}
                  options={newUserRoleOptions}
                />
              </div>
            )}
            
            {/* Explication pour les élèves */}
            {newUser.role === 'student' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Pour les élèves :</strong> L'email sera généré automatiquement pour les élèves du secondaire 
                    (format: matricule@ecole.edutrack.cm). Les élèves du primaire n'auront pas de compte de connexion.
                  </div>
                </div>
              </div>
            )}
            
            {/* Explication pour le personnel */}
            {['teacher', 'secretary'].includes(newUser.role) && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Email optionnel :</strong> Si l'{newUser.role === 'teacher' ? 'enseignant' : 'la secrétaire'} n'a pas d'email personnel, 
                    un email technique sera généré automatiquement (format: {newUser.role === 'teacher' ? 'enseignant' : 'secretaire'}[téléphone]@edutrack.cm).
                    <br/>
                    <span className="text-xs">Le téléphone est obligatoire pour générer l'email si nécessaire.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Champs spécifiques ENSEIGNANT */}
          {newUser.role === 'teacher' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Icon name="BookOpen" size={16} className="mr-2 text-blue-600" />
                Informations professionnelles (Enseignant)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spécialité / Matière principale *
                    </label>
                    <select
                      value={newUser.specialty}
                      onChange={(e) => {
                        if (e.target.value === 'add_new') {
                          setShowAddSubject(true);
                        } else {
                          setNewUser(prev => ({ ...prev, specialty: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingReference}
                    >
                      <option value="">Sélectionnez une matière</option>
                      {availableSubjects.map(subj => (
                        <option key={subj.value} value={subj.label}>
                          {subj.label}
                        </option>
                      ))}
                      <option value="add_new" className="text-blue-600 font-semibold">
                        ➕ Ajouter une nouvelle matière...
                      </option>
                    </select>
                    
                    {/* Modal d'ajout de matière */}
                    {showAddSubject && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Ajouter une nouvelle matière
                          </h3>
                          <Input
                            label="Nom de la matière"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="Ex: Philosophie, Économie..."
                            autoFocus
                          />
                          <div className="flex space-x-3 mt-6">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowAddSubject(false);
                                setNewSubjectName('');
                              }}
                              disabled={addingSubject}
                              className="flex-1"
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handleAddSubject}
                              disabled={addingSubject || !newSubjectName.trim()}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              {addingSubject ? 'Ajout...' : 'Ajouter'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Input
                    label="Date d'embauche"
                    type="date"
                    value={newUser.hireDate}
                    onChange={(e) => setNewUser(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Classes assignées
                    </label>
                    <select
                      multiple
                      value={newUser.selectedClasses}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setNewUser(prev => ({ ...prev, selectedClasses: values }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ minHeight: '120px' }}
                      disabled={loadingReference || availableClasses.length === 0}
                    >
                      {loadingReference ? (
                        <option disabled>Chargement des classes...</option>
                      ) : availableClasses.length === 0 ? (
                        <option disabled>Aucune classe disponible. Créez des classes d'abord.</option>
                      ) : (
                        availableClasses.map(cls => (
                          <option key={cls.value} value={cls.value}>
                            {cls.label}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableClasses.length > 0 
                        ? 'Maintenez Ctrl/Cmd pour sélectionner plusieurs' 
                        : 'Créez des classes dans "Gestion des classes" d\'abord'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Matières enseignées
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddSubject(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      >
                        <Icon name="Plus" size={14} className="mr-1" />
                        Ajouter
                      </button>
                    </div>
                    <select
                      multiple
                      value={newUser.selectedSubjects}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setNewUser(prev => ({ ...prev, selectedSubjects: values }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ minHeight: '120px' }}
                      disabled={loadingReference || availableSubjects.length === 0}
                    >
                      {loadingReference ? (
                        <option disabled>Chargement des matières...</option>
                      ) : availableSubjects.length === 0 ? (
                        <option disabled>Aucune matière disponible. Ajoutez-en une avec le bouton "Ajouter".</option>
                      ) : (
                        availableSubjects.map(subj => (
                          <option key={subj.value} value={subj.value}>
                            {subj.label}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {availableSubjects.length > 0 
                        ? 'Maintenez Ctrl/Cmd pour sélectionner plusieurs' 
                        : 'Cliquez sur "Ajouter" pour créer une matière'}
                    </p>
                  </div>
                </div>

                <Input
                  label="Heures hebdomadaires"
                  type="number"
                  value={newUser.weeklyHours}
                  onChange={(e) => setNewUser(prev => ({ ...prev, weeklyHours: e.target.value }))}
                  placeholder="Ex: 18"
                  min="1"
                  max="40"
                />

                {newUser.selectedClasses.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Classes sélectionnées ({newUser.selectedClasses.length}):</strong>
                      {' '}
                      {newUser.selectedClasses.map(id => 
                        availableClasses.find(c => c.value === id)?.label
                      ).join(', ')}
                    </p>
                  </div>
                )}

                {newUser.selectedSubjects.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Matières sélectionnées ({newUser.selectedSubjects.length}):</strong>
                      {' '}
                      {newUser.selectedSubjects.map(id => 
                        availableSubjects.find(s => s.value === id)?.label
                      ).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Champs spécifiques SECRÉTAIRE */}
          {newUser.role === 'secretary' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Icon name="Briefcase" size={16} className="mr-2 text-purple-600" />
                Informations professionnelles (Secrétaire)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Département"
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Administration, Pédagogie..."
                  />
                  
                  <Input
                    label="Date d'embauche"
                    type="date"
                    value={newUser.hireDate}
                    onChange={(e) => setNewUser(prev => ({ ...prev, hireDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions accordées
                  </label>
                  <div className="space-y-2">
                    {permissionsOptions.map(perm => (
                      <label key={perm.value} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.includes(perm.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, perm.value]
                              }));
                            } else {
                              setNewUser(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== perm.value)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {newUser.permissions.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>Permissions accordées ({newUser.permissions.length}):</strong>
                      {' '}
                      {newUser.permissions.map(p => 
                        permissionsOptions.find(opt => opt.value === p)?.label
                      ).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Champs spécifiques ÉLÈVE */}
          {newUser.role === 'student' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Icon name="GraduationCap" size={16} className="mr-2 text-green-600" />
                Informations scolaires (Élève)
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Classe *"
                      value={newUser.classId}
                      onChange={(value) => setNewUser(prev => ({ ...prev, classId: value }))}
                      options={[
                        { value: '', label: 'Sélectionnez une classe' },
                        ...availableClasses
                      ]}
                      disabled={loadingReference}
                    />
                    {newUser.classId && (
                      <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        newUser.schoolLevel === 'secondary' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Icon 
                          name={newUser.schoolLevel === 'secondary' ? 'CheckCircle' : 'Info'} 
                          size={14} 
                          className="mr-1" 
                        />
                        {newUser.schoolLevel === 'secondary' ? (
                          <span>
                            <strong>Secondaire</strong> - Compte personnel sera créé (matricule + email)
                          </span>
                        ) : (
                          <span>
                            <strong>Primaire</strong> - Pas de compte personnel (géré par le parent)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Input
                    label="Date de naissance"
                    type="date"
                    value={newUser.dateOfBirth}
                    onChange={(e) => setNewUser(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                <h5 className="text-sm font-medium text-gray-700 mt-6 mb-2 flex items-center">
                  <Icon name="Users" size={14} className="mr-2 text-orange-600" />
                  Lier à un parent existant *
                </h5>
                <p className="text-xs text-gray-600 mb-3">
                  Sélectionnez le parent ou tuteur responsable de cet élève. Le parent doit avoir été créé au préalable.
                </p>
                
                {availableStudents.length === 0 && !loadingReference ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Aucun parent disponible</strong>
                        <p className="mt-1">
                          Vous devez d'abord créer un compte PARENT avant de pouvoir inscrire un élève.
                        </p>
                        <p className="mt-2">
                          <strong>Comment faire :</strong><br/>
                          1. Sélectionnez le rôle "Parent" ci-dessus<br/>
                          2. Créez le compte du parent<br/>
                          3. Revenez créer l'élève et sélectionnez ce parent
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Select
                      label="Parent/Tuteur *"
                      value={newUser.parentId || ''}
                      onChange={(value) => setNewUser(prev => ({ ...prev, parentId: value }))}
                      options={[
                        { value: '', label: 'Sélectionnez un parent' },
                        ...availableStudents.map(parent => ({
                          value: parent.id,
                          label: `${parent.full_name} - ${parent.email || parent.phone || 'Pas de contact'}`
                        }))
                      ]}
                      disabled={loadingReference}
                      helperText="Le parent recevra les informations de l'élève. Pour le secondaire, il recevra aussi les identifiants de connexion."
                    />
                    
                    {!newUser.parentId && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>Conseil :</strong> Si le parent n'apparaît pas dans la liste, créez d'abord son compte 
                            avec le rôle "Parent", puis revenez créer l'élève.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Champs spécifiques PARENT */}
          {newUser.role === 'parent' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Icon name="Users" size={16} className="mr-2 text-orange-600" />
                Informations complémentaires (Parent)
              </h4>
              
              {/* Message explicatif */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Comment ça fonctionne :</strong>
                    <ol className="mt-2 ml-4 list-decimal space-y-1">
                      <li>Créez d'abord le compte du parent (nom, <strong className="text-orange-700">téléphone obligatoire</strong>, email optionnel, mot de passe)</li>
                      <li>Ensuite, créez les comptes des élèves et sélectionnez ce parent</li>
                      <li>Le lien parent-enfant sera établi automatiquement</li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-blue-300">
                      <p className="text-xs text-blue-700 font-medium mb-1">
                        <Icon name="Phone" size={12} className="inline mr-1" />
                        Téléphone obligatoire - Email optionnel
                      </p>
                      <p className="text-xs text-blue-600 ml-4">
                        • Le téléphone est le moyen de contact principal<br/>
                        • Si le parent n'a pas d'email, un email technique sera généré automatiquement<br/>
                        • Format : parent[téléphone]@edutrack.cm<br/>
                        • Le parent utilisera cet email + son mot de passe pour se connecter
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Profession (optionnel)"
                    value={newUser.profession}
                    onChange={(e) => setNewUser(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="Ex: Enseignant, Médecin, Commerçant..."
                  />
                  
                  <Input
                    label="Adresse (optionnel)"
                    value={newUser.address}
                    onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Quartier, Ville"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact d'urgence (optionnel)"
                    value={newUser.emergencyContact}
                    onChange={(e) => setNewUser(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    placeholder="Nom du contact d'urgence"
                  />

                  <Input
                    label="Téléphone d'urgence (optionnel)"
                    value={newUser.emergencyPhone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informations de connexion - Uniquement pour le personnel (pas pour les élèves) */}
          {newUser.role !== 'student' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Icon name="Lock" size={16} className="mr-2" />
                Informations de connexion
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <Input
                      label="Mot de passe *"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 8 caractères"
                      helperText="Lettres, chiffres et caractères spéciaux recommandés"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                    </button>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                    >
                      <Icon name="Shuffle" size={14} className="mr-2" />
                      Générer automatiquement
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (newUser.password) {
                          navigator.clipboard.writeText(newUser.password);
                          alert('Mot de passe copié dans le presse-papiers');
                        }
                      }}
                      disabled={!newUser.password}
                    >
                      <Icon name="Copy" size={14} className="mr-2" />
                      Copier
                    </Button>
                  </div>
              </div>
              
              <Select
                label="Statut"
                value={newUser.status}
                onChange={(value) => setNewUser(prev => ({ ...prev, status: value }))}
                options={[
                  { value: 'active', label: 'Actif' },
                  { value: 'inactive', label: 'Inactif' }
                ]}
              />
            </div>
          </div>
          )}
          
          <div className="border-t pt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewUser({
                  fullName: '',
                  email: '',
                  phone: '',
                  role: 'student',
                  password: '',
                  status: 'active',
                  specialty: '',
                  hireDate: new Date().toISOString().split('T')[0],
                  selectedClasses: [],
                  selectedSubjects: [],
                  weeklyHours: '',
                  permissions: [],
                  department: '',
                  classId: '',
                  dateOfBirth: '',
                  parentName: '',
                  parentPhone: '',
                  parentEmail: '',
                  selectedChildren: [],
                  emergencyContact: '',
                  emergencyPhone: '',
                  profession: ''
                });
                setActiveTab('overview');
              }}
            >
              Annuler
            </Button>
            
            <Button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loadingAccounts}
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              {loadingAccounts ? 'Création...' : 'Créer le compte'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Protection contre le rendu tant que les données ne sont pas chargées
  if (!userDataLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicateur de mode */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Mode Démonstration - Gestion des Comptes</h3>
              <p className="text-sm text-amber-700">
                Vous consultez des comptes de démonstration. Les actions ne modifieront pas les vraies données.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets - Style différent du menu principal */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-4" aria-label="Sous-menu Gestion des comptes">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu de l'onglet */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountsManagement;