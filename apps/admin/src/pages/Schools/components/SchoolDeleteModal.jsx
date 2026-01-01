import { useState } from 'react';
import { Modal } from '@edutrack/ui';
import { AlertTriangle, X } from 'lucide-react';
import { getSupabaseClient } from '@edutrack/api';

/**
 * Modal de confirmation pour supprimer une école
 *
 * RESTRICTIONS:
 * - Ne peut pas supprimer une école avec des utilisateurs associés
 * - Ne peut pas supprimer une école avec des classes
 * - Ne peut pas supprimer une école avec des abonnements actifs
 */
export default function SchoolDeleteModal({ isOpen, onClose, school, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== school.code) {
      setError('Le code saisi ne correspond pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // Vérifier les restrictions
      // 1. Vérifier s'il y a des utilisateurs liés
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('current_school_id', school.id)
        .limit(1);

      if (usersError) throw usersError;
      if (users && users.length > 0) {
        throw new Error('Impossible de supprimer une école avec des utilisateurs associés. Veuillez d\'abord désassocier ou supprimer les utilisateurs.');
      }

      // 2. Vérifier s'il y a des classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', school.id)
        .limit(1);

      if (classesError) throw classesError;
      if (classes && classes.length > 0) {
        throw new Error('Impossible de supprimer une école avec des classes. Veuillez d\'abord supprimer les classes.');
      }

      // 3. Vérifier s'il y a des abonnements actifs
      const { data: subscriptions, error: subsError } = await supabase
        .from('school_subscriptions')
        .select('id')
        .eq('school_id', school.id)
        .in('status', ['trial', 'active'])
        .limit(1);

      if (subsError) throw subsError;
      if (subscriptions && subscriptions.length > 0) {
        throw new Error('Impossible de supprimer une école avec des abonnements actifs. Veuillez d\'abord annuler les abonnements.');
      }

      // Si toutes les vérifications passent, supprimer
      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);

      if (deleteError) throw deleteError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting school:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (!school) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Supprimer l'école</h2>
            <p className="text-sm text-gray-500">Cette action est irréversible</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Attention : Suppression définitive
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                Vous êtes sur le point de supprimer l'école <span className="font-semibold">"{school.name}"</span>.
                Cette action est irréversible et toutes les données associées seront perdues.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
          <p className="text-sm font-medium text-gray-900">Restrictions de suppression :</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Aucun utilisateur ne doit être associé à cette école</li>
            <li>Aucune classe ne doit exister pour cette école</li>
            <li>Aucun abonnement actif ne doit être en cours</li>
          </ul>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
            Pour confirmer, saisissez le code de l'école : <span className="font-mono font-bold">{school.code}</span>
          </label>
          <input
            type="text"
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder={school.code}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || confirmText !== school.code}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Suppression...' : 'Supprimer définitivement'}
        </button>
      </div>
    </Modal>
  );
}
