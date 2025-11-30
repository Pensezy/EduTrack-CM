import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ userRole = 'student', isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Détecter le vrai rôle basé sur l'URL si userRole n'est pas correct
  const detectRoleFromUrl = () => {
    if (location.pathname.includes('/secretary-dashboard')) return 'secretary';
    if (location.pathname.includes('/principal-dashboard')) return 'principal';
    if (location.pathname.includes('/teacher-dashboard')) return 'teacher';
    if (location.pathname.includes('/student-dashboard')) return 'student';
    if (location.pathname.includes('/parent-dashboard')) return 'parent';
    if (location.pathname.includes('/admin-dashboard')) return 'admin';
    return userRole;
  };

  const actualUserRole = detectRoleFromUrl();

  const navigationItems = {
    student: [
      { label: 'Tableau de bord', path: '/student-dashboard', icon: 'Home', description: 'Vue d\'ensemble' },
      { label: 'Mes Notes', path: '/student-dashboard?tab=grades', icon: 'BookOpen', description: 'Performance académique' },
      { label: 'Mes Devoirs', path: '/student-dashboard?tab=assignments', icon: 'FileText', description: 'Travaux à rendre' },
      { label: 'Présences', path: '/student-dashboard?tab=attendance', icon: 'Calendar', description: 'Historique de présence' },
      { label: 'Emploi du temps', path: '/student-dashboard?tab=schedule', icon: 'Clock', description: 'Planning hebdomadaire' },
      { label: 'Mon Profil', path: '/student-dashboard?tab=profile', icon: 'User', description: 'Informations personnelles' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home', description: 'Aperçu des classes' },
      { label: 'Mes Classes', path: '/teacher-dashboard?tab=classes', icon: 'Users', description: 'Gestion des classes' },
      { label: 'Notes', path: '/teacher-dashboard?tab=grades', icon: 'BookOpen', description: 'Saisie des notes' },
      { label: 'Présences', path: '/teacher-dashboard?tab=attendance', icon: 'Calendar', description: 'Prise de présence' },
      { label: 'Documents', path: '/teacher-dashboard?tab=documents', icon: 'Files', description: 'Ressources pédagogiques' },
      { label: 'Mon Compte', path: '/teacher-dashboard?tab=account', icon: 'User', description: 'Gestion du compte' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ],
    secretary: [
      { label: 'Dashboard', path: '/secretary-dashboard', icon: 'Home', description: 'Retour à l\'accueil' },
      { label: 'Transferts', path: '/secretary-dashboard?tab=transfers', icon: 'ArrowRightLeft', description: 'Changements d\'école' },
      { label: 'Documents', path: '/secretary-dashboard?tab=documents', icon: 'FileText', description: 'Certificats & attestations' },
      { label: 'Année Scolaire', path: '/secretary-dashboard?tab=schoolyear', icon: 'RotateCcw', description: 'Transition d\'année' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ],
    principal: [
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home', description: 'Dashboard principal' },
      { label: 'Comptes', path: '/principal-dashboard?tab=accounts', icon: 'UserCheck', description: 'Gestion des comptes' },
      { label: 'Système', path: '/principal-dashboard?tab=system', icon: 'Settings', description: 'Configuration avancée' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ],
    parent: [
      { label: 'Dashboard', path: '/parent-dashboard', icon: 'Home', description: 'Vue d\'ensemble' },
      { label: 'Mes Enfants', path: '/parent-dashboard?tab=children', icon: 'Users', description: 'Suivi des enfants' },
      { label: 'Notes', path: '/parent-dashboard?tab=grades', icon: 'BookOpen', description: 'Résultats scolaires' },
      { label: 'Présences', path: '/parent-dashboard?tab=attendance', icon: 'Calendar', description: 'Assiduité' },
      { label: 'Paiements', path: '/parent-dashboard?tab=payments', icon: 'CreditCard', description: 'Frais scolaires' },
      { label: 'Messages', path: '/parent-dashboard?tab=messages', icon: 'MessageCircle', description: 'Communications' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ],
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard?tab=overview', icon: 'Home', description: 'Aperçu système' },
      { label: 'Utilisateurs', path: '/admin-dashboard?tab=users', icon: 'Users', description: 'Gestion utilisateurs' },
      { label: 'Établissements', path: '/admin-dashboard?tab=schools', icon: 'School', description: 'Gestion établissements' },
      { label: 'Finances', path: '/admin-dashboard?tab=finances', icon: 'DollarSign', description: 'Gestion financière' },
      { label: 'Analytics', path: '/admin-dashboard?tab=analytics', icon: 'BarChart3', description: 'Statistiques' },
      { label: 'Sécurité', path: '/admin-dashboard?tab=security', icon: 'Shield', description: 'Sécurité système' },
      { label: 'Aide', path: '/help', icon: 'HelpCircle', description: 'Centre d\'aide' }
    ]
  };

  const quickActions = {
    student: [
      { label: 'Devoirs en retard', icon: 'AlertCircle', path: '/student-dashboard?tab=assignments' },
      { label: 'Dernières notes', icon: 'TrendingUp', path: '/student-dashboard?tab=grades' },
      { label: 'Mes badges', icon: 'Award', path: '/student-dashboard' },
      { label: 'Messages non lus', icon: 'Mail', path: '/student-dashboard?tab=messages' },
    ],
    teacher: [
      { label: 'Nouvelle note', icon: 'Plus', path: '/teacher-dashboard?tab=grades' },
      { label: 'Prendre présence', icon: 'CheckSquare', path: '/teacher-dashboard?tab=attendance' },
      { label: 'Mes documents', icon: 'FileText', path: '/teacher-dashboard?tab=documents' },
      { label: 'Voir mes classes', icon: 'Users', path: '/teacher-dashboard?tab=classes' },
    ],
    secretary: [
      { label: 'Nouvel Élève', icon: 'UserPlus', path: '/secretary-dashboard?tab=students' },
      { label: 'Nouveau Paiement', icon: 'Plus', path: '/secretary-dashboard?tab=payments' },
      { label: 'Imprimer Cartes', icon: 'Printer', path: '/secretary-dashboard?tab=cards' },
      { label: 'Planifier RDV', icon: 'Calendar', path: '/secretary-dashboard?tab=planning' },
      { label: 'Envoyer SMS', icon: 'MessageCircle', path: '/secretary-dashboard?tab=communications' }
    ],
    principal: [
      { label: 'Créer compte personnel', icon: 'UserPlus', path: '/principal-dashboard?tab=accounts&subtab=create' },
      { label: 'Nouveau message', icon: 'Mail', path: '/notification-management' },
      { label: 'Créer rapport', icon: 'FileBarChart', path: '/report-generation' },
      { label: 'Sauvegarde', icon: 'Database', path: '/data-backup' },
    ],
    parent: [
      { label: 'Voir les notes', icon: 'BookOpen', path: '/parent-dashboard?tab=grades' },
      { label: 'Consulter présences', icon: 'Calendar', path: '/parent-dashboard?tab=attendance' },
      { label: 'Effectuer paiement', icon: 'CreditCard', path: '/parent-dashboard?tab=payments' },
      { label: 'Messages enseignants', icon: 'Mail', path: '/parent-dashboard?tab=messages' },
    ],
    admin: [
      { label: 'Utilisateurs', icon: 'Users', path: '/admin-dashboard?tab=users' },
      { label: 'Finances', icon: 'DollarSign', path: '/admin-dashboard?tab=finances' },
      { label: 'Analytics', icon: 'TrendingUp', path: '/admin-dashboard?tab=analytics' },
      { label: 'Sécurité', icon: 'Shield', path: '/admin-dashboard?tab=security' }
    ]
  };

  const currentNavItems = navigationItems?.[actualUserRole] || navigationItems?.student;
  const currentQuickActions = quickActions?.[actualUserRole] || quickActions?.student;

  // Debug pour vérifier la détection du rôle
  console.log('🔍 Sidebar Debug:', { 
    userRole, 
    actualUserRole,
    pathname: location.pathname,
    navItemsCount: currentNavItems?.length,
    quickActionsCount: currentQuickActions?.length 
  });

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
                    case 'Nouveau secrétaire':
                      return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300';
                    case 'Nouveau message':
                      return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300';
                    case 'Créer rapport':
                      return 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300';
                    case 'Sauvegarde':
                      return 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-300';
                    default:
                      return 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border-gray-200 hover:border-blue-200';
                  }
                };

                return (
                  <Link
                    key={index}
                    to={action?.path}
                    className={`flex items-center ${!isCollapsed ? 'space-x-3' : 'justify-center'} px-3 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 w-full shadow-sm hover:shadow-md ${getActionStyle(action?.label)}`}
                    title={isCollapsed ? action?.label : ''}
                  >
                    <Icon name={action?.icon} size={18} className="flex-shrink-0" />
                    {!isCollapsed && <span className="ml-2 font-medium">{action?.label}</span>}
                  </Link>
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