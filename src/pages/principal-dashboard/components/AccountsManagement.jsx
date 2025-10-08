import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useDataMode } from '../../../hooks/useDataMode';
import useDashboardData from '../../../hooks/useDashboardData';

const AccountsManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Hooks pour la gestion des données
  const { user } = useAuth();
  const { isDemo } = useDataMode();
  const { data, loading } = useDashboardData();

  // Gérer la navigation directe vers un sous-onglet via l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const subtabParam = urlParams.get('subtab');
    if (subtabParam && ['overview', 'accounts', 'create', 'security'].includes(subtabParam)) {
      setActiveTab(subtabParam);
    }
  }, [location.search]);

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

  // Comptes selon le mode (démo ou production)
  const accounts = isDemo ? demoAccounts : (data?.accounts || []);

  // Statistiques des comptes
  const accountStats = {
    total: accounts.length,
    active: accounts.filter(acc => acc.status === 'active').length,
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
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || account.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Options pour les filtres
  const roleOptions = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'principal', label: 'Directeur' },
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
    { id: 'create', label: 'Créer compte', icon: 'UserPlus' }
  ];

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

  const handleCreateUser = () => {
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation du mot de passe
    if (newUser.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (isDemo) {
      // Simuler l'envoi d'email
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
    } else {
      // Logique de création réelle avec envoi d'email
      console.log('Création nouveau compte:', newUser);
      
      const confirmSend = confirm(
        `Compte créé pour ${newUser.fullName}\n\n` +
        `Voulez-vous envoyer automatiquement les identifiants par email à ${newUser.email} ?\n\n` +
        `Sinon, vous devrez communiquer ces informations manuellement :\n` +
        `Email : ${newUser.email}\n` +
        `Mot de passe temporaire : ${newUser.password}`
      );
      
      if (confirmSend) {
        // Ici, on intégrerait un service d'email (SendGrid, AWS SES, etc.)
        sendCredentialsByEmail(newUser);
      } else {
        alert(`Identifiants créés. Veuillez les communiquer manuellement :\n\nEmail : ${newUser.email}\nMot de passe : ${newUser.password}\n\n⚠️ L'utilisateur devra changer son mot de passe lors de sa première connexion.`);
      }
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(accountStats.byRole).map(([role, count]) => (
            <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name={
                role === 'principal' ? 'Crown' :
                role === 'teacher' ? 'GraduationCap' :
                role === 'secretary' ? 'UserCheck' :
                role === 'student' ? 'User' : 'Users'
              } size={20} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm font-medium text-gray-600 capitalize">{role}</p>
              <p className="text-xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(account.id, account.full_name, account.email)}
                        title="Réinitialiser mot de passe et envoyer par email"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Icon name="Key" size={14} />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendCredentials(account.id, account.full_name, account.email)}
                        title="Renvoyer les identifiants par email"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Icon name="Mail" size={14} />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(account.id, account.full_name, account.status)}
                        className={account.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        title={account.status === 'active' ? 'Désactiver' : 'Activer'}
                      >
                        <Icon name={account.status === 'active' ? 'UserX' : 'UserCheck'} size={14} />
                      </Button>
                      
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
              <Input
                label="Mot de passe *"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 caractères"
                helperText="Lettres, chiffres et caractères spéciaux recommandés"
              />
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