import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useDataMode } from '../../hooks/useDataMode';
import { useDashboardData } from '../../hooks/useDashboardData';
import { getAdminDashboardData } from '../../services/adminDataService';

// Admin Dashboard Components

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('30d');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showSchoolDetailsModal, setShowSchoolDetailsModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [showSchoolStatsModal, setShowSchoolStatsModal] = useState(false);
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);
  const [revenueTimeRange, setRevenueTimeRange] = useState('8');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showTransactionFilter, setShowTransactionFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState({
    status: 'all',
    method: 'all',
    dateRange: '7d'
  });
  const [showFeatureDetailsModal, setShowFeatureDetailsModal] = useState(false);
  const [showAuditFilterModal, setShowAuditFilterModal] = useState(false);
  const [auditFilter, setAuditFilter] = useState({
    action: 'all',
    user: '',
    dateFrom: '',
    dateTo: ''
  });
  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    registrationsOpen: true
  });
  const [newSchool, setNewSchool] = useState({
    name: '',
    location: '',
    type: 'Public',
    director: '',
    phone: '',
    email: '',
    students: 0,
    teachers: 0,
    staff: 0,
    status: 'active'
  });
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    phone: '',
    school: ''
  });
  
  // 🔄 Détection du mode données avec cache optimisé
  const { user } = useAuth();
  const { dataMode, isDemo } = useDataMode();
  const { data, loading, error } = useDashboardData();
n  // États pour données réelles admin  const [adminRealData, setAdminRealData] = useState(null);  const [adminDataLoading, setAdminDataLoading] = useState(false);  const [adminDataError, setAdminDataError] = useState(null);

  // Admin data basé sur le mode
  const adminData = isDemo ? {
    id: "admin-001",
    name: "Administrateur Système", 
    email: "admin@edutrack.cm",
    role: "super_admin",
    permissions: ["system_admin", "user_management", "security_monitoring", "analytics_access"]
  } : {
    id: user?.id || "admin-real",
    name: user?.full_name || "Administrateur",
    email: user?.email || "admin@reelle.cm", 
    role: user?.role || "admin",
    permissions: user?.permissions || ["admin_access"]
  };

  // System metrics basé sur le mode
  const systemMetrics = isDemo ? {
    totalUsers: 2847,
    totalStudents: 1856,
    totalTeachers: 234,
    totalParents: 1234,
    totalStaff: 76,
    activeSchools: 15,
    systemUptime: 99.8,
    databaseHealth: 100,
    storageUsage: 68.5,
    dailyActiveUsers: 1456,
    weeklySignups: 87,
    criticalAlerts: 3,
    pendingApprovals: 12,
    monthlyRevenue: 45780000,
    pendingPayments: 234,
    successfulTransactions: 1876,
    failedTransactions: 23,
    averageResponseTime: 145,
    activeSessions: 342,
    totalDocuments: 8934,
    recentLoginAttempts: 2345
  } : {
    totalUsers: adminRealData?.systemMetrics?.totalUsers || data?.totalUsers || 0,
    totalStudents: data?.totalStudents || 0,
    totalTeachers: data?.totalTeachers || 0,
    totalParents: data?.totalParents || 0,
    totalStaff: data?.totalStaff || 0,
    activeSchools: adminRealData?.systemMetrics?.activeSchools || data?.activeSchools || 1,
    systemUptime: 100,
    databaseHealth: 100,
    storageUsage: data?.storageUsage || 15.2,
    dailyActiveUsers: data?.dailyActiveUsers || 0,
    weeklySignups: data?.weeklySignups || 0,
    criticalAlerts: 0,
    pendingApprovals: data?.pendingApprovals || 0,
    monthlyRevenue: data?.monthlyRevenue || 0,
    pendingPayments: data?.pendingPayments || 0,
    successfulTransactions: data?.successfulTransactions || 0,
    failedTransactions: data?.failedTransactions || 0,
    averageResponseTime: data?.averageResponseTime || 0,
    activeSessions: data?.activeSessions || 0,
    totalDocuments: data?.totalDocuments || 0,
    recentLoginAttempts: data?.recentLoginAttempts || 0
  };

  // Analytics data basé sur le mode
  const analyticsData = isDemo ? {
    userGrowth: [
      { month: 'Jan', users: 1200, students: 800, teachers: 45, parents: 355 },
      { month: 'Fév', users: 1350, students: 890, teachers: 52, parents: 408 },
      { month: 'Mar', users: 1580, students: 1020, teachers: 68, parents: 492 },
      { month: 'Avr', users: 1820, students: 1180, teachers: 85, parents: 555 },
      { month: 'Mai', users: 2100, students: 1350, teachers: 102, parents: 648 },
      { month: 'Juin', users: 2380, students: 1520, teachers: 125, parents: 735 },
      { month: 'Juil', users: 2650, students: 1690, teachers: 148, parents: 812 },
      { month: 'Août', users: 2847, students: 1856, teachers: 234, parents: 1234 }
    ],
    schoolActivity: [
      { name: 'Lycée Bilingue Biyem-Assi', students: 456, teachers: 28, activity: 95 },
      { name: 'Collège La Rochelle Douala', students: 387, teachers: 24, activity: 92 },
      { name: 'Lycée de Bonamoussadi', students: 298, teachers: 19, activity: 87 },
      { name: 'Collège Vogt Yaoundé', students: 234, teachers: 15, activity: 84 },
      { name: 'Lycée Général Leclerc', students: 187, teachers: 12, activity: 78 }
    ],
    platformUsage: [
      { feature: 'Gestion des Notes', usage: 89, users: 1245 },
      { feature: 'Suivi des Présences', usage: 76, users: 987 },
      { feature: 'Traitement des Paiements', usage: 65, users: 756 },
      { feature: 'Partage de Documents', usage: 58, users: 623 },
      { feature: 'Communication', usage: 72, users: 834 },
      { feature: 'Analytics', usage: 34, users: 298 }
    ]
} : {    userGrowth: adminRealData?.analyticsData?.newUsersChart?.map(item => ({      month: item.date,      users: item.users,      students: 0,      teachers: 0,      parents: 0    })) || data?.userGrowth || [      { month: 'Jan', users: 0, students: 0, teachers: 0, parents: 0 }    ],    schoolActivity: data?.schoolActivity || [      { name: user?.schoolData?.name || 'Votre école', students: 0, teachers: 0, activity: 100 }    ],    platformUsage: data?.platformUsage || [      { feature: 'Gestion Notes', usage: 0, users: 0 },      { feature: 'Présences', usage: 0, users: 0 },      { feature: 'Paiements', usage: 0, users: 0 },      { feature: 'Documents', usage: 0, users: 0 },      { feature: 'Communication', usage: 0, users: 0 },      { feature: 'Analytics', usage: 0, users: 0 }    ]  };

  // Security data basé sur le mode
  const securityData = isDemo ? {
    recentAlerts: [
      { id: 1, type: 'failed_login', severity: 'medium', message: 'Tentatives de connexion échouées multiples', user: 'inconnu', time: 'Il y a 2 min', location: 'Douala' },
      { id: 2, type: 'suspicious_activity', severity: 'high', message: 'Modèle inhabituel de modification de notes', user: 'enseignant.maths@demo.cm', time: 'Il y a 15 min', location: 'Yaoundé' },
      { id: 3, type: 'data_access', severity: 'low', message: 'Export groupé de données étudiants', user: 'admin@demo.cm', time: 'Il y a 1 heure', location: 'Bafoussam' }
    ],
    systemStatus: {
      firewall: 'active',
      authentication: 'secure',
      dataEncryption: 'enabled',
      backupStatus: 'completed',
      lastSecurityScan: '2024-11-19T02:30:00Z'
    }
  } : {
    recentAlerts: data?.securityAlerts || [
      { id: 1, type: 'system_status', severity: 'low', message: 'Système opérationnel', user: 'system', time: 'maintenant', location: user?.schoolData?.location || 'N/A' }
    ],
    systemStatus: {
      firewall: 'active',
      authentication: 'secure',
      dataEncryption: 'enabled',
      backupStatus: 'completed',
      lastSecurityScan: new Date().toISOString()
    }
  };

  // Audit trail basé sur le mode
  const auditTrail = isDemo ? [
    { id: 1, action: 'Utilisateur Créé', actor: 'admin@demo.cm', target: 'eleve.nouveau@demo.cm', timestamp: '2024-11-19T10:30:00Z', details: 'Nouveau compte étudiant créé' },
    { id: 2, action: 'Note Modifiée', actor: 'enseignant.maths@demo.cm', target: 'Paul Kamga', timestamp: '2024-11-19T09:45:00Z', details: 'Note de Mathématiques mise à jour: 15/20' },
    { id: 3, action: 'Paiement Traité', actor: 'système', target: 'Paiement #PAY-001', timestamp: '2024-11-19T08:20:00Z', details: 'MTN Mobile Money - 150 000 FCFA' },
    { id: 4, action: 'Connexion Utilisateur', actor: 'parent@demo.cm', target: 'Système', timestamp: '2024-11-19T07:15:00Z', details: 'Connexion réussie depuis application mobile' },
    { id: 5, action: 'Paramètres Mis à Jour', actor: 'admin@demo.cm', target: 'Configuration Système', timestamp: '2024-11-18T16:30:00Z', details: 'Paramètres de notification modifiés' }
  ] : data?.auditTrail || [
    { id: 1, action: 'System Login', actor: user?.email || 'admin', target: 'Admin Dashboard', timestamp: new Date().toISOString(), details: 'Accès tableau de bord administrateur' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
n  // Charger les données admin en mode production  useEffect(() => {    if (isDemo) return; // Ne rien charger en mode démo        async function loadAdminData() {      setAdminDataLoading(true);      setAdminDataError(null);            try {        const data = await getAdminDashboardData();        setAdminRealData(data);        console.log("✅ Données admin réelles chargées:", data);      } catch (error) {        console.error("❌ Erreur chargement données admin:", error);        setAdminDataError(error.message || "Erreur inconnue");      } finally {        setAdminDataLoading(false);      }    }        loadAdminData();  }, [isDemo]);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR')?.format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // En mode démo, on simule l'ajout
    console.log('Nouvel utilisateur ajouté:', newUser);
    alert(`Utilisateur ${newUser.firstName} ${newUser.lastName} ajouté avec succès!`);
    
    // Réinitialiser le formulaire
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      phone: '',
      school: ''
    });
    setShowAddUserModal(false);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Fichier CSV importé:', file.name);
      alert(`Fichier ${file.name} importé avec succès! ${Math.floor(Math.random() * 50 + 10)} utilisateurs ajoutés.`);
      setShowImportModal(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    const names = user.name.split(' ');
    setNewUser({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      school: user.school
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Utilisateur modifié:', selectedUser.id, newUser);
    alert(`Utilisateur ${newUser.firstName} ${newUser.lastName} modifié avec succès!`);
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)) {
      console.log('Utilisateur supprimé:', user.id);
      alert(`Utilisateur ${user.name} supprimé avec succès!`);
    }
  };

  const handleAddSchool = () => {
    if (!newSchool.name || !newSchool.location || !newSchool.director) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Nouvel établissement ajouté:', newSchool);
    alert(`Établissement ${newSchool.name} ajouté avec succès!`);
    setNewSchool({
      name: '',
      location: '',
      type: 'Public',
      director: '',
      phone: '',
      email: '',
      students: 0,
      teachers: 0,
      staff: 0,
      status: 'active'
    });
    setShowAddSchoolModal(false);
  };

  const handleViewSchool = (school) => {
    setSelectedSchoolData(school);
    setShowSchoolDetailsModal(true);
  };

  const handleEditSchool = (school) => {
    setSelectedSchoolData(school);
    setNewSchool({
      name: school.name,
      location: school.location,
      type: school.type,
      director: school.director,
      phone: school.phone || '',
      email: school.email || '',
      students: school.students || 0,
      teachers: school.teachers || 0,
      staff: school.staff || 0,
      status: school.status || 'active'
    });
    setShowEditSchoolModal(true);
  };

  const handleUpdateSchool = () => {
    if (!newSchool.name || !newSchool.location || !newSchool.director) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Établissement modifié:', selectedSchoolData.id, newSchool);
    alert(`Établissement ${newSchool.name} modifié avec succès!`);
    setShowEditSchoolModal(false);
    setSelectedSchoolData(null);
  };

  const handleViewSchoolStats = (school) => {
    setSelectedSchoolData(school);
    setShowSchoolStatsModal(true);
  };

  const handleDeactivateSchool = (school) => {
    if (confirm(`Êtes-vous sûr de vouloir désactiver l'établissement ${school.name} ?`)) {
      console.log('Établissement désactivé:', school.id);
      alert(`Établissement ${school.name} désactivé avec succès!`);
    }
  };

  const handleExportSchools = () => {
    alert('Export des données des établissements en cours...\nFormat: Excel (.xlsx)');
    console.log('Export des établissements');
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleDownloadReceipt = (transaction) => {
    alert(`Téléchargement du reçu pour ${transaction.id}...\nMontant: ${formatCurrency(transaction.amount)}`);
    console.log('Téléchargement reçu:', transaction);
  };

  const handleExportTransactions = () => {
    alert('Export des transactions en cours...\nFormat: Excel (.xlsx)');
    console.log('Export des transactions');
  };

  const handleExportAnalytics = () => {
    const period = analyticsRange === '7d' ? '7 jours' : 
                   analyticsRange === '30d' ? '30 jours' : 
                   analyticsRange === '90d' ? '90 jours' : '1 an';
    alert(`Export du rapport d'analytics en cours...\nPériode: ${period}\nFormat: PDF`);
    console.log('Export analytics:', analyticsRange);
  };

  const handleViewAllSchools = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('tab', 'schools');
    window.history.pushState({}, '', `${window.location.pathname}?${searchParams}`);
    window.location.reload();
  };

  const handleExportPDFReport = () => {
    alert('Génération du rapport PDF en cours...\nRapport complet de la plateforme');
    console.log('Export PDF report');
  };

  const handleExportExcel = () => {
    alert('Export Excel en cours...\nDonnées complètes de la plateforme');
    console.log('Export Excel');
  };

  const handleSendEmail = () => {
    alert('Envoi du rapport par email...\nDestinataire: admin@edutrack.cm');
    console.log('Send email report');
  };

  const handleViewFeatureDetails = () => {
    setShowFeatureDetailsModal(true);
  };

  const handleExportAuditLogs = () => {
    const dateRange = auditFilter.dateFrom && auditFilter.dateTo 
      ? `${auditFilter.dateFrom} au ${auditFilter.dateTo}` 
      : 'Toutes les dates';
    alert(`Export des logs d'audit...\nFiltre: ${auditFilter.action !== 'all' ? auditFilter.action : 'Toutes actions'}\nPériode: ${dateRange}\nFormat: CSV`);
    console.log('Export audit logs', auditFilter);
  };

  const handleApplyAuditFilter = () => {
    console.log('Apply audit filter:', auditFilter);
    setShowAuditFilterModal(false);
    // In production, this would filter the audit trail data
  };

  const handleResetAuditFilter = () => {
    setAuditFilter({
      action: 'all',
      user: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleToggleMaintenanceMode = () => {
    const newValue = !systemConfig.maintenanceMode;
    setSystemConfig({...systemConfig, maintenanceMode: newValue});
    alert(`Mode Maintenance ${newValue ? 'ACTIVÉ' : 'DÉSACTIVÉ'}\n\n${newValue ? '⚠️ Le système est maintenant en mode maintenance.\nLes utilisateurs ne pourront pas accéder à la plateforme.' : '✅ Le système est de nouveau accessible à tous les utilisateurs.'}`);
    console.log('Toggle maintenance mode:', newValue);
  };

  const handleToggleEmailNotifications = () => {
    const newValue = !systemConfig.emailNotifications;
    setSystemConfig({...systemConfig, emailNotifications: newValue});
    alert(`Notifications Email ${newValue ? 'ACTIVÉES' : 'DÉSACTIVÉES'}\n\n${newValue ? '✉️ Les alertes système seront envoyées par email.' : '🔕 Les alertes système ne seront plus envoyées par email.'}`);
    console.log('Toggle email notifications:', newValue);
  };

  const handleToggleRegistrations = () => {
    const newValue = !systemConfig.registrationsOpen;
    setSystemConfig({...systemConfig, registrationsOpen: newValue});
    alert(`Inscriptions ${newValue ? 'OUVERTES' : 'FERMÉES'}\n\n${newValue ? '🚪 Les nouvelles inscriptions sont autorisées.' : '🚫 Les nouvelles inscriptions sont bloquées.'}`);
    console.log('Toggle registrations:', newValue);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error bg-error/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const renderSystemOverview = () => (
    <div className="space-y-6">
      {/* Real-time System Status Banner */}
      <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <div>
              <p className="font-body font-body-semibold text-sm text-card-foreground">Système Opérationnel</p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                {formatNumber(systemMetrics?.activeSessions)} sessions actives • Réponse moy: {systemMetrics?.averageResponseTime}ms
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Disponibilité 30j</p>
              <p className="font-body font-body-semibold text-sm text-success">{systemMetrics?.systemUptime}%</p>
            </div>
            <div className="text-right">
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Santé BD</p>
              <p className="font-body font-body-semibold text-sm text-success">{systemMetrics?.databaseHealth}%</p>
            </div>
            <div className="text-right">
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Stockage</p>
              <p className="font-body font-body-semibold text-sm text-primary">{systemMetrics?.storageUsage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Users" size={24} className="text-primary" />
            </div>
            <span className="text-xs font-caption font-caption-semibold text-success bg-success/10 px-2 py-1 rounded-full">
              +{formatNumber(systemMetrics?.weeklySignups)}
            </span>
          </div>
          <div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Total Utilisateurs</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {formatNumber(systemMetrics?.totalUsers)}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <Icon name="TrendingUp" size={14} className="text-success" />
              <p className="font-caption font-caption-normal text-xs text-success">
                +3.2% vs mois dernier
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <Icon name="School" size={24} className="text-secondary" />
            </div>
            <span className="text-xs font-caption font-caption-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-full">
              100%
            </span>
          </div>
          <div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Établissements</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {systemMetrics?.activeSchools}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <Icon name="CheckCircle" size={14} className="text-success" />
              <p className="font-caption font-caption-normal text-xs text-success">
                Tous opérationnels
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-success" />
            </div>
            <span className="text-xs font-caption font-caption-semibold text-success bg-success/10 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Revenus Mensuels</p>
            <p className="font-heading font-heading-bold text-2xl text-card-foreground mt-1">
              {formatCurrency(systemMetrics?.monthlyRevenue)}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <Icon name="TrendingUp" size={14} className="text-success" />
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                {formatNumber(systemMetrics?.successfulTransactions)} transactions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-warning" />
            </div>
            {systemMetrics?.criticalAlerts > 0 && (
              <span className="text-xs font-caption font-caption-semibold text-error bg-error/10 px-2 py-1 rounded-full animate-pulse">
                Action requise
              </span>
            )}
          </div>
          <div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Alertes Système</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {systemMetrics?.criticalAlerts}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                {systemMetrics?.pendingApprovals} approbations en attente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Tendances de Croissance des Utilisateurs</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Élèves</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Enseignants</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">Parents</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData?.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#2A5CAA" strokeWidth={2} />
              <Line type="monotone" dataKey="teachers" stroke="#F4C430" strokeWidth={2} />
              <Line type="monotone" dataKey="parents" stroke="#1B3B5F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* School Activity and Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Activité des Écoles</h3>
          <div className="space-y-4">
            {analyticsData?.schoolActivity?.slice(0, 5)?.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-body font-body-semibold text-sm text-card-foreground">
                    {school?.name}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {school?.students} étudiants • {school?.teachers} professeurs
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-body font-body-semibold text-sm text-primary">
                    {school?.activity}%
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    activité
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Alertes de Sécurité</h3>
          <div className="space-y-3">
            {securityData?.recentAlerts?.map((alert) => (
              <div key={alert?.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert?.severity === 'high' ? 'bg-error' :
                  alert?.severity === 'medium' ? 'bg-warning' : 'bg-primary'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-body-semibold text-sm text-card-foreground">
                    {alert?.message}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                    {alert?.user} • {alert?.location} • {alert?.time}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${getSeverityColor(alert?.severity)}`}>
                  {alert?.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => {
    // Données utilisateurs demo pour la recherche/filtrage
const demoUsers = isDemo ? [      { id: 1, name: 'Marie Ngono', email: 'marie.ngono@demo.cm', role: 'student', status: 'active', school: 'Lycée Bilingue', registeredAt: '2024-09-15', lastLogin: '2024-11-28' },      { id: 2, name: 'Paul Kamga', email: 'paul.kamga@demo.cm', role: 'student', status: 'active', school: 'Collège La Rochelle', registeredAt: '2024-08-20', lastLogin: '2024-11-29' },      { id: 3, name: 'Prof. Jean Talla', email: 'j.talla@demo.cm', role: 'teacher', status: 'active', school: 'Lycée Bilingue', registeredAt: '2024-01-10', lastLogin: '2024-11-29' },      { id: 4, name: 'Dr. Atangana', email: 'atangana@demo.cm', role: 'teacher', status: 'active', school: 'Lycée Général Leclerc', registeredAt: '2023-12-05', lastLogin: '2024-11-28' },      { id: 5, name: 'Mme Ebogo', email: 'ebogo.parent@demo.cm', role: 'parent', status: 'active', school: 'Collège Vogt', registeredAt: '2024-10-01', lastLogin: '2024-11-27' },      { id: 6, name: 'M. Fouda', email: 'fouda@demo.cm', role: 'parent', status: 'active', school: 'Lycée de Bonamoussadi', registeredAt: '2024-09-12', lastLogin: '2024-11-26' },      { id: 7, name: 'Sophie Manga', email: 'sophie.m@demo.cm', role: 'student', status: 'inactive', school: 'Lycée Bilingue', registeredAt: '2024-06-15', lastLogin: '2024-10-15' },      { id: 8, name: 'Secrétaire Admin', email: 'sec.admin@demo.cm', role: 'staff', status: 'active', school: 'Administration', registeredAt: '2024-01-01', lastLogin: '2024-11-29' }    ] : (adminRealData?.users || []);

    // Filtrage
    const filteredUsers = demoUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Réinitialiser la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus]);
  
  return (
      <div className="space-y-6">
        {/* User Type Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="GraduationCap" size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-body font-body-semibold text-lg text-card-foreground">
                  {formatNumber(systemMetrics?.totalStudents)}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Élèves</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Icon name="BookOpen" size={20} className="text-secondary" />
              </div>
              <div>
                <p className="font-body font-body-semibold text-lg text-card-foreground">
                  {formatNumber(systemMetrics?.totalTeachers)}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Enseignants</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Icon name="Users" size={20} className="text-accent-foreground" />
              </div>
              <div>
                <p className="font-body font-body-semibold text-lg text-card-foreground">
                  {formatNumber(systemMetrics?.totalParents)}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Parents</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="Briefcase" size={20} className="text-warning" />
              </div>
              <div>
                <p className="font-body font-body-semibold text-lg text-card-foreground">
                  {formatNumber(systemMetrics?.totalStaff)}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Personnel</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="UserCheck" size={20} className="text-success" />
              </div>
              <div>
                <p className="font-body font-body-semibold text-lg text-card-foreground">
                  {formatNumber(systemMetrics?.dailyActiveUsers)}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Actifs Aujourd'hui</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm font-body font-body-normal text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm font-body font-body-normal text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tous les rôles</option>
                <option value="student">Élèves</option>
                <option value="teacher">Enseignants</option>
                <option value="parent">Parents</option>
                <option value="staff">Personnel</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm font-body font-body-normal text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="suspended">Suspendus</option>
              </select>

              <button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-primary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="UserPlus" size={18} />
                <span>Nouvel Utilisateur</span>
              </button>

              <button 
                onClick={() => setShowImportModal(true)}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="Upload" size={18} />
                <span>Import CSV</span>
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Rôle</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Établissement</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Statut</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Dernière Connexion</th>
                  <th className="text-center py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-body font-body-semibold text-sm text-card-foreground">{user.name}</p>
                          <p className="font-caption font-caption-normal text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${
                          user.role === 'student' ? 'bg-primary/10 text-primary' :
                          user.role === 'teacher' ? 'bg-secondary/10 text-secondary' :
                          user.role === 'parent' ? 'bg-accent/10 text-accent-foreground' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {user.role === 'student' ? 'Élève' :
                           user.role === 'teacher' ? 'Enseignant' :
                           user.role === 'parent' ? 'Parent' : 'Personnel'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                        {user.school}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${
                          user.status === 'active' ? 'bg-success/10 text-success' :
                          user.status === 'inactive' ? 'bg-muted text-muted-foreground' :
                          'bg-error/10 text-error'
                        }`}>
                          {user.status === 'active' ? 'Actif' :
                           user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                        {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors" 
                            title="Voir détails"
                          >
                            <Icon name="Eye" size={16} className="text-primary" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors" 
                            title="Modifier"
                          >
                            <Icon name="Edit" size={16} className="text-secondary" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors" 
                            title="Supprimer"
                          >
                            <Icon name="Trash2" size={16} className="text-error" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center">
                      <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-2" />
                      <p className="font-body font-body-normal text-sm text-muted-foreground">
                        Aucun utilisateur trouvé
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (() => {
            const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage + 1;
            const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);
            
            return (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                  Affichage de {startIndex}-{endIndex} sur {filteredUsers.length} utilisateur(s)
                </p>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-muted text-card-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-card-foreground hover:bg-muted/80'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-muted text-card-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Quick User Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="UserPlus" size={20} className="text-primary" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Ajouter Utilisateur</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Créer manuellement des comptes individuels avec configuration personnalisée
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-secondary/10 group-hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="Settings" size={20} className="text-secondary" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Gérer les Rôles</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Configurer les permissions et droits d'accès par rôle utilisateur
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 group-hover:bg-accent/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="Shield" size={20} className="text-accent-foreground" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Sécurité & Accès</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Paramètres de mot de passe, authentification 2FA et restrictions d'accès
            </p>
          </div>
        </div>

        {/* Modal Nouvel Utilisateur */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Nouvel Utilisateur</h3>
                  <button 
                    onClick={() => setShowAddUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jean"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="jean.dupont@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+237 6XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Élève</option>
                      <option value="teacher">Enseignant</option>
                      <option value="parent">Parent</option>
                      <option value="staff">Personnel</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <select
                      value={newUser.school}
                      onChange={(e) => setNewUser({...newUser, school: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un établissement</option>
                      <option value="lycee-biyem">Lycée Bilingue Biyem-Assi</option>
                      <option value="college-rochelle">Collège La Rochelle</option>
                      <option value="lycee-bonamoussadi">Lycée Bonamoussadi</option>
                      <option value="college-vogt">Collège Vogt</option>
                      <option value="lycee-leclerc">Lycée Général Leclerc</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer l'utilisateur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Import CSV */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Importer des Utilisateurs</h3>
                  <button 
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Téléchargez un fichier CSV contenant les informations des utilisateurs. Le fichier doit contenir les colonnes suivantes :
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <code className="text-xs text-gray-800">
                      prenom, nom, email, telephone, role, etablissement
                    </code>
                  </div>
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Icon name="Download" className="w-4 h-4" />
                    Télécharger le modèle CSV
                  </a>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Icon name="Upload" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Cliquez pour sélectionner un fichier
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">ou glissez-déposez un fichier CSV</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails Utilisateur */}
        {showUserDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Détails de l'utilisateur</h3>
                  <button 
                    onClick={() => {
                      setShowUserDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="User" className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{selectedUser.name}</h4>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
                      <p className="text-sm font-medium text-gray-900 capitalize">{
                        selectedUser.role === 'student' ? 'Élève' :
                        selectedUser.role === 'teacher' ? 'Enseignant' :
                        selectedUser.role === 'parent' ? 'Parent' :
                        selectedUser.role === 'staff' ? 'Personnel' : 'Admin'
                      }</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status === 'active' ? 'Actif' :
                         selectedUser.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Établissement</label>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.school}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date d'inscription</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedUser.registeredAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Dernière connexion</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowUserDetailsModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modifier Utilisateur */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h3>
                  <button 
                    onClick={() => {
                      setShowEditUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+237 6XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Élève</option>
                      <option value="teacher">Enseignant</option>
                      <option value="parent">Parent</option>
                      <option value="staff">Personnel</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <select
                      value={newUser.school}
                      onChange={(e) => setNewUser({...newUser, school: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un établissement</option>
                      <option value="lycee-biyem">Lycée Bilingue Biyem-Assi</option>
                      <option value="college-rochelle">Collège La Rochelle</option>
                      <option value="lycee-bonamoussadi">Lycée Bonamoussadi</option>
                      <option value="college-vogt">Collège Vogt</option>
                      <option value="lycee-leclerc">Lycée Général Leclerc</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        {/* Analytics Period Selector */}
        <div className="bg-card rounded-lg shadow-card border border-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Période d'Analyse
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setAnalyticsRange('7d')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  analyticsRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                7 Jours
              </button>
              <button 
                onClick={() => setAnalyticsRange('30d')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  analyticsRange === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                30 Jours
              </button>
              <button 
                onClick={() => setAnalyticsRange('90d')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  analyticsRange === '90d' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                90 Jours
              </button>
              <button 
                onClick={() => setAnalyticsRange('1y')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  analyticsRange === '1y' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                1 An
              </button>
              <button 
                onClick={handleExportAnalytics}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-body font-body-semibold hover:bg-secondary/90 transition-colors flex items-center space-x-1"
              >
                <Icon name="Download" size={14} />
                <span>Exporter Rapport</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="Users" size={20} className="text-primary" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-success">+8.2%</span>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Taux d'Engagement</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">68.5%</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
              vs période précédente
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={20} className="text-secondary" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-success">+12.7%</span>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Croissance Utilisateurs</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">+287</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
              nouveaux ce mois
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-accent-foreground" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-primary">Stable</span>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Temps Moyen Session</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">24min</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
              par utilisateur actif
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="Award" size={20} className="text-success" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-success">+4.3%</span>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Satisfaction Globale</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">4.6/5</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-2">
              basé sur 543 avis
            </p>
          </div>
        </div>

        {/* Platform Usage Chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Analyse d'Utilisation de la Plateforme
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.platformUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#2A5CAA" name="Taux d'utilisation (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Trend */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Tendance de Croissance des Utilisateurs
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#2A5CAA" strokeWidth={2} name="Élèves" />
                <Line type="monotone" dataKey="teachers" stroke="#F4C430" strokeWidth={2} name="Enseignants" />
                <Line type="monotone" dataKey="parents" stroke="#1B3B5F" strokeWidth={2} name="Parents" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Adoption */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Adoption des Fonctionnalités
              </h3>
              <button 
                onClick={handleViewFeatureDetails}
                className="text-xs text-primary font-body font-body-semibold hover:underline"
              >
                Détails
              </button>
            </div>
            <div className="space-y-3">
              {analyticsData?.platformUsage?.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body font-body-normal text-sm text-card-foreground">
                      {feature?.feature}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                        {formatNumber(feature?.users)} utilisateurs
                      </span>
                      <span className="font-caption font-caption-semibold text-xs text-primary">
                        {feature?.usage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${feature?.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Performance du Système
              </h3>
              <span className={`text-xs font-caption font-caption-semibold px-2 py-1 rounded-full ${
                systemMetrics?.averageResponseTime < 200 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              }`}>
                {systemMetrics?.averageResponseTime < 200 ? 'Excellent' : 'Bon'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Zap" size={18} className="text-success" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">Réponse Base de Données</span>
                </div>
                <span className="font-body font-body-semibold text-sm text-success">45ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Globe" size={18} className="text-success" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">Latence API</span>
                </div>
                <span className="font-body font-body-semibold text-sm text-success">120ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Monitor" size={18} className="text-primary" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">Temps Chargement Page</span>
                </div>
                <span className="font-body font-body-semibold text-sm text-primary">2.1s</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="HardDrive" size={18} className="text-warning" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">Utilisation Stockage</span>
                </div>
                <span className="font-body font-body-semibold text-sm text-warning">{systemMetrics?.storageUsage}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="Activity" size={18} className="text-success" />
                  <span className="font-body font-body-normal text-sm text-card-foreground">Disponibilité</span>
                </div>
                <span className="font-body font-body-semibold text-sm text-success">{systemMetrics?.systemUptime}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* School Activity Ranking */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Classement Activité des Écoles
            </h3>
            <button 
              onClick={handleViewAllSchools}
              className="text-xs text-primary font-body font-body-semibold hover:underline flex items-center space-x-1"
            >
              <span>Voir toutes</span>
              <Icon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {analyticsData?.schoolActivity?.slice(0, 5)?.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body font-body-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-body-semibold text-sm text-card-foreground">
                      {school?.name}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {school?.students} étudiants • {school?.teachers} professeurs
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${school?.activity}%` }}
                      />
                    </div>
                    <span className="font-body font-body-semibold text-sm text-primary w-12">
                      {school?.activity}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-2">
                Rapports et Exports
              </h3>
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Générez des rapports détaillés sur l'utilisation de la plateforme
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportPDFReport}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-primary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="FileText" size={18} />
                <span>Rapport PDF</span>
              </button>
              <button 
                onClick={handleExportExcel}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="Download" size={18} />
                <span>Exporter Excel</span>
              </button>
              <button 
                onClick={handleSendEmail}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-accent/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="Mail" size={18} />
                <span>Envoyer par Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAuditTrail = () => (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Journal d'Audit Système</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportAuditLogs}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-secondary/90 transition-micro"
          >
            Exporter les Logs
          </button>
          <button 
            onClick={() => setShowAuditFilterModal(true)}
            className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-body font-body-normal hover:bg-muted/80 transition-micro"
          >
            Filtrer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Action</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Acteur</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Cible</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Horodatage</th>
              <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Détails</th>
            </tr>
          </thead>
          <tbody>
            {auditTrail?.map((entry) => (
              <tr key={entry?.id} className="border-b border-border hover:bg-muted/20 transition-micro">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold bg-primary/10 text-primary">
                    {entry?.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-card-foreground">
                  {entry?.actor}
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                  {entry?.target}
                </td>
                <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                  {new Date(entry?.timestamp)?.toLocaleString('fr-FR')}
                </td>
                <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                  {entry?.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemConfig = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">Configuration Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Mode Maintenance</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Désactiver temporairement l'accès</p>
              </div>
              <button 
                onClick={handleToggleMaintenanceMode}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  systemConfig.maintenanceMode 
                    ? 'bg-warning text-warning-foreground hover:bg-warning/90' 
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                {systemConfig.maintenanceMode ? 'Activé' : 'Désactivé'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Notifications Email</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Alertes système par email</p>
              </div>
              <button 
                onClick={handleToggleEmailNotifications}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  systemConfig.emailNotifications 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                {systemConfig.emailNotifications ? 'Activé' : 'Désactivé'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-body font-body-semibold text-sm text-card-foreground">Inscriptions Ouvertes</p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">Autoriser nouvelles inscriptions</p>
              </div>
              <button 
                onClick={handleToggleRegistrations}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  systemConfig.registrationsOpen 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-card-foreground hover:bg-muted/80'
                }`}
              >
                {systemConfig.registrationsOpen ? 'Activé' : 'Désactivé'}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-body font-body-semibold text-sm text-card-foreground mb-2">Version du Système</p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">v2.4.1 (Build 20241119)</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-body font-body-semibold text-sm text-card-foreground mb-2">Dernière Mise à Jour</p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">19 novembre 2024, 14:30</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-body font-body-semibold text-sm text-card-foreground mb-2">Serveur</p>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">Cloud - Region: EU-West</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => {
    const securityLogs = isDemo ? [
      { id: 1, event: 'Tentative de connexion échouée', user: 'inconnu@email.cm', ip: '197.234.211.45', location: 'Douala', severity: 'high', timestamp: '2024-11-29 10:23:15', action: 'Bloqué après 3 tentatives' },
      { id: 2, event: 'Accès administrateur réussi', user: 'admin@demo.cm', ip: '41.202.219.73', location: 'Yaoundé', severity: 'low', timestamp: '2024-11-29 09:45:32', action: 'Accès autorisé' },
      { id: 3, event: 'Modification des permissions', user: 'admin@demo.cm', ip: '41.202.219.73', location: 'Yaoundé', severity: 'medium', timestamp: '2024-11-29 09:30:18', action: 'Permissions utilisateur modifiées' },
      { id: 4, event: 'Export de données sensibles', user: 'secretaire@demo.cm', ip: '102.16.44.128', location: 'Bafoussam', severity: 'medium', timestamp: '2024-11-29 08:15:42', action: 'Export autorisé et enregistré' },
      { id: 5, event: 'Scan de sécurité automatique', user: 'système', ip: '127.0.0.1', location: 'Serveur', severity: 'low', timestamp: '2024-11-29 03:00:00', action: 'Aucune menace détectée' }
    ] : [];

    const accessAttempts = isDemo ? [
      { country: 'Cameroun', attempts: 2234, success: 2198, failed: 36, blocked: 8 },
      { country: 'France', attempts: 45, success: 43, failed: 2, blocked: 0 },
      { country: 'Nigeria', attempts: 67, success: 12, failed: 55, blocked: 23 },
      { country: 'Inconnu', attempts: 89, success: 0, failed: 89, blocked: 89 }
    ] : [];

    return (
      <div className="space-y-6">
        {/* Security Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-success p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-success" />
              </div>
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Pare-feu</p>
            <p className="font-caption font-caption-normal text-xs text-success mt-1">Actif et opérationnel</p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-success p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="Lock" size={20} className="text-success" />
              </div>
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Chiffrement SSL</p>
            <p className="font-caption font-caption-normal text-xs text-success mt-1">Certificat valide 2025</p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-success p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="Key" size={20} className="text-success" />
              </div>
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Authentification 2FA</p>
            <p className="font-caption font-caption-normal text-xs text-success mt-1">Activé pour admins</p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-warning p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-warning bg-warning/10 px-2 py-1 rounded-full">
                {systemMetrics?.criticalAlerts}
              </span>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Alertes Actives</p>
            <p className="font-caption font-caption-normal text-xs text-warning mt-1">Nécessitent attention</p>
          </div>
        </div>

        {/* Security Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Attempts by Country */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Tentatives de Connexion par Pays
            </h3>
            <div className="space-y-3">
              {accessAttempts.map((country, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body font-body-semibold text-sm text-card-foreground">{country.country}</p>
                    <span className="text-xs font-caption font-caption-semibold text-muted-foreground">
                      {formatNumber(country.attempts)} tentatives
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-success/10 rounded p-2">
                      <p className="text-xs font-caption font-caption-semibold text-success">{country.success}</p>
                      <p className="text-xs font-caption font-caption-normal text-muted-foreground">Réussies</p>
                    </div>
                    <div className="bg-warning/10 rounded p-2">
                      <p className="text-xs font-caption font-caption-semibold text-warning">{country.failed}</p>
                      <p className="text-xs font-caption font-caption-normal text-muted-foreground">Échouées</p>
                    </div>
                    <div className="bg-error/10 rounded p-2">
                      <p className="text-xs font-caption font-caption-semibold text-error">{country.blocked}</p>
                      <p className="text-xs font-caption font-caption-normal text-muted-foreground">Bloquées</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Alerts */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                Alertes de Sécurité Récentes
              </h3>
              <button className="text-xs text-primary font-body font-body-semibold hover:underline">
                Voir tout
              </button>
            </div>
            <div className="space-y-3">
              {securityData?.recentAlerts?.slice(0, 5).map((alert) => (
                <div key={alert?.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert?.severity === 'high' ? 'bg-error animate-pulse' :
                    alert?.severity === 'medium' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-body-semibold text-sm text-card-foreground">
                      {alert?.message}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
                      {alert?.user} • {alert?.location} • {alert?.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-semibold whitespace-nowrap ${getSeverityColor(alert?.severity)}`}>
                    {alert?.severity === 'high' ? 'Critique' :
                     alert?.severity === 'medium' ? 'Moyen' : 'Info'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Security Logs */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Journal de Sécurité Détaillé</h3>
            <div className="flex space-x-2">
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/90 transition-micro">
                Exporter Logs
              </button>
              <button className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-muted/80 transition-micro">
                Filtrer
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Événement</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Localisation</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">IP</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Horodatage</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Sévérité</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">
                      {log.event}
                    </td>
                    <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {log.location}
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {log.ip}
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${
                        log.severity === 'high' ? 'bg-error/10 text-error' :
                        log.severity === 'medium' ? 'bg-warning/10 text-warning' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {log.severity === 'high' ? 'Critique' :
                         log.severity === 'medium' ? 'Moyen' : 'Info'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {log.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="UserX" size={20} className="text-primary" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Gérer Blocages</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Gérer les utilisateurs et adresses IP bloqués
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-secondary/10 group-hover:bg-secondary/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="Key" size={20} className="text-secondary" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Politique Mots de Passe</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Configurer les exigences de sécurité des mots de passe
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 group-hover:bg-accent/20 rounded-full flex items-center justify-center transition-colors">
                <Icon name="Scan" size={20} className="text-accent-foreground" />
              </div>
              <h4 className="font-body font-body-semibold text-sm text-card-foreground">Scan de Sécurité</h4>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              Lancer un scan manuel de sécurité du système
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBackups = () => (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Gestion des Sauvegardes</h3>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Icon name="Download" size={18} />
            Créer Sauvegarde
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Clock" size={20} className="text-primary" />
              <p className="font-body font-body-semibold text-sm text-card-foreground">Fréquence</p>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">Quotidienne à 03:00</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="HardDrive" size={20} className="text-secondary" />
              <p className="font-body font-body-semibold text-sm text-card-foreground">Espace Utilisé</p>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">12.4 GB / 50 GB</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="Archive" size={20} className="text-accent-foreground" />
              <p className="font-body font-body-semibold text-sm text-card-foreground">Rétention</p>
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">30 jours</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-heading font-heading-semibold text-base text-card-foreground">Sauvegardes Récentes</h4>
          {[
            { id: 1, date: '2024-11-19 03:00', size: '1.2 GB', status: 'success', type: 'Complète' },
            { id: 2, date: '2024-11-18 03:00', size: '1.1 GB', status: 'success', type: 'Complète' },
            { id: 3, date: '2024-11-17 03:00', size: '1.0 GB', status: 'success', type: 'Complète' },
            { id: 4, date: '2024-11-16 03:00', size: '980 MB', status: 'success', type: 'Complète' },
            { id: 5, date: '2024-11-15 03:00', size: '1.1 GB', status: 'success', type: 'Complète' }
          ].map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-body font-body-semibold text-sm text-card-foreground">{backup.type}</p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground">{backup.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">{backup.size}</span>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Icon name="Download" size={18} className="text-primary" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Icon name="MoreVertical" size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinances = () => {
    const allPaymentStats = isDemo ? [
      { month: 'Jan', revenue: 3200000, transactions: 145, pending: 12 },
      { month: 'Fév', revenue: 3850000, transactions: 167, pending: 8 },
      { month: 'Mar', revenue: 4100000, transactions: 189, pending: 15 },
      { month: 'Avr', revenue: 3950000, transactions: 178, pending: 10 },
      { month: 'Mai', revenue: 4500000, transactions: 201, pending: 7 },
      { month: 'Juin', revenue: 4200000, transactions: 192, pending: 11 },
      { month: 'Juil', revenue: 3780000, transactions: 156, pending: 9 },
      { month: 'Août', revenue: 4578000, transactions: 198, pending: 14 },
      { month: 'Sep', revenue: 4320000, transactions: 186, pending: 10 },
      { month: 'Oct', revenue: 4650000, transactions: 205, pending: 12 },
      { month: 'Nov', revenue: 4780000, transactions: 213, pending: 8 },
      { month: 'Déc', revenue: 3900000, transactions: 178, pending: 15 }
    ] : [];

    const paymentStats = revenueTimeRange === '8' 
      ? allPaymentStats.slice(0, 8)
      : revenueTimeRange === '12' 
        ? allPaymentStats 
        : allPaymentStats.slice(-6);

    const recentTransactions = isDemo ? [
      { id: 'TRX-001', student: 'Marie Ngono', amount: 150000, method: 'MTN Mobile Money', status: 'completed', date: '2024-11-29 10:35', type: 'Frais scolaires' },
      { id: 'TRX-002', student: 'Paul Kamga', amount: 150000, method: 'Orange Money', status: 'completed', date: '2024-11-29 09:20', type: 'Frais scolaires' },
      { id: 'TRX-003', student: 'Sophie Manga', amount: 75000, method: 'Express Union', status: 'pending', date: '2024-11-29 08:45', type: 'Paiement partiel' },
      { id: 'TRX-004', student: 'Jean Talla', amount: 25000, method: 'Carte bancaire', status: 'completed', date: '2024-11-28 16:30', type: 'Matériel pédagogique' },
      { id: 'TRX-005', student: 'Claire Mbida', amount: 150000, method: 'Virement', status: 'failed', date: '2024-11-28 14:15', type: 'Frais scolaires' }
    ] : [];

    return (
      <div className="space-y-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-success" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                +12.3%
              </span>
            </div>
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Revenus du Mois</p>
              <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
                {formatCurrency(systemMetrics?.monthlyRevenue)}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Icon name="TrendingUp" size={14} className="text-success" />
                <p className="font-caption font-caption-normal text-xs text-success">
                  vs mois dernier
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-primary" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                {((systemMetrics?.successfulTransactions / (systemMetrics?.successfulTransactions + systemMetrics?.failedTransactions)) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Transactions Réussies</p>
              <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
                {formatNumber(systemMetrics?.successfulTransactions)}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Icon name="Activity" size={14} className="text-muted-foreground" />
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                  ce mois
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-warning" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-warning bg-warning/10 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Paiements Pending</p>
              <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
                {formatNumber(systemMetrics?.pendingPayments)}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Icon name="AlertCircle" size={14} className="text-warning" />
                <p className="font-caption font-caption-normal text-xs text-warning">
                  nécessitent suivi
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="XCircle" size={24} className="text-error" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-error bg-error/10 px-2 py-1 rounded-full">
                {((systemMetrics?.failedTransactions / (systemMetrics?.successfulTransactions + systemMetrics?.failedTransactions)) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="font-caption font-caption-normal text-sm text-muted-foreground">Transactions Échouées</p>
              <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
                {formatNumber(systemMetrics?.failedTransactions)}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Icon name="AlertTriangle" size={14} className="text-error" />
                <p className="font-caption font-caption-normal text-xs text-error">
                  à résoudre
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Évolution des Revenus</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setRevenueTimeRange('8')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  revenueTimeRange === '8' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                8 Mois
              </button>
              <button 
                onClick={() => setRevenueTimeRange('12')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  revenueTimeRange === '12' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                12 Mois
              </button>
              <button 
                onClick={() => setRevenueTimeRange('6')}
                className={`px-3 py-1 text-xs font-body font-body-semibold rounded-lg transition-colors ${
                  revenueTimeRange === '6' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                6 Mois
              </button>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentStats} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Mois: ${label}`}
                  contentStyle={{ fontSize: '14px' }}
                />
                <Bar dataKey="revenue" fill="#10B981" name="Revenus" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">Transactions Récentes</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleExportTransactions}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="Download" size={16} />
                <span>Exporter</span>
              </button>
              <button 
                onClick={() => setShowTransactionFilter(!showTransactionFilter)}
                className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-muted/80 transition-micro flex items-center space-x-2"
              >
                <Icon name="Filter" size={16} />
                <span>Filtrer</span>
              </button>
            </div>
          </div>

          {/* Filtres de transactions */}
          {showTransactionFilter && (
            <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={transactionFilter.status}
                    onChange={(e) => setTransactionFilter({...transactionFilter, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous</option>
                    <option value="completed">Complétés</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoués</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                  <select
                    value={transactionFilter.method}
                    onChange={(e) => setTransactionFilter({...transactionFilter, method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Toutes</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="orange">Orange Money</option>
                    <option value="card">Carte bancaire</option>
                    <option value="transfer">Virement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                  <select
                    value={transactionFilter.dateRange}
                    onChange={(e) => setTransactionFilter({...transactionFilter, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">3 derniers mois</option>
                    <option value="all">Tout</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">ID Transaction</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Étudiant</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Montant</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Méthode</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Statut</th>
                  <th className="text-left py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Date</th>
                  <th className="text-center py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-caption font-caption-semibold text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                        {transaction.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">
                      {transaction.student}
                    </td>
                    <td className="py-3 px-4 font-body font-body-semibold text-sm text-card-foreground">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 font-body font-body-normal text-sm text-muted-foreground">
                      {transaction.method}
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {transaction.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-caption-semibold ${
                        transaction.status === 'completed' ? 'bg-success/10 text-success' :
                        transaction.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {transaction.status === 'completed' ? 'Complété' :
                         transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-caption font-caption-normal text-xs text-muted-foreground">
                      {transaction.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleViewTransaction(transaction)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors" 
                          title="Voir détails"
                        >
                          <Icon name="Eye" size={16} className="text-primary" />
                        </button>
                        <button 
                          onClick={() => handleDownloadReceipt(transaction)}
                          className="p-2 hover:bg-secondary/10 rounded-lg transition-colors" 
                          title="Télécharger reçu"
                        >
                          <Icon name="Download" size={16} className="text-secondary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Icon name="Smartphone" size={20} className="text-amber-600" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-amber-600">45%</span>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">MTN Mobile Money</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              {formatNumber(843)} transactions
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Smartphone" size={20} className="text-orange-600" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-orange-600">32%</span>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Orange Money</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              {formatNumber(601)} transactions
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="CreditCard" size={20} className="text-blue-600" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-blue-600">15%</span>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Carte Bancaire</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              {formatNumber(281)} transactions
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="Building" size={20} className="text-purple-600" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-purple-600">8%</span>
            </div>
            <p className="font-body font-body-semibold text-sm text-card-foreground">Virement / Autre</p>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              {formatNumber(151)} transactions
            </p>
          </div>
        </div>

        {/* Modal Détails Transaction */}
        {showTransactionDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Détails de la transaction</h3>
                  <button 
                    onClick={() => {
                      setShowTransactionDetails(false);
                      setSelectedTransaction(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">ID Transaction</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTransaction.id}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedTransaction.status === 'completed' ? '✓ Complété' :
                       selectedTransaction.status === 'pending' ? '⏳ En attente' : '✗ Échoué'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Étudiant</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.student}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Montant</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Méthode de paiement</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.method}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.type}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date et heure</p>
                    <p className="text-sm font-medium text-gray-900">{selectedTransaction.date}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Informations supplémentaires</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Frais de transaction:</span>
                        <span className="font-medium">{formatCurrency(selectedTransaction.amount * 0.01)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant net:</span>
                        <span className="font-medium">{formatCurrency(selectedTransaction.amount * 0.99)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Total reçu:</span>
                        <span className="font-bold text-green-600">{formatCurrency(selectedTransaction.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleDownloadReceipt(selectedTransaction)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="Download" size={16} />
                    Télécharger reçu
                  </button>
                  <button
                    onClick={() => {
                      setShowTransactionDetails(false);
                      setSelectedTransaction(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSchools = () => {
    const schools = isDemo ? [
      { 
        id: 1, 
        name: 'Lycée Bilingue de Biyem-Assi', 
        location: 'Yaoundé', 
        type: 'Public',
        students: 1245, 
        teachers: 67, 
        staff: 12,
        status: 'active',
        director: 'Dr. Mvondo Jean',
        phone: '+237 6 99 12 34 56',
        email: 'biyemassi@education.cm',
        revenue: 18750000,
        completionRate: 92
      },
      { 
        id: 2, 
        name: 'Collège La Rochelle Douala', 
        location: 'Douala', 
        type: 'Privé',
        students: 856, 
        teachers: 45, 
        staff: 8,
        status: 'active',
        director: 'Mme Ebelle Marie',
        phone: '+237 6 77 88 99 00',
        email: 'larochelle@education.cm',
        revenue: 25800000,
        completionRate: 95
      },
      { 
        id: 3, 
        name: 'Lycée de Bonamoussadi', 
        location: 'Douala', 
        type: 'Public',
        students: 1089, 
        teachers: 58, 
        staff: 10,
        status: 'active',
        director: 'M. Ondoua Paul',
        phone: '+237 6 55 44 33 22',
        email: 'bonamoussadi@education.cm',
        revenue: 16350000,
        completionRate: 88
      },
      { 
        id: 4, 
        name: 'Collège Vogt Yaoundé', 
        location: 'Yaoundé', 
        type: 'Privé',
        students: 654, 
        teachers: 38, 
        staff: 7,
        status: 'active',
        director: 'Dr. Nkolo Simon',
        phone: '+237 6 33 22 11 00',
        email: 'vogt@education.cm',
        revenue: 19620000,
        completionRate: 93
      },
      { 
        id: 5, 
        name: 'Lycée Général Leclerc', 
        location: 'Yaoundé', 
        type: 'Public',
        students: 987, 
        teachers: 52, 
        staff: 9,
        status: 'maintenance',
        director: 'M. Essomba Pierre',
        phone: '+237 6 11 00 99 88',
        email: 'leclerc@education.cm',
        revenue: 14805000,
        completionRate: 85
      }
    ] : (adminRealData?.schools || []);

    return (
      <div className="space-y-6">
        {/* Schools Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="School" size={20} className="text-primary" />
              </div>
              <span className="text-xs font-caption font-caption-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                +2 ce mois
              </span>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Établissements</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {systemMetrics?.activeSchools}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Icon name="Users" size={20} className="text-secondary" />
              </div>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Total Élèves</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {formatNumber(systemMetrics?.totalStudents)}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Icon name="BookOpen" size={20} className="text-accent-foreground" />
              </div>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Total Enseignants</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              {formatNumber(systemMetrics?.totalTeachers)}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={20} className="text-success" />
              </div>
            </div>
            <p className="font-caption font-caption-normal text-sm text-muted-foreground">Taux Moyen Réussite</p>
            <p className="font-heading font-heading-bold text-xl sm:text-2xl lg:text-3xl text-card-foreground mt-1">
              91%
            </p>
          </div>
        </div>

        {/* Schools List */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Liste des Établissements
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowAddSchoolModal(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-primary/90 transition-micro flex items-center space-x-2"
              >
                <Icon name="Plus" size={18} />
                <span>Nouvel Établissement</span>
              </button>
              <button 
                onClick={handleExportSchools}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/90 transition-micro"
              >
                Exporter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {schools.map((school) => (
              <div key={school.id} className="bg-muted/20 rounded-lg border border-border hover:shadow-md transition-shadow">
                <div className="p-3 sm:p-4 lg:p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon name="School" size={24} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-body font-body-bold text-base text-card-foreground mb-1">
                          {school.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center space-x-1">
                            <Icon name="MapPin" size={14} />
                            <span>{school.location}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-caption font-caption-semibold ${
                            school.type === 'Public' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {school.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-caption font-caption-semibold ${
                            school.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {school.status === 'active' ? 'Actif' : 'Maintenance'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Icon name="User" size={14} />
                            <span>{school.director}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Mail" size={14} />
                            <span>{school.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Icon name="Phone" size={14} />
                            <span>{school.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedSchool(selectedSchool === school.id ? null : school.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Icon name={selectedSchool === school.id ? "ChevronUp" : "ChevronDown"} size={20} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="font-body font-body-semibold text-lg text-primary">{formatNumber(school.students)}</p>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">Élèves</p>
                    </div>
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="font-body font-body-semibold text-lg text-secondary">{formatNumber(school.teachers)}</p>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">Enseignants</p>
                    </div>
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="font-body font-body-semibold text-lg text-accent-foreground">{formatNumber(school.staff)}</p>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">Personnel</p>
                    </div>
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="font-body font-body-semibold text-lg text-success">{formatCurrency(school.revenue)}</p>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">Revenus/Mois</p>
                    </div>
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="font-body font-body-semibold text-lg text-warning">{school.completionRate}%</p>
                      <p className="font-caption font-caption-normal text-xs text-muted-foreground">Taux Réussite</p>
                    </div>
                  </div>

                  {selectedSchool === school.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewSchool(school)}
                          className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-body font-body-semibold hover:bg-primary/20 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="Eye" size={16} />
                          <span>Voir Détails</span>
                        </button>
                        <button 
                          onClick={() => handleEditSchool(school)}
                          className="px-3 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-body font-body-semibold hover:bg-secondary/20 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="Edit" size={16} />
                          <span>Modifier</span>
                        </button>
                        <button 
                          onClick={() => handleViewSchoolStats(school)}
                          className="px-3 py-2 bg-accent/10 text-accent-foreground rounded-lg text-sm font-body font-body-semibold hover:bg-accent/20 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="BarChart" size={16} />
                          <span>Statistiques</span>
                        </button>
                        <button 
                          onClick={() => handleDeactivateSchool(school)}
                          className="px-3 py-2 bg-error/10 text-error rounded-lg text-sm font-body font-body-semibold hover:bg-error/20 transition-colors flex items-center space-x-2"
                        >
                          <Icon name="XCircle" size={16} />
                          <span>Désactiver</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Performance Comparison */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Comparaison des Performances
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={schools.map(school => ({
                  ...school,
                  shortName: school.name.length > 25 
                    ? school.name.substring(0, 22) + '...' 
                    : school.name
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  interval={0}
                  style={{ fontSize: '12px' }}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold text-sm text-gray-900 mb-2">{data.name}</p>
                          <p className="text-xs text-blue-600">Élèves: {data.students}</p>
                          <p className="text-xs text-yellow-600">Enseignants: {data.teachers}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="students" fill="#2A5CAA" name="Élèves" />
                <Bar dataKey="teachers" fill="#F4C430" name="Enseignants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modal Nouvel Établissement */}
        {showAddSchoolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Nouvel Établissement</h3>
                  <button 
                    onClick={() => setShowAddSchoolModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'établissement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lycée de..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newSchool.location}
                        onChange={(e) => setNewSchool({...newSchool, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Yaoundé"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newSchool.type}
                        onChange={(e) => setNewSchool({...newSchool, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Public">Public</option>
                        <option value="Privé">Privé</option>
                        <option value="Confessionnel">Confessionnel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Directeur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSchool.director}
                      onChange={(e) => setNewSchool({...newSchool, director: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="M./Mme..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newSchool.phone}
                      onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+237 6XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newSchool.email}
                      onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="etablissement@education.cm"
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Effectifs initiaux (optionnel)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Élèves
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.students}
                          onChange={(e) => setNewSchool({...newSchool, students: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enseignants
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.teachers}
                          onChange={(e) => setNewSchool({...newSchool, teachers: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Personnel
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.staff}
                          onChange={(e) => setNewSchool({...newSchool, staff: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowAddSchoolModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddSchool}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer l'établissement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Détails Établissement */}
        {showSchoolDetailsModal && selectedSchoolData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Détails de l'établissement</h3>
                  <button 
                    onClick={() => {
                      setShowSchoolDetailsModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="School" className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{selectedSchoolData.name}</h4>
                      <p className="text-sm text-gray-500">{selectedSchoolData.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                      <p className="text-sm font-medium text-gray-900">{selectedSchoolData.type}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Actif
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Directeur</label>
                    <p className="text-sm font-medium text-gray-900">{selectedSchoolData.director}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
                      <p className="text-sm text-gray-900">{selectedSchoolData.phone}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{selectedSchoolData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedSchoolData.students}</p>
                      <p className="text-xs text-gray-500">Élèves</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedSchoolData.teachers}</p>
                      <p className="text-xs text-gray-500">Enseignants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedSchoolData.staff}</p>
                      <p className="text-xs text-gray-500">Personnel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Revenus mensuels</label>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedSchoolData.revenue)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Taux de réussite</label>
                      <p className="text-lg font-bold text-gray-900">{selectedSchoolData.completionRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowSchoolDetailsModal(false);
                      handleEditSchool(selectedSchoolData);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowSchoolDetailsModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Modifier Établissement */}
        {showEditSchoolModal && selectedSchoolData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Modifier l'établissement</h3>
                  <button 
                    onClick={() => {
                      setShowEditSchoolModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'établissement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newSchool.location}
                        onChange={(e) => setNewSchool({...newSchool, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newSchool.type}
                        onChange={(e) => setNewSchool({...newSchool, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Public">Public</option>
                        <option value="Privé">Privé</option>
                        <option value="Confessionnel">Confessionnel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Directeur <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSchool.director}
                      onChange={(e) => setNewSchool({...newSchool, director: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={newSchool.phone}
                      onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newSchool.email}
                      onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Effectifs</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Élèves
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.students}
                          onChange={(e) => setNewSchool({...newSchool, students: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enseignants
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.teachers}
                          onChange={(e) => setNewSchool({...newSchool, teachers: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Personnel
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newSchool.staff}
                          onChange={(e) => setNewSchool({...newSchool, staff: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditSchoolModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateSchool}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Statistiques Établissement */}
        {showSchoolStatsModal && selectedSchoolData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Statistiques - {selectedSchoolData.name}</h3>
                  <button 
                    onClick={() => {
                      setShowSchoolStatsModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{selectedSchoolData.students}</p>
                      <p className="text-sm text-gray-600 mt-1">Élèves</p>
                      <p className="text-xs text-green-600 mt-1">+5% ce mois</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{selectedSchoolData.teachers}</p>
                      <p className="text-sm text-gray-600 mt-1">Enseignants</p>
                      <p className="text-xs text-green-600 mt-1">+2 cette année</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{selectedSchoolData.staff}</p>
                      <p className="text-sm text-gray-600 mt-1">Personnel</p>
                      <p className="text-xs text-gray-500 mt-1">Stable</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{selectedSchoolData.completionRate}%</p>
                      <p className="text-sm text-gray-600 mt-1">Réussite</p>
                      <p className="text-xs text-green-600 mt-1">+3% vs l'an dernier</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Performance financière</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Revenus mensuels</label>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedSchoolData.revenue)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Revenus annuels (estimés)</label>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedSchoolData.revenue * 10)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Indicateurs clés</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Taux de présence</span>
                          <span className="font-semibold text-gray-900">94%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Satisfaction parents</span>
                          <span className="font-semibold text-gray-900">88%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Taux d'encadrement</span>
                          <span className="font-semibold text-gray-900">1:{Math.round(selectedSchoolData.students / selectedSchoolData.teachers)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowSchoolStatsModal(false);
                      setSelectedSchoolData(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => alert('Export des statistiques en cours...')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Exporter PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'BarChart3' },
    { id: 'users', label: 'Utilisateurs', icon: 'Users' },
    { id: 'schools', label: 'Établissements', icon: 'School' },
    { id: 'finances', label: 'Finances', icon: 'DollarSign' },
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'audit', label: 'Journal d\'audit', icon: 'FileText' },
    { id: 'system', label: 'Système', icon: 'Settings' },
    { id: 'security', label: 'Sécurité', icon: 'Shield' },
    { id: 'backups', label: 'Sauvegardes', icon: 'Database' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="admin" 
        userName={adminData?.name}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Sidebar 
        userRole="admin"
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-20 sm:pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 space-y-2 sm:space-y-3 w-full overflow-x-hidden">
          {/* Welcome Section avec indicateur de mode */}
          <div className={`bg-gradient-to-r ${isDemo ? 'from-primary to-secondary' : 'from-green-600 to-blue-600'} rounded-lg p-6 text-white relative`}>
            {/* 🔍 Indicateur de mode données */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDemo 
                  ? 'bg-yellow-500 text-yellow-900' 
                  : 'bg-green-500 text-green-900'
              }`}>
                {isDemo ? '🔄 MODE DÉMO' : '🏫 DONNÉES RÉELLES'}
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="font-heading font-heading-bold text-2xl lg:text-xl sm:text-2xl lg:text-3xl mb-2">
                  {getGreeting()}, {adminData?.name?.split(' ')?.[0]} ! 🔧
                </h1>
                <p className="font-body font-body-normal text-white/90 mb-4 lg:mb-0">
                  {isDemo 
                    ? 'Surveillance et gestion globale de la plateforme EduTrack CM. Toutes les écoles, tous les utilisateurs.'
                    : `Administration de ${user?.schoolData?.name || 'votre établissement'}. Gestion système et utilisateurs.`
                  }
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {formatNumber(systemMetrics?.totalUsers)} utilisateurs
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      {systemMetrics?.activeSchools} {isDemo ? 'écoles actives' : 'établissement'}
                    </span>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1">
                    <span className="font-caption font-caption-semibold text-sm">
                      Uptime {systemMetrics?.systemUptime}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
{/* Loading State */}          {adminDataLoading && !isDemo && (            <div className="bg-blue-50 border-2 border-blue-200 p-3 sm:p-4 rounded-xl mb-2 sm:mb-3">              <div className="flex items-center gap-3">                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>                <span className="text-blue-800 font-medium text-sm">                  Chargement des données administrateur...                </span>              </div>            </div>          )}          {/* Error State */}          {adminDataError && !isDemo && (            <div className="bg-red-50 border-2 border-red-200 p-3 sm:p-4 rounded-xl mb-2 sm:mb-3">              <div className="flex items-center gap-3">                <Icon name="AlertTriangle" size={20} className="text-red-600" />                <div className="flex-1">                  <p className="text-red-800 font-semibold text-sm mb-1">                    Erreur de chargement des données                  </p>                  <p className="text-red-600 text-xs">                    {adminDataError}                  </p>                </div>                <button                   onClick={() => window.location.reload()}                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"                >                  Réessayer                </button>              </div>            </div>          )}
                  <div className="font-heading font-heading-bold text-xl">
                    {currentTime?.toLocaleDateString('fr-FR', { 
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="font-caption font-caption-normal text-sm text-white/80">
                    {currentTime?.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-card rounded-lg shadow-card border border-border p-1">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs?.map((tab) => (
                <Link
                  key={tab?.id}
                  to={`/admin-dashboard?tab=${tab?.id}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-body font-body-normal whitespace-nowrap transition-micro ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content avec loading et mode */}
          <div className="min-h-[600px]">
            {!isDemo && loading && Object.values(loading).some(l => l) ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Chargement des données réelles...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && renderSystemOverview()}
                {activeTab === 'users' && renderUserManagement()}
                {activeTab === 'schools' && renderSchools()}
                {activeTab === 'finances' && renderFinances()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'audit' && renderAuditTrail()}
                {activeTab === 'system' && renderSystemConfig()}
                {activeTab === 'security' && renderSecurity()}
                {activeTab === 'backups' && renderBackups()}
                
                {/* Debug mode information */}
                {!isDemo && (
                  <div className="bg-green-50 rounded-lg p-4 mt-6">
                    <div className="flex items-center">
                      <Icon name="Database" size={20} className="text-green-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">Mode Production Actif</h4>
                        <p className="text-sm text-green-700">
                          Données issues de Supabase pour {user?.schoolData?.name || 'votre établissement'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card border border-border p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
              Actions Rapides Administrateur
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              <Link
                to="/admin-dashboard?tab=users"
                className="flex flex-col items-center p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-micro group"
              >
                <Icon name="Users" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Utilisateurs
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=schools"
                className="flex flex-col items-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-micro group"
              >
                <Icon name="School" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Établissements
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=finances"
                className="flex flex-col items-center p-4 rounded-lg bg-success/5 hover:bg-success/10 transition-micro group"
              >
                <Icon name="DollarSign" size={24} className="text-success mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Finances
                </span>
              </Link>
              
              <Link
                to="/admin-dashboard?tab=analytics"
                className="flex flex-col items-center p-4 rounded-lg bg-accent/5 hover:bg-accent/10 transition-micro group"
              >
                <Icon name="TrendingUp" size={24} className="text-accent-foreground mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Analytics
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=backups"
                className="flex flex-col items-center p-4 rounded-lg bg-warning/5 hover:bg-warning/10 transition-micro group"
              >
                <Icon name="Database" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Sauvegardes
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=security"
                className="flex flex-col items-center p-4 rounded-lg bg-error/5 hover:bg-error/10 transition-micro group"
              >
                <Icon name="Shield" size={24} className="text-error mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Sécurité
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=system"
                className="flex flex-col items-center p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-micro group"
              >
                <Icon name="Settings" size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Configuration
                </span>
              </Link>

              <Link
                to="/admin-dashboard?tab=audit"
                className="flex flex-col items-center p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-micro group"
              >
                <Icon name="FileText" size={24} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-caption font-caption-normal text-xs text-center text-card-foreground">
                  Journal d'Audit
                </span>
              </Link>
            </div>

        {/* Modal Détails Adoption des Fonctionnalités */}
        {showFeatureDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-heading font-heading-bold text-card-foreground">
                    Détails de l'Adoption des Fonctionnalités
                  </h3>
                  <button
                    onClick={() => setShowFeatureDetailsModal(false)}
                    className="text-muted hover:text-card-foreground"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Gestion des Notes */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Gestion des Notes
                      </h4>
                      <p className="text-sm text-muted mt-1">Module de saisie et gestion des notes</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">92%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">1,247</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">8,934</div>
                      <p className="text-xs text-muted">Notes saisies</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+15%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Enseignants</span>
                      <span className="font-body font-body-semibold text-card-foreground">856 (89%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Secrétaires</span>
                      <span className="font-body font-body-semibold text-card-foreground">391 (96%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Gestion Documentaire */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Gestion Documentaire
                      </h4>
                      <p className="text-sm text-muted mt-1">Stockage et partage de documents</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">78%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">892</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">2,467</div>
                      <p className="text-xs text-muted">Documents partagés</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+22%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Enseignants</span>
                      <span className="font-body font-body-semibold text-card-foreground">645 (67%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Directeurs</span>
                      <span className="font-body font-body-semibold text-card-foreground">247 (88%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Suivi Présence */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Suivi Présence
                      </h4>
                      <p className="text-sm text-muted mt-1">Contrôle des absences et retards</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">85%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">1,034</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">15,678</div>
                      <p className="text-xs text-muted">Présences enregistrées</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+8%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Enseignants</span>
                      <span className="font-body font-body-semibold text-card-foreground">789 (82%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Secrétaires</span>
                      <span className="font-body font-body-semibold text-card-foreground">245 (88%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Paiements en Ligne */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Paiements en Ligne
                      </h4>
                      <p className="text-sm text-muted mt-1">Gestion des frais et paiements</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">67%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">723</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">1,845</div>
                      <p className="text-xs text-muted">Paiements effectués</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+31%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Parents</span>
                      <span className="font-body font-body-semibold text-card-foreground">589 (65%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Secrétaires</span>
                      <span className="font-body font-body-semibold text-card-foreground">134 (69%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '69%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Communication Parents */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Communication Parents
                      </h4>
                      <p className="text-sm text-muted mt-1">Messagerie et notifications</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">73%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">834</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">3,245</div>
                      <p className="text-xs text-muted">Messages envoyés</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+18%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Parents</span>
                      <span className="font-body font-body-semibold text-card-foreground">612 (68%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Enseignants</span>
                      <span className="font-body font-body-semibold text-card-foreground">222 (78%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Emploi du Temps */}
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        Emploi du Temps
                      </h4>
                      <p className="text-sm text-muted mt-1">Planification et horaires</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-heading font-heading-bold text-primary">88%</div>
                      <p className="text-xs text-muted">Taux d'adoption</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">1,156</div>
                      <p className="text-xs text-muted">Utilisateurs actifs</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-card-foreground">567</div>
                      <p className="text-xs text-muted">Emplois créés</p>
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-4">
                      <div className="text-2xl font-heading font-heading-bold text-success">+12%</div>
                      <p className="text-xs text-muted">vs mois dernier</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Directeurs</span>
                      <span className="font-body font-body-semibold text-card-foreground">267 (95%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Enseignants</span>
                      <span className="font-body font-body-semibold text-card-foreground">889 (83%)</span>
                    </div>
                    <div className="w-full bg-secondary/10 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

        {/* Modal Filtre Journal d'Audit */}
        {showAuditFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
              <div className="border-b border-border p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-heading font-heading-bold text-card-foreground">
                    Filtrer le Journal d'Audit
                  </h3>
                  <button
                    onClick={() => setShowAuditFilterModal(false)}
                    className="text-muted hover:text-card-foreground"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-body font-body-semibold text-card-foreground mb-2">
                    Type d'Action
                  </label>
                  <select
                    value={auditFilter.action}
                    onChange={(e) => setAuditFilter({...auditFilter, action: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  >
                    <option value="all">Toutes les actions</option>
                    <option value="CREATE">Création</option>
                    <option value="UPDATE">Modification</option>
                    <option value="DELETE">Suppression</option>
                    <option value="LOGIN">Connexion</option>
                    <option value="LOGOUT">Déconnexion</option>
                    <option value="EXPORT">Export de données</option>
                    <option value="IMPORT">Import de données</option>
                    <option value="ACCESS">Accès</option>
                    <option value="PERMISSION">Modification de permissions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-body font-body-semibold text-card-foreground mb-2">
                    Utilisateur
                  </label>
                  <input
                    type="text"
                    value={auditFilter.user}
                    onChange={(e) => setAuditFilter({...auditFilter, user: e.target.value})}
                    placeholder="Nom ou email de l'utilisateur"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-body font-body-semibold text-card-foreground mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={auditFilter.dateFrom}
                      onChange={(e) => setAuditFilter({...auditFilter, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-body-semibold text-card-foreground mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={auditFilter.dateTo}
                      onChange={(e) => setAuditFilter({...auditFilter, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-card-foreground"
                    />
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted">
                      <p className="font-body font-body-semibold mb-1">Filtres actifs :</p>
                      <ul className="space-y-0.5 font-caption font-caption-normal">
                        {auditFilter.action !== 'all' && <li>• Action: {auditFilter.action}</li>}
                        {auditFilter.user && <li>• Utilisateur: {auditFilter.user}</li>}
                        {auditFilter.dateFrom && <li>• Du: {auditFilter.dateFrom}</li>}
                        {auditFilter.dateTo && <li>• Au: {auditFilter.dateTo}</li>}
                        {auditFilter.action === 'all' && !auditFilter.user && !auditFilter.dateFrom && !auditFilter.dateTo && (
                          <li className="text-muted-foreground">Aucun filtre appliqué</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-6 flex justify-between gap-3">
                <button
                  onClick={handleResetAuditFilter}
                  className="px-4 py-2 text-muted hover:text-card-foreground font-body font-body-semibold text-sm transition-colors"
                >
                  Réinitialiser
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAuditFilterModal(false)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleApplyAuditFilter}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

              <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    alert('Export du rapport d\'adoption des fonctionnalités...');
                    console.log('Export feature adoption report');
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Exporter le Rapport
                </button>
                <button
                  onClick={() => setShowFeatureDetailsModal(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;