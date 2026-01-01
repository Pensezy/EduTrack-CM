/**
 * @edutrack/api - useAppAccess Hook
 *
 * Vérifie si une école a accès à une application spécifique.
 * Utilise la fonction SQL has_active_app() créée dans la migration.
 *
 * @example
 * ```jsx
 * const { hasAccess, loading, error } = useAppAccess('academic');
 *
 * if (loading) return <Spinner />;
 * if (!hasAccess) return <UpgradePrompt app="academic" />;
 *
 * return <AcademicDashboard />;
 * ```
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Hook pour vérifier l'accès à une application
 *
 * @param {string} appId - ID de l'application (ex: 'academic', 'financial')
 * @param {object} options - Options du hook
 * @param {boolean} options.enabled - Active/désactive le hook (default: true)
 * @param {number} options.refetchInterval - Intervalle de rafraîchissement en ms (default: null)
 * @returns {object} État de l'accès
 */
export function useAppAccess(appId, options = {}) {
  const { enabled = true, refetchInterval = null } = options;
  const { user } = useAuth();
  const [state, setState] = useState({
    hasAccess: false,
    loading: true,
    error: null,
    subscription: null,
  });

  const checkAccess = async () => {
    // Si pas d'utilisateur ou pas d'école, pas d'accès
    if (!user?.current_school_id) {
      setState({
        hasAccess: false,
        loading: false,
        error: null,
        subscription: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabaseClient();

      // 1. Vérifier si l'app est core (toujours accessible)
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .select('is_core')
        .eq('id', appId)
        .single();

      if (appError) throw appError;

      // Si app core, accès automatique
      if (appData?.is_core) {
        setState({
          hasAccess: true,
          loading: false,
          error: null,
          subscription: {
            app_id: appId,
            status: 'core',
            is_core: true,
          },
        });
        return;
      }

      // 2. Vérifier l'abonnement actif
      const { data: subscription, error: subError } = await supabase
        .from('school_subscriptions')
        .select('*')
        .eq('school_id', user.current_school_id)
        .eq('app_id', appId)
        .in('status', ['trial', 'active'])
        .single();

      if (subError && subError.code !== 'PGRST116') {
        // PGRST116 = pas de résultat, c'est OK
        throw subError;
      }

      // Vérifier les dates de validité
      let hasAccess = false;
      if (subscription) {
        const now = new Date();

        if (subscription.status === 'trial') {
          const trialEnds = new Date(subscription.trial_ends_at);
          hasAccess = trialEnds > now;
        } else if (subscription.status === 'active') {
          const expires = new Date(subscription.expires_at);
          hasAccess = expires > now;
        }
      }

      setState({
        hasAccess,
        loading: false,
        error: null,
        subscription: subscription || null,
      });

    } catch (err) {
      console.error('[useAppAccess] Error checking access:', err);
      setState({
        hasAccess: false,
        loading: false,
        error: err.message || 'Erreur lors de la vérification de l\'accès',
        subscription: null,
      });
    }
  };

  useEffect(() => {
    if (!enabled || !appId) {
      setState({
        hasAccess: false,
        loading: false,
        error: null,
        subscription: null,
      });
      return;
    }

    checkAccess();

    // Rafraîchissement périodique si demandé
    let interval;
    if (refetchInterval && refetchInterval > 0) {
      interval = setInterval(checkAccess, refetchInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appId, user?.current_school_id, enabled, refetchInterval]);

  return {
    hasAccess: state.hasAccess,
    loading: state.loading,
    error: state.error,
    subscription: state.subscription,
    refetch: checkAccess,

    // Helpers
    isTrial: state.subscription?.status === 'trial',
    isActive: state.subscription?.status === 'active',
    isCore: state.subscription?.is_core === true,
    expiresAt: state.subscription?.expires_at || state.subscription?.trial_ends_at,
    daysRemaining: state.subscription ? calculateDaysRemaining(
      state.subscription.expires_at || state.subscription.trial_ends_at
    ) : 0,
  };
}

/**
 * Calcule les jours restants avant expiration
 */
function calculateDaysRemaining(expirationDate) {
  if (!expirationDate) return 0;

  const now = new Date();
  const expires = new Date(expirationDate);
  const diff = expires - now;

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default useAppAccess;
