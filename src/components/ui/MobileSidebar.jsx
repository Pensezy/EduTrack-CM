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

  // Debug - vérifier les props reçues
  useEffect(() => {
    if (isOpen) {
      console.log('📱 MobileSidebar ouvert:', {
        userRole,
        userName,
        navigationItems: navigationItems?.length || 0,
        quickActions: quickActions?.length || 0,
        activeTab
      });
    }
  }, [isOpen, userRole, userName, navigationItems, quickActions, activeTab]);

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
          'fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-out lg:hidden',
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
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('navigation');
              console.log('Tab Navigation clicked');
            }}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
              'active:scale-95 cursor-pointer touch-manipulation',
              activeTab === 'navigation'
                ? 'text-primary border-b-2 border-primary bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-label="Onglet Navigation"
            aria-pressed={activeTab === 'navigation'}
          >
            <Icon name="Menu" size={16} className="inline mr-2" />
            Navigation
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('quick');
              console.log('Tab Actions clicked');
            }}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-all duration-200',
              'active:scale-95 cursor-pointer touch-manipulation',
              activeTab === 'quick'
                ? 'text-primary border-b-2 border-primary bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-label="Onglet Actions rapides"
            aria-pressed={activeTab === 'quick'}
          >
            <Icon name="Zap" size={16} className="inline mr-2" />
            Actions
          </button>
        </div>

        {/* Content */}
        <nav className="flex-1 overflow-y-auto overscroll-contain p-2">
          {activeTab === 'navigation' && (
            <div className="space-y-1">
              {navigationItems && navigationItems.length > 0 ? (
                navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={onClose}
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Icon name="Menu" size={48} className="text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500 font-medium">Aucun élément de navigation</p>
                  <p className="text-xs text-gray-400 mt-2">Les liens de navigation apparaîtront ici</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="space-y-1">
              {quickActions && quickActions.length > 0 ? (
                quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    onClick={onClose}
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Icon name="Zap" size={48} className="text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500 font-medium">Aucune action rapide</p>
                  <p className="text-xs text-gray-400 mt-2">Les actions rapides apparaîtront ici</p>
                </div>
              )}
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
