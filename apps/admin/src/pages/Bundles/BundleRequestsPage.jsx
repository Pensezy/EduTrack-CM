/**
 * Page Demandes de Packs (Admin)
 *
 * Permet à l'admin de:
 * - Voir toutes les demandes d'accès aux packs (pending, approved, rejected)
 * - Approuver une demande → Active automatiquement le pack et toutes ses apps
 * - Rejeter une demande avec un message
 * - Filtrer par statut et recherche
 * - Voir les détails de chaque demande (école, demandeur, pack, date)
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@edutrack/api';
import { useAuth } from '@edutrack/contexts';
import { formatDate, formatNumber } from '@edutrack/utils';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  School,
  User,
  Calendar,
  AlertCircle,
  Search,
  MessageSquare,
  Gift,
  Filter
} from 'lucide-react';

export default function BundleRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [processingId, setProcessingId] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { requestId, action: 'approve' | 'reject' }
  const [reviewMessage, setReviewMessage] = useState('');
  const [durationYears, setDurationYears] = useState(1);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Charger toutes les demandes avec les infos de l'école, du demandeur et du pack
      const { data: requestsData, error: requestsError } = await supabase
        .from('bundle_access_requests')
        .select(`
          *,
          school:schools(id, name),
          requester:users!bundle_access_requests_requested_by_fkey(id, first_name, last_name, email),
          reviewer:users!bundle_access_requests_reviewed_by_fkey(id, first_name, last_name),
          bundle:bundles(id, name, icon, price_yearly, app_ids)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      setRequests(requestsData || []);
    } catch (err) {
      console.error('Error loading bundle requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('⚠️ Confirmer l\'approbation ? Cela activera automatiquement le pack et toutes ses applications.')) {
      return;
    }

    try {
      setProcessingId(requestId);
      const supabase = getSupabaseClient();

      // Appeler la fonction approve_bundle_request
      const { data, error: approveError } = await supabase.rpc('approve_bundle_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_review_message: reviewMessage || null,
        p_duration_years: durationYears
      });

      if (approveError) throw approveError;

      alert(`✅ ${data.message || 'Demande approuvée avec succès !'}`);
      setReviewModal(null);
      setReviewMessage('');
      await loadRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      alert(`❌ Erreur: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!reviewMessage.trim()) {
      alert('⚠️ Veuillez fournir un message expliquant le rejet.');
      return;
    }

    if (!confirm('Confirmer le rejet de cette demande ?')) {
      return;
    }

    try {
      setProcessingId(requestId);
      const supabase = getSupabaseClient();

      // Appeler la fonction reject_bundle_request
      const { data, error: rejectError } = await supabase.rpc('reject_bundle_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_review_message: reviewMessage
      });

      if (rejectError) throw rejectError;

      alert(`✅ ${data.message || 'Demande rejetée'}`);
      setReviewModal(null);
      setReviewMessage('');
      await loadRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(`❌ Erreur: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtrer les demandes
  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === '' ||
      req.school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.bundle?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-600" />
            Demandes de Packs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Approuvez ou rejetez les demandes d'accès aux packs d'applications
          </p>
        </div>
      </div>

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approuvées</p>
              <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Rejetées</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par école, pack ou demandeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Liste des demandes */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map(request => {
            const isPending = request.status === 'pending';
            const isApproved = request.status === 'approved';
            const isRejected = request.status === 'rejected';

            return (
              <div
                key={request.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${
                  isPending ? 'border-yellow-400' :
                  isApproved ? 'border-green-400' :
                  'border-red-400'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Info demande */}
                  <div className="flex-1 space-y-3">
                    {/* École et Pack */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                        <span className="text-2xl">{request.bundle?.icon || '📦'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.bundle?.name || 'Pack inconnu'}
                          </h3>
                          {isPending && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approuvée
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejetée
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <School className="h-4 w-4" />
                            {request.school?.name || 'École inconnue'}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {request.requester ? `${request.requester.first_name} ${request.requester.last_name}` : 'Inconnu'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message de demande */}
                    {request.request_message && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          <strong>Message:</strong> {request.request_message}
                        </p>
                      </div>
                    )}

                    {/* Message de révision */}
                    {request.review_message && (
                      <div className={`rounded-lg p-3 ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm">
                          <strong className={isApproved ? 'text-green-700' : 'text-red-700'}>
                            Réponse admin ({request.reviewer ? `${request.reviewer.first_name} ${request.reviewer.last_name}` : 'Inconnu'}):
                          </strong>
                          <span className={isApproved ? 'text-green-700' : 'text-red-700'}>
                            {' '}{request.review_message}
                          </span>
                        </p>
                        {request.reviewed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Le {formatDate(request.reviewed_at)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Info pack */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="px-3 py-1 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">
                          {formatNumber(request.bundle?.price_yearly || 0)} FCFA/an
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-purple-50 rounded-lg">
                        <span className="text-purple-700 font-medium">
                          {(request.bundle?.app_ids || []).length} applications incluses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex flex-col gap-2 lg:w-48">
                      <button
                        onClick={() => setReviewModal({ requestId: request.id, action: 'approve' })}
                        disabled={processingId === request.id}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Approuver
                      </button>
                      <button
                        onClick={() => setReviewModal({ requestId: request.id, action: 'reject' })}
                        disabled={processingId === request.id}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 inline mr-2" />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune demande trouvée
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucune demande de pack pour le moment'}
          </p>
        </div>
      )}

      {/* Modal de révision */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewModal.action === 'approve' ? '✅ Approuver la demande' : '❌ Rejeter la demande'}
            </h3>

            {reviewModal.action === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée d'activation (années)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={durationYears}
                  onChange={(e) => setDurationYears(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le pack et toutes ses applications seront activés pour cette durée
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message {reviewModal.action === 'reject' ? '(obligatoire)' : '(optionnel)'}
              </label>
              <textarea
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={reviewModal.action === 'approve' ?
                  'Votre pack a été activé avec succès...' :
                  'Expliquez la raison du rejet...'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewMessage('');
                  setDurationYears(1);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (reviewModal.action === 'approve') {
                    handleApprove(reviewModal.requestId);
                  } else {
                    handleReject(reviewModal.requestId);
                  }
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  reviewModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
