import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import paymentService from '../../../services/paymentService';
import PaymentRegistrationModal from './PaymentRegistrationModal';
import ReceiptModal from './ReceiptModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import PaymentCalendarModal from './PaymentCalendarModal';
import PaymentAnalyticsModal from './PaymentAnalyticsModal';

const PaymentTab = () => {
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  
  // États pour les données
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    collected: 0,
    outstanding: 0,
    overdue: 0
  });

  // États pour les modals
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // État pour notification inline
  const [inlineNotification, setInlineNotification] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await paymentService.getAllPayments('production');
      setPayments(data.payments || []);
      setStats(data.statistics || stats);
    } catch (err) {
      setError('Erreur lors du chargement des paiements');
      showError('Erreur lors du chargement des paiements');
      console.error('Erreur chargement paiements:', err);
    } finally {
      setLoading(false);
    }
  };

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'completed', label: 'Payé' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
    { value: 'partial', label: 'Partiel' }
  ];

  const periodOptions = [
    { value: '', label: 'Toutes les périodes' },
    { value: '2024-2025', label: 'Année 2024-2025' },
    { value: 'Trimestre 1', label: 'Trimestre 1' },
    { value: 'Trimestre 2', label: 'Trimestre 2' },
    { value: 'Trimestre 3', label: 'Trimestre 3' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        label: 'Payé',
        className: 'bg-success/10 text-success',
        icon: 'CheckCircle'
      },
      pending: {
        label: 'En attente',
        className: 'bg-warning/10 text-warning',
        icon: 'Clock'
      },
      overdue: {
        label: 'En retard',
        className: 'bg-error/10 text-error',
        icon: 'AlertTriangle'
      },
      partial: {
        label: 'Partiel',
        className: 'bg-primary/10 text-primary',
        icon: 'Minus'
      }
    };
    return configs?.[status] || configs?.pending;
  };

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment?.student?.firstName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         payment?.student?.lastName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         payment?.student?.parentName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         payment?.student?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesClass = !filterClass || payment?.student?.class === filterClass;
    const matchesStatus = !filterStatus || payment?.status === filterStatus;
    const matchesPeriod = !filterPeriod || payment?.period?.includes(filterPeriod);
    
    return matchesSearch && matchesClass && matchesStatus && matchesPeriod;
  });

  const handleSendReminder = async (paymentId) => {
    try {
      setLoading(true);
      await paymentService.sendPaymentReminder(paymentId);
      showSuccess('Rappel envoyé avec succès');
      loadPayments();
    } catch (err) {
      showError('Erreur lors de l\'envoi du rappel');
      console.error('Erreur envoi rappel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    try {
      setLoading(true);
      await paymentService.markAsPaid(paymentId);
      showSuccess('Paiement marqué comme payé');
      loadPayments();
    } catch (err) {
      showError('Erreur lors de la mise à jour');
      console.error('Erreur marquer payé:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReminders = async () => {
    const unpaidPayments = filteredPayments?.filter(p => p?.status === 'overdue' || p?.status === 'pending');
    if (unpaidPayments.length === 0) {
      showInfo('Aucun paiement en attente trouvé');
      setInlineNotification({
        type: 'info',
        message: 'Aucun paiement en attente trouvé'
      });
      setTimeout(() => setInlineNotification(null), 4000);
      return;
    }

    try {
      setBulkReminderLoading(true);
      setInlineNotification({
        type: 'info',
        message: `📨 Envoi de ${unpaidPayments.length} rappel(s) en cours...`
      });
      showInfo(`Envoi de ${unpaidPayments.length} rappel(s) en cours...`);
      
      await paymentService.sendBulkReminders(unpaidPayments.map(p => p.id));
      
      setInlineNotification({
        type: 'success',
        message: `✅ ${unpaidPayments.length} rappel(s) envoyé(s) avec succès !`
      });
      showSuccess(`${unpaidPayments.length} rappel(s) envoyé(s) avec succès`);
      setTimeout(() => setInlineNotification(null), 6000);
    } catch (err) {
      setInlineNotification({
        type: 'error',
        message: `❌ Erreur lors de l'envoi des rappels`
      });
      showError('Erreur lors de l\'envoi des rappels');
      setTimeout(() => setInlineNotification(null), 6000);
      console.error('Erreur rappels groupés:', err);
    } finally {
      setBulkReminderLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const reportData = await paymentService.getPaymentStats();
      // Créer un CSV simple pour l'export
      const csvContent = [
        ['Élève', 'Classe', 'Type de frais', 'Période', 'Montant dû', 'Montant payé', 'Statut'].join(','),
        ...filteredPayments.map(payment => [
          `${payment.student.firstName} ${payment.student.lastName}`,
          payment.student.class,
          payment.feeType,
          payment.period,
          payment.totalAmount,
          payment.amountPaid || 0,
          payment.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rapport_paiements.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Rapport exporté avec succès');
    } catch (err) {
      showError('Erreur lors de l\'export');
      console.error('Erreur export:', err);
    }
  };

  const handleViewHistory = (student) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  const handleViewReceipt = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setShowReceiptModal(true);
  };

  const handleNewPayment = () => {
    setShowRegistrationModal(true);
  };

  const handleShowCalendar = () => {
    setShowCalendarModal(true);
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

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading font-heading-bold text-lg text-text-primary">
            Gestion des Paiements
          </h2>
          <p className="font-body font-body-normal text-xs text-text-secondary mt-0.5">
            Suivi des frais de scolarité et paiements
          </p>
        </div>
        <div className="flex items-center space-x-1.5">
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={handleNewPayment}
            disabled={loading}
          >
            Nouveau
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName={bulkReminderLoading ? null : "Mail"}
            iconPosition="left"
            onClick={handleBulkReminders}
            disabled={loading || bulkReminderLoading}
            loading={bulkReminderLoading}
          >
            {bulkReminderLoading ? 'Envoi...' : 'Rappels'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportReport}
            disabled={loading}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="BarChart3"
            iconPosition="left"
            onClick={() => setShowAnalyticsModal(true)}
            disabled={loading}
          >
            Analyses
          </Button>
        </div>
      </div>

      {/* Notification inline */}
      {inlineNotification && (
        <div className={`p-4 rounded-lg border-l-4 ${
          inlineNotification.type === 'success' 
            ? 'bg-green-50 border-l-green-500 text-green-800' 
            : inlineNotification.type === 'error'
            ? 'bg-red-50 border-l-red-500 text-red-800'
            : inlineNotification.type === 'info'
            ? 'bg-blue-50 border-l-blue-500 text-blue-800'
            : 'bg-yellow-50 border-l-yellow-500 text-yellow-800'
        } transition-all duration-300`}>
          <p className="text-sm font-medium flex items-center">
            <span className="mr-2">{inlineNotification.message}</span>
            {bulkReminderLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            )}
          </p>
        </div>
      )}

      {/* Payment Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <Icon name="Euro" size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {formatCurrency(stats?.total || 0)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Total attendu
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center">
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {formatCurrency(stats?.collected || 0)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Collecté
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-error/10 rounded flex items-center justify-center">
              <Icon name="AlertTriangle" size={16} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {formatCurrency(stats?.outstanding || 0)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En attente
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-warning/10 rounded flex items-center justify-center">
              <Icon name="Clock" size={16} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {(stats?.overdue || 0) + (stats?.pending || 0)}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Impayés
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}  
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="xs"
          iconName="Calendar"
          iconPosition="left"
          onClick={handleShowCalendar}
        >
          Calendrier
        </Button>
        <Button
          variant="ghost"
          size="xs"
          iconName="History"
          iconPosition="left"
          onClick={() => setShowHistoryModal(true)}
        >
          Historique
        </Button>
        <Button
          variant="ghost"
          size="xs"
          iconName="FileText"
          iconPosition="left"
          onClick={() => setShowAnalyticsModal(true)}
        >
          Rapport
        </Button>
        <Button
          variant="ghost"
          size="xs"
          iconName="Repeat"
          iconPosition="left"
          onClick={loadPayments}
          disabled={loading}
        >
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded border border-border p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="search"
            placeholder="Rechercher par nom ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          <Select
            placeholder="Filtrer par classe"
            options={classOptions}
            value={filterClass}
            onChange={setFilterClass}
          />
          <Select
            placeholder="Filtrer par statut"
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
          />
          <Select
            placeholder="Filtrer par période"
            options={periodOptions}
            value={filterPeriod}
            onChange={setFilterPeriod}
          />
        </div>
      </div>
      {/* Payments Table */}
      <div className="bg-card rounded border border-border overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 text-sm">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <Icon name="AlertTriangle" size={32} className="text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadPayments} 
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Élève
                  </th>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Type de frais
                  </th>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Période
                  </th>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Montant
                  </th>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Statut
                  </th>
                  <th className="text-left p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Échéance
                  </th>
                  <th className="text-right p-2 font-heading font-heading-semibold text-xs text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments?.map((payment) => {
                  const statusConfig = getStatusConfig(payment?.status);
                  const isOverdue = new Date(payment.dueDate) < new Date() && payment?.status !== 'completed';

                  return (
                    <tr key={payment?.id} className="border-t border-border hover:bg-muted/50 transition-micro">
                      <td className="p-2">
                        <div>
                          <p className="font-body font-body-semibold text-xs text-text-primary">
                            {payment?.student?.firstName} {payment?.student?.lastName}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            {payment?.student?.class} • {payment?.student?.studentId}
                          </p>
                          <p className="font-caption font-caption-normal text-xs text-text-secondary truncate max-w-32">
                            {payment?.student?.parentName}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <span className="font-body font-body-normal text-xs text-text-primary">
                            {payment?.feeType}
                          </span>
                          {payment?.description && (
                            <p className="font-caption font-caption-normal text-xs text-text-secondary truncate max-w-24">
                              {payment?.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-body font-body-normal text-xs text-text-primary">
                          {payment?.period}
                        </span>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-body font-body-semibold text-xs text-text-primary">
                            {formatCurrency(payment?.totalAmount)}
                          </p>
                          {payment?.status === 'partial' && (
                            <p className="font-caption font-caption-normal text-xs text-success">
                              Payé: {formatCurrency(payment?.amountPaid)}
                            </p>
                          )}
                          {payment?.paymentMethod && (
                            <p className="font-caption font-caption-normal text-xs text-text-secondary truncate max-w-20">
                              {payment?.paymentMethod}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-1">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-caption font-caption-normal ${statusConfig?.className}`}>
                            {statusConfig?.label}
                          </span>
                          {isOverdue && (
                            <Icon name="AlertTriangle" size={12} className="text-error" />
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-body font-body-normal text-xs text-text-primary">
                            {formatDate(payment?.dueDate)}
                          </p>
                          {payment?.paymentDate && (
                            <p className="font-caption font-caption-normal text-xs text-success">
                              Payé le {formatDate(payment?.paymentDate)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-end space-x-1">
                          {payment?.status !== 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleSendReminder(payment?.id)}
                                title="Envoyer un rappel"
                                disabled={loading}
                                className="h-6 w-6 p-0"
                              >
                                <Icon name="Mail" size={12} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleMarkAsPaid(payment?.id)}
                                title="Marquer comme payé"
                                disabled={loading}
                                className="h-6 w-6 p-0"
                              >
                                <Icon name="CheckCircle" size={12} />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewHistory(payment?.student)}
                            title="Voir l'historique"
                            className="h-6 w-6 p-0"
                          >
                            <Icon name="History" size={12} />
                          </Button>
                          {payment?.status !== 'pending' && payment?.receiptId && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleViewReceipt(payment?.receiptId)}
                              title="Voir le reçu"
                              className="h-6 w-6 p-0"
                            >
                              <Icon name="Receipt" size={12} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPayments?.length === 0 && !loading && (
              <div className="p-6 text-center">
                <Icon name="CreditCard" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="font-body font-body-normal text-sm text-text-secondary">
                  Aucun paiement trouvé
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="bg-accent/5 rounded border border-accent/20 p-3">
        <h3 className="font-heading font-heading-semibold text-xs text-text-primary mb-2">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="xs"
            iconName="Plus"
            onClick={handleNewPayment}
            disabled={loading}
          >
            Nouveau
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="Calendar"
            onClick={handleShowCalendar}
          >
            Calendrier
          </Button>
          <Button
            variant="outline"
            size="xs"
            iconName="BarChart3"
            onClick={() => setShowAnalyticsModal(true)}
          >
            Analyses
          </Button>
        </div>
      </div>

      {/* Modals */}
      <PaymentRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          showSuccess('Paiement enregistré avec succès');
          loadPayments();
          setShowRegistrationModal(false);
        }}
      />

      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedPaymentId(null);
        }}
        paymentId={selectedPaymentId}
      />

      <PaymentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedStudent(null);
        }}
        studentId={selectedStudent?.studentId}
        studentName={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
        onViewReceipt={handleViewReceipt}
      />

      <PaymentCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />

      <PaymentAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />
    </div>
  );
};

export default PaymentTab;