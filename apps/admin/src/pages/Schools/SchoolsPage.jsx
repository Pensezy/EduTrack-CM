import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  School,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Users,
  Edit,
  Trash2,
  Eye,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { SchoolFormModal, SchoolViewModal, SchoolDeleteModal, SchoolAdminModal } from './components';

export default function SchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Modal states
  const [formModal, setFormModal] = useState({ isOpen: false, school: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, school: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, school: null });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError('');

      const supabase = getSupabaseClient();
      let query = supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔒 SÉCURITÉ: Les directeurs ne voient que leur école
      if (user?.role === 'principal' && user?.current_school_id) {
        query = query.eq('id', user.current_school_id);
      }
      // Les admins voient toutes les écoles (pas de filtre)

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSchools(data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Erreur lors du chargement des écoles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  useEffect(() => {
    fetchSchools();
  }, [filterStatus]);

  const filteredSchools = schools.filter(school => {
    const matchesSearch = searchQuery === '' ||
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        icon: CheckCircle,
        text: 'Actif',
        className: 'bg-green-100 text-green-800'
      },
      inactive: {
        icon: XCircle,
        text: 'Inactif',
        className: 'bg-gray-100 text-gray-800'
      },
      pending: {
        icon: AlertCircle,
        text: 'En attente',
        className: 'bg-yellow-100 text-yellow-800'
      }
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getSchoolTypeLabel = (type) => {
    const types = {
      public: 'Public',
      prive: 'Privé',
      maternelle: 'Maternelle',
      primaire: 'Primaire',
      college: 'Collège',
      lycee: 'Lycée',
      college_lycee: 'Collège/Lycée',
      universite: 'Université',
      formation_professionnelle: 'Formation Pro'
    };
    return types[type] || type;
  };

  // Modal handlers
  const handleCreateSchool = () => {
    setFormModal({ isOpen: true, school: null });
  };

  const handleEditSchool = (school) => {
    setFormModal({ isOpen: true, school });
  };

  const handleViewSchool = (school) => {
    setViewModal({ isOpen: true, school });
  };

  const handleDeleteSchool = (school) => {
    setDeleteModal({ isOpen: true, school });
  };

  const handleModalSuccess = () => {
    fetchSchools(); // Refresh the schools list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Écoles</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(schools.length)} école{schools.length > 1 ? 's' : ''} enregistrée{schools.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateSchool}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nouvelle École</span>
          <span className="sm:hidden">Nouvelle</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, code ou ville..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Grid */}
      {filteredSchools.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune école trouvée</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter une nouvelle école'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* School Header */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 sm:p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{school.name}</h3>
                    <p className="text-primary-100 text-sm">Code: {school.code}</p>
                  </div>
                  <School className="h-7 w-7 sm:h-8 sm:w-8 text-white/80 flex-shrink-0 ml-2" />
                </div>
              </div>

              {/* School Info */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Status & Type */}
                <div className="flex items-center justify-between gap-2">
                  {getStatusBadge(school.status)}
                  <span className="text-xs text-gray-500 truncate">{getSchoolTypeLabel(school.type)}</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {school.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{school.city}</span>
                    </div>
                  )}
                  {school.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{school.phone}</span>
                    </div>
                  )}
                  {school.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{school.email}</span>
                    </div>
                  )}
                </div>

                {/* Director */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">Directeur:</span>
                    <span className="font-medium text-gray-900 truncate">{school.director_name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={() => handleViewSchool(school)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Voir</span>
                  </button>
                  <button
                    onClick={() => handleEditSchool(school)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <SchoolFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, school: null })}
        school={formModal.school}
        onSuccess={handleModalSuccess}
      />

      <SchoolViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, school: null })}
        school={viewModal.school}
        onEdit={handleEditSchool}
      />

      <SchoolDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, school: null })}
        school={deleteModal.school}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
