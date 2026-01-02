/**
 * Page de Gestion Globale du Catalogue d'Applications
 *
 * Permet à l'admin de :
 * - Voir toutes les apps du catalogue
 * - Modifier le statut de développement (ready, beta, in_development)
 * - Modifier les prix (yearly, monthly)
 * - Activer/Désactiver des apps
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@edutrack/api';
import {
  Grid3x3,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Construction,
  Plus,
  Edit,
  Save,
  X,
  DollarSign
} from 'lucide-react';

export default function AppsCatalogPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDevStatus, setFilterDevStatus] = useState('all');
  const [editingApp, setEditingApp] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      setApps(data || []);
    } catch (err) {
      console.error('Error loading apps:', err);
      alert('Erreur lors du chargement des applications');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app.id);
    setEditForm({
      development_status: app.development_status || 'ready',
      status: app.status,
      price_yearly: app.price_yearly,
      price_monthly: app.price_monthly || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
    setEditForm({});
  };

  const handleSaveEdit = async (appId) => {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('apps')
        .update({
          development_status: editForm.development_status,
          status: editForm.status,
          price_yearly: parseInt(editForm.price_yearly),
          price_monthly: parseInt(editForm.price_monthly),
          updated_at: new Date().toISOString(),
        })
        .eq('id', appId);

      if (error) throw error;

      await loadApps();
      setEditingApp(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating app:', err);
      alert('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = searchQuery === '' ||
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || app.category === filterCategory;

    const matchesDevStatus = filterDevStatus === 'all' || app.development_status === filterDevStatus;

    return matchesSearch && matchesCategory && matchesDevStatus;
  });

  const getDevelopmentBadge = (status) => {
    const badges = {
      ready: { icon: CheckCircle, text: 'Prêt', className: 'bg-green-100 text-green-800' },
      beta: { icon: AlertTriangle, text: 'Beta', className: 'bg-purple-100 text-purple-800' },
      in_development: { icon: Construction, text: 'En Dev', className: 'bg-orange-100 text-orange-800' }
    };

    const badge = badges[status] || badges.ready;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Actif', className: 'bg-green-100 text-green-800' },
      inactive: { text: 'Inactif', className: 'bg-gray-100 text-gray-800' },
      deprecated: { text: 'Déprécié', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.active;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
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
            <Grid3x3 className="h-7 w-7 text-primary-600" />
            Catalogue des Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion globale du catalogue ({apps.length} applications)
          </p>
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
                placeholder="Rechercher une application..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400 hidden sm:block" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Toutes catégories</option>
              <option value="pedagogy">Pédagogie</option>
              <option value="administration">Administration</option>
              <option value="communication">Communication</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          {/* Statut Dev */}
          <div>
            <select
              value={filterDevStatus}
              onChange={(e) => setFilterDevStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="ready">Prêt</option>
              <option value="beta">Beta</option>
              <option value="in_development">En développement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des Apps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {filteredApps.map((app) => {
          const isEditing = editingApp === app.id;

          return (
            <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Icône */}
                <div className="text-3xl flex-shrink-0">{app.icon || '📦'}</div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{app.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          {app.category}
                        </span>
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          ID: {app.id}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <button
                          onClick={() => handleEdit(app)}
                          className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSaveEdit(app.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Save className="h-4 w-4" />
                            Sauvegarder
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mode Édition */}
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                      {/* Statut Dev */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Statut Développement
                        </label>
                        <select
                          value={editForm.development_status}
                          onChange={(e) => setEditForm({ ...editForm, development_status: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="ready">✅ Prêt</option>
                          <option value="beta">🧪 Beta</option>
                          <option value="in_development">🚧 En Développement</option>
                        </select>
                      </div>

                      {/* Statut */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="active">Actif</option>
                          <option value="inactive">Inactif</option>
                          <option value="deprecated">Déprécié</option>
                        </select>
                      </div>

                      {/* Prix Annuel */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Prix Annuel (FCFA)
                        </label>
                        <input
                          type="number"
                          value={editForm.price_yearly}
                          onChange={(e) => setEditForm({ ...editForm, price_yearly: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {/* Prix Mensuel */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Prix Mensuel (FCFA)
                        </label>
                        <input
                          type="number"
                          value={editForm.price_monthly}
                          onChange={(e) => setEditForm({ ...editForm, price_monthly: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mt-2">
                      {getDevelopmentBadge(app.development_status)}
                      {getStatusBadge(app.status)}
                      <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {app.is_core
                          ? 'Gratuit'
                          : `${app.price_yearly?.toLocaleString()} FCFA/an`}
                      </span>
                      {app.price_monthly > 0 && (
                        <span className="text-xs text-gray-500">
                          ({app.price_monthly?.toLocaleString()} FCFA/mois)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="p-12 text-center">
            <Grid3x3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune application trouvée
            </h3>
            <p className="text-sm text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
