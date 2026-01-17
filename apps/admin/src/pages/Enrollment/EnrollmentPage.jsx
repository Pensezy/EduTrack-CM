import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  FileText,
  Search,
  Filter,
  Mail,
  Phone,
  School,
  User,
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  Eye,
  WifiOff,
  RefreshCw
} from 'lucide-react';

export default function EnrollmentPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');

      const supabase = getSupabaseClient();
      let query = supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // 🔒 SÉCURITÉ: Les directeurs ne voient que les demandes de leur école
      if (user?.role === 'principal' && user?.current_school_id) {
        query = query.eq('school_id', user.current_school_id);
      }
      // Les admins voient toutes les demandes (pas de filtre)

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEnrollments(data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
  };

  useEffect(() => {
    fetchEnrollments();
  }, [filterStatus]);

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = searchQuery === '' ||
      enrollment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.parent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.parent_email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        text: 'En attente',
        className: 'bg-yellow-100 text-yellow-800'
      },
      approved: {
        icon: Check,
        text: 'Approuvée',
        className: 'bg-green-100 text-green-800'
      },
      rejected: {
        icon: X,
        text: 'Rejetée',
        className: 'bg-red-100 text-red-800'
      }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const handleApprove = async (enrollmentId) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status: 'approved' })
        .eq('id', enrollmentId);

      if (error) throw error;

      fetchEnrollments();
    } catch (err) {
      console.error('Error approving enrollment:', err);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status: 'rejected' })
        .eq('id', enrollmentId);

      if (error) throw error;

      fetchEnrollments();
    } catch (err) {
      console.error('Error rejecting enrollment:', err);
      alert('Erreur lors du rejet');
    }
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Demandes d'Inscription</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(enrollments.length)} demande{enrollments.length > 1 ? 's' : ''} enregistrée{enrollments.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Error Message */}
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
                onClick={fetchEnrollments}
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'élève, parent ou école..."
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
              onChange={(e) => handleFilterStatusChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvée</option>
              <option value="rejected">Rejetée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments List */}
      {filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucune demande d\'inscription pour le moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section - Student Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.student_name}</h3>
                        <p className="text-sm text-gray-500">Demande du {new Date(enrollment.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Parent Name */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">Parent:</span>
                        <span className="font-medium text-gray-900 truncate">{enrollment.parent_name}</span>
                      </div>

                      {/* Parent Email */}
                      {enrollment.parent_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{enrollment.parent_email}</span>
                        </div>
                      )}

                      {/* Parent Phone */}
                      {enrollment.parent_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{enrollment.parent_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex lg:flex-col gap-2 lg:items-end">
                    {enrollment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(enrollment.id)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <Check className="h-4 w-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(enrollment.id)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <X className="h-4 w-4" />
                          Rejeter
                        </button>
                      </>
                    )}
                    <button className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
