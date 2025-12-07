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
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
            <Icon name="CreditCard" size={24} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl text-gray-900">
            Statut des Paiements
          </h3>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="CheckCircle" size={28} className="mx-auto mb-3" />
          <div className="font-display font-bold text-2xl">
            {formatAmount(totalPaid)}
          </div>
          <p className="font-body-medium text-sm mt-1 text-white/90">
            Montant payé
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-center shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="Clock" size={28} className="mx-auto mb-3" />
          <div className="font-display font-bold text-2xl">
            {formatAmount(totalPending)}
          </div>
          <p className="font-body-medium text-sm mt-1 text-white/90">
            Montant en attente
          </p>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments?.map(payment => (
          <div key={payment?.id} className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
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
              <div className="mt-4 pt-3 border-t-2 border-gray-200">
                <button className="w-full bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-body-bold py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                  <Icon name="Smartphone" size={18} />
                  Payer via Mobile Money
                </button>
              </div>
            )}
          </div>
        ))}

        {payments?.length === 0 && (
          <div className="text-center py-12 px-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="CreditCard" size={40} className="text-white" />
            </div>
            <p className="font-body-bold text-base text-gray-700">
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