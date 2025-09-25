import React, { useState } from 'react';
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
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home', description: 'Vue d\'ensemble' },
      { label: 'Analytics', path: '/principal-dashboard?tab=analytics', icon: 'BarChart3', description: 'Statistiques école' },
      { label: 'Actions', path: '/principal-dashboard?tab=actions', icon: 'Zap', description: 'Actions rapides' },
      { label: 'Système', path: '/principal-dashboard?tab=system', icon: 'Settings', description: 'Configuration système' },
      { label: 'Documents', path: '/document-management-hub', icon: 'FileText', description: 'Gestion documents' },
      { label: 'Enseignants', path: '/principal-dashboard?tab=teachers', icon: 'Users', description: 'Gestion enseignants' }
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
      { label: 'Rapports', icon: 'FileBarChart', action: () => console.log('View reports') },
      { label: 'Statistiques', icon: 'TrendingUp', action: () => console.log('School analytics') },
      { label: 'Enseignants', icon: 'Users', action: () => console.log('Manage teachers') },
      { label: 'Documents', icon: 'FileText', action: () => console.log('Manage documents') },
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

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
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

          {/* Quick Actions */}
          <div className="pt-6">
            {!isCollapsed && (
              <h3 className="font-caption font-caption-normal text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
            )}
            <div className="space-y-1">
              {currentQuickActions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action?.action}
                  className={`flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-2 rounded-lg text-sm font-body font-body-normal text-card-foreground hover:bg-muted hover:text-primary transition-micro w-full text-left`}
                  title={isCollapsed ? action?.label : ''}
                >
                  <Icon name={action?.icon} size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{action?.label}</span>}
                </button>
              ))}
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