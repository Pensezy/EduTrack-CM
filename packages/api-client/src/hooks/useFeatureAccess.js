/**
 * @edutrack/api - useFeatureAccess Hook
 *
 * Vérifie si une fonctionnalité spécifique est accessible.
 * Combine la vérification d'accès à l'app + la vérification de la feature.
 *
 * @example
 * ```jsx
 * const { hasAccess, loading } = useFeatureAccess('academic', 'notes');
 *
 * if (!hasAccess) {
 *   return <FeatureLockedMessage feature="Gestion des notes" />;
 * }
 *
 * return <NotesManager />;
 * ```
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAppAccess } from './useAppAccess.js';

/**
 * Hook pour vérifier l'accès à une fonctionnalité spécifique
 *
 * @param {string} appId - ID de l'application (ex: 'academic')
 * @param {string} featureId - ID de la fonctionnalité (ex: 'notes', 'bulletins')
 * @param {object} options - Options du hook
 * @param {boolean} options.enabled - Active/désactive le hook (default: true)
 * @returns {object} État de l'accès à la feature
 */
export function useFeatureAccess(appId, featureId, options = {}) {
  const { enabled = true } = options;
  const { user } = useAuth();
  const appAccess = useAppAccess(appId, { enabled });
  const [featureState, setFeatureState] = useState({
    hasAccess: false,
    loading: true,
    error: null,
    limitations: null,
    credits: null,
  });

  useEffect(() => {
    if (!enabled || !appId || !featureId) {
      setFeatureState({
        hasAccess: false,
        loading: false,
        error: null,
        limitations: null,
        credits: null,
      });
      return;
    }

    // Attendre que la vérification app soit terminée
    if (appAccess.loading) {
      setFeatureState(prev => ({ ...prev, loading: true }));
      return;
    }

    // Si pas d'accès à l'app, pas d'accès à la feature
    if (!appAccess.hasAccess) {
      setFeatureState({
        hasAccess: false,
        loading: false,
        error: 'Pas d\'accès à l\'application',
        limitations: null,
        credits: null,
      });
      return;
    }

    checkFeatureAccess();
  }, [appId, featureId, enabled, appAccess.hasAccess, appAccess.loading]);

  const checkFeatureAccess = async () => {
    try {
      setFeatureState(prev => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabaseClient();

      // Récupérer les infos de l'app
      const { data: app, error: appError } = await supabase
        .from('apps')
        .select('features, limitations, credits')
        .eq('id', appId)
        .single();

      if (appError) throw appError;

      // Vérifier si la feature existe dans l'app
      const features = app?.features || [];
      const hasFeature = features.includes(featureId);

      if (!hasFeature) {
        setFeatureState({
          hasAccess: false,
          loading: false,
          error: `Fonctionnalité "${featureId}" non disponible dans l'app "${appId}"`,
          limitations: null,
          credits: null,
        });
        return;
      }

      // Récupérer les limitations et crédits
      const limitations = app?.limitations || {};
      const credits = app?.credits || {};

      // Vérifier si la feature est limitée
      const featureLimitation = limitations[featureId];
      let hasAccess = true;

      // Si c'est un essai et que la feature est limitée
      if (appAccess.isTrial && featureLimitation?.trial === false) {
        hasAccess = false;
      }

      // Vérifier les crédits si applicable
      let remainingCredits = null;
      if (credits[featureId]) {
        const { data: subscription } = await supabase
          .from('school_subscriptions')
          .select('usage_stats')
          .eq('school_id', user.school_id)
          .eq('app_id', appId)
          .single();

        const usageStats = subscription?.usage_stats || {};
        const used = usageStats[featureId] || 0;
        const total = credits[featureId];
        remainingCredits = Math.max(0, total - used);

        // Si plus de crédits, pas d'accès
        if (remainingCredits <= 0) {
          hasAccess = false;
        }
      }

      setFeatureState({
        hasAccess,
        loading: false,
        error: null,
        limitations: featureLimitation,
        credits: remainingCredits !== null ? {
          total: credits[featureId],
          remaining: remainingCredits,
          used: credits[featureId] - remainingCredits,
        } : null,
      });

    } catch (err) {
      console.error('[useFeatureAccess] Error checking feature access:', err);
      setFeatureState({
        hasAccess: false,
        loading: false,
        error: err.message || 'Erreur lors de la vérification de l\'accès',
        limitations: null,
        credits: null,
      });
    }
  };

  return {
    hasAccess: featureState.hasAccess,
    loading: appAccess.loading || featureState.loading,
    error: featureState.error || appAccess.error,
    limitations: featureState.limitations,
    credits: featureState.credits,
    refetch: checkFeatureAccess,

    // App access info (passthrough)
    appAccess: {
      hasAccess: appAccess.hasAccess,
      isTrial: appAccess.isTrial,
      isActive: appAccess.isActive,
      isCore: appAccess.isCore,
      daysRemaining: appAccess.daysRemaining,
    },
  };
}

export default useFeatureAccess;
