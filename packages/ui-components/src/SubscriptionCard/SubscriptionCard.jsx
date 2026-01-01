/**
 * @edutrack/ui - SubscriptionCard Component
 *
 * Carte d'affichage d'un abonnement actif
 */

import { AlertCircle, Calendar, Check, Clock, CreditCard, X } from 'lucide-react';
import { cn } from '../utils/cn';

export function SubscriptionCard({
  subscription,
  app,
  onRenew = null,
  onCancel = null,
  onViewDetails = null,
  className = '',
}) {
  const isTrial = subscription.status === 'trial';
  const isActive = subscription.status === 'active';
  const isExpired = subscription.status === 'expired';
  const isCancelled = subscription.status === 'cancelled';

  // Calculer les jours restants
  const expirationDate = subscription.expires_at || subscription.trial_ends_at;
  const daysRemaining = subscription.days_remaining || 0;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  // Détermine la couleur du statut
  const getStatusColor = () => {
    if (isTrial) return 'yellow';
    if (isActive) return 'green';
    if (isExpired) return 'red';
    if (isCancelled) return 'gray';
    return 'gray';
  };

  const statusColor = getStatusColor();

  const statusStyles = {
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      badge: 'bg-gray-100 text-gray-800',
    },
  };

  const styles = statusStyles[statusColor];

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200',
      isExpiringSoon ? 'border-yellow-400 ring-2 ring-yellow-100' : styles.border,
      className
    )}>
      {/* Alerte expiration */}
      {isExpiringSoon && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                {isTrial ? 'Votre essai' : 'Votre abonnement'} expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => onRenew?.(subscription, app)}
                className="text-sm text-yellow-700 underline hover:text-yellow-900 font-medium mt-1"
              >
                Renouveler maintenant
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{app?.icon || '📦'}</div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {app?.name || 'Application'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {/* Badge statut */}
                <span className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                  styles.badge
                )}>
                  {isTrial && <Clock className="h-3 w-3" />}
                  {isActive && <Check className="h-3 w-3" />}
                  {isExpired && <X className="h-3 w-3" />}
                  {isCancelled && <X className="h-3 w-3" />}
                  {isTrial ? 'Essai Gratuit' : isActive ? 'Active' : isExpired ? 'Expirée' : 'Annulée'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-3">
          {/* Date d'expiration */}
          {expirationDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {isExpired ? 'Expiré le' : 'Expire le'}{' '}
                {new Date(expirationDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              {!isExpired && !isCancelled && (
                <span className="text-gray-500">
                  ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}

          {/* Montant payé */}
          {subscription.amount_paid > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {subscription.amount_paid.toLocaleString()} FCFA
              </span>
              {subscription.payment_method && (
                <span className="text-gray-500">
                  ({subscription.payment_method === 'mobile_money' ? 'Mobile Money' : subscription.payment_method})
                </span>
              )}
            </div>
          )}

          {/* Statistiques d'usage */}
          {subscription.usage_stats && Object.keys(subscription.usage_stats).length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                Utilisation
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(subscription.usage_stats).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-600 capitalize">{key}: </span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
          {!isExpired && !isCancelled && (
            <>
              <button
                onClick={() => onViewDetails?.(subscription, app)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Détails
              </button>

              {isTrial && (
                <button
                  onClick={() => onRenew?.(subscription, app)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Passer au Payant
                </button>
              )}

              {isActive && subscription.auto_renew && (
                <button
                  onClick={() => onCancel?.(subscription, app)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Annuler
                </button>
              )}
            </>
          )}

          {(isExpired || isCancelled) && (
            <button
              onClick={() => onRenew?.(subscription, app)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Réactiver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
