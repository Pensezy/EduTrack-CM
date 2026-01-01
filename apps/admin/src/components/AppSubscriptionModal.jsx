import { useState } from 'react';
import { Modal } from '@edutrack/ui';
import { X, AlertTriangle, CheckCircle, Info, DollarSign, Calendar, Zap } from 'lucide-react';
import { getSupabaseClient } from '@edutrack/api';

/**
 * Modal de confirmation pour souscrire à une application
 *
 * Affiche:
 * - Les détails de l'application
 * - Le prix et la période d'essai
 * - Les fonctionnalités incluses
 * - Avertissement si l'app est en développement
 * - Confirmation avant souscription
 */
export default function AppSubscriptionModal({ isOpen, onClose, app, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('trial'); // trial ou direct

  if (!app) return null;

  const isInDevelopment = app.development_status === 'in_development';
  const isBeta = app.development_status === 'beta';
  const isFree = app.is_core || app.price_yearly === 0;

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Récupérer les infos utilisateur pour avoir le school_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_school_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.current_school_id) {
        throw new Error('Aucune école associée à votre compte');
      }

      // Vérifier si l'abonnement existe déjà
      const { data: existing, error: existingError } = await supabase
        .from('school_subscriptions')
        .select('id, status')
        .eq('school_id', userData.current_school_id)
        .eq('app_id', app.id)
        .single();

      if (!existingError && existing) {
        throw new Error('Vous êtes déjà abonné à cette application');
      }

      // Créer l'abonnement
      const now = new Date();
      const subscriptionData = {
        school_id: userData.current_school_id,
        app_id: app.id,
        status: subscriptionType,
        activated_at: now.toISOString(),
      };

      if (subscriptionType === 'trial') {
        // Période d'essai de 30 jours
        const trialEnds = new Date(now);
        trialEnds.setDate(trialEnds.getDate() + 30);
        subscriptionData.trial_ends_at = trialEnds.toISOString();
      } else {
        // Abonnement direct pour 1 an
        const expires = new Date(now);
        expires.setFullYear(expires.getFullYear() + 1);
        subscriptionData.expires_at = expires.toISOString();
        subscriptionData.amount_paid = app.price_yearly;
      }

      const { error: insertError } = await supabase
        .from('school_subscriptions')
        .insert([subscriptionData]);

      if (insertError) throw insertError;

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error subscribing to app:', err);
      setError(err.message || 'Erreur lors de la souscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <span className="text-2xl">{app.icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Souscrire à {app.name}</h2>
            <p className="text-sm text-gray-500">Confirmez votre abonnement</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Avertissement si app en développement */}
        {isInDevelopment && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Application en développement
                </p>
                <p className="text-sm text-orange-800 mt-1">
                  Cette application est encore en cours de développement. Certaines fonctionnalités peuvent ne pas être disponibles ou fonctionner partiellement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Avertissement si beta */}
        {isBeta && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Version Beta
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Cette application est en version beta. Vous pourriez rencontrer des bugs ou des fonctionnalités incomplètes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Description</h3>
          <p className="text-sm text-gray-600">{app.description}</p>
        </div>

        {/* Fonctionnalités */}
        {app.features && app.features.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Fonctionnalités incluses</h3>
            <ul className="space-y-2">
              {app.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prix et options d'abonnement */}
        {!isFree && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Type d'abonnement</h3>

            {/* Option: Période d'essai */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="radio"
                name="subscriptionType"
                value="trial"
                checked={subscriptionType === 'trial'}
                onChange={(e) => setSubscriptionType(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-gray-900">Essai gratuit</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Recommandé
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Testez gratuitement pendant 30 jours, puis {app.price_yearly?.toLocaleString()} FCFA/an
                </p>
              </div>
            </label>

            {/* Option: Abonnement direct */}
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="radio"
                name="subscriptionType"
                value="active"
                checked={subscriptionType === 'active'}
                onChange={(e) => setSubscriptionType(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">Abonnement annuel</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {app.price_yearly?.toLocaleString()} FCFA/an - Accès immédiat et complet
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Info si gratuit */}
        {isFree && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">
                  Application gratuite
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Cette application est incluse gratuitement dans votre forfait.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Détails de validité */}
        {!isFree && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4" />
              <span>
                {subscriptionType === 'trial'
                  ? 'Période d\'essai de 30 jours'
                  : 'Abonnement valable 1 an'
                }
              </span>
            </div>
            {subscriptionType === 'trial' && (
              <p className="text-xs text-gray-600 ml-6">
                Vous pourrez annuler à tout moment pendant la période d'essai
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading || isInDevelopment}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Souscription...' : isFree ? 'Activer gratuitement' : subscriptionType === 'trial' ? 'Démarrer l\'essai gratuit' : 'Souscrire maintenant'}
        </button>
      </div>
    </Modal>
  );
}
