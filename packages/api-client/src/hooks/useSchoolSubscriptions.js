/**
 * @edutrack/api - useSchoolSubscriptions Hook
 *
 * Gère les abonnements de l'école (activation, renouvellement, annulation).
 * Fournit des méthodes pour démarrer des essais et activer des abonnements payants.
 *
 * @example
 * ```jsx
 * const {
 *   subscriptions,
 *   startTrial,
 *   activateSubscription,
 *   cancelSubscription,
 *   loading
 * } = useSchoolSubscriptions();
 *
 * const handleStartTrial = async (appId) => {
 *   await startTrial(appId);
 * };
 * ```
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Hook pour gérer les abonnements de l'école
 *
 * @param {object} options - Options du hook
 * @param {boolean} options.enabled - Active/désactive le hook (default: true)
 * @param {boolean} options.includeExpired - Inclure les abonnements expirés (default: false)
 * @returns {object} État et méthodes de gestion des abonnements
 */
export function useSchoolSubscriptions(options = {}) {
  const { enabled = true, includeExpired = false } = options;
  const { user } = useAuth();
  const [state, setState] = useState({
    subscriptions: [],
    loading: true,
    error: null,
  });

  const fetchSubscriptions = async () => {
    if (!user?.school_id) {
      setState({
        subscriptions: [],
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const supabase = getSupabaseClient();

      let query = supabase
        .from('school_subscriptions')
        .select(`
          *,
          app:apps(*),
          bundle:bundles(*)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (!includeExpired) {
        query = query.in('status', ['trial', 'active']);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setState({
        subscriptions: data || [],
        loading: false,
        error: null,
      });

    } catch (err) {
      console.error('[useSchoolSubscriptions] Error fetching subscriptions:', err);
      setState({
        subscriptions: [],
        loading: false,
        error: err.message || 'Erreur lors du chargement des abonnements',
      });
    }
  };

  useEffect(() => {
    if (!enabled) {
      setState({
        subscriptions: [],
        loading: false,
        error: null,
      });
      return;
    }

    fetchSubscriptions();
  }, [user?.school_id, enabled, includeExpired]);

  /**
   * Démarre un essai gratuit pour une application
   */
  const startTrial = async (appId, trialDays = 30) => {
    if (!user?.school_id) {
      throw new Error('Utilisateur non connecté ou sans école');
    }

    try {
      const supabase = getSupabaseClient();

      // Utiliser la fonction SQL start_trial
      const { data, error } = await supabase.rpc('start_trial', {
        p_school_id: user.school_id,
        p_app_id: appId,
        p_trial_days: trialDays,
      });

      if (error) throw error;

      // Rafraîchir la liste
      await fetchSubscriptions();

      return data;
    } catch (err) {
      console.error('[useSchoolSubscriptions] Error starting trial:', err);
      throw new Error(err.message || 'Erreur lors du démarrage de l\'essai');
    }
  };

  /**
   * Active un abonnement payant
   */
  const activateSubscription = async (
    appId,
    paymentMethod,
    paymentReference,
    amountPaid,
    durationMonths = 12
  ) => {
    if (!user?.school_id) {
      throw new Error('Utilisateur non connecté ou sans école');
    }

    try {
      const supabase = getSupabaseClient();

      // Utiliser la fonction SQL activate_subscription
      const { data, error } = await supabase.rpc('activate_subscription', {
        p_school_id: user.school_id,
        p_app_id: appId,
        p_payment_method: paymentMethod,
        p_payment_reference: paymentReference,
        p_amount_paid: amountPaid,
        p_duration_months: durationMonths,
      });

      if (error) throw error;

      // Rafraîchir la liste
      await fetchSubscriptions();

      return data;
    } catch (err) {
      console.error('[useSchoolSubscriptions] Error activating subscription:', err);
      throw new Error(err.message || 'Erreur lors de l\'activation de l\'abonnement');
    }
  };

  /**
   * Annule un abonnement
   */
  const cancelSubscription = async (appId) => {
    if (!user?.school_id) {
      throw new Error('Utilisateur non connecté ou sans école');
    }

    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('school_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq('school_id', user.school_id)
        .eq('app_id', appId);

      if (error) throw error;

      // Rafraîchir la liste
      await fetchSubscriptions();

    } catch (err) {
      console.error('[useSchoolSubscriptions] Error cancelling subscription:', err);
      throw new Error(err.message || 'Erreur lors de l\'annulation de l\'abonnement');
    }
  };

  /**
   * Met à jour les statistiques d'utilisation
   */
  const updateUsageStats = async (appId, featureId, incrementBy = 1) => {
    if (!user?.school_id) {
      throw new Error('Utilisateur non connecté ou sans école');
    }

    try {
      const supabase = getSupabaseClient();

      // Récupérer l'abonnement actuel
      const { data: subscription } = await supabase
        .from('school_subscriptions')
        .select('usage_stats')
        .eq('school_id', user.school_id)
        .eq('app_id', appId)
        .single();

      if (!subscription) {
        throw new Error('Abonnement non trouvé');
      }

      const currentStats = subscription.usage_stats || {};
      const currentUsage = currentStats[featureId] || 0;

      // Mettre à jour les stats
      const { error } = await supabase
        .from('school_subscriptions')
        .update({
          usage_stats: {
            ...currentStats,
            [featureId]: currentUsage + incrementBy,
          },
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('school_id', user.school_id)
        .eq('app_id', appId);

      if (error) throw error;

      // Rafraîchir la liste
      await fetchSubscriptions();

    } catch (err) {
      console.error('[useSchoolSubscriptions] Error updating usage stats:', err);
      // Ne pas throw ici, c'est pas critique
    }
  };

  return {
    subscriptions: state.subscriptions,
    loading: state.loading,
    error: state.error,
    refetch: fetchSubscriptions,

    // Actions
    startTrial,
    activateSubscription,
    cancelSubscription,
    updateUsageStats,

    // Helpers
    getSubscription: (appId) =>
      state.subscriptions.find(sub => sub.app_id === appId),
    hasSubscription: (appId) =>
      state.subscriptions.some(sub => sub.app_id === appId),
    activeSubscriptions: state.subscriptions.filter(sub =>
      sub.status === 'active' || sub.status === 'trial'
    ),
    trialSubscriptions: state.subscriptions.filter(sub =>
      sub.status === 'trial'
    ),
    expiredSubscriptions: state.subscriptions.filter(sub =>
      sub.status === 'expired'
    ),
    cancelledSubscriptions: state.subscriptions.filter(sub =>
      sub.status === 'cancelled'
    ),
  };
}

export default useSchoolSubscriptions;
