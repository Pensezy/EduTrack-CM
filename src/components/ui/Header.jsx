import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useDataMode from '../../hooks/useDataMode';
import AppIcon from '../AppIcon';
import Button from './Button';
import AccessibilityControls from './AccessibilityControls';
import MobileSidebar from './MobileSidebar';

const Header = ({ userRole = 'student', userName = 'User', isCollapsed = false, onToggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  
  // Hook pour détecter le mode de données
  const { isDemo, isProduction, user } = useDataMode();

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

  // Charger les notifications selon le mode
  useEffect(() => {
    const loadNotifications = async () => {
      if (isProduction && user?.current_school_id) {
        // Mode production : charger les vraies notifications depuis Supabase
        try {
          setLoadingNotifications(true);
          
          const { data: notifs, error } = await supabase
            .from('notifications')
            .select('id, title, message, type, priority, sent_at')
            .eq('school_id', user.current_school_id)
            .order('sent_at', { ascending: false })
            .limit(5);

          if (error) throw error;

          // Formater les notifications pour l'affichage
          const formattedNotifs = (notifs || []).map(notif => ({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            type: notif.type || 'info',
            time: formatTimeAgo(notif.sent_at)
          }));

          setNotifications(formattedNotifs);
        } catch (error) {
          console.error('❌ Erreur chargement notifications:', error);
          setNotifications([]);
        } finally {
          setLoadingNotifications(false);
        }
      } else if (isDemo) {
        // Mode démo : utiliser les données fictives avec traduction française
        const demoNotifications = [
          { id: 1, title: 'Note ajoutée', message: 'Mathématiques - Devoir 3', time: 'il y a 2 min', type: 'success' },
          { id: 2, title: 'Réunion parent programmée', message: 'Demain à 14h00', time: 'il y a 1h', type: 'warning' },
          { id: 3, title: 'Maintenance système', message: 'Programmée ce soir', time: 'il y a 3h', type: 'info' },
        ];
        setNotifications(demoNotifications);
      }
    };

    loadNotifications();
  }, [isDemo, isProduction, user?.current_school_id]);

  // Fonction pour formater le temps relatif
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const navigationItems = {
    student: [
      { label: 'Tableau de bord', path: '/student-dashboard', icon: 'Home' },
      { label: 'Notes', path: '/student-dashboard?tab=grades', icon: 'BookOpen' },
      { label: 'Devoirs', path: '/student-dashboard?tab=assignments', icon: 'FileText' },
      { label: 'Profil', path: '/student-dashboard?tab=profile', icon: 'User' },
    ],
    parent: [
      { label: 'Dashboard', path: '/parent-dashboard', icon: 'Home' },
      { label: 'Enfants', path: '/parent-dashboard?tab=children', icon: 'Users' },
      { label: 'Notes', path: '/parent-dashboard?tab=grades', icon: 'BookOpen' },
      { label: 'Messages', path: '/parent-dashboard?tab=messages', icon: 'MessageCircle' },
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home' },
      { label: 'Classes', path: '/teacher-dashboard?tab=classes', icon: 'Users' },
      { label: 'Notes', path: '/teacher-dashboard?tab=grades', icon: 'BookOpen' },
      { label: 'Compte', path: '/teacher-dashboard?tab=account', icon: 'User' },
    ],
    secretary: [
      { label: 'Dashboard', path: '/secretary-dashboard', icon: 'Home' },
      { label: 'Urgences', path: '/secretary-dashboard?tab=justifications', icon: 'AlertCircle' },
      { label: 'Communications', path: '/secretary-dashboard?tab=communications', icon: 'MessageCircle' },
    ],
    principal: [
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home' },
      { label: 'Comptes', path: '/principal-dashboard?tab=accounts', icon: 'UserCheck' },
      { label: 'Validation Année', path: '/principal-dashboard?tab=school-year', icon: 'Calendar' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard?tab=overview', icon: 'Home' },
      { label: 'Utilisateurs', path: '/admin-dashboard?tab=users', icon: 'Users' },
      { label: 'Établissements', path: '/admin-dashboard?tab=schools', icon: 'School' },
      { label: 'Finances', path: '/admin-dashboard?tab=finances', icon: 'DollarSign' },
      { label: 'Analytics', path: '/admin-dashboard?tab=analytics', icon: 'TrendingUp' },
      { label: 'Sécurité', path: '/admin-dashboard?tab=security', icon: 'Shield' }
    ]
  };

  const quickActions = {
    student: [
      { label: 'Devoirs en retard', icon: 'AlertCircle', path: '/student-dashboard?tab=assignments' },
      { label: 'Dernières notes', icon: 'TrendingUp', path: '/student-dashboard?tab=grades' },
      { label: 'Mes badges', icon: 'Award', path: '/student-dashboard' },
    ],
    teacher: [
      { label: 'Nouvelle note', icon: 'Plus', path: '/teacher-dashboard?tab=grades' },
      { label: 'Prendre présence', icon: 'CheckSquare', path: '/teacher-dashboard?tab=attendance' },
      { label: 'Voir mes classes', icon: 'Users', path: '/teacher-dashboard?tab=classes' },
    ],
    secretary: [
      { label: 'Nouvel Élève', icon: 'UserPlus', path: '/secretary-dashboard?tab=students' },
      { label: 'Nouveau Paiement', icon: 'Plus', path: '/secretary-dashboard?tab=payments' },
      { label: 'Envoyer SMS', icon: 'MessageCircle', path: '/secretary-dashboard?tab=communications' }
    ],
    principal: [
      { label: 'Créer compte', icon: 'UserPlus', path: '/principal-dashboard?tab=accounts' },
      { label: 'Nouveau message', icon: 'Mail', path: '/notification-management' },
      { label: 'Sauvegarde', icon: 'Database', path: '/data-backup' },
    ],
    parent: [
      { label: 'Voir les notes', icon: 'BookOpen', path: '/parent-dashboard?tab=grades' },
      { label: 'Consulter présences', icon: 'Calendar', path: '/parent-dashboard?tab=attendance' },
      { label: 'Effectuer paiement', icon: 'CreditCard', path: '/parent-dashboard?tab=payments' },
    ],
    admin: [
      { label: 'Utilisateurs', icon: 'Users', path: '/admin-dashboard?tab=users' },
      { label: 'Finances', icon: 'DollarSign', path: '/admin-dashboard?tab=finances' },
      { label: 'Sécurité', icon: 'Shield', path: '/admin-dashboard?tab=security' }
    ]
  };

  const currentNavItems = navigationItems?.[actualUserRole] || navigationItems?.student;
  const currentQuickActions = quickActions?.[actualUserRole] || quickActions?.student;

  // Debug pour identifier les problèmes de rôle
  useEffect(() => {
    console.log('🔍 Header Debug:', {
      userRole,
      actualUserRole,
      pathname: location.pathname,
      userName,
      hasNavItems: !!navigationItems?.[actualUserRole],
      currentNavItems: currentNavItems?.map(item => item.label)
    });
  }, [userRole, userName, currentNavItems]);

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Déconnecter de Supabase si connecté
      if (isProduction) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log('Erreur lors de la déconnexion:', error.message);
    }
    
    // Rediriger vers school-management dans tous les cas
    window.location.href = '/school-management';
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/50 backdrop-blur-xl border-b border-gray-200/50 z-navigation shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden hover:bg-blue-100/50 transition-all duration-300"
            aria-label="Ouvrir le menu"
          >
            <AppIcon name="Menu" size={24} className="text-blue-600" />
          </Button>

          {/* Logo - Modernisé */}
          <Link to={currentNavItems?.[0]?.path || '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <img
                src="/assets/images/mon_logo.png"
                alt="Logo EduTrack CM"
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-heading-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EduTrack CM
              </span>
              <p className="text-xs text-gray-500 font-medium">Gestion Scolaire</p>
            </div>
          </Link>

          {/* Desktop Navigation - Modernisé */}
          <nav className="hidden lg:flex items-center space-x-2">
            {currentNavItems?.slice(0, 4)?.map((item) => {
              // Logique pour déterminer si le lien est actif
              const isActive = () => {
                if (item?.path?.includes('?')) {
                  // Pour les liens avec paramètres (ex: /principal-dashboard?tab=analytics)
                  const [pathname, search] = item?.path?.split('?');
                  return location?.pathname === pathname && location?.search === `?${search}`;
                } else {
                  // Pour les liens simples
                  return location?.pathname === item?.path;
                }
              };

              return (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-body font-body-semibold transition-all duration-300 ${
                    isActive()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:scale-102'
                  }`}
                >
                  <AppIcon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section - Actions and Profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications - Modernisé */}
          {userRole !== 'principal' && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="relative hover:bg-blue-50 transition-all duration-300 group"
              >
                <AppIcon name="Bell" size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
                {notifications?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md animate-pulse">
                    {notifications?.length}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown - Modernisé */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-notification animate-fadeIn">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                          <AppIcon name="Bell" size={16} className="text-white" />
                        </div>
                        <h3 className="font-heading font-heading-semibold text-base text-gray-900">
                          Notifications
                        </h3>
                      </div>
                      {/* Indicateur de mode */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        isDemo 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-green-100 text-green-800 border border-green-300'
                      }`}>
                        {isDemo ? '🎭 Démo' : '✅ Prod'}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification?.id}
                          className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-1 shadow-sm group-hover:scale-110 transition-transform ${
                              notification?.type === 'success' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                              notification?.type === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                              'bg-gradient-to-br from-blue-400 to-indigo-500'
                            }`}>
                              <AppIcon name={
                                notification?.type === 'success' ? 'CheckCircle' :
                                notification?.type === 'warning' ? 'AlertTriangle' : 'Info'
                              } size={18} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-body-semibold text-sm text-gray-900">
                                {notification?.title}
                              </p>
                              <p className="font-body font-body-normal text-sm text-gray-600 mt-1">
                                {notification?.message}
                              </p>
                              <p className="font-caption font-caption-normal text-xs text-gray-500 mt-1 flex items-center">
                                <AppIcon name="Clock" size={12} className="mr-1" />
                                {notification?.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <AppIcon name="Bell" size={24} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {isProduction 
                            ? 'Aucune notification' 
                            : 'Pas de notifications'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-border">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile - Modernisé */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleProfileClick}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-blue-50 rounded-full transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <AppIcon name="User" size={18} color="white" />
              </div>
              <div className="hidden md:block text-left">
                <span className="font-body font-body-semibold text-sm text-gray-900 block">
                  {userName || "Utilisateur"}
                </span>
                <span className="font-caption text-xs text-gray-500">
                  {actualUserRole === 'secretary' ? 'Secrétaire' : 
                   actualUserRole === 'principal' ? 'Directeur' :
                   actualUserRole === 'teacher' ? 'Enseignant' :
                   actualUserRole === 'student' ? 'Élève' :
                   actualUserRole === 'parent' ? 'Parent' :
                   actualUserRole === 'admin' ? 'Admin' : actualUserRole}
                </span>
              </div>
              <AppIcon name="ChevronDown" size={16} className="hidden md:block text-gray-500 group-hover:text-blue-600 transition-colors" />
            </Button>

            {/* Profile Dropdown - Modernisé */}
            {isProfileOpen && (
              <div className="absolute right-0 top-14 w-64 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 animate-fadeIn">
                <div className="p-4">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <AppIcon name="User" size={20} color="white" />
                      </div>
                      <div>
                        <p className="font-heading font-heading-semibold text-sm text-gray-900">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-600 capitalize flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          {actualUserRole === 'secretary' ? 'Secrétaire' : 
                           actualUserRole === 'principal' ? 'Directeur' :
                           actualUserRole === 'teacher' ? 'Enseignant' :
                           actualUserRole === 'student' ? 'Élève' :
                           actualUserRole === 'parent' ? 'Parent' :
                           actualUserRole === 'admin' ? 'Administrateur' : actualUserRole}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lien vers paramètres de profil */}
                  <Link
                    to="/profile-settings"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <AppIcon name="Settings" size={16} className="text-blue-600" />
                    </div>
                    <span className="font-body font-body-medium">Mon profil</span>
                  </Link>

                  {/* Lien Aide */}
                  <Link
                    to="/help"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-all duration-300 group"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <AppIcon name="HelpCircle" size={16} className="text-purple-600" />
                    </div>
                    <span className="font-body font-body-medium">Aide</span>
                  </Link>

                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 w-full text-left group"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <AppIcon name="LogOut" size={16} className="text-red-600" />
                      </div>
                      <span className="font-body font-body-semibold">{isProduction ? 'Se déconnecter' : 'Quitter la démo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        userRole={actualUserRole}
        userName={userName}
        navigationItems={currentNavItems}
        quickActions={currentQuickActions}
      />
    </header>
  );
};

export default Header;