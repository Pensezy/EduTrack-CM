/**
 * Dashboard Administrateur
 *
 * Affiche les statistiques globales pour l'admin:
 * - Écoles, utilisateurs, élèves, enseignants
 * - Applications et packs (actifs, revenus)
 * - Demandes en attente (apps, packs, inscriptions)
 * - Revenus générés
 * - Activités récentes
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  School,
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  UserCheck,
  Grid3x3,
  Package,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// Stat Card Component
function StatCard({ title, value, icon: Icon, subtitle, color = 'primary', onClick }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-purple-50 text-purple-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schools: 0,
    users: 0,
    students: 0,
    teachers: 0,
    classes: 0,
    apps: 0,
    bundles: 0,
    activeSubscriptions: 0,
    pendingAppRequests: 0,
    pendingBundleRequests: 0,
    pendingEnrollments: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer toutes les stats en parallèle
      const [
        schoolsRes,
        usersRes,
        studentsRes,
        teachersRes,
        classesRes,
        appsRes,
        bundlesRes,
        subsRes,
        appRequestsRes,
        bundleRequestsRes,
        enrollmentsRes,
      ] = await Promise.all([
        // Écoles
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        // Utilisateurs
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // Élèves
        supabase.from('students').select('*', { count: 'exact', head: true }),
        // Enseignants
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        // Classes
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        // Apps
        supabase.from('apps').select('*', { count: 'exact', head: true }),
        // Bundles
        supabase.from('bundles').select('*', { count: 'exact', head: true }),
        // Subscriptions actives
        supabase.from('school_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'trial']),
        // Demandes d'apps en attente
        supabase.from('app_access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Demandes de packs en attente
        supabase.from('bundle_access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Demandes d'inscription en attente
        supabase.from('enrollment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      // Calculer les revenus (toutes les subscriptions actives)
      const { data: activeSubsData } = await supabase
        .from('school_subscriptions')
        .select('amount_paid')
        .in('status', ['active', 'trial']);

      const { data: activeBundlesData } = await supabase
        .from('school_bundle_subscriptions')
        .select('amount_paid')
        .in('status', ['active', 'trial']);

      const totalRevenue = [
        ...(activeSubsData || []),
        ...(activeBundlesData || [])
      ].reduce((sum, item) => sum + (item.amount_paid || 0), 0);

      setStats({
        schools: schoolsRes.count || 0,
        users: usersRes.count || 0,
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        classes: classesRes.count || 0,
        apps: appsRes.count || 0,
        bundles: bundlesRes.count || 0,
        activeSubscriptions: subsRes.count || 0,
        pendingAppRequests: appRequestsRes.count || 0,
        pendingBundleRequests: bundleRequestsRes.count || 0,
        pendingEnrollments: enrollmentsRes.count || 0,
        monthlyRevenue: totalRevenue / 12, // Approximation
        yearlyRevenue: totalRevenue,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPendingRequests = stats.pendingAppRequests + stats.pendingBundleRequests + stats.pendingEnrollments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Administrateur
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d'ensemble de la plateforme EduTrack
        </p>
      </div>

      {/* Alerte demandes en attente */}
      {totalPendingRequests > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">{totalPendingRequests} demande{totalPendingRequests > 1 ? 's' : ''} en attente</span> de votre validation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques globales</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Écoles"
            value={formatNumber(stats.schools)}
            icon={School}
            subtitle="Établissements inscrits"
            color="primary"
            onClick={() => window.location.href = '/schools'}
          />
          <StatCard
            title="Utilisateurs"
            value={formatNumber(stats.users)}
            icon={Users}
            subtitle="Comptes actifs"
            color="blue"
            onClick={() => window.location.href = '/users'}
          />
          <StatCard
            title="Élèves"
            value={formatNumber(stats.students)}
            icon={GraduationCap}
            subtitle="Total inscrits"
            color="secondary"
          />
          <StatCard
            title="Enseignants"
            value={formatNumber(stats.teachers)}
            icon={UserCheck}
            subtitle="Personnel éducatif"
            color="success"
          />
        </div>
      </div>

      {/* Applications & Packs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications & Packs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Applications"
            value={formatNumber(stats.apps)}
            icon={Grid3x3}
            subtitle={`${stats.activeSubscriptions} abonnements actifs`}
            color="primary"
            onClick={() => window.location.href = '/apps-catalog'}
          />
          <StatCard
            title="Packs"
            value={formatNumber(stats.bundles)}
            icon={Package}
            subtitle="Packs disponibles"
            color="secondary"
          />
          <StatCard
            title="Revenus annuels"
            value={`${formatNumber(stats.yearlyRevenue)} FCFA`}
            icon={DollarSign}
            subtitle={`~${formatNumber(stats.monthlyRevenue)} FCFA/mois`}
            color="warning"
          />
        </div>
      </div>

      {/* Demandes en attente - Afficher uniquement s'il y a des demandes */}
      {totalPendingRequests > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demandes en attente</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.pendingAppRequests > 0 && (
              <StatCard
                title="Demandes d'Apps"
                value={formatNumber(stats.pendingAppRequests)}
                icon={ClipboardList}
                subtitle="En attente de validation"
                color="warning"
                onClick={() => window.location.href = '/app-requests'}
              />
            )}
            {stats.pendingBundleRequests > 0 && (
              <StatCard
                title="Demandes de Packs"
                value={formatNumber(stats.pendingBundleRequests)}
                icon={Package}
                subtitle="En attente de validation"
                color="warning"
                onClick={() => window.location.href = '/bundle-requests'}
              />
            )}
            {stats.pendingEnrollments > 0 && (
              <StatCard
                title="Inscriptions"
                value={formatNumber(stats.pendingEnrollments)}
                icon={FileText}
                subtitle="Demandes d'inscription"
                color="warning"
                onClick={() => window.location.href = '/enrollment'}
              />
            )}
          </div>
        </div>
      )}

      {/* Statistiques académiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Classes</h3>
            <GraduationCap className="h-6 w-6 text-primary-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total des classes</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(stats.classes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moyenne par école</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.schools > 0 ? formatNumber(Math.round(stats.classes / stats.schools)) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Élèves par classe</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.classes > 0 ? formatNumber(Math.round(stats.students / stats.classes)) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Taux d'utilisation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilisation plateforme</h3>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taux d'adoption apps</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.schools > 0 && stats.apps > 0
                  ? `${Math.round((stats.activeSubscriptions / (stats.schools * stats.apps)) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Écoles actives</span>
              <span className="text-lg font-bold text-gray-900">
                {formatNumber(stats.schools)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue par école</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.schools > 0
                  ? `${formatNumber(Math.round(stats.yearlyRevenue / stats.schools))} FCFA`
                  : '0 FCFA'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => window.location.href = '/schools'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <School className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Gérer écoles</span>
          </button>
          <button
            onClick={() => window.location.href = '/apps-catalog'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Grid3x3 className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Catalogue Apps</span>
          </button>
          <button
            onClick={() => window.location.href = '/app-requests'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all relative"
          >
            <ClipboardList className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Demandes</span>
            {(stats.pendingAppRequests + stats.pendingBundleRequests) > 0 && (
              <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {stats.pendingAppRequests + stats.pendingBundleRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => window.location.href = '/users'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Utilisateurs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
