/**
 * Dashboard Parent
 *
 * Affiche les informations essentielles pour le parent:
 * - Liste de ses enfants
 * - Présences récentes
 * - Paiements à faire
 * - Actions rapides
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber, formatCurrency } from '@edutrack/utils';
import {
  Users,
  GraduationCap,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Calendar,
  Baby,
  ArrowRight,
  School,
  Clock,
  ClipboardCheck
} from 'lucide-react';

// Child Card Component
function ChildCard({ child, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
          {child.full_name?.charAt(0) || 'E'}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{child.full_name}</h3>
          <p className="text-sm text-gray-500">{child.class_name || 'Classe non assignée'}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {child.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, subtitle, color = 'primary', onClick }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-purple-50 text-purple-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
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

export default function ParentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    children: [],
    totalChildren: 0,
    attendanceThisWeek: { present: 0, absent: 0 },
    pendingPayments: 0,
    pendingAmount: 0,
  });
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer les enfants du parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          class_id,
          status,
          school_id,
          classes:class_id (name)
        `)
        .eq('parent_id', user.id);

      if (childrenError) throw childrenError;

      // Formater les données des enfants
      const children = (childrenData || []).map(child => ({
        ...child,
        class_name: child.classes?.name || 'Non assigné'
      }));

      // Calculer les présences de la semaine (si la table existe)
      let attendanceThisWeek = { present: 0, absent: 0 };
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      if (children.length > 0) {
        try {
          const childIds = children.map(c => c.id);
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('status')
            .in('student_id', childIds)
            .gte('date', startOfWeek.toISOString().split('T')[0]);

          if (attendanceData) {
            attendanceThisWeek = {
              present: attendanceData.filter(a => a.status === 'present').length,
              absent: attendanceData.filter(a => a.status === 'absent').length,
            };
          }
        } catch (e) {
          // Table attendance n'existe peut-être pas
        }
      }

      // Récupérer les paiements en attente (si la table existe)
      let pendingPayments = 0;
      let pendingAmount = 0;

      try {
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('parent_id', user.id)
          .eq('status', 'pending');

        if (paymentsData) {
          pendingPayments = paymentsData.length;
          pendingAmount = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        }
      } catch (e) {
        // Table payments n'existe peut-être pas
      }

      setStats({
        children,
        totalChildren: children.length,
        attendanceThisWeek,
        pendingPayments,
        pendingAmount,
      });

      // Sélectionner le premier enfant par défaut
      if (children.length > 0) {
        setSelectedChild(children[0]);
      }
    } catch (err) {
      console.error('Error fetching parent dashboard data:', err);
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
          Espace Parent
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.full_name || 'Parent'}
        </p>
      </div>

      {/* Alerte paiements en attente */}
      {stats.pendingPayments > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Vous avez <span className="font-medium">{stats.pendingPayments} paiement{stats.pendingPayments > 1 ? 's' : ''} en attente</span>
                {stats.pendingAmount > 0 && ` pour un total de ${formatCurrency(stats.pendingAmount)} FCFA`}
              </p>
            </div>
            <button
              onClick={() => navigate('/parent/payments')}
              className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
            >
              Payer <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mes Enfants"
          value={formatNumber(stats.totalChildren)}
          icon={Baby}
          subtitle="Enfants inscrits"
          color="pink"
          onClick={() => navigate('/parent/children')}
        />
        <StatCard
          title="Présences cette semaine"
          value={formatNumber(stats.attendanceThisWeek.present)}
          icon={CheckCircle}
          subtitle="Jours de présence"
          color="success"
          onClick={() => navigate('/parent/attendance')}
        />
        <StatCard
          title="Absences cette semaine"
          value={formatNumber(stats.attendanceThisWeek.absent)}
          icon={AlertCircle}
          subtitle="Jours d'absence"
          color={stats.attendanceThisWeek.absent > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/parent/attendance')}
        />
        <StatCard
          title="Paiements en attente"
          value={formatNumber(stats.pendingPayments)}
          icon={CreditCard}
          subtitle={stats.pendingAmount > 0 ? `${formatCurrency(stats.pendingAmount)} FCFA` : 'Aucun'}
          color={stats.pendingPayments > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/parent/payments')}
        />
      </div>

      {/* Sélecteur d'enfant si plusieurs */}
      {stats.children.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un enfant:
          </label>
          <select
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = stats.children.find(c => c.id === e.target.value);
              setSelectedChild(child);
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {stats.children.map(child => (
              <option key={child.id} value={child.id}>
                {child.full_name} - {child.class_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mes Enfants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mes Enfants</h2>
          <button
            onClick={() => navigate('/parent/children')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            Voir détails <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        {stats.children.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            <Baby className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p>Aucun enfant inscrit pour le moment</p>
            <p className="text-sm mt-1">Contactez l'administration de l'école pour inscrire vos enfants.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stats.children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onClick={() => navigate(`/parent/children?id=${child.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => navigate('/parent/children')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Baby className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mes Enfants</span>
          </button>
          <button
            onClick={() => navigate('/parent/attendance')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <ClipboardCheck className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Présences</span>
          </button>
          <button
            onClick={() => navigate('/parent/payments')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all relative"
          >
            <CreditCard className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Paiements</span>
            {stats.pendingPayments > 0 && (
              <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-yellow-500 rounded-full">
                {stats.pendingPayments}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mon Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

