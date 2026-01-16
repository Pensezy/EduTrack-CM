/**
 * Dashboard Élève
 *
 * Affiche les informations essentielles pour l'élève:
 * - Emploi du temps
 * - Mes présences
 * - Informations de la classe
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import { formatNumber } from '@edutrack/utils';
import {
  GraduationCap,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
  BookOpen,
  ArrowRight,
  School
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
    indigo: 'bg-indigo-50 text-indigo-600',
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    schoolName: '',
    className: '',
    studentName: '',
    attendanceThisMonth: { present: 0, absent: 0, total: 0 },
    attendanceRate: 0,
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

      // Récupérer les infos de l'élève
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          full_name,
          class_id,
          school_id,
          classes:class_id (name, level),
          schools:school_id (name)
        `)
        .eq('user_id', user.id)
        .single();

      if (studentError && studentError.code !== 'PGRST116') {
        throw studentError;
      }

      // Si pas de données student, utiliser les infos du user
      let schoolName = 'Mon École';
      let className = 'Ma Classe';
      let studentName = user.full_name || 'Élève';

      if (studentData) {
        schoolName = studentData.schools?.name || schoolName;
        className = studentData.classes?.name || className;
        studentName = studentData.full_name || studentName;
      } else if (user.current_school_id) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('name')
          .eq('id', user.current_school_id)
          .single();
        schoolName = schoolData?.name || schoolName;
      }

      // Calculer les présences du mois
      let attendanceThisMonth = { present: 0, absent: 0, total: 0 };
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      try {
        const studentId = studentData?.id || user.id;
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentId)
          .gte('date', startOfMonth.toISOString().split('T')[0]);

        if (attendanceData) {
          attendanceThisMonth = {
            present: attendanceData.filter(a => a.status === 'present').length,
            absent: attendanceData.filter(a => a.status === 'absent').length,
            total: attendanceData.length,
          };
        }
      } catch (e) {
        // Table attendance n'existe peut-être pas
      }

      const attendanceRate = attendanceThisMonth.total > 0
        ? Math.round((attendanceThisMonth.present / attendanceThisMonth.total) * 100)
        : 100;

      setStudentInfo({
        schoolName,
        className,
        studentName,
        attendanceThisMonth,
        attendanceRate,
      });
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
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
      {/* Header avec profil */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {studentInfo.studentName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{studentInfo.studentName}</h1>
            <p className="text-indigo-100">{studentInfo.className} • {studentInfo.schoolName}</p>
          </div>
        </div>
      </div>

      {/* Date du jour */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <div className="ml-3">
            <p className="text-sm font-medium text-indigo-800">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Ma Classe"
          value={studentInfo.className}
          icon={GraduationCap}
          subtitle={studentInfo.schoolName}
          color="indigo"
        />
        <StatCard
          title="Taux de présence"
          value={`${studentInfo.attendanceRate}%`}
          icon={CheckCircle}
          subtitle="Ce mois-ci"
          color={studentInfo.attendanceRate >= 80 ? 'success' : studentInfo.attendanceRate >= 60 ? 'warning' : 'danger'}
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          title="Absences ce mois"
          value={formatNumber(studentInfo.attendanceThisMonth.absent)}
          icon={AlertCircle}
          subtitle={`sur ${studentInfo.attendanceThisMonth.total} jours`}
          color={studentInfo.attendanceThisMonth.absent === 0 ? 'success' : 'warning'}
          onClick={() => navigate('/student/attendance')}
        />
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon Espace</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate('/student/schedule')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Emploi du temps</h3>
                <p className="text-sm text-gray-500">Voir mon planning</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => navigate('/student/attendance')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mes Présences</h3>
                <p className="text-sm text-gray-500">Historique de présence</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => navigate('/student/profile')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mon Profil</h3>
                <p className="text-sm text-gray-500">Mes informations</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </button>
        </div>
      </div>

      {/* Info école */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
            <School className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{studentInfo.schoolName}</h3>
            <p className="text-sm text-gray-500">Mon établissement</p>
          </div>
        </div>
      </div>
    </div>
  );
}
