import { useState, useEffect } from 'react';
import { useAuth, dashboardService } from '@edutrack/api';
import { formatCurrency, formatNumber } from '@edutrack/utils';
import {
  School,
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Stat Card Component
function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-purple-50 text-purple-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
            </div>
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
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // For now, use mock data. This will be replaced with actual API calls
      const mockMetrics = {
        totalSchools: 15,
        totalStudents: 3450,
        totalTeachers: 285,
        totalClasses: 142,
        pendingEnrollments: 23,
        activeUsers: 3820,
        monthlyRevenue: 45000000,
        schoolsGrowth: 12,
        studentsGrowth: 8,
        teachersGrowth: 5,
        revenueGrowth: 15,
        enrollmentsByMonth: [
          { month: 'Jan', count: 45 },
          { month: 'Fév', count: 52 },
          { month: 'Mar', count: 48 },
          { month: 'Avr', count: 65 },
          { month: 'Mai', count: 58 },
          { month: 'Juin', count: 72 }
        ],
        schoolsByType: [
          { name: 'Primaire', value: 8 },
          { name: 'Secondaire', value: 5 },
          { name: 'Lycée', value: 2 }
        ],
        recentActivities: [
          { id: 1, type: 'school', message: 'Nouvelle école ajoutée: École Primaire Les Bambins', time: 'Il y a 2 heures' },
          { id: 2, type: 'enrollment', message: '15 nouvelles demandes d\'inscription', time: 'Il y a 4 heures' },
          { id: 3, type: 'user', message: '5 nouveaux enseignants enregistrés', time: 'Il y a 1 jour' },
          { id: 4, type: 'payment', message: 'Paiement de 2.5M FCFA reçu', time: 'Il y a 1 jour' }
        ]
      };

      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Tableau de bord administratif
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.full_name || 'Administrateur'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <StatCard
          title="Écoles"
          value={formatNumber(metrics.totalSchools)}
          icon={School}
          trend={metrics.schoolsGrowth}
          color="primary"
        />
        <StatCard
          title="Élèves"
          value={formatNumber(metrics.totalStudents)}
          icon={Users}
          trend={metrics.studentsGrowth}
          color="secondary"
        />
        <StatCard
          title="Enseignants"
          value={formatNumber(metrics.totalTeachers)}
          icon={UserCheck}
          trend={metrics.teachersGrowth}
          color="success"
        />
        <StatCard
          title="Revenus (mois)"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={DollarSign}
          trend={metrics.revenueGrowth}
          color="warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-primary-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(metrics.totalClasses)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Demandes en attente</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(metrics.pendingEnrollments)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(metrics.activeUsers)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
        {/* Enrollment Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Inscriptions mensuelles
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.enrollmentsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                name="Inscriptions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Schools by Type */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Répartition des écoles
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics.schoolsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.schoolsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Activités récentes
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {metrics.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start pb-3 sm:pb-4 border-b border-gray-100 last:border-0">
              <div className="flex-shrink-0">
                {activity.type === 'school' && <School className="h-5 w-5 text-primary-600" />}
                {activity.type === 'enrollment' && <FileText className="h-5 w-5 text-yellow-600" />}
                {activity.type === 'user' && <Users className="h-5 w-5 text-green-600" />}
                {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-purple-600" />}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-words">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
