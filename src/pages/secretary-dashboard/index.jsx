import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// Import all tab components
import StudentManagementTab from './components/StudentManagementTab';
import GradeEntryTab from './components/GradeEntryTab';
import AttendanceTab from './components/AttendanceTab';
import PaymentTab from './components/PaymentTab';
import NotificationCenter from './components/NotificationCenter';
import TransferWorkflow from './components/TransferWorkflow';

const SecretaryDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Récupérer les informations de l'utilisateur connecté
  const { user } = useAuth();

  const tabs = [
    {
      id: 'students',
      label: 'Gestion des Élèves',
      icon: 'Users',
      component: StudentManagementTab,
      description: 'Inscriptions et profils'
    },
    {
      id: 'grades',
      label: 'Saisie des Notes',
      icon: 'BookOpen',
      component: GradeEntryTab,
      description: 'Évaluations et bulletins'
    },
    {
      id: 'attendance',
      label: 'Présences',
      icon: 'Calendar',
      component: AttendanceTab,
      description: 'Suivi quotidien'
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: 'CreditCard',
      component: PaymentTab,
      description: 'Frais de scolarité'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      component: NotificationCenter,
      description: 'SMS et emails'
    },
    {
      id: 'transfers',
      label: 'Transferts',
      icon: 'ArrowRightLeft',
      component: TransferWorkflow,
      description: 'Changements d\'école'
    }
  ];

  const currentTab = tabs?.find(tab => tab?.id === activeTab);
  const ActiveComponent = currentTab?.component;

  const quickStats = [
    {
      label: 'Élèves actifs',
      value: '127',
      icon: 'Users',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Absences aujourd\'hui',
      value: '8',
      icon: 'AlertTriangle',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Paiements en attente',
      value: '23',
      icon: 'Clock',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Messages envoyés',
      value: '45',
      icon: 'MessageSquare',
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
            {/* Desktop Tab Navigation */}
            <div className="hidden lg:block border-b border-border">
              <nav className="flex space-x-8 px-6">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-body font-body-semibold text-sm transition-micro ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <div className="text-left">
                      <div>{tab?.label}</div>
                      <div className="font-caption font-caption-normal text-xs opacity-70">
                        {tab?.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden border-b border-border p-4">
              <div className="relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e?.target?.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-4 py-2 pr-8 font-body font-body-normal text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {tabs?.map((tab) => (
                    <option key={tab?.id} value={tab?.id}>
                      {tab?.label} - {tab?.description}
                    </option>
                  ))}
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
                iconName="UserPlus"
                iconPosition="left"
                onClick={() => setActiveTab('students')}
                className="justify-start"
              >
                Nouvel élève
              </Button>
              <Button
                variant="outline"
                iconName="Calendar"
                iconPosition="left"
                onClick={() => setActiveTab('attendance')}
                className="justify-start"
              >
                Prendre les présences
              </Button>
              <Button
                variant="outline"
                iconName="Mail"
                iconPosition="left"
                onClick={() => setActiveTab('notifications')}
                className="justify-start"
              >
                Envoyer un message
              </Button>
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={() => console.log('Export data')}
                className="justify-start"
              >
                Exporter les données
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaryDashboard;