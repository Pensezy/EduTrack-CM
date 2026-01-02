import { useState } from 'react';
import { Modal } from '@edutrack/ui';
import { X, AlertCircle, CheckCircle, Info, DollarSign, Calendar, Package, Grid3x3 } from 'lucide-react';
import { getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';

/**
 * Modal de demande d'accès à un pack
 *
 * Affiche:
 * - Les détails du pack
 * - Le prix et les économies
 * - Les applications incluses
 * - Formulaire de demande avec message optionnel
 *
 * Workflow:
 * - Directeur fait une demande → Admin approuve → Pack et toutes ses apps activés automatiquement
 */
export default function BundleRequestModal({ isOpen, onClose, bundle, apps = [], onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  if (!bundle) return null;

  // Filtrer les apps du bundle
  const bundleApps = (bundle.app_ids || [])
    .map(appId => apps.find(app => app.id === appId))
    .filter(Boolean);

  const handleRequestAccess = async () => {
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
        .select('current_school_id, id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.current_school_id) {
        throw new Error('Aucune école associée à votre compte');
      }

      // Vérifier si une demande existe déjà
      const { data: existingRequest } = await supabase
        .from('bundle_access_requests')
        .select('id, status')
        .eq('school_id', userData.current_school_id)
        .eq('bundle_id', bundle.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Vous avez déjà une demande en attente pour ce pack');
      }

      // Vérifier si l'abonnement au pack existe déjà
      const { data: existingSub } = await supabase
        .from('school_bundle_subscriptions')
        .select('id, status')
        .eq('school_id', userData.current_school_id)
        .eq('bundle_id', bundle.id)
        .in('status', ['active', 'trial'])
        .single();

      if (existingSub) {
        throw new Error('Vous êtes déjà abonné à ce pack');
      }

      // Créer la demande d'accès au pack
      const { error: insertError } = await supabase
        .from('bundle_access_requests')
        .insert([{
          school_id: userData.current_school_id,
          bundle_id: bundle.id,
          requested_by: userData.id,
          request_message: requestMessage.trim() || null,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      alert(`✅ Demande de pack envoyée avec succès !

Votre demande d'accès au pack "${bundle.name}" a été envoyée à l'administrateur.

Une fois approuvée, le pack et toutes les applications incluses (${bundleApps.length}) seront automatiquement activées pour votre école.

Vous serez notifié une fois qu'elle sera traitée.`);
      onSuccess?.();
      onClose();
      setRequestMessage('');
    } catch (err) {
      console.error('Error requesting bundle access:', err);
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <span className="text-2xl">{bundle.icon || '📦'}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Demander l'accès au {bundle.name}</h2>
            <p className="text-sm text-gray-500">Envoyez votre demande à l'administrateur</p>
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

        {/* Description du pack */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{bundle.description}</p>
        </div>

        {/* Prix et économies */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Prix annuel</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(bundle.price_yearly)} FCFA
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Économies</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatNumber(bundle.savings)} FCFA
            </p>
          </div>
        </div>

        {/* Applications incluses */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Grid3x3 className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              {bundleApps.length} applications incluses
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {bundleApps.map(app => (
              <div
                key={app.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100">
                  <span className="text-lg">{app.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{app.name}</p>
                  <p className="text-xs text-gray-500">{app.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600">
                    {formatNumber(app.price_yearly)} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avantage de la demande */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Activation automatique
              </p>
              <p className="text-sm text-purple-800 mt-1">
                Une fois votre demande approuvée par l'administrateur, le pack et toutes les {bundleApps.length} applications incluses seront automatiquement activées pour votre école avec un compte à rebours jusqu'à expiration.
              </p>
            </div>
          </div>
        </div>

        {/* Message optionnel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message pour l'administrateur (optionnel)
          </label>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Ex: Nous avons besoin de ce pack pour améliorer notre gestion administrative..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Annuler
        </button>
        <button
          onClick={handleRequestAccess}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              Envoyer la demande
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
