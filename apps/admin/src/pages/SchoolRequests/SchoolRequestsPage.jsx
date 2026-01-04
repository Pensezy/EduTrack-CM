import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber, formatDate } from '@edutrack/utils';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';

export default function SchoolRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  // Modals
  const [viewModal, setViewModal] = useState({ isOpen: false, request: null });
  const [approveModal, setApproveModal] = useState({ isOpen: false, request: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, request: null });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRequests();
    }
  }, [user, filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const supabase = getSupabaseClient();
      let query = supabase
        .from('school_creation_requests')
        .select(`
          *,
          requester:requester_user_id(
            id,
            full_name,
            email,
            phone
          ),
          reviewer:reviewed_by_user_id(
            id,
            full_name,
            email
          ),
          created_school:created_school_id(
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching school requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRequests = requests.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.school_name?.toLowerCase().includes(query) ||
      request.school_code?.toLowerCase().includes(query) ||
      request.city?.toLowerCase().includes(query) ||
      request.region?.toLowerCase().includes(query) ||
      request.director_full_name?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        text: 'En attente',
        className: 'bg-yellow-100 text-yellow-800'
      },
      approved: {
        icon: CheckCircle,
        text: 'Approuvée',
        className: 'bg-green-100 text-green-800'
      },
      rejected: {
        icon: XCircle,
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

  const getSchoolTypeLabel = (type) => {
    const types = {
      maternelle: 'Maternelle',
      primaire: 'Primaire',
      college: 'Collège',
      lycee: 'Lycée',
      college_lycee: 'Collège/Lycée'
    };
    return types[type] || type;
  };

  const getOwnershipLabel = (ownership) => {
    return ownership === 'private' ? 'Privé' : 'Public';
  };

  const handleView = (request) => {
    setViewModal({ isOpen: true, request });
  };

  const handleApprove = (request) => {
    setApproveModal({ isOpen: true, request });
  };

  const handleReject = (request) => {
    setRejectModal({ isOpen: true, request });
  };

  const handleModalSuccess = () => {
    fetchRequests();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Demandes de Création d'Établissements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(requests.length)} demande{requests.length > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                placeholder="Rechercher par nom, code, ville, région..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
          <p className="text-sm text-gray-500">
            {searchQuery
              ? 'Essayez de modifier vos critères de recherche'
              : 'Aucune demande de création d\'établissement pour le moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {request.school_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Code: {request.school_code} • {getSchoolTypeLabel(request.school_type)} • {getOwnershipLabel(request.ownership_type)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Location */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Localisation:</span>
                      <span>{request.region}, {request.city}</span>
                    </div>
                    {request.department && (
                      <div className="text-sm text-gray-500 ml-6">
                        Département: {request.department}
                      </div>
                    )}
                  </div>

                  {/* Director */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">Directeur:</span>
                      <span className="truncate">{request.director_full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-6">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{request.director_email}</span>
                    </div>
                  </div>
                </div>

                {/* Requester & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Demandé par <span className="font-medium">{request.requester?.full_name}</span>
                    {' • '}
                    {formatDate(request.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(request)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Voir détails</span>
                    </button>

                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="hidden sm:inline">Approuver</span>
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="hidden sm:inline">Rejeter</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Review Info (if processed) */}
                {request.status !== 'pending' && request.reviewed_at && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {request.status === 'approved' ? 'Approuvée' : 'Rejetée'} par{' '}
                      <span className="font-medium">{request.reviewer?.full_name}</span>
                      {' • '}
                      {formatDate(request.reviewed_at)}
                    </div>
                    {request.review_notes && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                        <span className="font-medium">Notes:</span> {request.review_notes}
                      </div>
                    )}
                    {request.created_school && (
                      <div className="mt-2 text-sm text-green-700 bg-green-50 rounded p-2">
                        <span className="font-medium">École créée:</span> {request.created_school.name} ({request.created_school.code})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals - To be created */}
      {viewModal.isOpen && (
        <ViewRequestModal
          request={viewModal.request}
          onClose={() => setViewModal({ isOpen: false, request: null })}
        />
      )}

      {approveModal.isOpen && (
        <ApproveRequestModal
          request={approveModal.request}
          onClose={() => setApproveModal({ isOpen: false, request: null })}
          onSuccess={handleModalSuccess}
        />
      )}

      {rejectModal.isOpen && (
        <RejectRequestModal
          request={rejectModal.request}
          onClose={() => setRejectModal({ isOpen: false, request: null })}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

// Temporary placeholder components - Will be created next
function ViewRequestModal({ request, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Détails de la demande</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(request, null, 2)}
          </pre>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveRequestModal({ request, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { user } = await supabase.auth.getUser();

      const { error } = await supabase.rpc('approve_school_request', {
        p_request_id: request.id,
        p_admin_user_id: user.user.id,
        p_review_notes: notes || null
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Erreur lors de l\'approbation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Approuver la demande</h2>
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir approuver la demande pour <strong>{request.school_name}</strong> ?
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes optionnelles..."
            className="w-full border rounded p-2 mb-4"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Approuver'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectRequestModal({ request, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Veuillez indiquer la raison du rejet');
      return;
    }

    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      const { user } = await supabase.auth.getUser();

      const { error } = await supabase.rpc('reject_school_request', {
        p_request_id: request.id,
        p_admin_user_id: user.user.id,
        p_review_notes: notes
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Erreur lors du rejet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Rejeter la demande</h2>
          <p className="text-gray-600 mb-4">
            Indiquez la raison du rejet de la demande pour <strong>{request.school_name}</strong>:
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Raison du rejet (obligatoire)..."
            className="w-full border rounded p-2 mb-4"
            rows={4}
            required
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading || !notes.trim()}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Rejeter'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
