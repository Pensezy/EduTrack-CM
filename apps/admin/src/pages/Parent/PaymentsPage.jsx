/**
 * Page Paiements - Parent
 *
 * Affiche l'historique des paiements et les paiements en attente
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber, formatCurrency } from '@edutrack/utils';
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Baby
} from 'lucide-react';

export default function ParentPaymentsPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPaid: 0,
    pending: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchChildren();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user?.id, selectedChild]);

  const fetchChildren = async () => {
    try {
      const supabase = getSupabaseClient();

      const { data, error: fetchError } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('parent_id', user.id)
        .order('full_name');

      if (fetchError) throw fetchError;

      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      let query = supabase
        .from('payments')
        .select(`
          *,
          students:student_id (full_name)
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedChild !== 'all') {
        query = query.eq('student_id', selectedChild);
      }

      const { data, error: fetchError } = await query;

      if (fetchError && fetchError.code !== '42P01') {
        throw fetchError;
      }

      setPayments(data || []);

      // Calculer les stats
      const paidPayments = (data || []).filter(p => p.status === 'paid');
      const pendingPayments = (data || []).filter(p => p.status === 'pending');

      setStats({
        totalPaid: paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pending: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingCount: pendingPayments.length,
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      paid: { icon: CheckCircle, text: 'Payé', className: 'bg-green-100 text-green-800' },
      overdue: { icon: AlertCircle, text: 'En retard', className: 'bg-red-100 text-red-800' },
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

  const getPaymentTypeName = (type) => {
    const types = {
      tuition: 'Frais de scolarité',
      registration: 'Inscription',
      exam: 'Frais d\'examen',
      transport: 'Transport',
      canteen: 'Cantine',
      other: 'Autre',
    };
    return types[type] || type || 'Paiement';
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Paiements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Historique et suivi des paiements
        </p>
      </div>

      {/* Alerte paiements en attente */}
      {stats.pendingCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Vous avez <span className="font-medium">{stats.pendingCount} paiement{stats.pendingCount > 1 ? 's' : ''} en attente</span>
                {stats.pending > 0 && ` pour un total de ${formatCurrency(stats.pending)} FCFA`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtre par enfant */}
      {children.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par enfant</label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous les enfants</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>{child.full_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payé</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalPaid)} <span className="text-sm font-normal">FCFA</span>
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
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
      </div>

      {/* Error */}
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

      {/* Liste des paiements */}
      {children.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun enfant inscrit</h3>
          <p className="text-sm text-gray-500">
            Contactez l'administration pour inscrire vos enfants.
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement</h3>
          <p className="text-sm text-gray-500">
            Vous n'avez pas encore de paiements enregistrés.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enfant
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(payment.paid_at || payment.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {payment.students?.full_name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getPaymentTypeName(payment.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'paid' && payment.receipt_url && (
                        <button className="text-primary-600 hover:text-primary-900 mr-2">
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
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
    </div>
  );
}
