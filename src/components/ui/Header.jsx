import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import useDataMode from '../../hooks/useDataMode';
import AppIcon from '../AppIcon';
import Button from './Button';
import AccessibilityControls from './AccessibilityControls';

const Header = ({ userRole = 'student', userName = 'User', isCollapsed = false, onToggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  
  // Hook pour détecter le mode de données
  const { isDemo, isProduction, user } = useDataMode();

  const navigationItems = {
    student: [
      { label: 'Dashboard', path: '/student-dashboard', icon: 'Home' },
      { label: 'Profile', path: '/student-profile-management', icon: 'User' },
      { label: 'Grades', path: '/grade-management-system', icon: 'BookOpen' },
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard', icon: 'Home' },
      { label: 'Assignments', path: '/teacher-assignment-system', icon: 'FileText' },
      { label: 'Account', path: '/teacher-account-management', icon: 'User' },
    ],
    secretary: [
      { label: 'Paiements', path: '/secretary-dashboard?tab=payments', icon: 'CreditCard' },
      { label: 'Communication', path: '/secretary-dashboard?tab=communications', icon: 'MessageCircle' },
      { label: 'Documents', path: '/secretary-dashboard?tab=documents', icon: 'FileText' },
    ],
    principal: [
      { label: 'Dashboard', path: '/principal-dashboard', icon: 'Home' },
      { label: 'Documents', path: '/document-management-hub?mode=principal', icon: 'FileText' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard', icon: 'Home' },
      { label: 'System Management', path: '/admin-dashboard', icon: 'Settings' },
      { label: 'User Management', path: '/admin-dashboard', icon: 'Users' },
      { label: 'Analytics', path: '/admin-dashboard', icon: 'BarChart3' },
    ]
  };

  const currentNavItems = navigationItems?.[userRole] || navigationItems?.student;

  const notifications = [
    { id: 1, title: 'New grade posted', message: 'Mathematics - Assignment 3', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Parent meeting scheduled', message: 'Tomorrow at 2:00 PM', time: '1 hour ago', type: 'warning' },
    { id: 3, title: 'System maintenance', message: 'Scheduled for tonight', time: '3 hours ago', type: 'info' },
  ];

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
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-navigation">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <AppIcon name="Menu" size={20} />
          </Button>

          {/* Logo */}
          <Link to={currentNavItems?.[0]?.path || '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent">
              <img
                src="/assets/images/mon_logo.png"
                alt="Logo EduTrack CM"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-heading font-heading-bold text-xl text-primary hidden sm:block">
              EduTrack CM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-body font-body-normal transition-micro ${
                    isActive()
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text-primary hover:bg-muted hover:text-primary'
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
          {/* Notifications - Masqué pour Principal (notifications dans le dashboard) */}
          {userRole !== 'principal' && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="relative"
              >
                <AppIcon name="Bell" size={20} />
                {notifications?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-caption font-caption-normal">
                    {notifications?.length}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-lg shadow-modal z-notification">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-heading font-heading-semibold text-sm text-popover-foreground">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications?.map((notification) => (
                      <div
                        key={notification?.id}
                        className="p-4 border-b border-border last:border-b-0 hover:bg-muted transition-micro cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification?.type === 'success' ? 'bg-success' :
                            notification?.type === 'warning' ? 'bg-warning' : 'bg-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-body font-body-semibold text-sm text-popover-foreground">
                              {notification?.title}
                            </p>
                            <p className="font-body font-body-normal text-sm text-muted-foreground mt-1">
                              {notification?.message}
                            </p>
                            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
                              {notification?.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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

          {/* User Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={handleProfileClick}
              className="flex items-center space-x-2 px-3 py-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <AppIcon name="User" size={16} color="white" />
              </div>
              <span className="font-body font-body-normal text-sm text-text-primary hidden md:block">
                {userName}
              </span>
              <AppIcon name="ChevronDown" size={16} className="hidden md:block" />
            </Button>

            {/* Profile Dropdown - Simplifié pour Principal */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userRole}
                    </p>
                  </div>
                  
                  {/* Lien vers paramètres de profil pour tous les rôles */}
                  <Link
                    to="/profile-settings"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <AppIcon name="Settings" size={16} />
                    <span>Mon profil</span>
                  </Link>

                  {userRole !== 'principal' && (
                    <>
                      <Link
                        to="/help"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <AppIcon name="HelpCircle" size={16} />
                        <span>Aide</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                    >
                      <AppIcon name="LogOut" size={16} />
                      <span>{isProduction ? 'Se déconnecter' : 'Quitter la démo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;