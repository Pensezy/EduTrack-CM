import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ userRole = 'student', isCollapsed = false, onToggle }) => {
  const location = useLocation();

  const navigationItems = {
    student: [
      { label: 'Dashboard', path: '/student-dashboard', icon: 'Home', description: 'Aperçu et actions rapides' },
      { label: 'Mon Profil', path: '/student-profile-management', icon: 'User', description: 'Informations personnelles' },
      { label: 'Mes Notes', path: '/grade-management-system', icon: 'BookOpen', description: 'Performance académique' },
      { label: 'Documents', path: '/document-management-hub', icon: 'FileText', description: 'Documents et ressources' }
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home', description: 'Aperçu des classes' },
      { label: 'Devoirs & Notes', path: '/teacher-assignment-system', icon: 'FileText', description: 'Gestion des devoirs' },
      { label: 'Mon Compte', path: '/teacher-account-management', icon: 'User', description: 'Gestion du compte' },
      { label: 'Documents', path: '/document-management-hub', icon: 'Files', description: 'Ressources pédagogiques' }
    ],
    secretary: [
      { label: 'Dashboard', path: '/secretary-dashboard', icon: 'Home', description: 'Aperçu administratif' },
      { label: 'Centre Documents', path: '/document-management-center', icon: 'FileText', description: 'Gestion documentaire' },
      { label: 'Gestion Étudiants', path: '/student-profile-management', icon: 'Users', description: 'Dossiers étudiants' },
      { label: 'Bulletins & Notes', path: '/grade-management-system', icon: 'BookOpen', description: 'Gestion des notes' }
    ],
    principal: [
      { label: 'Vue d\'ensemble', path: '/principal-dashboard', icon: 'Home', description: 'Dashboard principal' },
      { label: 'Analyses', path: '/principal-dashboard?tab=analytics', icon: 'TrendingUp', description: 'Rapports & tendances' },
      { label: 'Enseignants', path: '/principal-dashboard?tab=teachers', icon: 'Users', description: 'Gestion équipe' },
      { label: 'Actions Rapides', path: '/principal-dashboard?tab=actions', icon: 'Zap', description: 'Outils de gestion' },
      { label: 'Paramètres', path: '/principal-dashboard?tab=system', icon: 'Settings', description: 'Configuration' }
    ],
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard', icon: 'Home', description: 'Aperçu système' },
      { label: 'Système', path: '/admin-dashboard', icon: 'Settings', description: 'Configuration système' },
      { label: 'Utilisateurs', path: '/admin-dashboard', icon: 'Users', description: 'Gestion utilisateurs' },
      { label: 'Analytics', path: '/admin-dashboard', icon: 'BarChart3', description: 'Statistiques globales' }
    ]
  };

  const quickActions = {
    student: [
      { label: 'Voir les devoirs', icon: 'FileText', action: () => console.log('View assignments') },
      { label: 'Présences', icon: 'Calendar', action: () => console.log('Check attendance') },
      { label: 'Bulletins', icon: 'FileBarChart', action: () => console.log('View grades') },
    ],
    teacher: [
      { label: 'Nouvelle note', icon: 'Plus', action: () => console.log('Add grade') },
      { label: 'Documents', icon: 'FileText', action: () => console.log('Manage documents') },
      { label: 'Emploi du temps', icon: 'Calendar', action: () => console.log('View schedule') },
    ],
    secretary: [
      { label: 'Nouvel élève', icon: 'UserPlus', action: () => console.log('Add student') },
      { label: 'Rapports', icon: 'FileBarChart', action: () => console.log('Generate report') },
      { label: 'Notifications', icon: 'Mail', action: () => console.log('Send notice') },
      { label: 'Documents', icon: 'FileText', action: () => console.log('Manage documents') },
    ],
    principal: [
      { label: 'Nouveau message', icon: 'Mail', action: () => console.log('Send announcement') },
      { label: 'Exporter données', icon: 'Download', action: () => console.log('Export data') },
      { label: 'Créer rapport', icon: 'FileBarChart', action: () => console.log('Generate report') },
      { label: 'Sauvegarde', icon: 'Database', action: () => console.log('Backup data') },
    ],
    admin: [
      { label: 'Système', icon: 'Settings', action: () => console.log('System settings') },
      { label: 'Sécurité', icon: 'Shield', action: () => console.log('Security settings') },
      { label: 'Backups', icon: 'Database', action: () => console.log('Manage backups') },
      { label: 'Logs', icon: 'FileText', action: () => console.log('View logs') },
    ]
  };

  const currentNavItems = navigationItems?.[userRole] || navigationItems?.student;
  const currentQuickActions = quickActions?.[userRole] || quickActions?.student;

  // Ajouter le CSS pour la scrollbar personnalisée
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .sidebar-scroll::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      .sidebar-scroll {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border z-navigation transition-all duration-state ${
      isCollapsed ? 'w-16' : 'w-64'
    } lg:fixed`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Navigation
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
          </Button>
        </div>

        {/* Navigation Items - Scrollable */}
        <nav 
          className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
        >
          <div className="p-4 space-y-2">
            <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="font-caption font-caption-normal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Main Menu
              </h3>
            )}
            {currentNavItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-2 rounded-lg text-sm font-body font-body-normal transition-micro group ${
                  location?.pathname === item?.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-card-foreground hover:bg-muted hover:text-primary'
                }`}
                title={isCollapsed ? item?.label : ''}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={`flex-shrink-0 ${
                    location?.pathname === item?.path ? 'text-primary-foreground' : ''
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="font-body font-body-semibold">{item?.label}</div>
                    <div className="font-caption font-caption-normal text-xs text-muted-foreground group-hover:text-primary/70">
                      {item?.description}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Actions - Améliorées */}
          <div className="pt-6 border-t border-gray-200">
            {!isCollapsed && (
              <div className="mb-4 pt-4">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Actions Rapides
                </h3>
                <p className="text-xs text-gray-500">Outils de gestion</p>
              </div>
            )}
            <div className="space-y-2">
              {currentQuickActions?.map((action, index) => {
                // Définir des couleurs spécifiques pour chaque type d'action
                const getActionStyle = (actionLabel) => {
                  switch (actionLabel) {
                    case 'Nouveau message':
                      return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300';
                    case 'Exporter données':
                      return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300';
                    case 'Créer rapport':
                      return 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300';
                    case 'Sauvegarde':
                      return 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-300';
                    default:
                      return 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border-gray-200 hover:border-blue-200';
                  }
                };

                return (
                  <button
                    key={index}
                    onClick={action?.action}
                    className={`flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 w-full text-left shadow-sm hover:shadow-md ${getActionStyle(action?.label)}`}
                    title={isCollapsed ? action?.label : ''}
                  >
                    <Icon name={action?.icon} size={18} className="flex-shrink-0" />
                    {!isCollapsed && <span className="ml-2 font-medium">{action?.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border">
          {!isCollapsed ? (
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Lightbulb" size={16} className="text-accent" />
                <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                  Tip
                </span>
              </div>
              <p className="font-body font-body-normal text-xs text-card-foreground">
                Use keyboard shortcuts to navigate faster. Press '?' for help.
              </p>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              title="Help & Tips"
            >
              <Icon name="Lightbulb" size={20} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;