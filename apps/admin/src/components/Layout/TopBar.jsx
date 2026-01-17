import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  FileText,
  Grid3x3,
  Package,
  School,
  Users,
  BarChart3,
  DollarSign,
  Loader2,
  GraduationCap,
  UserCog
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import {
  formatNotificationTime,
  getNotificationAction,
  getPriorityBadgeColor
} from '../../utils/notificationHelpers';

export default function TopBar({ user, onMenuClick }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Utiliser le hook de notifications réelles
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading: notificationsLoading
  } = useNotifications();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche globale avec debounce
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const supabase = getSupabaseClient();
      const results = [];
      const searchTerm = `%${query.toLowerCase()}%`;

      // Recherche dans les écoles (admin et principal)
      if (user?.role === 'admin' || user?.role === 'principal') {
        const { data: schools } = await supabase
          .from('schools')
          .select('id, name, city, code')
          .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},code.ilike.${searchTerm}`)
          .limit(5);

        if (schools) {
          schools.forEach(school => {
            results.push({
              type: 'school',
              id: school.id,
              title: school.name,
              subtitle: `${school.city || 'Ville non définie'} - ${school.code}`,
              icon: School,
              href: `/schools?highlight=${school.id}`
            });
          });
        }
      }

      // Recherche dans les utilisateurs
      if (user?.role === 'admin' || user?.role === 'principal') {
        let usersQuery = supabase
          .from('users')
          .select('id, full_name, email, role')
          .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5);

        // Principal ne voit que les utilisateurs de son école
        if (user?.role === 'principal' && user?.current_school_id) {
          usersQuery = usersQuery.eq('current_school_id', user.current_school_id);
        }

        const { data: users } = await usersQuery;

        if (users) {
          users.forEach(u => {
            const roleLabels = {
              admin: 'Admin',
              principal: 'Directeur',
              teacher: 'Enseignant',
              secretary: 'Secrétaire',
              parent: 'Parent',
              student: 'Élève'
            };
            const roleIcons = {
              admin: UserCog,
              principal: User,
              teacher: GraduationCap,
              secretary: UserCog,
              parent: Users,
              student: User
            };

            results.push({
              type: 'user',
              id: u.id,
              title: u.full_name,
              subtitle: `${roleLabels[u.role] || u.role} - ${u.email}`,
              icon: roleIcons[u.role] || User,
              href: `/users?highlight=${u.id}`
            });
          });
        }
      }

      // Recherche dans les élèves (students table)
      if (user?.role === 'admin' || user?.role === 'principal' || user?.role === 'secretary' || user?.role === 'teacher') {
        let studentsQuery = supabase
          .from('students')
          .select('id, first_name, last_name, registration_number, school_id')
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},registration_number.ilike.${searchTerm}`)
          .limit(5);

        // Filtrer par école si pas admin
        if (user?.role !== 'admin' && user?.current_school_id) {
          studentsQuery = studentsQuery.eq('school_id', user.current_school_id);
        }

        const { data: students } = await studentsQuery;

        if (students) {
          students.forEach(student => {
            results.push({
              type: 'student',
              id: student.id,
              title: `${student.first_name} ${student.last_name}`,
              subtitle: `Matricule: ${student.registration_number || 'Non défini'}`,
              icon: GraduationCap,
              href: user?.role === 'secretary' ? `/secretary/students?highlight=${student.id}` : `/users?highlight=${student.id}`
            });
          });
        }
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [user]);

  // Debounce la recherche
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      // Naviguer vers le premier résultat
      navigate(searchResults[0].href);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleResultClick = (result) => {
    navigate(result.href);
    setSearchQuery('');
    setShowSearchResults(false);
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
        {/* Search - Modern Design avec résultats */}
        <div className="flex flex-1 max-w-2xl items-center relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="w-full">
            <div className={`
              relative w-full transition-all duration-200
              ${searchFocused ? 'transform scale-105' : ''}
            `}>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {searchLoading ? (
                  <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                ) : (
                  <Search className={`h-5 w-5 transition-colors ${
                    searchFocused ? 'text-primary-500' : 'text-gray-400'
                  }`} />
                )}
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
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
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Résultats de recherche */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 px-2">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ${result.type === 'school' ? 'bg-blue-100 text-blue-600' :
                          result.type === 'user' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${result.type === 'school' ? 'bg-blue-50 text-blue-700' :
                          result.type === 'user' ? 'bg-green-50 text-green-700' :
                          'bg-purple-50 text-purple-700'}
                      `}>
                        {result.type === 'school' ? 'École' :
                         result.type === 'user' ? 'Utilisateur' : 'Élève'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {searchQuery.length >= 2 && (
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    Appuyez Entrée pour voir le premier résultat
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message si aucun résultat */}
          {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && !searchLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4 z-50">
              <p className="text-sm text-gray-500 text-center">
                Aucun résultat pour "{searchQuery}"
              </p>
            </div>
          )}
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
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>

                {/* Liste des notifications */}
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                      <span className="ml-2 text-sm text-gray-500">Chargement...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const handleClick = () => {
                        // Marquer comme lue
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        // Exécuter l'action de navigation
                        const action = getNotificationAction(notification, navigate);
                        action();
                        // Fermer le dropdown
                        setNotificationsOpen(false);
                      };

                      return (
                        <div
                          key={notification.id}
                          onClick={handleClick}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Indicateur non lu */}
                            {!notification.is_read && (
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                            )}

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">
                                  {formatNotificationTime(notification.created_at)}
                                </p>
                                {notification.priority !== 'medium' && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityBadgeColor(notification.priority)}`}>
                                    {notification.priority === 'high' ? 'Urgent' : 'Info'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-200 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                )}
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
