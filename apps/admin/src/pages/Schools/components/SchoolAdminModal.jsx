import { useState, useEffect } from 'react';
import { Modal } from '@edutrack/ui';
import {
  X, School as SchoolIcon, Package, Grid3x3,
  CheckCircle, XCircle, AlertTriangle, Power,
  Calendar, Users, MapPin, Phone, Mail, Building2,
  Hash, Eye, Settings, Zap, Construction
} from 'lucide-react';
import { formatDate } from '@edutrack/utils';
import { getSupabaseClient } from '@edutrack/api';

/**
 * Modal Super Admin pour gérer complètement un établissement
 * - Voir toutes les infos
 * - Gérer les abonnements (apps & bundles)
 * - Activer/désactiver des abonnements
 */
export default function SchoolAdminModal({ isOpen, onClose, school, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info'); // 'info', 'apps', 'bundles', 'stats'
  const [schoolData, setSchoolData] = useState(null);
  const [apps, setApps] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_classes: 0
  });

  useEffect(() => {
    if (isOpen && school) {
      loadSchoolData();
    }
  }, [isOpen, school]);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Charger les apps et bundles
      const [appsRes, bundlesRes, subsRes, statsRes] = await Promise.all([
        supabase.from('apps').select('*').order('sort_order'),
        supabase.from('bundles').select('*').order('sort_order'),
        supabase.from('school_subscriptions').select('*').eq('school_id', school.id),
        supabase.rpc('get_school_stats', { p_school_id: school.id })
      ]);

      if (appsRes.error) throw appsRes.error;
      if (bundlesRes.error) throw bundlesRes.error;
      if (subsRes.error) throw subsRes.error;

      setApps(appsRes.data || []);
      setBundles(bundlesRes.data || []);
      setSubscriptions(subsRes.data || []);
      setStats(statsRes.data || stats);
      setSchoolData(school);
    } catch (error) {
      console.error('Error loading school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (appId, currentStatus) => {
    try {
      const supabase = getSupabaseClient();

      // Chercher l'abonnement existant
      const existingSub = subscriptions.find(s => s.app_id === appId);

      if (existingSub) {
        // Mettre à jour le statut
        const newStatus = currentStatus === 'active' ? 'cancelled' : 'active';
        const { error } = await supabase
          .from('school_subscriptions')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);

        if (error) throw error;
      } else {
        // Créer un nouvel abonnement
        const { error } = await supabase
          .from('school_subscriptions')
          .insert({
            school_id: school.id,
            app_id: appId,
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 an
          });

        if (error) throw error;
      }

      await loadSchoolData();
      onSuccess?.();
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('Erreur lors de la modification de l\'abonnement');
    }
  };

  const handleChangeAppStatus = async (appId, newStatus) => {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('apps')
        .update({
          development_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appId);

      if (error) throw error;

      await loadSchoolData();
      onSuccess?.();
    } catch (error) {
      console.error('Error changing app status:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  if (!school) return null;

  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: CheckCircle, text: 'Actif', className: 'bg-green-100 text-green-800' },
      inactive: { icon: XCircle, text: 'Inactif', className: 'bg-gray-100 text-gray-800' },
      pending: { icon: AlertTriangle, text: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      trial: { icon: Zap, text: 'Essai', className: 'bg-blue-100 text-blue-800' },
      cancelled: { icon: XCircle, text: 'Annulé', className: 'bg-red-100 text-red-800' }
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
        <Icon className="h-3 w-3" />
        {badge.text}
      </span>
    );
  };

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

  const getSubscriptionStatus = (appId) => {
    const sub = subscriptions.find(s => s.app_id === appId);
    return sub?.status || null;
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5 break-words">{value || 'Non renseigné'}</p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
            <SchoolIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestion de {school.name}</h2>
            <p className="text-sm text-gray-500">Super Admin - Accès complet</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 px-6">
          {[
            { id: 'info', icon: Eye, label: 'Informations' },
            { id: 'apps', icon: Grid3x3, label: 'Applications' },
            { id: 'bundles', icon: Package, label: 'Packs' },
            { id: 'stats', icon: Users, label: 'Statistiques' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${tab === t.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Onglet Informations */}
            {tab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4" />
                    Informations de base
                  </h3>
                  <div className="space-y-1 divide-y divide-gray-100">
                    <InfoRow icon={SchoolIcon} label="Nom" value={school.name} />
                    <InfoRow icon={Hash} label="Code" value={school.code} />
                    <InfoRow icon={Building2} label="Type" value={school.type} />
                    <InfoRow icon={CheckCircle} label="Statut" value={<>{getStatusBadge(school.status)}</>} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    Coordonnées
                  </h3>
                  <div className="space-y-1 divide-y divide-gray-100">
                    <InfoRow icon={MapPin} label="Adresse" value={school.address} />
                    <InfoRow icon={MapPin} label="Ville" value={school.city} />
                    <InfoRow icon={Phone} label="Téléphone" value={school.phone} />
                    <InfoRow icon={Mail} label="Email" value={school.email} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Métadonnées
                  </h3>
                  <div className="space-y-1 divide-y divide-gray-100">
                    <InfoRow icon={Calendar} label="Créé le" value={formatDate(school.created_at)} />
                    <InfoRow icon={Calendar} label="Mis à jour le" value={formatDate(school.updated_at || school.created_at)} />
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Applications */}
            {tab === 'apps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Gestion des applications ({apps.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {apps.map((app) => {
                    const subStatus = getSubscriptionStatus(app.id);
                    const isSubscribed = subStatus && subStatus !== 'cancelled';

                    return (
                      <div
                        key={app.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">{app.icon || '📦'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">{app.name}</h4>
                                {getDevelopmentBadge(app.development_status)}
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{app.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {app.price_yearly?.toLocaleString()} FCFA/an
                                </span>
                                {isSubscribed && getStatusBadge(subStatus)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {/* Bouton Activer/Désactiver abonnement */}
                            <button
                              onClick={() => handleToggleSubscription(app.id, subStatus)}
                              className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1
                                ${isSubscribed
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }
                              `}
                            >
                              <Power className="h-3 w-3" />
                              {isSubscribed ? 'Désactiver' : 'Activer'}
                            </button>

                            {/* Menu changement de statut dev */}
                            <select
                              value={app.development_status}
                              onChange={(e) => handleChangeAppStatus(app.id, e.target.value)}
                              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="ready">Prêt</option>
                              <option value="beta">Beta</option>
                              <option value="in_development">En Dev</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Packs */}
            {tab === 'bundles' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Packs disponibles ({bundles.length})
                </h3>

                <div className="space-y-3">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Package className="h-6 w-6 text-primary-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">{bundle.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{bundle.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-900">
                                {bundle.price_yearly?.toLocaleString()} FCFA/an
                              </span>
                              {bundle.savings > 0 && (
                                <span className="text-xs text-green-600">
                                  Économie: {bundle.savings?.toLocaleString()} FCFA
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => alert('Fonction à implémenter')}
                          className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-medium transition-colors"
                        >
                          Souscrire
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Statistiques */}
            {tab === 'stats' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Statistiques de l'établissement</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">Utilisateurs</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{stats.total_users || 0}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium text-green-900">Élèves</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{stats.total_students || 0}</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">Enseignants</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{stats.total_teachers || 0}</p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-orange-600" />
                      <span className="text-xs font-medium text-orange-900">Classes</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{stats.total_classes || 0}</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Abonnements actifs</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {subscriptions.filter(s => s.status === 'active').length} / {apps.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Applications actives sur {apps.length} disponibles
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
}
