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
  ClipboardList,
  Edit3,
  Building2,
  ShoppingBag,
  BarChart3,
  FileCheck
} from 'lucide-react';
import SidebarGroup from './SidebarGroup';

// Configuration de navigation par rôle avec groupements
const getNavigationForRole = (role) => {
  if (role === 'admin') {
    return {
      standalone: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
      groups: [
        {
          id: 'schools-management',
          label: 'Gestion Écoles',
          icon: Building2,
          defaultOpen: true,
          items: [
            { name: 'Écoles', href: '/schools', icon: School },
            { name: 'Demandes Établissements', href: '/schools/requests', icon: FileCheck },
            { name: 'Utilisateurs', href: '/users', icon: Users },
            { name: 'Classes', href: '/classes', icon: GraduationCap },
            { name: 'Personnel', href: '/personnel', icon: UserCog },
            { name: 'Demandes Inscription', href: '/enrollment', icon: FileText },
          ]
        },
        {
          id: 'app-store',
          label: 'App Store',
          icon: ShoppingBag,
          defaultOpen: true,
          items: [
            { name: 'Catalogue Apps', href: '/apps-catalog', icon: Grid3x3 },
            { name: 'Demandes Apps', href: '/app-requests', icon: ClipboardList },
            { name: 'Gérer Packs', href: '/manage-bundles', icon: Edit3 },
            { name: 'Catalogue Packs', href: '/bundles-catalog', icon: Package },
            { name: 'Demandes Packs', href: '/bundle-requests', icon: ClipboardList },
          ]
        },
        {
          id: 'analytics',
          label: 'Statistiques',
          icon: BarChart3,
          defaultOpen: false,
          items: [
            // Placeholder pour futures fonctionnalités analytics
            // { name: 'Vue d\'ensemble', href: '/analytics', icon: BarChart3 },
          ]
        }
      ],
      settings: { name: 'Paramètres', href: '/settings', icon: Settings }
    };
  } else if (role === 'principal') {
    return {
      standalone: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
      groups: [
        {
          id: 'school-management',
          label: 'Mon École',
          icon: Building2,
          defaultOpen: true,
          items: [
            { name: 'Informations', href: '/schools', icon: School },
            { name: 'Classes', href: '/classes', icon: GraduationCap },
          ]
        },
        {
          id: 'users-management',
          label: 'Gestion des Utilisateurs',
          icon: Users,
          defaultOpen: true,
          items: [
            { name: 'Personnel', href: '/personnel', icon: UserCog },
            { name: 'Élèves & Parents', href: '/users', icon: Users },
          ]
        },
        {
          id: 'apps',
          label: 'Applications',
          icon: ShoppingBag,
          defaultOpen: true,
          items: [
            { name: 'App Store', href: '/app-store', icon: Store },
            { name: 'Mes Apps', href: '/my-apps', icon: Package },
          ]
        }
      ],
      settings: { name: 'Paramètres', href: '/settings', icon: Settings }
    };
  }

  // Fallback pour autres rôles
  return {
    standalone: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
    groups: [],
    settings: { name: 'Paramètres', href: '/settings', icon: Settings }
  };
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
        {/* Items standalone (Dashboard) */}
        {navigation.standalone?.map((item) => {
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
            </Link>
          );
        })}

        {/* Séparateur */}
        {navigation.standalone?.length > 0 && navigation.groups?.length > 0 && (
          <div className="my-3 border-t border-primary-600"></div>
        )}

        {/* Groupes collapsibles */}
        {navigation.groups?.map((group) => {
          // Ne pas afficher les groupes vides
          if (!group.items || group.items.length === 0) return null;

          return (
            <SidebarGroup
              key={group.id}
              label={group.label}
              icon={group.icon}
              defaultOpen={group.defaultOpen}
              badge={group.badge}
              badgeColor={group.badgeColor}
            >
              {group.items.map((item) => {
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
                          mr-3 h-4 w-4 flex-shrink-0
                          ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}
                        `}
                      />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-400 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </SidebarGroup>
          );
        })}

        {/* Séparateur avant Paramètres */}
        {navigation.settings && (
          <div className="my-3 border-t border-primary-600"></div>
        )}

        {/* Paramètres */}
        {navigation.settings && (() => {
          const Icon = navigation.settings.icon;
          const active = isActive(navigation.settings.href);

          return (
            <Link
              to={navigation.settings.href}
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
                {navigation.settings.name}
              </div>
            </Link>
          );
        })()}
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
