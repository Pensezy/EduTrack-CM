/**
 * Page de Gestion des Demandes d'Accès aux Applications
 *
 * Permet à l'admin de :
 * - Voir toutes les demandes (pending, approved, rejected)
 * - Filtrer par statut et par école
 * - Approuver des demandes (crée automatiquement l'abonnement)
 * - Rejeter des demandes avec un message
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  School as SchoolIcon,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Construction
} from 'lucide-react';
import { formatDate } from '@edutrack/utils';

export default function AppAccessRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  // Modal pour approuver/rejeter
  const [reviewModal, setReviewModal] = useState({ isOpen: false, request: null, action: null });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('v_app_access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
      alert('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.rpc('approve_app_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_review_message: reviewMessage || null
      });

      if (error) throw error;

      alert('✅ Demande approuvée ! L\'abonnement a été créé automatiquement.');
      await loadRequests();
      setReviewModal({ isOpen: false, request: null, action: null });
      setReviewMessage('');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Erreur lors de l\'approbation: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!reviewMessage.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    try {
      setProcessingId(requestId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.rpc('reject_app_request', {
        p_request_id: requestId,
        p_admin_id: user.id,
        p_review_message: reviewMessage
      });

      if (error) throw error;

      alert('❌ Demande rejetée');
      await loadRequests();
      setReviewModal({ isOpen: false, request: null, action: null });
      setReviewMessage('');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Erreur lors du rejet: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const openReviewModal = (request, action) => {
    setReviewModal({ isOpen: true, request, action });
    setReviewMessage('');
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchQuery === '' ||
      request.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.app_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requester_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { icon: CheckCircle, text: 'Approuvée', className: 'bg-green-100 text-green-800' },
      rejected: { icon: XCircle, text: 'Rejetée', className: 'bg-red-100 text-red-800' }
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

  const getDevelopmentBadge = (status) => {
    const badges = {
      ready: { icon: CheckCircle, text: 'Prêt', className: 'bg-green-100 text-green-800' },
      beta: { icon: AlertTriangle, text: 'Beta', className: 'bg-purple-100 text-purple-800' },
      in_development: { icon: Construction, text: 'En Dev', className: 'bg-orange-100 text-orange-800' }
    };

    const badge = badges[status] || badges.ready;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length
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
            <FileText className="h-7 w-7 text-primary-600" />
            Demandes d'Accès aux Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérer les demandes des directeurs d'école
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-600">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-xs text-gray-600">Approuvées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-xs text-gray-600">Rejetées</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
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
                placeholder="Rechercher école, app ou demandeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des Demandes */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucune demande pour le moment'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* En-tête */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <SchoolIcon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">{request.school_name}</h3>
                    <span className="text-sm text-gray-500">({request.school_code})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{request.app_icon || '📦'}</span>
                    <div>
                      <p className="text-base font-medium text-gray-900">{request.app_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getDevelopmentBadge(request.development_status)}
                        <span className="text-sm text-gray-600">
                          {request.price_yearly?.toLocaleString()} FCFA/an
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(request.status)}
                </div>
              </div>

              {/* Demandeur */}
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Demandé par:</span>
                <span className="font-medium text-gray-900">{request.requester_name}</span>
                <span className="text-gray-500">({request.requester_email})</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Date de demande:</span>
                <span className="font-medium text-gray-900">{formatDate(request.created_at)}</span>
              </div>

              {/* Message de la demande */}
              {request.request_message && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-900 mb-1">Message du directeur:</p>
                      <p className="text-sm text-blue-800">{request.request_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Réponse de l'admin */}
              {request.status !== 'pending' && request.review_message && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  request.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <div>
                      <p className={`text-xs font-medium mb-1 ${
                        request.status === 'approved' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Réponse de {request.reviewer_name || 'l\'admin'}:
                      </p>
                      <p className={`text-sm ${
                        request.status === 'approved' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {request.review_message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Le {formatDate(request.reviewed_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions (seulement si pending) */}
              {request.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openReviewModal(request, 'approve')}
                    disabled={processingId === request.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => openReviewModal(request, 'reject')}
                    disabled={processingId === request.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de Confirmation */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {reviewModal.action === 'approve' ? '✅ Approuver la demande' : '❌ Rejeter la demande'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">École:</span> {reviewModal.request.school_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Application:</span> {reviewModal.request.app_name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Demandeur:</span> {reviewModal.request.requester_name}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {reviewModal.action === 'approve' ? 'Message (optionnel)' : 'Raison du rejet *'}
              </label>
              <textarea
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                placeholder={
                  reviewModal.action === 'approve'
                    ? 'Ajouter un commentaire...'
                    : 'Expliquer pourquoi cette demande est rejetée...'
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setReviewModal({ isOpen: false, request: null, action: null })}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  reviewModal.action === 'approve'
                    ? handleApprove(reviewModal.request.id)
                    : handleReject(reviewModal.request.id)
                }
                disabled={processingId === reviewModal.request.id}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  reviewModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === reviewModal.request.id ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
