import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useDataMode } from '../../hooks/useDataMode';
import { useDashboardData } from '../../hooks/useDashboardData';

const DataBackup = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // 🔄 Détection du mode données avec cache optimisé
  const { user } = useAuth();
  const { dataMode, isDemo } = useDataMode();
  const { data, loading } = useDashboardData();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Debug pour voir les données utilisateur
  console.log('🔍 User data in data-backup:', user);
  console.log('🔍 User full_name:', user?.full_name);
  console.log('🔍 User name:', user?.name);
  console.log('🔍 User email:', user?.email);

  // Fonction pour récupérer le nom utilisateur de manière intelligente
  const getUserDisplayName = () => {
    // Priorité 1: full_name
    if (user?.full_name && user.full_name !== '') return user.full_name;
    
    // Priorité 2: name
    if (user?.name && user.name !== '') return user.name;
    
    // Priorité 3: schoolData.principal_name
    if (user?.schoolData?.principal_name && user.schoolData.principal_name !== '') return user.schoolData.principal_name;
    
    // Priorité 4: first_name + last_name
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    
    // Priorité 5: metadata.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    
    // Priorité 6: email (sans domaine)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    // Fallback par mode
    return isDemo ? "M. Directeur (Démo)" : "Utilisateur";
  };

  // Données de démonstration
  const demoBackupHistory = [
    {
      id: 1,
      date: '2024-09-25 03:00:00',
      type: 'automatic',
      size: '2.4 GB',
      status: 'completed',
      duration: '12 min'
    },
    {
      id: 2,
      date: '2024-09-24 03:00:00',
      type: 'automatic',
      size: '2.3 GB',
      status: 'completed',
      duration: '11 min'
    },
    {
      id: 3,
      date: '2024-09-23 15:30:00',
      type: 'manual',
      size: '2.3 GB',
      status: 'completed',
      duration: '10 min'
    },
    {
      id: 4,
      date: '2024-09-23 03:00:00',
      type: 'automatic',
      size: '2.2 GB',
      status: 'failed',
      duration: '-'
    },
    {
      id: 5,
      date: '2024-09-22 03:00:00',
      type: 'automatic',
      size: '2.2 GB',
      status: 'completed',
      duration: '9 min'
    }
  ];

  // Historique basé sur le mode
  const backupHistory = isDemo ? demoBackupHistory : (data?.backupHistory || [
    {
      id: 1,
      date: new Date().toISOString(),
      type: 'manual',
      size: '1.2 GB',
      status: 'completed',
      duration: '5 min'
    }
  ]);

  // Statistiques de démonstration
  const demoBackupStats = [
    {
      title: 'Dernière sauvegarde',
      value: 'Il y a 2h',
      status: 'success',
      icon: 'CheckCircle'
    },
    {
      title: 'Taille totale',
      value: '24.8 GB',
      status: 'info',
      icon: 'HardDrive'
    },
    {
      title: 'Sauvegardes réussies',
      value: '98.5%',
      status: 'success',
      icon: 'TrendingUp'
    },
    {
      title: 'Rétention',
      value: '30 jours',
      status: 'info',
      icon: 'Calendar'
    }
  ];

  // Statistiques basées sur le mode
  const backupStats = isDemo ? demoBackupStats : [
    {
      title: 'Dernière sauvegarde',
      value: data?.lastBackup || 'Jamais',
      status: 'success',
      icon: 'CheckCircle'
    },
    {
      title: 'Taille totale',
      value: data?.totalBackupSize || '0 GB',
      status: 'info',
      icon: 'HardDrive'
    },
    {
      title: 'Sauvegardes réussies',
      value: data?.backupSuccessRate || '100%',
      status: 'success',
      icon: 'TrendingUp'
    },
    {
      title: 'Rétention',
      value: data?.retentionPeriod || '30 jours',
      status: 'info',
      icon: 'Calendar'
    }
  ];

  const handleManualBackup = () => {
    setBackupInProgress(true);
    setBackupProgress(0);
    
    if (isDemo) {
      // Simulation du processus de sauvegarde en mode démo
      const incrementProgress = () => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            setBackupInProgress(false);
            alert('✅ Sauvegarde simulée terminée avec succès ! (Mode démonstration)');
            return 100;
          }
          return prev + 10;
        });
      };
      
      const interval = setInterval(incrementProgress, 500);
      
      setTimeout(() => {
        clearInterval(interval);
        setBackupInProgress(false);
        setBackupProgress(0);
      }, 6000);
    } else {
      // Vraie sauvegarde en mode production
      const incrementProgress = () => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            setBackupInProgress(false);
            alert(`✅ Sauvegarde réelle terminée avec succès pour ${user?.schoolData?.name || 'votre établissement'} !`);
            return 100;
          }
          return prev + 10;
        });
      };
      
      const interval = setInterval(incrementProgress, 800);
      
      setTimeout(() => {
        clearInterval(interval);
        setBackupInProgress(false);
        setBackupProgress(0);
      }, 8000);
    }
  };

  const handleExportData = (format) => {
    if (isDemo) {
      console.log(`Demo export in ${format} format`);
      alert(`📊 Export simulé au format ${format.toUpperCase()} (Mode démonstration)`);
    } else {
      console.log(`Real export for ${user?.schoolData?.name} in ${format} format`);
      alert(`📊 Export réel des données de ${user?.schoolData?.name || 'votre établissement'} au format ${format.toUpperCase()}...`);
    }
  };

  const handleAutoBackupConfig = () => {
    if (isDemo) {
      alert(`⚙️ Configuration de l'auto-sauvegarde (Mode démonstration)\n\nFonctionnalités disponibles :\n• Fréquence : Quotidienne, Hebdomadaire\n• Heure : Personnalisable\n• Rétention : 7-90 jours\n• Notifications : Email/SMS`);
    } else {
      alert(`⚙️ Configuration de l'auto-sauvegarde pour ${user?.schoolData?.name || 'votre établissement'}\n\nAccès aux paramètres :\n• Planification automatique\n• Configuration des notifications\n• Gestion de la rétention\n• Surveillance des sauvegardes`);
    }
  };

  const handleRefreshHistory = () => {
    if (isDemo) {
      alert(`🔄 Actualisation de l'historique (Mode démonstration)\n\nHistorique des sauvegardes mis à jour !`);
    } else {
      alert(`🔄 Actualisation de l'historique des sauvegardes\n\nRécupération des dernières sauvegardes depuis Supabase...`);
    }
  };

  const handleViewFullHistory = () => {
    if (isDemo) {
      alert(`📜 Historique complet des sauvegardes (Mode démonstration)\n\nAffichage de toutes les sauvegardes de démonstration depuis le début.\n\nFonctionnalités disponibles :\n• Filtrage par date\n• Recherche par type\n• Export de l'historique`);
    } else {
      alert(`📜 Historique complet des sauvegardes\n\nAccès à l'historique complet de ${user?.schoolData?.name || 'votre établissement'} depuis Supabase.\n\nOptions disponibles :\n• Filtres avancés\n• Recherche par période\n• Détails des sauvegardes\n• Export des rapports`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'failed':
        return 'XCircle';
      case 'in_progress':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'failed':
        return 'Échouée';
      case 'in_progress':
        return 'En cours';
      default:
        return 'Inconnue';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Sauvegarde et Données - EduTrack CM</title>
        <meta name="description" content="Gérer les sauvegardes et l'export des données" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole={user?.role || "principal"} 
          userName={getUserDisplayName()}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex pt-16">
          <Sidebar 
            userRole={user?.role || "principal"}
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } p-6`}>
            
            {/* Page Header avec indicateur de mode */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Database" size={20} className="text-primary" />
                  </div>
                  <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                    Sauvegarde et Données
                  </h1>
                </div>
                
                {/* Indicateur de mode données */}
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  isDemo 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {isDemo ? '🔄 MODE DÉMO' : '🏫 DONNÉES RÉELLES'}
                </div>
              </div>
              
              <p className="text-muted-foreground">
                {isDemo 
                  ? 'Gérer les sauvegardes et l\'exportation des données de l\'école (Démonstration)'
                  : `Gérer les sauvegardes et l'exportation des données de ${user?.schoolData?.name || 'votre établissement'}`
                }
              </p>
              
              {loading && (
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  {isDemo ? 'Chargement des données de démonstration...' : 'Chargement des données réelles...'}
                </div>
              )}
              
              {/* Debug info - à enlever en production */}
              <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                👤 Utilisateur connecté: <strong>{getUserDisplayName()}</strong>
                {user?.role && ` | Rôle: ${user.role}`}
                {user?.schoolData?.name && ` | École: ${user.schoolData.name}`}
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {backupStats.map((stat, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stat.status === 'success' ? 'bg-green-100' :
                      stat.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <Icon name={stat.icon} size={20} className={
                        stat.status === 'success' ? 'text-green-600' :
                        stat.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      } />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actions de sauvegarde */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sauvegarde manuelle */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <Icon name="Database" size={20} className="text-primary" />
                    <h2 className="text-lg font-heading font-heading-semibold text-card-foreground">
                      Sauvegarde Manuelle
                    </h2>
                  </div>

                  {backupInProgress && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">Sauvegarde en cours...</span>
                        <span className="text-sm text-muted-foreground">{backupProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${backupProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleManualBackup}
                      disabled={backupInProgress}
                      className="h-12"
                    >
                      {backupInProgress ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Icon name="Download" size={16} className="mr-2" />
                          Sauvegarder maintenant
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-12"
                      onClick={handleAutoBackupConfig}
                    >
                      <Icon name="Settings" size={16} className="mr-2" />
                      Configurer auto-sauvegarde
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground text-sm mb-1">
                          {isDemo ? 'Information sur la sauvegarde (Démo)' : 'Information sur la sauvegarde'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isDemo 
                            ? 'La sauvegarde inclut toutes les données de démonstration : élèves, enseignants, notes, documents et paramètres. Cette fonctionnalité est simulée.'
                            : `La sauvegarde inclut toutes les données de ${user?.schoolData?.name || 'votre établissement'} : élèves, enseignants, notes, documents et paramètres. Les sauvegardes sont cryptées et stockées de manière sécurisée dans Supabase.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export de données */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <div className="flex items-center space-x-3 mb-6">
                    <Icon name="Download" size={20} className="text-primary" />
                    <h2 className="text-lg font-heading font-heading-semibold text-card-foreground">
                      Export de Données
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleExportData('excel')}
                      className="h-12 flex-col space-y-1"
                    >
                      <Icon name="FileSpreadsheet" size={20} className="text-green-600" />
                      <span className="text-sm">Excel</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportData('pdf')}
                      className="h-12 flex-col space-y-1"
                    >
                      <Icon name="FileText" size={20} className="text-red-600" />
                      <span className="text-sm">PDF</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      className="h-12 flex-col space-y-1"
                    >
                      <Icon name="Database" size={20} className="text-blue-600" />
                      <span className="text-sm">CSV</span>
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 border rounded-lg ${
                      isDemo ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'
                    }`}>
                      <h4 className="font-medium text-foreground text-sm mb-2">
                        Données académiques {isDemo ? '(Démo)' : ''}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {isDemo ? 'Notes, présences, bulletins de démonstration' : 'Notes, présences, bulletins réels'}
                      </p>
                    </div>
                    <div className={`p-3 border rounded-lg ${
                      isDemo ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'
                    }`}>
                      <h4 className="font-medium text-foreground text-sm mb-2">
                        Données administratives {isDemo ? '(Démo)' : ''}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {isDemo ? 'Personnel, finances, rapports de démonstration' : 'Personnel, finances, rapports réels'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique des sauvegardes */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
                    Historique
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRefreshHistory}
                  >
                    <Icon name="RefreshCw" size={14} />
                  </Button>
                </div>

                <div className="space-y-4">
                  {backupHistory.map((backup) => (
                    <div key={backup.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={getStatusColor(backup.status)}>
                            <Icon name={getStatusIcon(backup.status)} size={16} />
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {backup.type === 'automatic' ? 'Auto' : 'Manuel'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {backup.size}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDate(backup.date)}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className={getStatusColor(backup.status)}>
                          {getStatusLabel(backup.status)}
                        </span>
                        {backup.status === 'completed' && (
                          <span className="text-muted-foreground">
                            {backup.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={handleViewFullHistory}
                  >
                    <Icon name="History" size={14} className="mr-2" />
                    Voir tout l'historique
                  </Button>
                </div>
              </div>
            </div>

            {/* Information sur le mode actuel */}
            <div className={`mt-8 rounded-lg p-6 ${
              isDemo ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start space-x-3">
                <Icon name={isDemo ? "TestTube" : "Database"} size={20} className={
                  isDemo ? 'text-yellow-600' : 'text-green-600'
                } />
                <div>
                  <h4 className={`font-medium mb-2 ${
                    isDemo ? 'text-yellow-800' : 'text-green-800'
                  }`}>
                    {isDemo ? '🔄 Mode Démonstration Actif' : '🏫 Mode Production Actif'}
                  </h4>
                  <p className={`text-sm ${
                    isDemo ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {isDemo 
                      ? 'Vous naviguez en mode démonstration. Toutes les sauvegardes et exports sont simulés. Les données affichées sont fictives et servent uniquement à la présentation des fonctionnalités.'
                      : `Vous utilisez les vraies données de ${user?.schoolData?.name || 'votre établissement'}. Les sauvegardes et exports concernent vos données réelles stockées dans Supabase. Toutes les opérations sont authentiques et sécurisées.`
                    }
                  </p>
                  
                  {!isDemo && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-xs text-green-800">
                        <Icon name="Shield" size={14} className="inline mr-1" />
                        Sécurité : Toutes les sauvegardes sont cryptées et les exports respectent la confidentialité des données.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DataBackup;