/**
 * @edutrack/api - ProtectedRoute Component
 *
 * Composant pour protéger une route qui nécessite un accès à une application.
 * Redirige vers une page d'upgrade si l'utilisateur n'a pas accès.
 *
 * @example
 * ```jsx
 * import { ProtectedRoute } from '@edutrack/api';
 *
 * <ProtectedRoute appId="academic" fallback={<UpgradePage />}>
 *   <AcademicDashboard />
 * </ProtectedRoute>
 * ```
 */

import { useAppAccess } from '../hooks/useAppAccess.js';

/**
 * Composant de route protégée par application
 *
 * @param {object} props - Props du composant
 * @param {string} props.appId - ID de l'application requise
 * @param {React.ReactNode} props.children - Contenu à afficher si accès accordé
 * @param {React.ReactNode} props.fallback - Contenu à afficher si pas d'accès (optionnel)
 * @param {React.ReactNode} props.loading - Contenu à afficher pendant le chargement (optionnel)
 * @param {Function} props.onAccessDenied - Callback appelé si accès refusé (optionnel)
 * @param {boolean} props.redirect - Rediriger vers /upgrade si pas d'accès (default: false)
 * @param {string} props.redirectPath - Chemin de redirection personnalisé (default: /upgrade)
 */
export function ProtectedRoute({
  appId,
  children,
  fallback = null,
  loading = null,
  onAccessDenied = null,
  redirect = false,
  redirectPath = '/upgrade',
}) {
  const { hasAccess, loading: isLoading, subscription, daysRemaining } = useAppAccess(appId);

  // Afficher le loader pendant la vérification
  if (isLoading) {
    return loading || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Si pas d'accès
  if (!hasAccess) {
    // Appeler le callback si fourni
    if (onAccessDenied) {
      onAccessDenied({ appId, subscription });
    }

    // Rediriger si demandé
    if (redirect && typeof window !== 'undefined') {
      window.location.href = `${redirectPath}?app=${appId}`;
      return null;
    }

    // Afficher le fallback ou un message par défaut
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Accès Restreint
          </h2>
          <p className="text-gray-600 mb-6">
            Cette fonctionnalité nécessite l'application <strong>{appId}</strong>.
          </p>
          <button
            onClick={() => window.location.href = `${redirectPath}?app=${appId}`}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Voir les Plans
          </button>
        </div>
      </div>
    );
  }

  // Afficher un avertissement si l'essai expire bientôt
  const showExpiringWarning = subscription?.status === 'trial' && daysRemaining <= 7;

  return (
    <>
      {showExpiringWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Votre essai gratuit expire dans <strong>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong>.
                {' '}
                <a
                  href={`${redirectPath}?app=${appId}`}
                  className="font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  Passez au plan payant pour continuer
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export default ProtectedRoute;
