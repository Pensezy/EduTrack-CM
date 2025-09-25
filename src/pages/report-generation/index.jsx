import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ReportGeneration = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    period: 'monthly',
    class: 'all',
    subject: 'all',
    format: 'pdf'
  });

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

  const recentReports = [
    {
      id: 1,
      title: 'Rapport Académique - Septembre 2024',
      type: 'academic',
      date: '2024-09-25',
      status: 'ready',
      size: '2.4 MB'
    },
    {
      id: 2,
      title: 'Rapport Présence - Semaine 38',
      type: 'attendance',
      date: '2024-09-20',
      status: 'ready',
      size: '1.8 MB'
    },
    {
      id: 3,
      title: 'Rapport Financier - Trimestre 1',
      type: 'financial',
      date: '2024-09-15',
      status: 'generating',
      size: '-'
    }
  ];

  const handleGenerateReport = (reportType) => {
    setSelectedReport(reportType);
    console.log('Generating report:', reportType, reportFilters);
    // Ici vous ajouteriez la logique de génération
    setTimeout(() => {
      alert(`Rapport ${reportType.title} généré avec succès !`);
      setSelectedReport(null);
    }, 2000);
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
                  <Icon name="FileBarChart" size={20} className="text-primary" />
                </div>
                <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                  Génération de Rapports
                </h1>
              </div>
              <p className="text-muted-foreground">
                Créer des rapports personnalisés et analyser les données
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
                        >
                          {selectedReport?.id === report.id ? (
                            <>
                              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Icon name="Download" size={16} className="mr-2" />
                              Générer
                            </>
                          )}
                        </Button>
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
                        <option value="all">Toutes les classes</option>
                        <option value="6eme">6ème</option>
                        <option value="5eme">5ème</option>
                        <option value="4eme">4ème</option>
                        <option value="3eme">3ème</option>
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
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground">
                            {report.title}
                          </h4>
                          <span className={`${getStatusColor(report.status)}`}>
                            <Icon name={getStatusIcon(report.status)} size={16} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{report.date}</span>
                          {report.status === 'ready' && (
                            <Button variant="ghost" size="sm">
                              <Icon name="Download" size={12} className="mr-1" />
                              {report.size}
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