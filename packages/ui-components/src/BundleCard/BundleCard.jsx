/**
 * @edutrack/ui - BundleCard Component
 *
 * Carte d'affichage d'un bundle (pack d'applications)
 */

import { Check, Package, Sparkles, TrendingDown, AlertTriangle, Construction } from 'lucide-react';
import { cn } from '../utils/cn';

export function BundleCard({
  bundle,
  apps = [],
  onSubscribe = null,
  recommended = false,
  className = '',
}) {
  // Calculer le prix total si acheté séparément
  const totalPriceIndividual = apps.reduce((sum, app) => sum + (app.price_yearly || 0), 0);
  const savings = bundle.savings || (totalPriceIndividual - bundle.price_yearly);
  const savingsPercent = totalPriceIndividual > 0
    ? Math.round((savings / totalPriceIndividual) * 100)
    : 0;

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200',
      recommended ? 'border-primary-500 border-2 ring-4 ring-primary-100' : 'border-gray-200',
      className
    )}>
      {/* Badge recommandé */}
      {recommended && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>RECOMMANDÉ</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cn(
        'p-6 text-center',
        recommended ? 'bg-gradient-to-br from-primary-50 to-primary-100' : 'bg-gray-50'
      )}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4">
          <Package className={cn(
            'h-8 w-8',
            recommended ? 'text-primary-600' : 'text-gray-600'
          )} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {bundle.name}
        </h3>

        <p className="text-sm text-gray-600">
          {bundle.description}
        </p>
      </div>

      {/* Prix */}
      <div className="p-6 text-center border-b border-gray-200">
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {(bundle.price_yearly || 0).toLocaleString()}
          </span>
          <span className="text-gray-600">FCFA/an</span>
        </div>

        {/* Économie */}
        {savings > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <TrendingDown className="h-4 w-4" />
            <span>Économisez {savings.toLocaleString()} FCFA ({savingsPercent}%)</span>
          </div>
        )}
      </div>

      {/* Applications incluses */}
      <div className="p-6 space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase">
          Applications Incluses
        </h4>

        <ul className="space-y-2">
          {apps.map((app, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                {app.icon || '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {app.name}
                  </p>
                  {app.development_status === 'beta' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Beta
                    </span>
                  )}
                  {app.development_status === 'in_development' && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                      <Construction className="h-2.5 w-2.5" />
                      En Dev
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {app.price_yearly?.toLocaleString()} FCFA/an
                </p>
              </div>
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            </li>
          ))}
        </ul>

        {/* Avantages extra */}
        {bundle.features_extra && Object.keys(bundle.features_extra).length > 0 && (
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase">
              Avantages
            </h4>
            <ul className="space-y-1.5">
              {bundle.features_extra.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}

              {bundle.features_extra.support && (
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Support {bundle.features_extra.support === 'phone' ? 'téléphonique' : bundle.features_extra.support}</span>
                </li>
              )}

              {bundle.features_extra.training && (
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Formation {bundle.features_extra.training === 'onsite' ? 'sur site' : 'vidéo'}</span>
                </li>
              )}

              {bundle.features_extra.sms_monthly && (
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>{bundle.features_extra.sms_monthly} SMS/mois inclus</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Bouton d'action */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSubscribe?.(bundle)}
          className={cn(
            'w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105',
            recommended
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          )}
        >
          {recommended ? 'Choisir ce Pack' : 'Souscrire'}
        </button>
      </div>
    </div>
  );
}

export default BundleCard;
