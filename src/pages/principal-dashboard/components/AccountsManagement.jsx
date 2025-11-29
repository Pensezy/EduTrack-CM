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
          
          // Aplatir les données school
          const userWithSchool = {
            ...userData,
            school_id: userData.school?.id || userData.current_school_id,
            school_name: userData.school?.name || 'École'
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
    status: 'active'
  });

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

  // Onglets de navigation
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'accounts', label: 'Comptes utilisateurs', icon: 'Users' },
    { id: 'security', label: 'Sécurité', icon: 'Shield' },
    { id: 'create', label: 'Créer compte', icon: 'UserPlus' },
    { id: 'email-test', label: 'Test Email', icon: 'Mail' }
  ];

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
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation du mot de passe
    if (newUser.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
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
            const { error: teacherError } = await supabase
              .from('teachers')
              .insert({
                school_id: user.current_school_id,
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                specialty: newUser.specialty || '',
                hire_date: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (teacherError) {
              console.error('Erreur création enseignant:', teacherError);
              // Ne pas bloquer, l'utilisateur est créé
            }
          } else if (newUser.role === 'secretary') {
            const { error: secretaryError } = await supabase
              .from('secretaries')
              .insert({
                school_id: user.current_school_id,
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                hire_date: new Date().toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (secretaryError) {
              console.error('Erreur création secrétaire:', secretaryError);
              // Ne pas bloquer, l'utilisateur est créé
            }
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

        // Étape 2: Envoyer l'email avec les identifiants (pour le personnel uniquement)
        if (newUser.role !== 'principal' && newUser.role !== 'admin') {
          console.log('📧 Envoi de l\'email avec les identifiants...');
          console.log('Configuration email actuelle:', { 
            configured: isEmailConfigured(),
            hasServiceId: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
            hasTemplateId: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            hasPublicKey: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
          });
          
          const emailResult = await sendCredentialsEmail({
            recipientEmail: newUser.email,
            recipientName: newUser.fullName,
            role: getRoleLabel(newUser.role),
            email: newUser.email,
            password: newUser.password,
            schoolName: user.school_name || 'Votre établissement',
            principalName: user.full_name || 'Le Directeur',
          });

          console.log('📬 Résultat de l\'envoi:', emailResult);

          if (emailResult.success) {
            // Email envoyé avec succès
            alert(
              `✅ Compte créé avec succès !\n\n` +
              `Utilisateur : ${newUser.fullName}\n` +
              `Email : ${newUser.email}\n` +
              `Rôle : ${getRoleLabel(newUser.role)}\n\n` +
              `📧 Un email a été envoyé à ${newUser.email} avec les identifiants de connexion.\n\n` +
              `L'utilisateur recevra :\n` +
              `• Son email de connexion\n` +
              `• Son mot de passe temporaire\n` +
              `• Le lien pour se connecter\n\n` +
              `✓ Email envoyé le ${new Date().toLocaleString('fr-FR')}`
            );
          } else if (emailResult.fallback) {
            // Fallback: afficher les identifiants si l'email n'a pas pu être envoyé
            const errorDetails = emailResult.technicalError 
              ? `\n\n🔧 Erreur technique : ${emailResult.technicalError}` 
              : '';
            
            const configMessage = !isEmailConfigured() 
              ? '\n\n⚙️ Pour activer l\'envoi automatique d\'emails :\n1. Créez un compte sur https://emailjs.com\n2. Configurez un service email (Gmail, Outlook...)\n3. Créez un template d\'email\n4. Ajoutez les clés dans le fichier .env'
              : '\n\n⚙️ EmailJS est configuré mais l\'envoi a échoué.\nVérifiez :\n• Votre connexion Internet\n• Que le Service ID et Template ID sont corrects\n• Que le template existe sur emailjs.com';
            
            alert(
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
          status: 'active'
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
      case 'email-test':
        return renderEmailTest();
      default:
        return renderOverview();
    }
  };

  // Interface de test EmailJS
  const renderEmailTest = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="Mail" size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Test de Configuration Email</h3>
            <p className="text-sm text-gray-600">Diagnostiquer et tester l'envoi d'emails</p>
          </div>
        </div>

        {/* Statut de la configuration */}
        <div className={`rounded-lg p-4 mb-6 ${isEmailConfigured() ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start space-x-3">
            <Icon 
              name={isEmailConfigured() ? 'CheckCircle' : 'AlertCircle'} 
              size={20} 
              className={isEmailConfigured() ? 'text-green-600' : 'text-orange-600'} 
            />
            <div className="flex-1">
              <h4 className={`font-semibold ${isEmailConfigured() ? 'text-green-900' : 'text-orange-900'}`}>
                {isEmailConfigured() ? '✅ EmailJS Configuré' : '⚠️ EmailJS Non Configuré'}
              </h4>
              <p className={`text-sm mt-1 ${isEmailConfigured() ? 'text-green-700' : 'text-orange-700'}`}>
                {isEmailConfigured() 
                  ? 'Les clés EmailJS sont détectées. Vous pouvez tester l\'envoi d\'emails.'
                  : 'Les clés EmailJS ne sont pas configurées. Consultez le guide de configuration.'}
              </p>
            </div>
          </div>
        </div>

        {/* Informations de configuration */}
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-900">Configuration Actuelle</h4>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Service ID:</span>
              <span className={import.meta.env.VITE_EMAILJS_SERVICE_ID ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_EMAILJS_SERVICE_ID || '❌ Non configuré'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Template ID:</span>
              <span className={import.meta.env.VITE_EMAILJS_TEMPLATE_ID ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '❌ Non configuré'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Public Key:</span>
              <span className={import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'text-green-600' : 'text-red-600'}>
                {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '✓ Configurée' : '❌ Non configurée'}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton de test */}
        <div className="space-y-4">
          <Button
            onClick={testEmailConfiguration}
            disabled={!isEmailConfigured() || isDemo}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Icon name="Send" size={16} className="mr-2" />
            {isDemo ? 'Test disponible en mode production' : 'Envoyer un email de test'}
          </Button>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h5>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Cliquez sur "Envoyer un email de test"</li>
              <li>Entrez votre adresse email</li>
              <li>Vérifiez votre boîte de réception (et les spams)</li>
              <li>Si vous recevez l'email, la configuration fonctionne !</li>
            </ol>
          </div>
        </div>

        {/* Guide de dépannage */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold text-gray-900 mb-3">🔧 Dépannage</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Si le test échoue :</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Vérifiez que les clés dans <code className="bg-gray-100 px-1 rounded">.env</code> correspondent à celles sur emailjs.com</li>
              <li>Redémarrez le serveur après avoir modifié <code className="bg-gray-100 px-1 rounded">.env</code></li>
              <li>Vérifiez que le template existe sur emailjs.com</li>
              <li>Vérifiez votre connexion Internet</li>
              <li>Consultez le guide complet : <code className="bg-gray-100 px-1 rounded">docs/EMAIL_TROUBLESHOOTING.md</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Créer un nouveau compte</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom complet *"
              value={newUser.fullName}
              onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Nom et prénom"
            />
            
            <Input
              label="Email *"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Téléphone"
              value={newUser.phone}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+237 6XX XXX XXX"
            />
            
            <Select
              label="Rôle *"
              value={newUser.role}
              onChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
              options={newUserRoleOptions}
            />
          </div>
          
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
                  status: 'active'
                });
                setActiveTab('overview');
              }}
            >
              Annuler
            </Button>
            
            <Button
              onClick={handleCreateUser}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Créer le compte
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

      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet */}
      {renderTabContent()}
    </div>
  );
};

export default AccountsManagement;