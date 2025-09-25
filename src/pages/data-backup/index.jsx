import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DataBackup = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const backupHistory = [
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

  const backupStats = [
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

  const handleManualBackup = () => {
    setBackupInProgress(true);
    setBackupProgress(0);
    
    // Simulation du processus de sauvegarde
    const incrementProgress = () => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          setBackupInProgress(false);
          alert('Sauvegarde terminée avec succès !');
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
  };

  const handleExportData = (format) => {
    console.log(`Exporting data in ${format} format`);
    alert(`Export en cours au format ${format.toUpperCase()}...`);
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
          userRole="principal" 
          userName="Principal Admin"
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex pt-16">
          <Sidebar 
            userRole="principal"
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } p-6`}>
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Database" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                  Sauvegarde et Données
                </h1>
              </div>
              <p className="text-muted-foreground">
                Gérer les sauvegardes et l'exportation des données de l'école
              </p>
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
                    <Button variant="outline" className="h-12">
                      <Icon name="Settings" size={16} className="mr-2" />
                      Configurer auto-sauvegarde
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground text-sm mb-1">
                          Information sur la sauvegarde
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          La sauvegarde inclut toutes les données de l'école : élèves, enseignants, 
                          notes, documents et paramètres. Les sauvegardes sont cryptées et stockées 
                          de manière sécurisée.
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
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-foreground text-sm mb-2">Données académiques</h4>
                      <p className="text-xs text-muted-foreground">Notes, présences, bulletins</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h4 className="font-medium text-foreground text-sm mb-2">Données administratives</h4>
                      <p className="text-xs text-muted-foreground">Personnel, finances, rapports</p>
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
                  <Button variant="ghost" size="sm">
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
                  <Button variant="ghost" size="sm" className="w-full">
                    <Icon name="History" size={14} className="mr-2" />
                    Voir tout l'historique
                  </Button>
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