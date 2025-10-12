import React, { useState, useEffect } from 'react';
import { X, Calendar, Receipt, Search, Filter, Download, Eye } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import paymentService from '../../../services/paymentService';

export const PaymentHistoryModal = ({ isOpen, onClose, studentId, studentName, onViewReceipt }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });

  // Filtres
  const [filters, setFilters] = useState({
    period: '',
    feeType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      loadPaymentHistory();
    }
  }, [isOpen, studentId]);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPaymentHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const historyData = await paymentService.getPaymentHistory(studentId);
      setPayments(historyData.payments || []);
      setSummary(historyData.summary || summary);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Filtre par période
    if (filters.period) {
      filtered = filtered.filter(payment => payment.period === filters.period);
    }

    // Filtre par type de frais
    if (filters.feeType) {
      filtered = filtered.filter(payment => payment.feeType === filters.feeType);
    }

    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.dueDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.dueDate) <= new Date(filters.dateTo)
      );
    }

    // Filtre par terme de recherche
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.feeType.toLowerCase().includes(term) ||
        payment.description?.toLowerCase().includes(term) ||
        payment.reference?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      period: '',
      feeType: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type de frais', 'Période', 'Montant dû', 'Montant payé', 'Solde', 'Statut', 'Date de paiement'].join(','),
      ...filteredPayments.map(payment => [
        formatDate(payment.dueDate),
        payment.feeType,
        payment.period,
        payment.totalAmount,
        payment.amountPaid || 0,
        payment.remainingBalance,
        getStatusText(payment.status),
        payment.paymentDate ? formatDate(payment.paymentDate) : 'Non payé'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique_paiements_${studentName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'partial': 'Partiel',
      'completed': 'Payé',
      'overdue': 'En retard'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'partial': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historique des Paiements
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Élève: <span className="font-medium">{studentName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total dû</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.total)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Payé</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(summary.paid)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(summary.pending)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(summary.overdue)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Type de frais, description..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                >
                  <option value="">Toutes les périodes</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="Trimestre 1">Trimestre 1</option>
                  <option value="Trimestre 2">Trimestre 2</option>
                  <option value="Trimestre 3">Trimestre 3</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de frais
                </label>
                <Select
                  value={filters.feeType}
                  onChange={(e) => handleFilterChange('feeType', e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="Frais de scolarité">Frais de scolarité</option>
                  <option value="Frais d'inscription">Frais d'inscription</option>
                  <option value="Frais d'examen">Frais d'examen</option>
                  <option value="Frais d'activités">Frais d'activités</option>
                  <option value="Frais de transport">Frais de transport</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="partial">Partiel</option>
                  <option value="completed">Payé</option>
                  <option value="overdue">En retard</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Effacer filtres
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Chargement de l'historique...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredPayments.length} paiement(s) trouvé(s)
                </p>
              </div>

              {filteredPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun paiement trouvé</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'échéance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type de frais
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Période
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant dû
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant payé
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Solde
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.dueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.feeType}
                                </div>
                                {payment.description && (
                                  <div className="text-sm text-gray-500">
                                    {payment.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(payment.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(payment.amountPaid || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(payment.remainingBalance)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                {getStatusText(payment.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <div className="flex items-center justify-center gap-2">
                                {payment.status !== 'pending' && payment.receiptId && (
                                  <button
                                    onClick={() => onViewReceipt(payment.receiptId)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                    title="Voir le reçu"
                                  >
                                    <Receipt className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;