/**
 * @edutrack/api - AppsContext
 *
 * Context global pour gérer l'état des applications de l'école.
 * Fournit les apps actives, les abonnements et les méthodes de gestion.
 *
 * @example
 * ```jsx
 * import { AppsProvider, useApps } from '@edutrack/api';
 *
 * // Dans App.jsx
 * <AppsProvider>
 *   <YourApp />
 * </AppsProvider>
 *
 * // Dans un composant
 * const { activeApps, hasApp, startTrial } = useApps();
 * ```
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useActiveApps } from '../hooks/useActiveApps.js';
import { useSchoolSubscriptions } from '../hooks/useSchoolSubscriptions.js';

const AppsContext = createContext(null);

/**
 * Provider du contexte Apps
 *
 * @param {object} props - Props du provider
 * @param {React.ReactNode} props.children - Composants enfants
 * @param {boolean} props.includeCatalog - Inclure le catalogue complet (default: true)
 * @param {number} props.refetchInterval - Intervalle de rafraîchissement en ms (default: null)
 */
export function AppsProvider({
  children,
  includeCatalog = true,
  refetchInterval = null,
}) {
  const { user } = useAuth();

  // Hooks pour les apps et abonnements
  const appsData = useActiveApps({
    enabled: !!user?.school_id,
    includeCatalog,
    refetchInterval,
  });

  const subscriptionsData = useSchoolSubscriptions({
    enabled: !!user?.school_id,
    includeExpired: false,
  });

  // État local pour les notifications
  const [notifications, setNotifications] = useState([]);

  // Détecter les apps qui expirent bientôt
  useEffect(() => {
    if (!appsData.expiringApps || appsData.expiringApps.length === 0) {
      return;
    }

    const newNotifications = appsData.expiringApps.map(app => ({
      id: `expiring-${app.id}`,
      type: 'warning',
      appId: app.id,
      title: `${app.name} expire bientôt`,
      message: `Votre ${app.is_trial ? 'essai gratuit' : 'abonnement'} expire dans ${app.days_remaining} jour${app.days_remaining > 1 ? 's' : ''}`,
      daysRemaining: app.days_remaining,
      action: {
        label: 'Renouveler',
        href: `/upgrade?app=${app.id}`,
      },
    }));

    setNotifications(prev => {
      // Fusionner les nouvelles notifications sans doublons
      const existingIds = prev.map(n => n.id);
      const toAdd = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...toAdd];
    });
  }, [appsData.expiringApps]);

  /**
   * Démarre un essai gratuit et affiche une notification
   */
  const startTrial = async (appId) => {
    try {
      const result = await subscriptionsData.startTrial(appId);

      // Ajouter une notification de succès
      setNotifications(prev => [
        ...prev,
        {
          id: `trial-started-${appId}`,
          type: 'success',
          appId,
          title: 'Essai gratuit démarré',
          message: `Votre essai gratuit de 30 jours a commencé!`,
          autoHide: true,
        },
      ]);

      // Rafraîchir les apps
      await appsData.refetch();

      return result;
    } catch (error) {
      // Ajouter une notification d'erreur
      setNotifications(prev => [
        ...prev,
        {
          id: `trial-error-${appId}`,
          type: 'error',
          appId,
          title: 'Erreur',
          message: error.message || 'Impossible de démarrer l\'essai',
          autoHide: true,
        },
      ]);

      throw error;
    }
  };

  /**
   * Active un abonnement payant et affiche une notification
   */
  const activateSubscription = async (appId, paymentMethod, paymentReference, amountPaid, durationMonths) => {
    try {
      const result = await subscriptionsData.activateSubscription(
        appId,
        paymentMethod,
        paymentReference,
        amountPaid,
        durationMonths
      );

      // Ajouter une notification de succès
      setNotifications(prev => [
        ...prev,
        {
          id: `subscription-activated-${appId}`,
          type: 'success',
          appId,
          title: 'Abonnement activé',
          message: `Votre abonnement a été activé avec succès!`,
          autoHide: true,
        },
      ]);

      // Rafraîchir les apps
      await appsData.refetch();

      return result;
    } catch (error) {
      // Ajouter une notification d'erreur
      setNotifications(prev => [
        ...prev,
        {
          id: `subscription-error-${appId}`,
          type: 'error',
          appId,
          title: 'Erreur',
          message: error.message || 'Impossible d\'activer l\'abonnement',
          autoHide: true,
        },
      ]);

      throw error;
    }
  };

  /**
   * Supprime une notification
   */
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Supprime toutes les notifications
   */
  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    // Apps
    apps: appsData.apps,
    activeApps: appsData.activeApps,
    availableApps: appsData.availableApps,
    coreApps: appsData.coreApps,
    trialApps: appsData.trialApps,
    paidApps: appsData.paidApps,
    expiringApps: appsData.expiringApps,

    // Subscriptions
    subscriptions: subscriptionsData.subscriptions,
    activeSubscriptions: subscriptionsData.activeSubscriptions,
    trialSubscriptions: subscriptionsData.trialSubscriptions,
    expiredSubscriptions: subscriptionsData.expiredSubscriptions,

    // État
    loading: appsData.loading || subscriptionsData.loading,
    error: appsData.error || subscriptionsData.error,

    // Méthodes d'apps
    hasApp: appsData.hasApp,
    getApp: appsData.getApp,
    refetchApps: appsData.refetch,

    // Méthodes d'abonnements
    getSubscription: subscriptionsData.getSubscription,
    hasSubscription: subscriptionsData.hasSubscription,
    refetchSubscriptions: subscriptionsData.refetch,

    // Actions
    startTrial,
    activateSubscription,
    cancelSubscription: subscriptionsData.cancelSubscription,
    updateUsageStats: subscriptionsData.updateUsageStats,

    // Notifications
    notifications,
    dismissNotification,
    clearNotifications,
  };

  return (
    <AppsContext.Provider value={value}>
      {children}
    </AppsContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte Apps
 */
export function useApps() {
  const context = useContext(AppsContext);

  if (!context) {
    throw new Error('useApps must be used within an AppsProvider');
  }

  return context;
}

export default AppsContext;
