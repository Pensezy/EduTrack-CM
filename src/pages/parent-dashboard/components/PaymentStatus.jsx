import React from 'react';
import Icon from '../../../components/AppIcon';

const PaymentStatus = ({ payments }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'overdue': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10';
      case 'pending': return 'bg-warning/10';
      case 'overdue': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Payé';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalPending = payments?.filter(p => p?.status === 'pending')?.reduce((sum, p) => sum + p?.amount, 0) || 0;
  const totalPaid = payments?.filter(p => p?.status === 'completed')?.reduce((sum, p) => sum + p?.amount, 0) || 0;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Statut des Paiements
        </h3>
        <Icon name="CreditCard" size={20} className="text-primary" />
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-success/10 rounded-lg p-4 text-center">
          <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-success">
            {formatAmount(totalPaid)}
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
            Montant payé
          </p>
        </div>

        <div className="bg-warning/10 rounded-lg p-4 text-center">
          <Icon name="Clock" size={24} className="text-warning mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-warning">
            {formatAmount(totalPending)}
          </div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">
            Montant en attente
          </p>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments?.map(payment => (
          <div key={payment?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  payment?.status === 'completed' ? 'bg-success' :
                  payment?.status === 'pending' ? 'bg-warning' : 'bg-error'
                }`}></div>
                <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                  {payment?.type}
                </h4>
              </div>
              
              <div className="text-right">
                <div className="font-heading font-heading-bold text-xl text-card-foreground">
                  {formatAmount(payment?.amount)}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold ${getStatusBg(payment?.status)} ${getStatusColor(payment?.status)}`}>
                  {getStatusText(payment?.status)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-body font-body-normal text-muted-foreground">
                {payment?.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Building" size={14} className="text-muted-foreground" />
                  <span className="font-caption font-caption-normal text-muted-foreground">
                    {payment?.provider}
                  </span>
                </div>
                
                <span className="font-caption font-caption-normal text-muted-foreground">
                  {payment?.status === 'completed' && payment?.paidDate ? 
                    `Payé le ${formatDate(payment?.paidDate)}` :
                    `Échéance: ${formatDate(payment?.dueDate)}`
                  }
                </span>
              </div>
            </div>

            {/* Action Button for Pending Payments */}
            {payment?.status === 'pending' && (
              <div className="mt-4 pt-3 border-t border-border">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-body font-body-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Icon name="Smartphone" size={16} />
                  Payer via Mobile Money
                </button>
              </div>
            )}
          </div>
        ))}

        {payments?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground">
              Aucun paiement en cours
            </p>
          </div>
        )}
      </div>

      {/* Mobile Money Notice */}
      {totalPending > 0 && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-body font-body-semibold text-primary mb-1">
                Paiement Mobile Money
              </p>
              <p className="font-body font-body-normal text-muted-foreground">
                Vous pouvez effectuer vos paiements via MTN Mobile Money ou Orange Money. 
                Les reçus de paiement sont générés automatiquement après confirmation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;