import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import { X, School, AlertCircle, CheckCircle, Package, Calendar, DollarSign } from 'lucide-react';
import { getSupabaseClient, useAuth } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';

/**
 * Modal d'assignation directe d'un pack à une école (Admin uniquement)
 *
 * Permet à l'admin de:
 * - Sélectionner une école dans une liste
 * - Choisir la durée d'activation
 * - Activer le pack directement sans demande
 */
export default function AssignBundleModal({ isOpen, onClose, bundle, onSuccess }) {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [durationYears, setDurationYears] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      const supabase = getSupabaseClient();

      const { data, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, code')
        .order('name');

      if (schoolsError) throw schoolsError;

      setSchools(data || []);
    } catch (err) {
      console.error('Error loading schools:', err);
      setError('Erreur lors du chargement des écoles');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSchoolId) {
      setError('Veuillez sélectionner une école');
      return;
    }

    if (!confirm(`⚠️ Confirmer l'assignation du pack "${bundle.name}" à cette école pour ${durationYears} an(s) ?\n\nCela activera automatiquement le pack et toutes ses applications.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Appeler la fonction activate_bundle directement
      const { data, error: activateError } = await supabase.rpc('activate_bundle', {
        p_school_id: selectedSchoolId,
        p_bundle_id: bundle.id,
        p_duration_years: durationYears,
        p_admin_id: user.id
      });

      if (activateError) throw activateError;

      // Récupérer le nom de l'école pour le message
      const selectedSchool = schools.find(s => s.id === selectedSchoolId);

      alert(`✅ ${data.message || 'Pack activé avec succès !'}

École: ${selectedSchool?.name || 'Inconnue'}
Pack: ${bundle.name}
Durée: ${durationYears} an(s)
Applications activées: ${data.apps_activated || 0}

Le pack et toutes ses applications sont maintenant actifs pour cette école.`);

      onSuccess?.();
      onClose();
      setSelectedSchoolId('');
      setDurationYears(1);
    } catch (err) {
      console.error('Error assigning bundle:', err);
      setError(err.message || 'Erreur lors de l\'assignation du pack');
    } finally {
      setLoading(false);
    }
  };

  if (!bundle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <span className="text-2xl">{bundle.icon || '📦'}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assigner le pack {bundle.name}</h2>
            <p className="text-sm text-gray-500">Activation directe sans demande</p>
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
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Infos pack */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Prix annuel</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(bundle.price_yearly)} FCFA
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Économies</p>
              <p className="text-lg font-bold text-green-700">
                {formatNumber(bundle.savings)} FCFA
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-600">Applications incluses</p>
            <p className="text-sm font-medium text-gray-900">
              {(bundle.app_ids || []).length} applications
            </p>
          </div>
        </div>

        {/* Sélection école */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <School className="h-4 w-4 inline mr-1" />
            École cible *
          </label>
          {loadingSchools ? (
            <div className="text-sm text-gray-500">Chargement des écoles...</div>
          ) : (
            <select
              value={selectedSchoolId}
              onChange={(e) => setSelectedSchoolId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">-- Sélectionner une école --</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Durée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Durée d'activation *
          </label>
          <select
            value={durationYears}
            onChange={(e) => setDurationYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="1">1 an</option>
            <option value="2">2 ans</option>
            <option value="3">3 ans</option>
            <option value="5">5 ans</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Le pack et toutes ses applications expireront dans {durationYears} an(s)
          </p>
        </div>

        {/* Info activation automatique */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Activation automatique
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Le pack sera immédiatement activé avec toutes les {(bundle.app_ids || []).length} applications incluses. L'école pourra les utiliser dès maintenant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleAssign}
          disabled={loading || !selectedSchoolId}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Assignation en cours...
            </>
          ) : (
            <>
              <Package className="h-4 w-4" />
              Assigner le pack
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
