import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// Import all tab components
import StudentManagementTab from './components/StudentManagementTab';
import JustificationTab from './components/JustificationTab';
import PaymentTab from './components/PaymentTab';
import NotificationCenter from './components/NotificationCenter';
import TransferWorkflow from './components/TransferWorkflow';
import DocumentsTab from './components/DocumentsTab';
import PlanningTab from './components/PlanningTab';
import TasksTab from './components/TasksTab';

const SecretaryDashboard = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Récupérer les informations de l'utilisateur connecté
  const { user } = useAuth();

  // Gérer la navigation via les paramètres URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = ['students', 'justifications', 'payments', 'communications', 'transfers', 'documents', 'planning', 'tasks'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const tabs = [
    {
      id: 'tasks',
      label: 'Tâches',
      icon: 'CheckSquare',
      component: TasksTab,
      description: 'Actions du jour'
    },
    {
      id: 'students',
      label: 'Élèves',
      icon: 'Users',
      component: StudentManagementTab,
      description: 'Inscriptions'
    },
    {
      id: 'justifications',
      label: 'Absences',
      icon: 'FileCheck',
      component: JustificationTab,
      description: 'Justificatifs'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: 'CreditCard',
      component: PaymentTab,
      description: 'Frais scolaires'
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: 'Calendar',
      component: PlanningTab,
      description: 'Rendez-vous'
    },
    {
      id: 'communications',
      label: 'Communication',
      icon: 'MessageCircle',
      component: NotificationCenter,
      description: 'SMS & emails'
    }
  ];

  const secondaryTabs = [
    {
      id: 'documents',
      label: 'Documents',
      icon: 'FileText',
      component: DocumentsTab,
      description: 'Certificats'
    },
    {
      id: 'transfers',
      label: 'Transferts',
      icon: 'ArrowRightLeft',
      component: TransferWorkflow,
      description: 'Changements d\'école'
    }
  ];

  const allTabs = [...tabs, ...secondaryTabs];
  const currentTab = allTabs?.find(tab => tab?.id === activeTab);
  const ActiveComponent = currentTab?.component;

  const quickStats = [
    {
      label: 'Élèves inscrits',
      value: '127',
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Justificatifs en attente',
      value: '5',
      icon: 'FileText',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Paiements en retard',
      value: '12',
      icon: 'CreditCard',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Appels parents urgents',
      value: '3',
      icon: 'Phone',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        userRole={user?.role || "secretary"} 
        userName={user?.full_name || user?.name || "Utilisateur"}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {/* Sidebar */}
      <Sidebar 
        userRole={user?.role || "secretary"}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-state ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="font-heading font-heading-bold text-3xl text-text-primary">
                  Tableau de Bord Secrétariat
                </h1>
                <p className="font-body font-body-normal text-text-secondary mt-2">
                  Gestion administrative complète de l'établissement scolaire
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-body font-body-semibold text-sm text-text-primary">
                    {new Date()?.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-text-secondary">
                    Année scolaire 2024-2025
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats?.map((stat, index) => (
              <div key={index} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon name={stat?.icon} size={24} className={stat?.color} />
                  </div>
                  <div>
                    <p className="font-heading font-heading-bold text-2xl text-text-primary">
                      {stat?.value}
                    </p>
                    <p className="font-caption font-caption-normal text-sm text-text-secondary">
                      {stat?.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="bg-card rounded-lg border border-border mb-6">
            {/* Desktop Tab Navigation - Compact Grid */}
            <div className="hidden lg:block p-6">
              {/* Main Tabs - Grid Layout */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeTab === tab?.id ? 'bg-primary/10' : 'bg-muted/30'
                    }`}>
                      <Icon name={tab?.icon} size={20} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-body font-body-semibold text-sm">{tab?.label}</div>
                      <div className="font-caption font-caption-normal text-xs opacity-70">
                        {tab?.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Secondary Tabs - Inline */}
              <div className="flex space-x-3 pt-4 border-t border-border">
                <span className="text-xs font-medium text-text-secondary px-2 py-1">Autres :</span>
                {secondaryTabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-body font-body-medium">{tab?.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden p-4">
              <div className="relative mb-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e?.target?.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-4 py-2 pr-8 font-body font-body-normal text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <optgroup label="Fonctions principales">
                    {tabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Autres fonctions">
                    {secondaryTabs?.map((tab) => (
                      <option key={tab?.id} value={tab?.id}>
                        {tab?.label} - {tab?.description}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <Icon 
                  name="ChevronDown" 
                  size={16} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="bg-accent/5 rounded-lg border border-accent/20 p-6">
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                variant="outline"
                iconName="CheckSquare"
                iconPosition="left"
                onClick={() => setActiveTab('tasks')}
                className="justify-start"
              >
                Mes tâches du jour
              </Button>
              <Button
                variant="outline"
                iconName="Phone"
                iconPosition="left"
                onClick={() => setActiveTab('justifications')}
                className="justify-start"
              >
                Appels parents urgents
              </Button>
              <Button
                variant="outline"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => setActiveTab('planning')}
                className="justify-start"
              >
                Planning rendez-vous
              </Button>
              <Button
                variant="outline"
                iconName="FileText"
                iconPosition="left"
                onClick={() => setActiveTab('documents')}
                className="justify-start"
              >
                Certificats à imprimer
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaryDashboard;