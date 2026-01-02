import { useState } from 'react';
import { Modal } from '@edutrack/ui';
import { X, AlertTriangle, CheckCircle, Info, DollarSign, Calendar, Zap } from 'lucide-react';
import { getSupabaseClient } from '@edutrack/api';

/**
 * Modal de demande d'accès à une application
 *
 * Affiche:
 * - Les détails de l'application
 * - Le prix
 * - Les fonctionnalités incluses
 * - Avertissement si l'app est en développement (bloque la demande)
 * - Formulaire de demande avec message optionnel
 *
 * Workflow:
 * - Directeur fait une demande → Admin approuve → Abonnement créé
 */
export default function AppSubscriptionModal({ isOpen, onClose, app, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  if (!app) return null;

  const isInDevelopment = app.development_status === 'in_development';
  const isBeta = app.development_status === 'beta';
  const isFree = app.is_core || app.price_yearly === 0;

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
        .from('app_access_requests')
        .select('id, status')
        .eq('school_id', userData.current_school_id)
        .eq('app_id', app.id)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        throw new Error('Vous avez déjà une demande en attente pour cette application');
      }

      // Vérifier si l'abonnement existe déjà
      const { data: existingSub } = await supabase
        .from('school_subscriptions')
        .select('id, status')
        .eq('school_id', userData.current_school_id)
        .eq('app_id', app.id)
        .in('status', ['active', 'trial'])
        .single();

      if (existingSub) {
        throw new Error('Vous êtes déjà abonné à cette application');
      }

      // Créer la demande d'accès
      const { error: insertError } = await supabase
        .from('app_access_requests')
        .insert([{
          school_id: userData.current_school_id,
          app_id: app.id,
          requested_by: userData.id,
          request_message: requestMessage.trim() || null,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      alert('✅ Demande envoyée avec succès !\n\nVotre demande d\'accès a été envoyée à l\'administrateur. Vous serez notifié une fois qu\'elle sera traitée.');
      onSuccess?.();
      onClose();
      setRequestMessage('');
    } catch (err) {
      console.error('Error requesting app access:', err);
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
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
            <h2 className="text-lg font-semibold text-gray-900">Demander l'accès à {app.name}</h2>
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

        {/* Avertissement si app en développement (BLOQUÉ) */}
        {isInDevelopment && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Application non disponible
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Cette application est encore en cours de développement et n'est pas encore disponible pour une demande d'accès. Veuillez réessayer lorsqu'elle sera en version Beta ou Prête.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info si beta */}
        {isBeta && !isInDevelopment && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">
                  Version Beta
                </p>
                <p className="text-sm text-purple-800 mt-1">
                  Cette application est en phase de test. Vous pourriez rencontrer des bugs ou des fonctionnalités incomplètes. Votre demande sera examinée par l'administrateur.
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

        {/* Prix (pour information) */}
        {!isFree && !isInDevelopment && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Prix annuel:</span>
              <span className="text-gray-700">{app.price_yearly?.toLocaleString()} FCFA/an</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Le paiement sera effectué uniquement après approbation de l'administrateur
            </p>
          </div>
        )}

        {/* Formulaire de demande */}
        {!isInDevelopment && (
          <div className="space-y-2">
            <label htmlFor="request-message" className="block text-sm font-medium text-gray-900">
              Message (optionnel)
            </label>
            <textarea
              id="request-message"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Expliquez pourquoi cette application est nécessaire pour votre établissement..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Ce message sera envoyé à l'administrateur avec votre demande
            </p>
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

        {/* Info workflow */}
        {!isInDevelopment && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Processus de demande</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                  <li>Votre demande sera envoyée à l'administrateur</li>
                  <li>L'administrateur examinera et approuvera/rejettera</li>
                  <li>Vous serez notifié du résultat par email</li>
                  <li>Si approuvée, l'application sera activée automatiquement</li>
                </ul>
              </div>
            </div>
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
          onClick={handleRequestAccess}
          disabled={loading || isInDevelopment}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
      </div>
    </Modal>
  );
}
