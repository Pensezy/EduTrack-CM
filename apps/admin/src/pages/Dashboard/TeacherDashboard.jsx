/**
 * Dashboard Enseignant
 *
 * Affiche les informations essentielles pour l'enseignant:
 * - Ses classes assignées
 * - Nombre d'élèves
 * - Présences du jour
 * - Actions rapides
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  BookOpen,
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

// Class Card Component
function ClassCard({ className, level, studentCount, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{className}</h3>
          <p className="text-sm text-gray-500">{level}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">{studentCount}</p>
          <p className="text-xs text-gray-500">élèves</p>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    schoolName: '',
    totalClasses: 0,
    totalStudents: 0,
    attendanceToday: { present: 0, absent: 0, total: 0 },
    classes: [],
  });
  const [error, setError] = useState('');

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

      // Récupérer les infos de l'école
      let schoolName = 'Mon École';
      if (user.current_school_id) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('name')
          .eq('id', user.current_school_id)
          .single();
        schoolName = schoolData?.name || schoolName;
      }

      // Récupérer les classes de l'enseignant
      // On suppose qu'il y a une relation teacher_classes ou que le teacher_id est dans classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          level,
          school_id
        `)
        .eq('school_id', user.current_school_id);

      // Pour chaque classe, compter les élèves
      let totalStudents = 0;
      const classesWithCounts = [];

      if (classesData) {
        for (const cls of classesData) {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          classesWithCounts.push({
            ...cls,
            studentCount: count || 0
          });
          totalStudents += count || 0;
        }
      }

      // Présences du jour (si la table existe)
      const today = new Date().toISOString().split('T')[0];
      let attendanceToday = { present: 0, absent: 0, total: 0 };

      try {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('date', today)
          .eq('school_id', user.current_school_id);

        if (attendanceData) {
          attendanceToday = {
            present: attendanceData.filter(a => a.status === 'present').length,
            absent: attendanceData.filter(a => a.status === 'absent').length,
            total: attendanceData.length,
          };
        }
      } catch (e) {
        // Table attendance n'existe peut-être pas encore
      }

      setStats({
        schoolName,
        totalClasses: classesWithCounts.length,
        totalStudents,
        attendanceToday,
        classes: classesWithCounts.slice(0, 5), // 5 premières classes
      });
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
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

  const attendanceRate = stats.attendanceToday.total > 0
    ? Math.round((stats.attendanceToday.present / stats.attendanceToday.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord - Enseignant
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {user?.full_name || 'Enseignant'} • {stats.schoolName}
        </p>
      </div>

      {/* Date du jour */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-primary-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-primary-800">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Mes Classes"
          value={formatNumber(stats.totalClasses)}
          icon={GraduationCap}
          subtitle="Classes assignées"
          color="primary"
          onClick={() => navigate('/teacher/classes')}
        />
        <StatCard
          title="Mes Élèves"
          value={formatNumber(stats.totalStudents)}
          icon={Users}
          subtitle="Total élèves"
          color="blue"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          title="Présents aujourd'hui"
          value={`${stats.attendanceToday.present}/${stats.attendanceToday.total || stats.totalStudents}`}
          icon={CheckCircle}
          subtitle={stats.attendanceToday.total > 0 ? `${attendanceRate}% de présence` : 'Non enregistré'}
          color="success"
          onClick={() => navigate('/teacher/attendance')}
        />
        <StatCard
          title="Absents aujourd'hui"
          value={formatNumber(stats.attendanceToday.absent)}
          icon={AlertCircle}
          subtitle="Élèves absents"
          color={stats.attendanceToday.absent > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/teacher/attendance')}
        />
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <ClipboardCheck className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Faire l'appel</span>
          </button>
          <button
            onClick={() => navigate('/teacher/classes')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <GraduationCap className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mes Classes</span>
          </button>
          <button
            onClick={() => navigate('/teacher/students')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mes Élèves</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-all"
          >
            <BookOpen className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mon Profil</span>
          </button>
        </div>
      </div>

      {/* Mes Classes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mes Classes</h2>
          <button
            onClick={() => navigate('/teacher/classes')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            Voir tout <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        {stats.classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            Aucune classe assignée pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.classes.map((cls) => (
              <ClassCard
                key={cls.id}
                className={cls.name}
                level={cls.level}
                studentCount={cls.studentCount}
                onClick={() => navigate(`/teacher/classes?id=${cls.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
