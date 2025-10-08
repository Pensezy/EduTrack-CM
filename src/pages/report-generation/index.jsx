import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import useDashboardData from '../../hooks/useDashboardData';

const ReportGeneration = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    period: 'monthly',
    class: 'all',
    subject: 'all',
    format: 'pdf'
  });

  // Hook pour récupérer les données selon le mode (démo/production)
  const { 
    data, 
    isDemo, 
    isProduction, 
    user 
  } = useDashboardData();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const reportTypes = [
    {
      id: 'academic',
      title: 'Rapport Académique',
      description: 'Performance des élèves par classe et matière',
      icon: 'BookOpen',
      color: 'bg-blue-500',
      fields: ['period', 'class', 'subject']
    },
    {
      id: 'attendance',
      title: 'Rapport de Présence',
      description: 'Statistiques de présence des élèves',
      icon: 'UserCheck',
      color: 'bg-green-500',
      fields: ['period', 'class']
    },
    {
      id: 'financial',
      title: 'Rapport Financier',
      description: 'État des paiements de scolarité',
      icon: 'CreditCard',
      color: 'bg-purple-500',
      fields: ['period', 'class']
    },
    {
      id: 'teacher',
      title: 'Rapport Enseignants',
      description: 'Performance et évaluations du personnel',
      icon: 'Users',
      color: 'bg-orange-500',
      fields: ['period']
    },
    {
      id: 'behavior',
      title: 'Rapport Disciplinaire',
      description: 'Incidents et comportements des élèves',
      icon: 'Shield',
      color: 'bg-red-500',
      fields: ['period', 'class']
    },
    {
      id: 'overall',
      title: 'Rapport Global',
      description: 'Vue d\'ensemble de l\'établissement',
      icon: 'BarChart3',
      color: 'bg-indigo-500',
      fields: ['period']
    }
  ];

  // Rapports récents basés sur le mode de données
  const recentReports = isDemo ? [
    {
      id: 1,
      title: 'Rapport Académique - Septembre 2024 (DÉMO)',
      type: 'academic',
      date: '2024-09-25',
      status: 'ready',
      size: '2.4 MB',
      isDemo: true
    },
    {
      id: 2,
      title: 'Rapport Présence - Semaine 38 (DÉMO)',
      type: 'attendance',
      date: '2024-09-20',
      status: 'ready',
      size: '1.8 MB',
      isDemo: true
    },
    {
      id: 3,
      title: 'Rapport Financier - Trimestre 1 (DÉMO)',
      type: 'financial',
      date: '2024-09-15',
      status: 'generating',
      size: '-',
      isDemo: true
    }
  ] : [
    {
      id: 1,
      title: `Configuration ${user?.schoolData?.name || 'École'} - ${new Date().toLocaleDateString('fr-FR')}`,
      type: 'overall',
      date: new Date().toISOString().split('T')[0],
      status: 'ready',
      size: '1.2 MB',
      isDemo: false
    },
    {
      id: 2,
      title: `Classes configurées - ${user?.schoolData?.type || 'Établissement'}`,
      type: 'academic',
      date: new Date().toISOString().split('T')[0],
      status: 'ready',
      size: '0.8 MB',
      isDemo: false
    },
    {
      id: 3,
      title: 'Rapport système - État opérationnel',
      type: 'teacher',
      date: new Date().toISOString().split('T')[0],
      status: 'ready',
      size: '0.5 MB',
      isDemo: false
    }
  ];

  const handleGenerateReport = (reportType) => {
    if (isDemo) {
      // Mode démo : simulation simple
      setSelectedReport(reportType);
      console.log('🔄 Génération rapport démo:', reportType.title);
      
      setTimeout(() => {
        alert(`📄 Rapport démo "${reportType.title}" simulé avec succès !\n\nℹ️ En mode réel, un fichier ${reportFilters.format.toUpperCase()} serait téléchargé.`);
        setSelectedReport(null);
      }, 1500);
      
    } else {
      // Mode production : génération réelle
      setSelectedReport(reportType);
      console.log('🏫 Génération rapport réel:', reportType.title, 'pour', user?.schoolData?.name);
      console.log('📊 Filtres appliqués:', reportFilters);
      
      // Simulation d'une génération réelle avec les vraies données
      setTimeout(() => {
        // Créer les données du rapport basées sur l'école de l'utilisateur
        const reportData = {
          schoolName: user?.schoolData?.name || 'École',
          schoolType: user?.schoolData?.type || 'Établissement',
          classes: user?.schoolData?.available_classes || [],
          reportType: reportType.title,
          filters: reportFilters,
          generatedAt: new Date().toLocaleString('fr-FR'),
          format: reportFilters.format.toUpperCase()
        };
        
        // Simuler la création d'un fichier
        const blob = new Blob([
          `RAPPORT: ${reportData.reportType}\n`,
          `ÉCOLE: ${reportData.schoolName}\n`,
          `TYPE: ${reportData.schoolType}\n`,
          `CLASSES: ${reportData.classes.join(', ')}\n`,
          `PÉRIODE: ${reportFilters.period}\n`,
          `CLASSE SÉLECTIONNÉE: ${reportFilters.class}\n`,
          `GÉNÉRÉ LE: ${reportData.generatedAt}\n`,
          `\n--- DONNÉES DU RAPPORT ---\n`,
          `Ce fichier contiendrait les vraies données de votre école.\n`,
          `En version complète, il inclurait:\n`,
          `- Statistiques détaillées par classe\n`,
          `- Graphiques et analyses\n`,
          `- Données de performance\n`,
          `- Recommandations personnalisées\n`
        ], { type: 'text/plain' });
        
        // Créer le lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType.title.replace(/\s+/g, '_')}_${reportData.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert(`✅ Rapport "${reportType.title}" généré avec succès !\n\n📁 Fichier téléchargé: ${link.download}\n🏫 École: ${reportData.schoolName}\n📊 Format: ${reportData.format}`);
        setSelectedReport(null);
        
      }, 2500); // Un peu plus long pour le mode réel
    }
  };

  const handleFilterChange = (field, value) => {
    setReportFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return 'CheckCircle';
      case 'generating':
        return 'Clock';
      case 'error':
        return 'XCircle';
      default:
        return 'FileText';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'text-green-500';
      case 'generating':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      <Helmet>
        <title>Génération de Rapports - EduTrack CM</title>
        <meta name="description" content="Générer des rapports personnalisés pour l'école" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole="principal" 
          userName={
            user?.schoolData?.director_name || 
            user?.schoolData?.users?.full_name ||
            user?.full_name ||
            user?.email?.split('@')[0] || 
            'Directeur'
          }
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
            
            {/* Indicateur de mode */}
            {isDemo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={20} className="text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Mode Démonstration</h3>
                    <p className="text-sm text-orange-700">
                      Les rapports affichés sont fictifs. Connectez-vous avec un compte réel pour générer vos vrais rapports.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="FileBarChart" size={20} className="text-primary" />
                  </div>
                  <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                    Génération de Rapports
                  </h1>
                </div>
                {isProduction && (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Mode réel</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                Créer des rapports personnalisés pour {isProduction ? user?.schoolData?.name || 'votre école' : 'l\'école (mode démo)'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Types de rapports */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <h2 className="text-lg font-heading font-heading-semibold text-card-foreground mb-6">
                    Types de Rapports
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map((report) => (
                      <div
                        key={report.id}
                        className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-start space-x-3 mb-4">
                          <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center`}>
                            <Icon name={report.icon} size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground mb-1">
                              {report.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {report.description}
                            </p>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleGenerateReport(report)}
                          className="w-full"
                          disabled={selectedReport?.id === report.id}
                          variant={isDemo ? "outline" : "default"}
                        >
                          {selectedReport?.id === report.id ? (
                            <>
                              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                              {isDemo ? 'Simulation...' : 'Génération...'}
                            </>
                          ) : (
                            <>
                              <Icon name={isDemo ? "TestTube" : "Download"} size={16} className="mr-2" />
                              {isDemo ? 'Simuler' : 'Générer'}
                            </>
                          )}
                        </Button>
                        {isDemo && (
                          <div className="text-xs text-orange-600 mt-2 text-center">
                            Mode démonstration - Simulation uniquement
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtres et historique */}
              <div className="space-y-6">
                {/* Filtres */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                    Filtres
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Période
                      </label>
                      <select
                        value={reportFilters.period}
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                        className="w-full p-2 border border-input bg-background rounded-md"
                      >
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="quarterly">Trimestriel</option>
                        <option value="yearly">Annuel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Classe
                      </label>
                      <select
                        value={reportFilters.class}
                        onChange={(e) => handleFilterChange('class', e.target.value)}
                        className="w-full p-2 border border-input bg-background rounded-md"
                      >
                        <option value="all">
                          {isDemo ? 'Toutes les classes (démo)' : 'Toutes les classes'}
                        </option>
                        {isDemo ? (
                          // Options démo
                          <>
                            <option value="6eme">6ème (démo)</option>
                            <option value="5eme">5ème (démo)</option>
                            <option value="4eme">4ème (démo)</option>
                            <option value="3eme">3ème (démo)</option>
                          </>
                        ) : (
                          // Vraies classes de l'utilisateur
                          user?.schoolData?.available_classes?.map((className, index) => (
                            <option key={index} value={className}>
                              {className}
                            </option>
                          )) || <option value="none">Aucune classe configurée</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Format
                      </label>
                      <select
                        value={reportFilters.format}
                        onChange={(e) => handleFilterChange('format', e.target.value)}
                        className="w-full p-2 border border-input bg-background rounded-md"
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rapports récents */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-heading-semibold text-card-foreground">
                      Rapports Récents
                    </h3>
                    <Button variant="ghost" size="sm">
                      <Icon name="RefreshCw" size={14} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                          report.isDemo 
                            ? 'border-orange-200 bg-orange-50/30' 
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-foreground">
                              {report.title}
                            </h4>
                            {report.isDemo && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                DÉMO
                              </span>
                            )}
                          </div>
                          <span className={`${getStatusColor(report.status)}`}>
                            <Icon name={getStatusIcon(report.status)} size={16} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{report.date}</span>
                          {report.status === 'ready' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={report.isDemo}
                              className={report.isDemo ? 'opacity-50' : ''}
                            >
                              <Icon name="Download" size={12} className="mr-1" />
                              {report.isDemo ? 'Fictif' : report.size}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default ReportGeneration;