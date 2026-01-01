/**
 * My Apps Page - Gestion des abonnements
 */

import { useState } from 'react';
import { useApps } from '@edutrack/api';
import { SubscriptionCard } from '@edutrack/ui';
import {
  Package,
  AlertCircle,
  Clock,
  Check,
  TrendingUp,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function MyAppsPage() {
  const {
    activeApps,
    subscriptions,
    activeSubscriptions,
    trialSubscriptions,
    expiringApps,
    cancelSubscription,
    loading
  } = useApps();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'trial' | 'active'

  // Filtrer les abonnements
  const filteredSubscriptions = activeSubscriptions.filter(sub => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'trial') return sub.status === 'trial';
    if (filterStatus === 'active') return sub.status === 'active';
    return true;
  });

  const handleRenew = (subscription, app) => {
    alert(`Renouveler ${app.name} - À implémenter`);
  };

  const handleCancel = async (subscription, app) => {
    if (!confirm(`Êtes-vous sûr de vouloir annuler l'abonnement à ${app.name}?`)) {
      return;
    }

    try {
      await cancelSubscription(subscription.app_id);
      alert('Abonnement annulé avec succès');
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleViewDetails = (subscription, app) => {
    alert(`Détails de ${app.name} - À implémenter`);
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
            Mes Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos abonnements et suivez votre utilisation
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Apps actives */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Apps Actives</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activeApps.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Essais gratuits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Essais Gratuits</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {trialSubscriptions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Apps expirant bientôt */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expire Bientôt</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {expiringApps.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Dépenses totales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dépenses Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscriptions
                  .reduce((sum, sub) => sum + (sub.amount_paid || 0), 0)
                  .toLocaleString()} FCFA
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertes expiration */}
      {expiringApps.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{expiringApps.length}</strong> application{expiringApps.length > 1 ? 's' : ''} expire{expiringApps.length > 1 ? 'nt' : ''} dans moins de 7 jours.
                {' '}
                <button className="font-medium underline hover:text-yellow-600">
                  Renouveler maintenant
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Filtrer:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({activeSubscriptions.length})
          </button>
          <button
            onClick={() => setFilterStatus('trial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'trial'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Essais ({trialSubscriptions.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actives ({activeSubscriptions.filter(s => s.status === 'active').length})
          </button>
        </div>
      </div>

      {/* Liste des abonnements */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubscriptions.map(subscription => {
            const app = activeApps.find(a => a.id === subscription.app_id);
            if (!app) return null;

            return (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                app={app}
                onRenew={handleRenew}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun abonnement
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {filterStatus !== 'all'
              ? 'Aucun abonnement ne correspond à ce filtre'
              : 'Vous n\'avez pas encore d\'abonnement actif'}
          </p>
          <a
            href="/app-store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <TrendingUp className="h-5 w-5" />
            Découvrir les applications
          </a>
        </div>
      )}

      {/* Historique des paiements */}
      {subscriptions.some(s => s.amount_paid > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Historique des Paiements
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions
                  .filter(s => s.amount_paid > 0)
                  .sort((a, b) => new Date(b.activated_at) - new Date(a.activated_at))
                  .map(subscription => {
                    const app = activeApps.find(a => a.id === subscription.app_id);
                    return (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{app?.icon || '📦'}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {app?.name || 'App inconnue'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {subscription.activated_at
                            ? new Date(subscription.activated_at).toLocaleDateString('fr-FR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {subscription.amount_paid.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {subscription.payment_method === 'mobile_money' ? 'Mobile Money' :
                           subscription.payment_method === 'bank_transfer' ? 'Virement' :
                           subscription.payment_method === 'cash' ? 'Espèces' :
                           subscription.payment_method || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {subscription.payment_reference || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
