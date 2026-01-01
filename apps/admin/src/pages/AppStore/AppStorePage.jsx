/**
 * App Store Page - Catalogue des applications
 */

import { useState, useEffect } from 'react';
import { useApps, getSupabaseClient } from '@edutrack/api';
import { AppCard, BundleCard } from '@edutrack/ui';
import AppSubscriptionModal from '../../components/AppSubscriptionModal.jsx';
import {
  Store,
  Package,
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function AppStorePage() {
  const {
    apps,
    activeApps,
    availableApps,
    subscriptions,
    startTrial,
    loading: appsLoading,
    error,
    refetch
  } = useApps();

  // Debug logs
  console.log('🏪 [AppStorePage] État:');
  console.log('  - apps (catalogue complet):', apps.length, apps);
  console.log('  - activeApps:', activeApps.length, activeApps);
  console.log('  - availableApps:', availableApps.length, availableApps);

  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [tab, setTab] = useState('apps'); // 'apps' | 'bundles'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [bundles, setBundles] = useState([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [subscriptionModal, setSubscriptionModal] = useState({ isOpen: false, app: null });

  // Charger les bundles depuis Supabase
  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setBundlesLoading(true);
      const supabase = getSupabaseClient();

      // La vue v_bundles_catalog filtre déjà sur is_active = true
      const { data, error: bundlesError } = await supabase
        .from('v_bundles_catalog')
        .select('*')
        .order('sort_order');

      if (bundlesError) {
        console.error('❌ Erreur chargement bundles:', bundlesError);
        throw bundlesError;
      }

      console.log('✅ Bundles chargés:', data);
      setBundles(data || []);
    } catch (err) {
      console.error('❌ Erreur chargement bundles:', err);
      setBundles([]);
    } finally {
      setBundlesLoading(false);
    }
  };

  const loading = appsLoading || bundlesLoading;

  // Filtrer les apps
  const filteredApps = apps.filter(app => {
    const matchesSearch = searchQuery === '' ||
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || app.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Séparer les apps disponibles et actives
  const myApps = filteredApps.filter(app =>
    activeApps.some(active => active.id === app.id)
  );

  const availableAppsFiltered = filteredApps.filter(app =>
    !activeApps.some(active => active.id === app.id)
  );

  const handleStartTrial = (app) => {
    // Ouvrir la modal de confirmation avec type "trial" par défaut
    setSubscriptionModal({ isOpen: true, app });
  };

  const handleSubscribe = (app) => {
    // Ouvrir la modal de confirmation avec type "active" par défaut
    setSubscriptionModal({ isOpen: true, app });
  };

  const handleSubscriptionSuccess = () => {
    // Rafraîchir la liste des apps après souscription
    refetch();
  };

  const handleSubscribeBundle = (bundle) => {
    // Ouvrir modal de paiement bundle
    alert(`Souscrire au ${bundle.name} - À implémenter`);
  };

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
            <Store className="h-7 w-7 text-primary-600" />
            App Store
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Découvrez et activez de nouvelles fonctionnalités
          </p>
        </div>

        {/* Stats rapides */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{activeApps.length}</div>
            <div className="text-xs text-gray-500">Apps actives</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{availableApps.length}</div>
            <div className="text-xs text-gray-500">Disponibles</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('apps')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${tab === 'apps'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Grid3x3 className="h-5 w-5" />
            Applications
          </button>
          <button
            onClick={() => setTab('bundles')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${tab === 'bundles'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Package className="h-5 w-5" />
            Packs
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Économisez jusqu'à 115k
            </span>
          </button>
        </nav>
      </div>

      {/* Onglet Applications */}
      {tab === 'apps' && (
        <>
          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une application..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="pedagogy">Pédagogie</option>
                  <option value="administration">Administration</option>
                  <option value="communication">Communication</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>

              {/* Vue */}
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mes Applications */}
          {myApps.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-600" />
                Mes Applications ({myApps.length})
              </h2>
              <div className={view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {myApps.map(app => {
                  const subscription = subscriptions.find(sub => sub.app_id === app.id);
                  return (
                    <AppCard
                      key={app.id}
                      app={app}
                      subscription={subscription}
                      onViewDetails={() => alert('Voir détails - À implémenter')}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications Disponibles */}
          {availableAppsFiltered.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Applications Disponibles ({availableAppsFiltered.length})
              </h2>
              <div className={view === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {availableAppsFiltered.map(app => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onStartTrial={handleStartTrial}
                    onSubscribe={handleSubscribe}
                    onViewDetails={() => alert('Voir détails - À implémenter')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune application trouvée
              </h3>
              <p className="text-sm text-gray-500">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </>
      )}

      {/* Onglet Bundles */}
      {tab === 'bundles' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Packs Prédéfinis
            </h2>
            <p className="text-sm text-gray-600">
              Économisez jusqu'à 115 000 FCFA avec nos packs tout inclus
            </p>
          </div>

          {bundles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bundles.map((bundle) => {
                // Charger les apps du bundle basé sur app_ids
                const bundleApps = (bundle.app_ids || [])
                  .map(appId => apps.find(app => app.id === appId))
                  .filter(Boolean); // Filtrer les undefined

                return (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    apps={bundleApps}
                    recommended={bundle.is_recommended || false}
                    onSubscribe={handleSubscribeBundle}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chargement des packs...
              </h3>
              <p className="text-sm text-gray-500">
                Les bundles seront bientôt disponibles
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmation de souscription */}
      <AppSubscriptionModal
        isOpen={subscriptionModal.isOpen}
        onClose={() => setSubscriptionModal({ isOpen: false, app: null })}
        app={subscriptionModal.app}
        onSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}
