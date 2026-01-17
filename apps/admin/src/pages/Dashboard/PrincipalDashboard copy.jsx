/**
 * Dashboard Directeur d'École
 *
 * Affiche uniquement les statistiques de SON école:
 * - Élèves, enseignants, classes DE SON ÉCOLE
 * - Applications actives pour son école
 * - Demandes de son école (apps, packs)
 * - Activités récentes de son école
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  School,
  Users,
  GraduationCap,
  AlertCircle,
  FileText,
  Grid3x3,
  Package,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';
import UpgradeBanner, { BlockingUpgradeBanner } from '../../components/UpgradeBanner';

// Hook simple pour vérifier l'accès à une app
const useAppAccess = (appId) => {
  // TODO: Implémenter la vraie logique de vérification avec Supabase
  // Pour l'instant, retourne false pour tester la bannière upgrade
  return { hasAccess: false };
};

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

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const { hasAccess: hasAcademicApp } = useAppAccess('academic');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schoolName: '',
    students: 0,
    teachers: 0,
    staff: 0,
    classes: 0,
    activeApps: 0,
    activeBundles: 0,
    pendingAppRequests: 0,
    pendingBundleRequests: 0,
    recentEnrollments: 0,
  });
  const [error, setError] = useState('');

  // Constantes de limite pour App Core gratuite
  const CORE_STUDENT_LIMIT = 20;
  const CORE_CLASS_LIMIT = 1;
  const CORE_TEACHER_LIMIT = 3;

  useEffect(() => {
    if (user?.current_school_id) {
      fetchSchoolDashboardData();
    }
  }, [user]);

  const fetchSchoolDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();
      const schoolId = user.current_school_id;

      if (!schoolId) {
        throw new Error('Aucune école associée à votre compte');
      }

      // Récupérer les infos de l'école
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();

      // Récupérer toutes les stats de l'école en parallèle
      const [
        studentsRes,
        teachersRes,
        staffRes,
        classesRes,
        appsRes,
        bundlesRes,
        appRequestsRes,
        bundleRequestsRes,
      ] = await Promise.all([
        // Élèves de cette école
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        // Enseignants de cette école
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('current_school_id', schoolId).eq('role', 'teacher'),
        // Personnel (tous sauf élèves)
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('current_school_id', schoolId),
        // Classes de cette école
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        // Apps actives pour cette école
        supabase.from('school_subscriptions').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('status', ['active', 'trial']),
        // Bundles actifs pour cette école
        supabase.from('school_bundle_subscriptions').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('status', ['active', 'trial']),
        // Demandes d'apps en attente de cette école
        supabase.from('app_access_requests').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'pending'),
        // Demandes de packs en attente de cette école
        supabase.from('bundle_access_requests').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'pending'),
      ]);

      setStats({
        schoolName: schoolData?.name || 'Mon École',
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        staff: staffRes.count || 0,
        classes: classesRes.count || 0,
        activeApps: appsRes.count || 0,
        activeBundles: bundlesRes.count || 0,
        pendingAppRequests: appRequestsRes.count || 0,
        pendingBundleRequests: bundleRequestsRes.count || 0,
        recentEnrollments: 0, // À implémenter si besoin
      });
    } catch (err) {
      console.error('Error fetching principal dashboard data:', err);
      setError('Erreur lors du chargement des données de votre école');
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

  const totalPendingRequests = stats.pendingAppRequests + stats.pendingBundleRequests;

  // Calculer le pourcentage d'utilisation des limites
  const studentUsagePercent = (stats.students / CORE_STUDENT_LIMIT) * 100;
  const teacherUsagePercent = (stats.teachers / CORE_TEACHER_LIMIT) * 100;
  const isNearStudentLimit = !hasAcademicApp && studentUsagePercent >= 80;
  const isAtStudentLimit = !hasAcademicApp && stats.students >= CORE_STUDENT_LIMIT;
  const isNearTeacherLimit = !hasAcademicApp && teacherUsagePercent >= 80;
  const isAtTeacherLimit = !hasAcademicApp && stats.teachers >= CORE_TEACHER_LIMIT;

  return (
    <div className="space-y-6">
      {/* Header avec indicateur de limite */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord - {stats.schoolName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenue, {user?.full_name || 'Directeur'}
          </p>
        </div>

        {/* Indicateur de limite App Core */}
        {!hasAcademicApp && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium">App Core Gratuite</p>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-gray-700">
                  Élèves: {stats.students}/{CORE_STUDENT_LIMIT}
                </p>
                <span className="text-gray-400">•</span>
                <p className="text-sm font-bold text-gray-700">
                  Enseignants: {stats.teachers}/{CORE_TEACHER_LIMIT}
                </p>
              </div>
            </div>
            {(isNearStudentLimit || isNearTeacherLimit) && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                ⚠️ Limite proche
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alerte demandes en attente */}
      {totalPendingRequests > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <Clock className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Vous avez <span className="font-medium">{totalPendingRequests} demande{totalPendingRequests > 1 ? 's' : ''} en attente</span> de validation par l'administrateur
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bannière de blocage si limite élèves atteinte */}
      {isAtStudentLimit && (
        <BlockingUpgradeBanner
          title="⛔ Limite de 20 élèves atteinte"
          description="Vous ne pouvez plus ajouter d'élèves avec l'App Core gratuite. Passez à App Académique pour débloquer jusqu'à 500 élèves, des bulletins professionnels personnalisés et des statistiques avancées."
          targetApp="App Académique"
          price="75 000"
        />
      )}

      {/* Bannière de blocage si limite enseignants atteinte */}
      {isAtTeacherLimit && !isAtStudentLimit && (
        <BlockingUpgradeBanner
          title="⛔ Limite de 3 enseignants atteinte"
          description="Vous ne pouvez plus ajouter d'enseignants avec l'App Core gratuite. Passez à App Académique pour créer des comptes enseignants illimités et débloquer l'accès secrétaire."
          targetApp="App Académique"
          price="75 000"
        />
      )}

      {/* Bannière d'avertissement si proche de la limite */}
      {(isNearStudentLimit || isNearTeacherLimit) && !isAtStudentLimit && !isAtTeacherLimit && (
        <UpgradeBanner
          title="🎓 Votre école grandit!"
          description={`Vous approchez des limites (Élèves: ${stats.students}/${CORE_STUDENT_LIMIT}, Enseignants: ${stats.teachers}/${CORE_TEACHER_LIMIT}). Débloquez jusqu'à 500 élèves, enseignants illimités et bulletins professionnels avec App Académique.`}
          targetApp="App Académique"
          price="75 000"
          variant="warning"
          icon="crown"
        />
      )}

      {/* Stats principales - Effectifs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Effectifs de votre école</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Élèves"
            value={formatNumber(stats.students)}
            icon={GraduationCap}
            subtitle="Inscrits dans votre école"
            color="primary"
          />
          <StatCard
            title="Enseignants"
            value={formatNumber(stats.teachers)}
            icon={UserCheck}
            subtitle="Personnel enseignant"
            color="success"
          />
          <button onClick={() => window.location.href = '/users'}>
            <StatCard
              title="Personnel"
              value={formatNumber(stats.staff)}
              icon={Users}
              subtitle="Total collaborateurs"
              color="blue"
            />
          </button>
          <StatCard
            title="Classes"
            value={formatNumber(stats.classes)}
            icon={School}
            subtitle="Classes actives"
            color="secondary"
          />
        </div>
      </div>

      {/* Applications & Packs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos applications</h2>
        <div className={`grid grid-cols-1 gap-4 ${totalPendingRequests > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <StatCard
            title="Apps actives"
            value={formatNumber(stats.activeApps)}
            icon={Grid3x3}
            subtitle="Applications utilisées"
            color="primary"
            onClick={() => window.location.href = '/my-apps'}
          />
          <StatCard
            title="Packs actifs"
            value={formatNumber(stats.activeBundles)}
            icon={Package}
            subtitle="Packs souscrits"
            color="secondary"
          />
          {totalPendingRequests > 0 && (
            <StatCard
              title="Demandes en cours"
              value={formatNumber(totalPendingRequests)}
              icon={Clock}
              subtitle="En attente de validation"
              color="warning"
            />
          )}
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Répartition classes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vos classes</h3>
            <School className="h-6 w-6 text-primary-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nombre de classes</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(stats.classes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Élèves par classe</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.classes > 0 ? formatNumber(Math.round(stats.students / stats.classes)) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Enseignants par classe</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.classes > 0 ? (stats.teachers / stats.classes).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Utilisation plateforme */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilisation</h3>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Applications actives</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(stats.activeApps)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Packs actifs</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(stats.activeBundles)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Personnel actif</span>
              <span className="text-lg font-bold text-gray-900">{formatNumber(stats.staff)}</span>
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
            <span className="text-sm font-medium">Mon École</span>
          </button>
          <button
            onClick={() => window.location.href = '/users'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Personnel</span>
          </button>
          <button
            onClick={() => window.location.href = '/app-store'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Grid3x3 className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">App Store</span>
          </button>
          <button
            onClick={() => window.location.href = '/my-apps'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all relative"
          >
            <Package className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mes Apps</span>
            {totalPendingRequests > 0 && (
              <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                {totalPendingRequests}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
