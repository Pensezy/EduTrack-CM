/**
 * Dashboard Secrétaire
 *
 * Affiche les informations essentielles pour le secrétariat:
 * - Élèves inscrits dans l'école
 * - Inscriptions en attente
 * - Paiements récents et en retard
 * - Actions rapides
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  Users,
  UserPlus,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight
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

// Action Card Component
function ActionCard({ title, description, icon: Icon, onClick, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4 text-white text-left hover:shadow-lg transition-all w-full`}
    >
      <Icon className="h-8 w-8 mb-2" />
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </button>
  );
}

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schoolName: '',
    totalStudents: 0,
    pendingEnrollments: 0,
    pendingPayments: 0,
    totalPaymentsThisMonth: 0,
    overduePayments: 0,
    recentEnrollments: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.current_school_id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
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

      // Récupérer les stats en parallèle
      const [
        studentsRes,
        pendingEnrollmentsRes,
        paymentsRes,
        recentEnrollmentsRes,
      ] = await Promise.all([
        // Total élèves
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        // Inscriptions en attente
        supabase.from('enrollment_requests').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'pending'),
        // Paiements ce mois (si la table existe)
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).catch(() => ({ count: 0 })),
        // Inscriptions récentes (5 dernières)
        supabase.from('enrollment_requests').select('id, student_name, class_name, status, created_at').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        schoolName: schoolData?.name || 'Mon École',
        totalStudents: studentsRes.count || 0,
        pendingEnrollments: pendingEnrollmentsRes.count || 0,
        pendingPayments: 0, // À implémenter selon la structure de payments
        totalPaymentsThisMonth: paymentsRes?.count || 0,
        overduePayments: 0, // À implémenter
        recentEnrollments: recentEnrollmentsRes.data || [],
      });
    } catch (err) {
      console.error('Error fetching secretary dashboard data:', err);
      setError('Erreur lors du chargement des données');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord - Secrétariat
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.full_name || 'Secrétaire'} • {stats.schoolName}
        </p>
      </div>

      {/* Alertes */}
      {stats.pendingEnrollments > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">{stats.pendingEnrollments} inscription{stats.pendingEnrollments > 1 ? 's' : ''} en attente</span> de validation
              </p>
            </div>
            <button
              onClick={() => navigate('/secretary/enrollment')}
              className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
            >
              Voir <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Élèves"
          value={formatNumber(stats.totalStudents)}
          icon={Users}
          subtitle="Élèves inscrits"
          color="primary"
          onClick={() => navigate('/secretary/students')}
        />
        <StatCard
          title="Inscriptions en attente"
          value={formatNumber(stats.pendingEnrollments)}
          icon={UserPlus}
          subtitle="À traiter"
          color={stats.pendingEnrollments > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/secretary/enrollment')}
        />
        <StatCard
          title="Paiements ce mois"
          value={formatNumber(stats.totalPaymentsThisMonth)}
          icon={CreditCard}
          subtitle="Transactions"
          color="success"
          onClick={() => navigate('/secretary/payments')}
        />
        <StatCard
          title="Paiements en retard"
          value={formatNumber(stats.overduePayments)}
          icon={AlertCircle}
          subtitle="À relancer"
          color={stats.overduePayments > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/secretary/payments')}
        />
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="Nouvelle inscription"
            description="Ajouter un nouvel élève"
            icon={UserPlus}
            color="primary"
            onClick={() => navigate('/secretary/enrollment')}
          />
          <ActionCard
            title="Liste des élèves"
            description="Voir tous les élèves"
            icon={Users}
            color="blue"
            onClick={() => navigate('/secretary/students')}
          />
          <ActionCard
            title="Enregistrer paiement"
            description="Nouveau paiement"
            icon={CreditCard}
            color="success"
            onClick={() => navigate('/secretary/payments')}
          />
          <ActionCard
            title="Rapports"
            description="Générer des rapports"
            icon={FileText}
            color="warning"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Inscriptions récentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Inscriptions récentes</h2>
            <button
              onClick={() => navigate('/secretary/enrollment')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentEnrollments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune inscription récente
            </div>
          ) : (
            stats.recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                    <p className="text-sm text-gray-500">{enrollment.class_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enrollment.status === 'pending' ? 'En attente' :
                       enrollment.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(enrollment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
