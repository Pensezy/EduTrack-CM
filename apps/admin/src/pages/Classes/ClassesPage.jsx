import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  School,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  BookOpen,
  Calendar,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { ClassFormModal, ClassViewModal } from './components';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Modal states
  const [formModal, setFormModal] = useState({ isOpen: false, classData: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, classData: null });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');

      const supabase = getSupabaseClient();
      let query = supabase
        .from('classes')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      // 🔒 SÉCURITÉ: Les directeurs ne voient que les classes de leur école
      if (user?.role === 'principal' && user?.current_school_id) {
        query = query.eq('school_id', user.current_school_id);
      }
      // Les admins voient toutes les classes (pas de filtre)

      if (filterLevel !== 'all') {
        query = query.eq('level', filterLevel);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterLevelChange = (level) => {
    setFilterLevel(level);
  };

  useEffect(() => {
    fetchClasses();
  }, [filterLevel]);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = searchQuery === '' ||
      cls.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getLevelLabel = (level) => {
    const levels = {
      '6eme': '6ème',
      '5eme': '5ème',
      '4eme': '4ème',
      '3eme': '3ème',
      'seconde': 'Seconde',
      'premiere': 'Première',
      'terminale': 'Terminale',
      'cp': 'CP',
      'ce1': 'CE1',
      'ce2': 'CE2',
      'cm1': 'CM1',
      'cm2': 'CM2',
      'maternelle': 'Maternelle'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      '6eme': 'from-blue-500 to-blue-600',
      '5eme': 'from-indigo-500 to-indigo-600',
      '4eme': 'from-purple-500 to-purple-600',
      '3eme': 'from-pink-500 to-pink-600',
      'seconde': 'from-green-500 to-green-600',
      'premiere': 'from-yellow-500 to-yellow-600',
      'terminale': 'from-red-500 to-red-600',
      'cp': 'from-cyan-500 to-cyan-600',
      'ce1': 'from-teal-500 to-teal-600',
      'ce2': 'from-emerald-500 to-emerald-600',
      'cm1': 'from-lime-500 to-lime-600',
      'cm2': 'from-amber-500 to-amber-600',
      'maternelle': 'from-rose-500 to-rose-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  // Modal handlers
  const handleCreateClass = () => {
    setFormModal({ isOpen: true, classData: null });
  };

  const handleEditClass = (classData) => {
    setFormModal({ isOpen: true, classData });
  };

  const handleViewClass = (classData) => {
    setViewModal({ isOpen: true, classData });
  };

  const handleModalSuccess = () => {
    fetchClasses(); // Refresh the classes list
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Classes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(classes.length)} classe{classes.length > 1 ? 's' : ''} enregistrée{classes.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateClass}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Nouvelle Classe</span>
          <span className="sm:hidden">Nouvelle</span>
        </button>
      </div>

      {/* Error Message - Amélioration esthétique */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <WifiOff className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-red-800 mb-1">
                Problème de connexion
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {error}
              </p>
              <button
                onClick={fetchClasses}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom de classe ou école..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterLevel}
              onChange={(e) => handleFilterLevelChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les niveaux</option>
              <option value="maternelle">Maternelle</option>
              <option value="cp">CP</option>
              <option value="ce1">CE1</option>
              <option value="ce2">CE2</option>
              <option value="cm1">CM1</option>
              <option value="cm2">CM2</option>
              <option value="6eme">6ème</option>
              <option value="5eme">5ème</option>
              <option value="4eme">4ème</option>
              <option value="3eme">3ème</option>
              <option value="seconde">Seconde</option>
              <option value="premiere">Première</option>
              <option value="terminale">Terminale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune classe trouvée</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Commencez par créer une nouvelle classe'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* Class Header */}
              <div className={`bg-gradient-to-br ${getLevelColor(cls.level)} p-4 sm:p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">{cls.name}</h3>
                    <p className="text-white/90 text-sm">{getLevelLabel(cls.level)}</p>
                  </div>
                  <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-white/80 flex-shrink-0 ml-2" />
                </div>
              </div>

              {/* Class Info */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Student Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Élèves:</span>
                  <span className="font-medium text-gray-900">{cls.student_count || 0}</span>
                </div>

                {/* Academic Year */}
                {cls.academic_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">Année:</span>
                    <span className="font-medium text-gray-900">{cls.academic_year}</span>
                  </div>
                )}

                {/* Description */}
                {cls.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 line-clamp-2">{cls.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={() => handleViewClass(cls)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Voir</span>
                  </button>
                  <button
                    onClick={() => handleEditClass(cls)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Modifier</span>
                  </button>
                  <button
                    onClick={() => alert('Suppression à implémenter avec confirmation')}
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
      <ClassFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, classData: null })}
        classData={formModal.classData}
        onSuccess={handleModalSuccess}
      />

      <ClassViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, classData: null })}
        classData={viewModal.classData}
        onEdit={handleEditClass}
      />
    </div>
  );
}
