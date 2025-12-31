import { Bell, Search, Menu } from 'lucide-react';

export default function TopBar({ user }) {
  return (
    <div className="lg:pl-64">
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
        {/* Mobile menu button */}
        <button
          type="button"
          className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="flex flex-1">
            <div className="flex w-full md:ml-0">
              <label htmlFor="search-field" className="sr-only">
                Rechercher
              </label>
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Rechercher..."
                  type="search"
                  name="search"
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="ml-4 flex items-center md:ml-6 gap-3">
            {/* Notifications */}
            <button
              type="button"
              className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Bell className="h-6 w-6" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrateur' :
                   user?.role === 'principal' ? 'Directeur' :
                   user?.role === 'secretary' ? 'Secrétaire' : 'Utilisateur'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
