/**
 * Page Catalogue Packs (Admin)
 *
 * Permet à l'admin de:
 * - Voir tous les packs (actifs et inactifs)
 * - Activer/Désactiver un pack (is_active)
 * - Voir les détails d'un pack (apps incluses, prix, économies)
 * - Assigner directement un pack à une école
 * - Voir les statistiques d'utilisation par pack
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import AssignBundleModal from '../../components/AssignBundleModal.jsx';
import {
  Package,
  Eye,
  EyeOff,
  Edit,
  Gift,
  Users,
  DollarSign,
  Grid3x3,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Plus,
  Search
} from 'lucide-react';

export default function BundlesCatalogPage() {
  const [bundles, setBundles] = useState([]);
  const [bundleStats, setBundleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [assignModal, setAssignModal] = useState({ isOpen: false, bundle: null });

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Charger tous les bundles (actifs ET inactifs)
      const { data: bundlesData, error: bundlesError } = await supabase
        .from('bundles')
        .select('*')
        .order('sort_order');

      if (bundlesError) throw bundlesError;

      // Charger les stats d'abonnements pour chaque pack
      const { data: subsData, error: subsError } = await supabase
        .from('school_bundle_subscriptions')
        .select('bundle_id, status, amount_paid');

      if (subsError) throw subsError;

      // Calculer les stats par bundle
      const stats = {};
      bundlesData.forEach(bundle => {
        const bundleSubs = (subsData || []).filter(sub => sub.bundle_id === bundle.id);
        const activeSubs = bundleSubs.filter(sub => sub.status === 'active' || sub.status === 'trial');
        const totalRevenue = bundleSubs.reduce((sum, sub) => sum + (sub.amount_paid || 0), 0);

        stats[bundle.id] = {
          totalSubscriptions: bundleSubs.length,
          activeSubscriptions: activeSubs.length,
          revenue: totalRevenue
        };
      });

      setBundles(bundlesData || []);
      setBundleStats(stats);
    } catch (err) {
      console.error('Error loading bundles:', err);
      setError('Erreur lors du chargement des packs');
    } finally {
      setLoading(false);
    }
  };

  const toggleBundleStatus = async (bundleId, currentStatus) => {
    try {
      const supabase = getSupabaseClient();
      const newStatus = !currentStatus;

      const { error: updateError } = await supabase
        .from('bundles')
        .update({ is_active: newStatus })
        .eq('id', bundleId);

      if (updateError) throw updateError;

      // Rafraîchir la liste
      await loadBundles();

      alert(`✅ Pack ${newStatus ? 'activé' : 'désactivé'} avec succès !`);
    } catch (err) {
      console.error('Error toggling bundle status:', err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const handleAssignBundle = (bundle) => {
    setAssignModal({ isOpen: true, bundle });
  };

  const handleAssignSuccess = () => {
    // Rafraîchir la liste après assignation
    loadBundles();
  };

  // Filtrer les bundles
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = searchQuery === '' ||
      bundle.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && bundle.is_active) ||
      (filterStatus === 'inactive' && !bundle.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-600" />
            Catalogue des Packs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez la disponibilité et l'assignation des packs d'applications
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Packs totaux</p>
              <p className="text-2xl font-bold text-gray-900">{bundles.length}</p>
            </div>
            <Package className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Packs actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {bundles.filter(b => b.is_active).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abonnements actifs</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(bundleStats).reduce((sum, stat) => sum + stat.activeSubscriptions, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenus packs</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatNumber(Object.values(bundleStats).reduce((sum, stat) => sum + stat.revenue, 0))} FCFA
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un pack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Filtre statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les packs</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>
        </div>
      </div>

      {/* Liste des packs */}
      {filteredBundles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBundles.map(bundle => {
            const stats = bundleStats[bundle.id] || { totalSubscriptions: 0, activeSubscriptions: 0, revenue: 0 };

            return (
              <div
                key={bundle.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  bundle.is_active ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                      <span className="text-2xl">{bundle.icon || '📦'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {bundle.name}
                        {bundle.is_recommended && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Recommandé
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                    </div>
                  </div>

                  {/* Badge statut */}
                  <div className="flex items-center gap-2">
                    {bundle.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Masqué
                      </span>
                    )}
                  </div>
                </div>

                {/* Prix et économies */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Prix annuel</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatNumber(bundle.price_yearly)} FCFA
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">Économies</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatNumber(bundle.savings)} FCFA
                    </p>
                  </div>
                </div>

                {/* Applications incluses */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    {(bundle.app_ids || []).length} applications incluses
                  </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-blue-700">Abonnements</p>
                    <p className="text-lg font-bold text-blue-900">{stats.totalSubscriptions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-700">Actifs</p>
                    <p className="text-lg font-bold text-blue-900">{stats.activeSubscriptions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-700">Revenus</p>
                    <p className="text-sm font-bold text-blue-900">{formatNumber(stats.revenue)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBundleStatus(bundle.id, bundle.is_active)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      bundle.is_active
                        ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                        : 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                  >
                    {bundle.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4 inline mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 inline mr-2" />
                        Activer
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleAssignBundle(bundle)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Gift className="h-4 w-4 inline mr-2" />
                    Assigner
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun pack trouvé
          </h3>
          <p className="text-sm text-gray-500">
            {searchQuery ? 'Essayez de modifier vos critères de recherche' : 'Aucun pack disponible'}
          </p>
        </div>
      )}

      {/* Modal d'assignation */}
      <AssignBundleModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, bundle: null })}
        bundle={assignModal.bundle}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}
