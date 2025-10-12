import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import paymentService from '../../../services/paymentService';

export const PaymentAnalyticsModal = ({ isOpen, onClose }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, period, selectedClass]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(data.payments || []);
      calculateAnalytics(data.payments || []);
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (paymentsData) => {
    const filteredPayments = selectedClass 
      ? paymentsData.filter(p => p.student?.class === selectedClass)
      : paymentsData;

    const now = new Date();
    const periodDate = new Date();
    
    switch(period) {
      case 'week':
        periodDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        periodDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        periodDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        periodDate.setMonth(now.getMonth() - 1);
    }

    const periodPayments = filteredPayments.filter(p => 
      new Date(p.dueDate) >= periodDate
    );

    // Calculs des métriques
    const totalAmount = periodPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = periodPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalOutstanding = totalAmount - totalPaid;
    
    const completedPayments = periodPayments.filter(p => p.status === 'completed').length;
    const pendingPayments = periodPayments.filter(p => p.status === 'pending').length;
    const overduePayments = periodPayments.filter(p => p.status === 'overdue').length;
    const partialPayments = periodPayments.filter(p => p.status === 'partial').length;

    // Analyse par méthode de paiement
    const paymentMethods = {};
    periodPayments.forEach(p => {
      if (p.paymentMethod && p.status !== 'pending') {
        paymentMethods[p.paymentMethod] = (paymentMethods[p.paymentMethod] || 0) + (p.amountPaid || 0);
      }
    });

    // Analyse par type de frais
    const feeTypes = {};
    periodPayments.forEach(p => {
      feeTypes[p.feeType] = (feeTypes[p.feeType] || 0) + p.totalAmount;
    });

    // Analyse par classe
    const classAnalysis = {};
    periodPayments.forEach(p => {
      const className = p.student?.class || 'Non défini';
      if (!classAnalysis[className]) {
        classAnalysis[className] = { total: 0, paid: 0, count: 0 };
      }
      classAnalysis[className].total += p.totalAmount;
      classAnalysis[className].paid += (p.amountPaid || 0);
      classAnalysis[className].count += 1;
    });

    // Taux de recouvrement
    const collectionRate = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    
    // Calcul du taux de ponctualité (paiements à temps)
    const onTimePayments = periodPayments.filter(p => {
      if (p.status !== 'completed' || !p.paymentDate) return false;
      return new Date(p.paymentDate) <= new Date(p.dueDate);
    }).length;
    const punctualityRate = completedPayments > 0 ? (onTimePayments / completedPayments) * 100 : 0;

    setAnalytics({
      period: period,
      totalPayments: periodPayments.length,
      totalAmount,
      totalPaid,
      totalOutstanding,
      completedPayments,
      pendingPayments,
      overduePayments,
      partialPayments,
      collectionRate,
      punctualityRate,
      paymentMethods,
      feeTypes,
      classAnalysis,
      averagePayment: periodPayments.length > 0 ? totalAmount / periodPayments.length : 0
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportReport = () => {
    if (!analytics) return;

    const reportData = [
      ['RAPPORT D\'ANALYSE DES PAIEMENTS'],
      [''],
      ['Période:', getPeriodLabel()],
      ['Classe:', selectedClass || 'Toutes les classes'],
      ['Date de génération:', new Date().toLocaleDateString('fr-FR')],
      [''],
      ['RÉSUMÉ GÉNÉRAL'],
      ['Nombre total de paiements:', analytics.totalPayments],
      ['Montant total attendu:', formatCurrency(analytics.totalAmount)],
      ['Montant total collecté:', formatCurrency(analytics.totalPaid)],
      ['Montant en attente:', formatCurrency(analytics.totalOutstanding)],
      ['Taux de recouvrement:', `${analytics.collectionRate.toFixed(1)}%`],
      ['Taux de ponctualité:', `${analytics.punctualityRate.toFixed(1)}%`],
      [''],
      ['RÉPARTITION PAR STATUT'],
      ['Paiements complétés:', analytics.completedPayments],
      ['Paiements en attente:', analytics.pendingPayments],
      ['Paiements en retard:', analytics.overduePayments],
      ['Paiements partiels:', analytics.partialPayments],
      [''],
      ['ANALYSE PAR MÉTHODE DE PAIEMENT'],
      ...Object.entries(analytics.paymentMethods).map(([method, amount]) => 
        [method, formatCurrency(amount)]
      ),
      [''],
      ['ANALYSE PAR TYPE DE FRAIS'],
      ...Object.entries(analytics.feeTypes).map(([type, amount]) => 
        [type, formatCurrency(amount)]
      )
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse_paiements_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPeriodLabel = () => {
    const labels = {
      'week': 'Dernière semaine',
      'month': 'Dernier mois',
      'quarter': 'Dernier trimestre',
      'year': 'Dernière année'
    };
    return labels[period] || 'Dernier mois';
  };

  const periodOptions = [
    { value: 'week', label: 'Dernière semaine' },
    { value: 'month', label: 'Dernier mois' },
    { value: 'quarter', label: 'Dernier trimestre' },
    { value: 'year', label: 'Dernière année' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analyses Financières
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Statistiques et analyses des paiements scolaires
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportReport}
              disabled={!analytics}
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

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Période d'analyse
              </label>
              <Select
                value={period}
                onChange={setPeriod}
                options={periodOptions}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe
              </label>
              <Select
                value={selectedClass}
                onChange={setSelectedClass}
                options={classOptions}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Calcul des analyses...</span>
            </div>
          )}

          {!loading && analytics && (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Résumé - {getPeriodLabel()}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Total Attendu</p>
                        <p className="text-xl font-bold text-blue-900">
                          {formatCurrency(analytics.totalAmount)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">Total Collecté</p>
                        <p className="text-xl font-bold text-green-900">
                          {formatCurrency(analytics.totalPaid)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600">En Attente</p>
                        <p className="text-xl font-bold text-red-900">
                          {formatCurrency(analytics.totalOutstanding)}
                        </p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Taux Recouvrement</p>
                        <p className="text-xl font-bold text-purple-900">
                          {analytics.collectionRate.toFixed(1)}%
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Répartition par statut */}
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Répartition par Statut</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Complétés</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(analytics.completedPayments / analytics.totalPayments) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.completedPayments}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En attente</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(analytics.pendingPayments / analytics.totalPayments) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.pendingPayments}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">En retard</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(analytics.overduePayments / analytics.totalPayments) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.overduePayments}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Partiels</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(analytics.partialPayments / analytics.totalPayments) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{analytics.partialPayments}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Méthodes de paiement */}
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Méthodes de Paiement</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.paymentMethods).map(([method, amount]) => (
                      <div key={method} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{method}</span>
                        <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.paymentMethods).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Aucune méthode de paiement enregistrée pour cette période
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Analyse par classe */}
              {Object.keys(analytics.classAnalysis).length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Analyse par Classe</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-gray-700">Classe</th>
                          <th className="text-right p-2 font-medium text-gray-700">Nb Paiements</th>
                          <th className="text-right p-2 font-medium text-gray-700">Total Attendu</th>
                          <th className="text-right p-2 font-medium text-gray-700">Total Payé</th>
                          <th className="text-right p-2 font-medium text-gray-700">Taux</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(analytics.classAnalysis).map(([className, data]) => (
                          <tr key={className}>
                            <td className="p-2 font-medium">{className}</td>
                            <td className="p-2 text-right">{data.count}</td>
                            <td className="p-2 text-right">{formatCurrency(data.total)}</td>
                            <td className="p-2 text-right">{formatCurrency(data.paid)}</td>
                            <td className="p-2 text-right">
                              <span className={`px-2 py-1 rounded text-xs ${
                                ((data.paid / data.total) * 100) >= 80 
                                  ? 'bg-green-100 text-green-800'
                                  : ((data.paid / data.total) * 100) >= 50
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {((data.paid / data.total) * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalyticsModal;