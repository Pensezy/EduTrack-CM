/**
 * @edutrack/ui - AppCard Component
 *
 * Carte d'affichage d'une application dans le store
 */

import { Check, Clock, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export function AppCard({
  app,
  subscription = null,
  onStartTrial = null,
  onSubscribe = null,
  onViewDetails = null,
  className = '',
}) {
  const isCore = app.is_core;
  const hasSubscription = !!subscription;
  const isTrial = subscription?.is_trial;
  const isActive = subscription?.is_active;
  const daysRemaining = subscription?.days_remaining || 0;

  // Détermine le badge de statut
  const getStatusBadge = () => {
    if (isCore) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="h-3 w-3" />
          Inclus
        </span>
      );
    }

    if (isTrial) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Essai {daysRemaining}j
        </span>
      );
    }

    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Check className="h-3 w-3" />
          Active
        </span>
      );
    }

    return null;
  };

  // Détermine le bouton d'action principal
  const getPrimaryAction = () => {
    if (isCore) {
      return null; // Pas d'action pour les apps core
    }

    if (hasSubscription) {
      return (
        <button
          onClick={() => onViewDetails?.(app)}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Voir Détails
        </button>
      );
    }

    return (
      <div className="space-y-2">
        <button
          onClick={() => onStartTrial?.(app)}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Essai Gratuit 30j
        </button>
        <button
          onClick={() => onSubscribe?.(app)}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Souscrire
        </button>
      </div>
    );
  };

  // Catégorie colors
  const categoryColors = {
    core: 'from-gray-500 to-gray-600',
    pedagogy: 'from-blue-500 to-blue-600',
    administration: 'from-purple-500 to-purple-600',
    communication: 'from-green-500 to-green-600',
    analytics: 'from-orange-500 to-orange-600',
  };

  const gradientClass = categoryColors[app.category] || 'from-gray-500 to-gray-600';

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200',
      className
    )}>
      {/* Header avec icône et badge */}
      <div className={`bg-gradient-to-br ${gradientClass} p-6 text-white relative`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{app.icon || '📦'}</div>
            <div>
              <h3 className="font-semibold text-lg">{app.name}</h3>
              {getStatusBadge() && (
                <div className="mt-1">
                  {getStatusBadge()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {app.description}
        </p>

        {/* Features */}
        {app.features && app.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase">
              Fonctionnalités
            </h4>
            <ul className="space-y-1">
              {app.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {app.features.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{app.features.length - 3} autres...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Prix */}
        {!isCore && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {(app.price_yearly || 0).toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">FCFA/an</span>
            </div>
            {app.price_monthly && (
              <p className="text-xs text-gray-500 mt-1">
                ou {(app.price_monthly).toLocaleString()} FCFA/mois
              </p>
            )}
          </div>
        )}

        {/* Action */}
        <div className="pt-2">
          {getPrimaryAction()}
        </div>
      </div>
    </div>
  );
}

export default AppCard;
