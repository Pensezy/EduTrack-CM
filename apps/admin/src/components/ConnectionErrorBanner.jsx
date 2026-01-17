/**
 * Composant de bannière d'erreur de connexion amélioré
 *
 * Affiche un message d'erreur esthétique avec bouton de réessai
 */

import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Bannière d'erreur de connexion esthétique
 *
 * @param {Object} props
 * @param {string} props.error - Message d'erreur à afficher
 * @param {Function} props.onRetry - Fonction à appeler pour réessayer
 * @param {string} [props.title] - Titre personnalisé (défaut: "Problème de connexion")
 * @param {string} [props.variant] - Variante de style: 'connection' | 'warning' | 'error' (défaut: 'connection')
 */
export default function ConnectionErrorBanner({
  error,
  onRetry,
  title = 'Problème de connexion',
  variant = 'connection'
}) {
  if (!error) return null;

  const variants = {
    connection: {
      container: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700',
      Icon: WifiOff
    },
    warning: {
      container: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      Icon: AlertTriangle
    },
    error: {
      container: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700',
      Icon: AlertTriangle
    }
  };

  const style = variants[variant] || variants.connection;
  const IconComponent = style.Icon;

  return (
    <div className={`${style.container} border rounded-xl p-5 shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
            <IconComponent className={`h-6 w-6 ${style.iconColor}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-semibold ${style.title} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${style.text} mb-3`}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center gap-2 px-4 py-2 ${style.button} text-white text-sm font-medium rounded-lg transition-colors shadow-sm`}
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Version compacte de la bannière d'erreur
 */
export function CompactErrorBanner({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <WifiOff className="h-5 w-5 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Réessayer
        </button>
      )}
    </div>
  );
}
