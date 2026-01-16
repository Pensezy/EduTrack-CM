/**
 * Page Paiements - Secrétaire
 *
 * Permet au secrétaire de gérer les paiements de l'école
 * Fonctionnalités: voir paiements, enregistrer paiement, historique
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber, formatCurrency } from '@edutrack/utils';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Download,
  Eye
} from 'lucide-react';

export default function SecretaryPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [stats, setStats] = useState({
    totalReceived: 0,
    pending: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    if (user?.current_school_id) {
      fetchPayments();
    }
  }, [user?.current_school_id, filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();
      const schoolId = user?.current_school_id;

      if (!schoolId) {
        setError('Aucune école associée à votre compte');
        return;
      }

      let query = supabase
        .from('payments')
        .select(`
          *,
          students:student_id (full_name, matricule),
          parents:parent_id (full_name, phone)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Si la table n'existe pas, afficher un message approprié
        if (fetchError.code === '42P01') {
          setPayments([]);
          setStats({ totalReceived: 0, pending: 0, thisMonth: 0 });
          return;
        }
        throw fetchError;
      }

      setPayments(data || []);

      // Calculer les stats
      const paidPayments = (data || []).filter(p => p.status === 'paid');
      const pendingPayments = (data || []).filter(p => p.status === 'pending');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const thisMonthPayments = paidPayments.filter(p =>
        new Date(p.paid_at || p.created_at) >= startOfMonth
      );

      setStats({
        totalReceived: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pending: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        thisMonth: thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' ||
      payment.students?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.parents?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      paid: { icon: CheckCircle, text: 'Payé', className: 'bg-green-100 text-green-800' },
      overdue: { icon: AlertCircle, text: 'En retard', className: 'bg-red-100 text-red-800' },
      cancelled: { icon: AlertCircle, text: 'Annulé', className: 'bg-gray-100 text-gray-800' },
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

  const getPaymentTypeBadge = (type) => {
    const types = {
      tuition: 'Frais de scolarité',
      registration: 'Inscription',
      exam: 'Frais d\'examen',
      transport: 'Transport',
      canteen: 'Cantine',
      other: 'Autre',
    };
    return types[type] || type || 'Non spécifié';
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(payments.length)} paiement{payments.length > 1 ? 's' : ''} enregistré{payments.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {/* TODO: Export */}}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>
          <button
            onClick={() => setShowNewPaymentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau Paiement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reçu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalReceived)} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.pending)} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ce Mois</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.thisMonth)} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
          </div>
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
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par élève, parent ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="overdue">En retard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucun paiement enregistré pour le moment'}
          </p>
          <button
            onClick={() => setShowNewPaymentModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Enregistrer un paiement
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {payment.reference || `PAY-${payment.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                          {payment.students?.full_name?.charAt(0) || 'E'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{payment.students?.full_name || '-'}</p>
                          <p className="text-xs text-gray-500">{payment.parents?.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPaymentTypeBadge(payment.type)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(payment.paid_at || payment.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nouveau Paiement (simplifié) */}
      {showNewPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouveau Paiement</h2>
              <button onClick={() => setShowNewPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Cette fonctionnalité sera disponible prochainement.
                <br /><br />
                Elle permettra d'enregistrer les paiements des frais de scolarité, inscriptions et autres frais.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowNewPaymentModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
