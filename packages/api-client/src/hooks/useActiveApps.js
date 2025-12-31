/**
 * @edutrack/api - useActiveApps Hook
 *
 * Récupère toutes les applications actives pour l'école de l'utilisateur.
 * Utilise la fonction SQL get_school_active_apps() créée dans la migration.
 *
 * @example
 * ```jsx
 * const { apps, loading, error } = useActiveApps();
 *
 * return (
 *   <div>
 *     <h2>Vos Applications</h2>
 *     {apps.map(app => (
 *       <AppCard key={app.id} app={app} />
 *     ))}
 *   </div>
 * );
 * ```
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Hook pour récupérer toutes les apps actives de l'école
 *
 * @param {object} options - Options du hook
 * @param {boolean} options.enabled - Active/désactive le hook (default: true)
 * @param {boolean} options.includeCatalog - Inclure toutes les apps disponibles (default: false)
 * @param {number} options.refetchInterval - Intervalle de rafraîchissement en ms (default: null)
 * @returns {object} Liste des applications
 */
export function useActiveApps(options = {}) {
  const { enabled = true, includeCatalog = false, refetchInterval = null } = options;
  const { user } = useAuth();
  const [state, setState] = useState({
    apps: [],
    activeApps: [],
    availableApps: [],
    loading: true,
    error: null,
  });

  const fetchApps = async () => {
    if (!user?.school_id) {
      setState({
        apps: [],
        activeApps: [],
        availableApps: [],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabaseClient();

      // 1. Récupérer toutes les apps du catalogue si demandé
      let catalogApps = [];
      if (includeCatalog) {
        const { data: catalog, error: catalogError } = await supabase
          .from('apps')
          .select('*')
          .eq('status', 'active')
          .order('sort_order');

        if (catalogError) throw catalogError;
        catalogApps = catalog || [];
      }

      // 2. Récupérer les apps actives de l'école
      const { data: subscriptions, error: subsError } = await supabase
        .from('school_subscriptions')
        .select(`
          *,
          app:apps(*)
        `)
        .eq('school_id', user.school_id)
        .in('status', ['trial', 'active']);

      if (subsError && subsError.code !== 'PGRST116') {
        throw subsError;
      }

      // 3. Récupérer les apps core (toujours actives)
      const { data: coreApps, error: coreError } = await supabase
        .from('apps')
        .select('*')
        .eq('is_core', true)
        .eq('status', 'active');

      if (coreError) throw coreError;

      // 4. Construire la liste des apps actives
      const now = new Date();
      const activeApps = [];

      // Ajouter les apps core
      (coreApps || []).forEach(app => {
        activeApps.push({
          ...app,
          subscription_status: 'core',
          is_trial: false,
          is_active: true,
          is_core: true,
          days_remaining: null,
          expires_at: null,
        });
      });

      // Ajouter les apps avec abonnement actif
      (subscriptions || []).forEach(sub => {
        const app = sub.app;
        if (!app) return;

        let isActive = false;
        let daysRemaining = 0;

        if (sub.status === 'trial') {
          const trialEnds = new Date(sub.trial_ends_at);
          isActive = trialEnds > now;
          if (isActive) {
            daysRemaining = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24));
          }
        } else if (sub.status === 'active') {
          const expires = new Date(sub.expires_at);
          isActive = expires > now;
          if (isActive) {
            daysRemaining = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
          }
        }

        if (isActive) {
          activeApps.push({
            ...app,
            subscription_status: sub.status,
            subscription_id: sub.id,
            is_trial: sub.status === 'trial',
            is_active: true,
            is_core: false,
            days_remaining: daysRemaining,
            expires_at: sub.expires_at || sub.trial_ends_at,
            usage_stats: sub.usage_stats,
            last_used_at: sub.last_used_at,
          });
        }
      });

      // 5. Calculer les apps disponibles (si catalog demandé)
      const activeAppIds = activeApps.map(app => app.id);
      const availableApps = catalogApps.filter(app => !activeAppIds.includes(app.id));

      setState({
        apps: includeCatalog ? catalogApps : activeApps,
        activeApps,
        availableApps,
        loading: false,
        error: null,
      });

    } catch (err) {
      console.error('[useActiveApps] Error fetching apps:', err);
      setState({
        apps: [],
        activeApps: [],
        availableApps: [],
        loading: false,
        error: err.message || 'Erreur lors du chargement des applications',
      });
    }
  };

  useEffect(() => {
    if (!enabled) {
      setState({
        apps: [],
        activeApps: [],
        availableApps: [],
        loading: false,
        error: null,
      });
      return;
    }

    fetchApps();

    // Rafraîchissement périodique si demandé
    let interval;
    if (refetchInterval && refetchInterval > 0) {
      interval = setInterval(fetchApps, refetchInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.school_id, enabled, includeCatalog, refetchInterval]);

  return {
    apps: state.apps,
    activeApps: state.activeApps,
    availableApps: state.availableApps,
    loading: state.loading,
    error: state.error,
    refetch: fetchApps,

    // Helpers
    hasApp: (appId) => state.activeApps.some(app => app.id === appId),
    getApp: (appId) => state.activeApps.find(app => app.id === appId),
    coreApps: state.activeApps.filter(app => app.is_core),
    trialApps: state.activeApps.filter(app => app.is_trial),
    paidApps: state.activeApps.filter(app => app.is_active && !app.is_core && !app.is_trial),
    expiringApps: state.activeApps.filter(app =>
      app.days_remaining !== null && app.days_remaining <= 7
    ),
  };
}

export default useActiveApps;
