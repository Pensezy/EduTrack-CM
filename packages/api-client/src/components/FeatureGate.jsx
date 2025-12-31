/**
 * @edutrack/api - FeatureGate Component
 *
 * Composant pour conditionner l'affichage d'une fonctionnalité.
 * Affiche un message de mise à niveau si la feature n'est pas accessible.
 *
 * @example
 * ```jsx
 * import { FeatureGate } from '@edutrack/api';
 *
 * <FeatureGate appId="academic" featureId="bulletins">
 *   <BulletinsManager />
 * </FeatureGate>
 * ```
 */

import { useFeatureAccess } from '../hooks/useFeatureAccess.js';

/**
 * Composant de contrôle d'accès à une fonctionnalité
 *
 * @param {object} props - Props du composant
 * @param {string} props.appId - ID de l'application
 * @param {string} props.featureId - ID de la fonctionnalité
 * @param {React.ReactNode} props.children - Contenu à afficher si accès accordé
 * @param {React.ReactNode} props.fallback - Contenu à afficher si pas d'accès (optionnel)
 * @param {React.ReactNode} props.loading - Contenu à afficher pendant le chargement (optionnel)
 * @param {string} props.featureName - Nom de la feature à afficher (optionnel)
 * @param {boolean} props.showCredits - Afficher les crédits restants si applicable (default: true)
 * @param {Function} props.onAccessDenied - Callback appelé si accès refusé (optionnel)
 */
export function FeatureGate({
  appId,
  featureId,
  children,
  fallback = null,
  loading = null,
  featureName = null,
  showCredits = true,
  onAccessDenied = null,
}) {
  const {
    hasAccess,
    loading: isLoading,
    error,
    credits,
    limitations,
    appAccess,
  } = useFeatureAccess(appId, featureId);

  // Afficher le loader pendant la vérification
  if (isLoading) {
    return loading || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Si pas d'accès
  if (!hasAccess) {
    // Appeler le callback si fourni
    if (onAccessDenied) {
      onAccessDenied({ appId, featureId, error, limitations, appAccess });
    }

    // Afficher le fallback ou un message par défaut
    return fallback || (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-gray-400"
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
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Fonctionnalité Non Disponible
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              {error ? (
                <p>{error}</p>
              ) : (
                <>
                  <p>
                    {featureName ? (
                      <>La fonctionnalité <strong>{featureName}</strong> n'est pas disponible avec votre plan actuel.</>
                    ) : (
                      <>Cette fonctionnalité nécessite une mise à niveau.</>
                    )}
                  </p>
                  {appAccess.isTrial && (
                    <p className="mt-2 text-yellow-700">
                      Vous êtes en période d'essai. Certaines fonctionnalités sont limitées.
                    </p>
                  )}
                  {credits && credits.remaining === 0 && (
                    <p className="mt-2 text-red-700">
                      Vous avez épuisé vos crédits pour cette fonctionnalité ({credits.used}/{credits.total} utilisés).
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.href = `/upgrade?app=${appId}&feature=${featureId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un avertissement si les crédits sont faibles
  const showCreditsWarning = showCredits && credits && credits.remaining <= credits.total * 0.2;

  return (
    <>
      {showCreditsWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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
                Attention: Il vous reste <strong>{credits.remaining}</strong> crédit{credits.remaining > 1 ? 's' : ''} sur {credits.total}.
                {' '}
                <a
                  href={`/upgrade?app=${appId}&feature=${featureId}`}
                  className="font-medium underline text-yellow-700 hover:text-yellow-600"
                >
                  Acheter plus de crédits
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Afficher les crédits restants */}
      {showCredits && credits && credits.remaining > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>Crédits disponibles</span>
          <span className="font-medium">
            {credits.remaining} / {credits.total}
          </span>
        </div>
      )}

      {children}
    </>
  );
}

export default FeatureGate;
