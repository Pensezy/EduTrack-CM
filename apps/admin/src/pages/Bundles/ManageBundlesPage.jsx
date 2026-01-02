/**
 * Page Gestion des Packs (Admin) - CRUD Complet
 *
 * Permet à l'admin de:
 * - Créer un nouveau pack
 * - Modifier un pack existant
 * - Supprimer un pack
 * - Voir tous les packs avec détails
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient, useApps } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Grid3x3,
  DollarSign,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ManageBundlesPage() {
  const { apps } = useApps();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBundle, setEditingBundle] = useState(null); // null | bundle object
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: '📦',
    app_ids: [],
    price_yearly: 0,
    savings: 0,
    is_recommended: false,
    is_active: true,
    sort_order: 1
  });

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data, error: bundlesError } = await supabase
        .from('bundles')
        .select('*')
        .order('sort_order');

      if (bundlesError) throw bundlesError;

      setBundles(data || []);
    } catch (err) {
      console.error('Error loading bundles:', err);
      setError('Erreur lors du chargement des packs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBundle(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      icon: '📦',
      app_ids: [],
      price_yearly: 0,
      savings: 0,
      is_recommended: false,
      is_active: true,
      sort_order: bundles.length + 1
    });
  };

  const handleEdit = (bundle) => {
    setIsCreating(false);
    setEditingBundle(bundle);
    setFormData({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description || '',
      icon: bundle.icon || '📦',
      app_ids: bundle.app_ids || [],
      price_yearly: bundle.price_yearly || 0,
      savings: bundle.savings || 0,
      is_recommended: bundle.is_recommended || false,
      is_active: bundle.is_active !== undefined ? bundle.is_active : true,
      sort_order: bundle.sort_order || 1
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingBundle(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      icon: '📦',
      app_ids: [],
      price_yearly: 0,
      savings: 0,
      is_recommended: false,
      is_active: true,
      sort_order: 1
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        alert('⚠️ Le nom du pack est obligatoire');
        return;
      }

      if (!formData.id.trim()) {
        alert('⚠️ L\'ID du pack est obligatoire');
        return;
      }

      if (formData.app_ids.length === 0) {
        alert('⚠️ Veuillez sélectionner au moins une application');
        return;
      }

      const supabase = getSupabaseClient();

      if (isCreating) {
        // Créer nouveau pack
        const { error: insertError } = await supabase
          .from('bundles')
          .insert([formData]);

        if (insertError) throw insertError;

        alert('✅ Pack créé avec succès !');
      } else {
        // Mettre à jour pack existant
        const { error: updateError } = await supabase
          .from('bundles')
          .update(formData)
          .eq('id', formData.id);

        if (updateError) throw updateError;

        alert('✅ Pack mis à jour avec succès !');
      }

      handleCancel();
      await loadBundles();
    } catch (err) {
      console.error('Error saving bundle:', err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const handleDelete = async (bundleId) => {
    if (!confirm(`⚠️ ATTENTION !\n\nÊtes-vous sûr de vouloir supprimer ce pack ?\n\nCette action:\n- Supprimera le pack de la base de données\n- N'affectera PAS les abonnements existants\n- Est IRRÉVERSIBLE`)) {
      return;
    }

    try {
      const supabase = getSupabaseClient();

      const { error: deleteError } = await supabase
        .from('bundles')
        .delete()
        .eq('id', bundleId);

      if (deleteError) throw deleteError;

      alert('✅ Pack supprimé avec succès');
      await loadBundles();
    } catch (err) {
      console.error('Error deleting bundle:', err);
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const toggleAppSelection = (appId) => {
    setFormData(prev => ({
      ...prev,
      app_ids: prev.app_ids.includes(appId)
        ? prev.app_ids.filter(id => id !== appId)
        : [...prev.app_ids, appId]
    }));
  };

  // Calculer le prix total des apps sélectionnées
  const calculateTotalPrice = () => {
    return formData.app_ids.reduce((total, appId) => {
      const app = apps.find(a => a.id === appId);
      return total + (app?.price_yearly || 0);
    }, 0);
  };

  // Calculer les économies suggérées (20% du prix total)
  const suggestSavings = () => {
    const totalPrice = calculateTotalPrice();
    return Math.round(totalPrice * 0.2); // 20% d'économie par défaut
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-primary-600" />
            Gestion des Packs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Créer, modifier ou supprimer des packs d'applications
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Créer un pack
        </button>
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

      {/* Formulaire création/édition */}
      {(isCreating || editingBundle) && (
        <div className="bg-white rounded-lg shadow-sm border-2 border-primary-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Créer un nouveau pack' : `Modifier: ${editingBundle?.name}`}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Infos de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID du pack *
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={!isCreating}
                  placeholder="ex: starter-pack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
                {isCreating && (
                  <p className="text-xs text-gray-500 mt-1">
                    Utilisez des minuscules et tirets. Ex: starter-pack
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du pack *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Pack Démarrage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Description du pack..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📦"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix annuel (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formData.price_yearly}
                    onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Prix total apps: {formatNumber(calculateTotalPrice())}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Économies (FCFA)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.savings}
                      onChange={(e) => setFormData({ ...formData, savings: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, savings: suggestSavings() })}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs"
                      title="Suggérer 20% du prix total"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_recommended}
                    onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Pack recommandé</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {formData.is_active ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm font-medium text-gray-700">Pack visible dans le catalogue</span>
                </label>
              </div>
            </div>

            {/* Colonne droite - Sélection apps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Grid3x3 className="h-4 w-4 inline mr-1" />
                Applications incluses * ({formData.app_ids.length} sélectionnées)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                {apps.map(app => (
                  <label
                    key={app.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.app_ids.includes(app.id)
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.app_ids.includes(app.id)}
                      onChange={() => toggleAppSelection(app.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100">
                      <span className="text-lg">{app.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-500">{formatNumber(app.price_yearly)} FCFA/an</p>
                    </div>
                    {formData.app_ids.includes(app.id) && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreating ? 'Créer le pack' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      )}

      {/* Liste des packs */}
      <div className="grid grid-cols-1 gap-4">
        {bundles.map(bundle => (
          <div
            key={bundle.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                  <span className="text-2xl">{bundle.icon || '📦'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bundle.name}</h3>
                    {bundle.is_recommended && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Recommandé
                      </span>
                    )}
                    {bundle.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Masqué
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700">
                      <strong>ID:</strong> {bundle.id}
                    </span>
                    <span className="text-gray-700">
                      <strong>Prix:</strong> {formatNumber(bundle.price_yearly)} FCFA
                    </span>
                    <span className="text-green-700">
                      <strong>Économies:</strong> {formatNumber(bundle.savings)} FCFA
                    </span>
                    <span className="text-gray-700">
                      <strong>Apps:</strong> {(bundle.app_ids || []).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(bundle)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(bundle.id)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
