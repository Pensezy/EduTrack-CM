/**
 * SIDEBAR MOBILE RESPONSIVE
 *
 * - Menu hamburger pour mobile
 * - Drawer animé (slide-in)
 * - Overlay avec fermeture au clic
 * - Touch-friendly
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { cn } from '../../utils/responsive';

const MobileSidebar = ({
  userRole = 'student',
  userName = 'User',
  navigationItems = [],
  quickActions = [],
  isOpen = false,
  onClose = () => {}
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('navigation');

  // Fermer au changement de route
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Bloquer le scroll du body quand ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (path) => {
    if (!path) return false;
    const cleanPath = path.split('?')[0];
    return location.pathname === cleanPath || location.pathname.startsWith(cleanPath + '/');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-[998] transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[999] transform transition-transform duration-300 ease-out lg:hidden',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">{userName}</h3>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <Icon name="X" size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('navigation')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'navigation'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon name="Menu" size={16} className="inline mr-2" />
            Navigation
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'quick'
                ? 'text-primary border-b-2 border-primary bg-white'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon name="Zap" size={16} className="inline mr-2" />
            Actions
          </button>
        </div>

        {/* Content */}
        <nav className="flex-1 overflow-y-auto overscroll-contain p-2">
          {activeTab === 'navigation' && (
            <div className="space-y-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                    'active:scale-95',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon name={item.icon} size={20} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    )}
                  </div>
                  {isActive(item.path) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="space-y-1">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg',
                    'text-gray-700 hover:bg-gray-100 transition-all active:scale-95'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={action.icon} size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium flex-1">{action.label}</span>
                  <Icon name="ChevronRight" size={16} className="text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-destructive text-white rounded-lg font-medium hover:bg-destructive/90 transition-colors active:scale-95"
            onClick={() => {
              // Logique de déconnexion
              window.location.href = '/login-authentication';
            }}
          >
            <Icon name="LogOut" size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
