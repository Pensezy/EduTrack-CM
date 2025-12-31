import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@edutrack/api';
import { Bell, Search, Menu, User, Settings, LogOut, ChevronDown, X } from 'lucide-react';

export default function TopBar({ user, onMenuClick }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Mock notifications (à remplacer par vraies données plus tard)
  const notifications = [
    { id: 1, message: 'Nouvelle demande d\'inscription', time: 'Il y a 5 min', unread: true },
    { id: 2, message: 'Rapport mensuel disponible', time: 'Il y a 2h', unread: true },
    { id: 3, message: 'Mise à jour système réussie', time: 'Il y a 1 jour', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // TODO: Implémenter la recherche
    }
  };

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="border-r border-gray-200 px-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        {/* Search - Modern Design */}
        <div className="flex flex-1 max-w-2xl items-center">
          <form onSubmit={handleSearch} className="w-full">
            <div className={`
              relative w-full transition-all duration-200
              ${searchFocused ? 'transform scale-105' : ''}
            `}>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className={`h-5 w-5 transition-colors ${
                  searchFocused ? 'text-primary-500' : 'text-gray-400'
                }`} />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`
                  block w-full rounded-full border pl-10 pr-10 py-2 text-sm
                  transition-all duration-200
                  ${searchFocused
                    ? 'border-primary-300 ring-2 ring-primary-100 bg-white'
                    : 'border-gray-300 bg-gray-50 hover:bg-white'
                  }
                  text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:border-primary-500
                `}
                placeholder="Rechercher écoles, élèves, enseignants..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right section */}
        <div className="ml-4 flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-full p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 rounded-full hover:bg-gray-100 p-1 pr-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrateur' :
                   user?.role === 'principal' ? 'Directeur' : 'Utilisateur'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform hidden sm:block ${
                profileMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Mon Profil
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Link>
                </div>
                <div className="border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
