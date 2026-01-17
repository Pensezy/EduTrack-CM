import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Shield,
  School,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Download,
  Upload
} from 'lucide-react';
import { UserFormModal, UserViewModal, AdminFormModal, PrincipalFormModal, TeacherFormModal, SecretaryFormModal, ParentFormModal, StudentFormModal } from './components';
import ImportExportModal from '../../components/ImportExportModal';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Modal states
  const [formModal, setFormModal] = useState({ isOpen: false, user: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, user: null });
  const [adminModal, setAdminModal] = useState({ isOpen: false, user: null });
  const [principalModal, setPrincipalModal] = useState({ isOpen: false, user: null });
  const [teacherModal, setTeacherModal] = useState({ isOpen: false, user: null });
  const [secretaryModal, setSecretaryModal] = useState({ isOpen: false, user: null });
  const [parentModal, setParentModal] = useState({ isOpen: false, user: null });
  const [studentModal, setStudentModal] = useState({ isOpen: false, user: null });
  const [exportModal, setExportModal] = useState(false);
  const [importModal, setImportModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const supabase = getSupabaseClient();
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔒 SÉCURITÉ: Les directeurs ne voient que les utilisateurs de leur école
      if (user?.role === 'principal' && user?.current_school_id) {
        query = query
          .eq('current_school_id', user.current_school_id)
          // Les directeurs ne voient QUE : personnel, parents et élèves
          .in('role', ['teacher', 'secretary', 'student', 'parent']);
      }
      // Les admins voient tous les utilisateurs (pas de filtre)

      if (filterRole !== 'all') {
        query = query.eq('role', filterRole);
      }

      if (filterStatus !== 'all') {
        const isActive = filterStatus === 'active';
        query = query.eq('is_active', isActive);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterRoleChange = (role) => {
    setFilterRole(role);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, filterStatus]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        icon: Shield,
        text: 'Administrateur',
        className: 'bg-purple-100 text-purple-800'
      },
      principal: {
        icon: UserCheck,
        text: 'Directeur',
        className: 'bg-blue-100 text-blue-800'
      },
      teacher: {
        icon: Users,
        text: 'Enseignant',
        className: 'bg-green-100 text-green-800'
      },
      secretary: {
        icon: UserCheck,
        text: 'Secrétaire',
        className: 'bg-yellow-100 text-yellow-800'
      },
      student: {
        icon: Users,
        text: 'Élève',
        className: 'bg-indigo-100 text-indigo-800'
      },
      parent: {
        icon: Users,
        text: 'Parent',
        className: 'bg-pink-100 text-pink-800'
      }
    };

    const badge = badges[role] || {
      icon: Users,
      text: role,
      className: 'bg-gray-100 text-gray-800'
    };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="h-3 w-3" />
        Inactif
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const getAvatarColor = (role) => {
    const colors = {
      admin: 'from-purple-500 to-purple-600',
      principal: 'from-blue-500 to-blue-600',
      teacher: 'from-green-500 to-green-600',
      secretary: 'from-yellow-500 to-yellow-600',
      student: 'from-indigo-500 to-indigo-600',
      parent: 'from-pink-500 to-pink-600'
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  // Modal handlers
  const handleCreateUser = () => {
    setFormModal({ isOpen: true, user: null });
  };

  const handleCreateTeacher = () => {
    setTeacherModal({ isOpen: true, user: null });
  };

  const handleCreateParent = () => {
    setParentModal({ isOpen: true, user: null });
  };

  const handleCreateStudent = () => {
    setStudentModal({ isOpen: true, user: null });
  };

  const handleCreateSecretary = () => {
    setSecretaryModal({ isOpen: true, user: null });
  };

  const handleCreateAdmin = () => {
    setAdminModal({ isOpen: true, user: null });
  };

  const handleCreatePrincipal = () => {
    setPrincipalModal({ isOpen: true, user: null });
  };

  const handleEditUser = (userData) => {
    // Route to specialized modal based on role
    if (userData.role === 'admin') {
      setAdminModal({ isOpen: true, user: userData });
    } else if (userData.role === 'principal') {
      setPrincipalModal({ isOpen: true, user: userData });
    } else if (userData.role === 'teacher') {
      setTeacherModal({ isOpen: true, user: userData });
    } else if (userData.role === 'secretary') {
      setSecretaryModal({ isOpen: true, user: userData });
    } else if (userData.role === 'parent') {
      setParentModal({ isOpen: true, user: userData });
    } else if (userData.role === 'student') {
      setStudentModal({ isOpen: true, user: userData });
    } else {
      // Fallback
      setFormModal({ isOpen: true, user: userData });
    }
  };

  const handleViewUser = (userData) => {
    setViewModal({ isOpen: true, user: userData });
  };

  const handleModalSuccess = () => {
    fetchUsers(); // Refresh the users list
  };

  // Import handler
  const handleImportUsers = async (importedData, type) => {
    // TODO: Implement bulk user creation
    // For now, just log and refresh
    console.log('Importing users:', importedData);
    alert(`Import de ${importedData.length} utilisateur(s) en cours de développement`);
    fetchUsers();
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(users.length)} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Boutons Export/Import */}
          <button
            onClick={() => setExportModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm text-sm"
            title="Exporter"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button
            onClick={() => setImportModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm text-sm"
            title="Importer"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importer</span>
          </button>

          {/* Boutons pour Admin uniquement */}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={handleCreateAdmin}
                className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Administrateur</span>
              </button>
              <button
                onClick={handleCreatePrincipal}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Directeur</span>
              </button>
            </>
          )}

          {/* Boutons communs */}
          <button
            onClick={handleCreateTeacher}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Enseignant</span>
          </button>
          <button
            onClick={handleCreateSecretary}
            className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Secrétaire</span>
          </button>
          <button
            onClick={handleCreateParent}
            className="inline-flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Parent</span>
          </button>
          <button
            onClick={handleCreateStudent}
            className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Élève</span>
          </button>
        </div>
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
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou école..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Role Filter */}
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
              <select
                value={filterRole}
                onChange={(e) => handleFilterRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les rôles</option>
                {/* Les admins peuvent voir tous les rôles */}
                {user?.role === 'admin' && (
                  <>
                    <option value="admin">Administrateur</option>
                    <option value="principal">Directeur</option>
                  </>
                )}
                {/* Rôles visibles par les directeurs */}
                <option value="teacher">Enseignant</option>
                <option value="secretary">Secrétaire</option>
                <option value="student">Élève</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter un nouvel utilisateur'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              {/* User Header */}
              <div className={`bg-gradient-to-br ${getAvatarColor(user.role)} p-4 sm:p-6 text-white`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-lg sm:text-xl font-bold">
                      {getInitials(user.full_name)}
                    </span>
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{user.full_name || 'Sans nom'}</h3>
                    <p className="text-white/90 text-sm truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Role & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.is_active)}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Créé le {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={() => handleViewUser(user)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Voir</span>
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
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
      <UserFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, user: null })}
        user={formModal.user}
        onSuccess={handleModalSuccess}
      />

      <UserViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, user: null })}
        user={viewModal.user}
        onEdit={handleEditUser}
      />

      <AdminFormModal
        isOpen={adminModal.isOpen}
        onClose={() => setAdminModal({ isOpen: false, user: null })}
        user={adminModal.user}
        onSuccess={handleModalSuccess}
      />

      <PrincipalFormModal
        isOpen={principalModal.isOpen}
        onClose={() => setPrincipalModal({ isOpen: false, user: null })}
        user={principalModal.user}
        onSuccess={handleModalSuccess}
      />

      <TeacherFormModal
        isOpen={teacherModal.isOpen}
        onClose={() => setTeacherModal({ isOpen: false, user: null })}
        user={teacherModal.user}
        onSuccess={handleModalSuccess}
      />

      <SecretaryFormModal
        isOpen={secretaryModal.isOpen}
        onClose={() => setSecretaryModal({ isOpen: false, user: null })}
        user={secretaryModal.user}
        onSuccess={handleModalSuccess}
      />

      <ParentFormModal
        isOpen={parentModal.isOpen}
        onClose={() => setParentModal({ isOpen: false, user: null })}
        user={parentModal.user}
        onSuccess={handleModalSuccess}
      />

      <StudentFormModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ isOpen: false, user: null })}
        user={studentModal.user}
        onSuccess={handleModalSuccess}
      />

      {/* Export/Import Modals */}
      <ImportExportModal
        isOpen={exportModal}
        onClose={() => setExportModal(false)}
        mode="export"
        data={users}
        type="users"
        schoolName="EduTrack"
      />

      <ImportExportModal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        mode="import"
        type="users"
        schoolName="EduTrack"
        onImport={handleImportUsers}
        allowedTypes={['users', 'students', 'teachers', 'parents']}
      />
    </div>
  );
}
