import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@edutrack/api';
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  FileText,
  UserCog,
  Settings,
  LogOut,
  X,
  Store,
  Package,
  Grid3x3,
  ClipboardList
} from 'lucide-react';

// Configuration de navigation par rôle
const getNavigationForRole = (role) => {
  // Menu de base pour tous
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'principal'] },
  ];

  // Menus spécifiques admin
  const adminOnlyMenus = [
    { name: 'Écoles', href: '/schools', icon: School, roles: ['admin'] },
    { name: 'Utilisateurs', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Classes', href: '/classes', icon: GraduationCap, roles: ['admin'] },
    { name: 'Demandes Inscription', href: '/enrollment', icon: FileText, roles: ['admin'] },
    { name: 'Personnel', href: '/personnel', icon: UserCog, roles: ['admin'] },
    { name: 'Catalogue Apps', href: '/apps-catalog', icon: Grid3x3, roles: ['admin'] },
    { name: 'Demandes d\'Accès', href: '/app-requests', icon: ClipboardList, badge: 'new', roles: ['admin'] },
  ];

  // Menus spécifiques directeur
  const principalOnlyMenus = [
    { name: 'Mon École', href: '/schools', icon: School, roles: ['principal'] },
    { name: 'Personnel', href: '/users', icon: Users, roles: ['principal'] },
    { name: 'Classes', href: '/classes', icon: GraduationCap, roles: ['principal'] },
    { name: 'Élèves & Parents', href: '/personnel', icon: UserCog, roles: ['principal'] },
    { name: 'App Store', href: '/app-store', icon: Store, roles: ['principal'] },
    { name: 'Mes Apps', href: '/my-apps', icon: Package, roles: ['principal'] },
  ];

  // Menu commun
  const commonMenus = [
    { name: 'Paramètres', href: '/settings', icon: Settings, roles: ['admin', 'principal'] },
  ];

  // Construire le menu selon le rôle
  if (role === 'admin') {
    return [...baseNavigation, ...adminOnlyMenus, ...commonMenus];
  } else if (role === 'principal') {
    return [...baseNavigation, ...principalOnlyMenus, ...commonMenus];
  }

  return baseNavigation;
};

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Obtenir le menu de navigation selon le rôle de l'utilisateur
  const navigation = getNavigationForRole(user?.role);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col flex-grow bg-primary-700 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-5 bg-primary-800">
        <div className="flex items-center">
          <img
            src="/assets/images/mon_logo.png"
            alt="EduTrack Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="ml-3 text-xl font-heading font-bold text-white">
            {user?.role === 'admin' ? 'EduTrack Admin' : 'EduTrack Directeur'}
          </span>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden text-white hover:text-gray-200 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={`
                group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md
                transition-colors duration-150
                ${active
                  ? 'bg-primary-800 text-white'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }
              `}
            >
              <div className="flex items-center">
                <Icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}
                  `}
                />
                {item.name}
              </div>
              {item.badge === 'new' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-400 text-white">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
        <button
          onClick={handleLogout}
          className="flex-shrink-0 w-full group block text-primary-100 hover:text-white transition-colors"
        >
          <div className="flex items-center">
            <LogOut className="inline-block h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Déconnexion</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col z-50 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
