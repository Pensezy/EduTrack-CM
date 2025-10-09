import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PaymentTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'paid', label: 'Payé' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
    { value: 'partial', label: 'Partiel' }
  ];

  const periodOptions = [
    { value: '', label: 'Toutes les périodes' },
    { value: '2024-09', label: 'Septembre 2024' },
    { value: '2024-10', label: 'Octobre 2024' },
    { value: '2024-11', label: 'Novembre 2024' },
    { value: '2024-12', label: 'Décembre 2024' }
  ];

  const payments = [
    {
      id: 1,
      studentName: "Marie Dubois",
      studentId: "STU001",
      class: "CM2",
      parentName: "Jean Dubois",
      parentPhone: "+237 6 12 34 56 78",
      period: "Novembre 2024",
      amount: 25000,
      paidAmount: 25000,
      status: "paid",
      dueDate: "15/11/2024",
      paidDate: "12/11/2024",
      paymentMethod: "Mobile Money",
      description: "Frais de scolarité mensuelle"
    },
    {
      id: 2,
      studentName: "Pierre Martin",
      studentId: "STU002",
      class: "CM1",
      parentName: "Sophie Martin",
      parentPhone: "+237 6 23 45 67 89",
      period: "Novembre 2024",
      amount: 25000,
      paidAmount: 0,
      status: "pending",
      dueDate: "15/11/2024",
      paidDate: null,
      paymentMethod: null,
      description: "Frais de scolarité mensuelle"
    },
    {
      id: 3,
      studentName: "Camille Rousseau",
      studentId: "STU003",
      class: "CE2",
      parentName: "Marc Rousseau",
      parentPhone: "+237 6 34 56 78 90",
      period: "Octobre 2024",
      amount: 22000,
      paidAmount: 0,
      status: "overdue",
      dueDate: "15/10/2024",
      paidDate: null,
      paymentMethod: null,
      description: "Frais de scolarité mensuelle"
    },
    {
      id: 4,
      studentName: "Lucas Bernard",
      studentId: "STU004",
      class: "CM2",
      parentName: "Anne Bernard",
      parentPhone: "+237 6 45 67 89 01",
      period: "Novembre 2024",
      amount: 35000,
      paidAmount: 15000,
      status: "partial",
      dueDate: "15/11/2024",
      paidDate: "10/11/2024",
      paymentMethod: "Espèces",
      description: "Frais de scolarité + sortie scolaire"
    },
    {
      id: 5,
      studentName: "Emma Leroy",
      studentId: "STU005",
      class: "CE1",
      parentName: "David Leroy",
      parentPhone: "+237 6 56 78 90 12",
      period: "Novembre 2024",
      amount: 20000,
      paidAmount: 20000,
      status: "paid",
      dueDate: "15/11/2024",
      paidDate: "08/11/2024",
      paymentMethod: "Virement bancaire",
      description: "Frais de scolarité mensuelle"
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
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
    const matchesSearch = payment?.studentName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         payment?.parentName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         payment?.studentId?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesClass = !filterClass || payment?.class === filterClass;
    const matchesStatus = !filterStatus || payment?.status === filterStatus;
    const matchesPeriod = !filterPeriod || payment?.period?.includes(filterPeriod);
    
    return matchesSearch && matchesClass && matchesStatus && matchesPeriod;
  });

  const handleSendReminder = (paymentId) => {
    console.log('Send payment reminder for:', paymentId);
  };

  const handleMarkAsPaid = (paymentId) => {
    console.log('Mark as paid:', paymentId);
  };

  const handleBulkReminders = () => {
    const overduePayments = filteredPayments?.filter(p => p?.status === 'overdue' || p?.status === 'pending');
    console.log('Send bulk reminders for:', overduePayments);
  };

  const handleExportReport = () => {
    console.log('Export payment report');
  };

  const getPaymentStats = () => {
    const stats = filteredPayments?.reduce((acc, payment) => {
      acc.total += payment?.amount;
      acc.collected += payment?.paidAmount;
      acc[payment.status] = (acc?.[payment?.status] || 0) + 1;
      return acc;
    }, { total: 0, collected: 0, paid: 0, pending: 0, overdue: 0, partial: 0 });
    
    stats.outstanding = stats?.total - stats?.collected;
    return stats;
  };

  const stats = getPaymentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-xl text-text-primary">
            Gestion des Paiements
          </h2>
          <p className="font-body font-body-normal text-sm text-text-secondary mt-1">
            Suivi des frais de scolarité et paiements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            iconName="Mail"
            iconPosition="left"
            onClick={handleBulkReminders}
          >
            Rappels groupés
          </Button>
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportReport}
          >
            Exporter
          </Button>
        </div>
      </div>
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Euro" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.total?.toLocaleString()} FCFA
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Total attendu
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.collected?.toLocaleString()} FCFA
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Collecté
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.outstanding?.toLocaleString()} FCFA
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                En attente
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-lg text-text-primary">
                {stats?.overdue + stats?.pending}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Impayés
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Élève
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Période
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Montant
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Statut
                </th>
                <th className="text-left p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Échéance
                </th>
                <th className="text-right p-4 font-heading font-heading-semibold text-sm text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments?.map((payment) => {
                const statusConfig = getStatusConfig(payment?.status);
                const isOverdue = new Date(payment.dueDate.split('/').reverse().join('-')) < new Date() && payment?.status !== 'paid';

                return (
                  <tr key={payment?.id} className="border-t border-border hover:bg-muted/50 transition-micro">
                    <td className="p-4">
                      <div>
                        <p className="font-body font-body-semibold text-sm text-text-primary">
                          {payment?.studentName}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          {payment?.class} • ID: {payment?.studentId}
                        </p>
                        <p className="font-caption font-caption-normal text-xs text-text-secondary">
                          {payment?.parentName}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-body font-body-normal text-sm text-text-primary">
                        {payment?.period}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-body font-body-semibold text-sm text-text-primary">
                          {payment?.amount?.toLocaleString()} FCFA
                        </p>
                        {payment?.status === 'partial' && (
                          <p className="font-caption font-caption-normal text-xs text-success">
                            Payé: {payment?.paidAmount?.toLocaleString()} FCFA
                          </p>
                        )}
                        {payment?.paymentMethod && (
                          <p className="font-caption font-caption-normal text-xs text-text-secondary">
                            {payment?.paymentMethod}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-caption font-caption-normal ${statusConfig?.className}`}>
                          {statusConfig?.label}
                        </span>
                        {isOverdue && (
                          <Icon name="AlertTriangle" size={14} className="text-error" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-body font-body-normal text-sm text-text-primary">
                          {payment?.dueDate}
                        </p>
                        {payment?.paidDate && (
                          <p className="font-caption font-caption-normal text-xs text-success">
                            Payé le {payment?.paidDate}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        {payment?.status !== 'paid' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendReminder(payment?.id)}
                              title="Envoyer un rappel"
                            >
                              <Icon name="Mail" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsPaid(payment?.id)}
                              title="Marquer comme payé"
                            >
                              <Icon name="CheckCircle" size={16} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Voir les détails"
                        >
                          <Icon name="Eye" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body font-body-normal text-text-secondary">
              Aucun paiement trouvé avec les critères de recherche
            </p>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="bg-accent/5 rounded-lg border border-accent/20 p-4">
        <h3 className="font-heading font-heading-semibold text-sm text-text-primary mb-3">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            onClick={() => console.log('Add new payment')}
          >
            Nouveau paiement
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            onClick={() => console.log('View payment calendar')}
          >
            Calendrier des échéances
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="BarChart3"
            onClick={() => console.log('View payment analytics')}
          >
            Analyses financières
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTab;