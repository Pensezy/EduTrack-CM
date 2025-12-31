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
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Écoles', href: '/schools', icon: School },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Classes', href: '/classes', icon: GraduationCap },
  { name: 'Demandes', href: '/enrollment', icon: FileText },
  { name: 'Personnel', href: '/personnel', icon: UserCog },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-primary-700 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 py-5 bg-primary-800">
          <School className="h-8 w-8 text-white" />
          <span className="ml-3 text-xl font-heading font-bold text-white">
            EduTrack Admin
          </span>
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
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-colors duration-150
                  ${active
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${active ? 'text-white' : 'text-primary-300 group-hover:text-white'}
                  `}
                />
                {item.name}
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
    </div>
  );
}
