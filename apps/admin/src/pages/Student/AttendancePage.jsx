/**
 * Page Mes Présences - Élève
 *
 * Affiche l'historique des présences de l'élève
 */

import { useState, useEffect } from 'react';
import { useAuth, getSupabaseClient } from '@edutrack/api';
import {
  ClipboardCheck,
  AlertCircle,
  Check,
  X,
  Clock,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    rate: 100,
  });

  useEffect(() => {
    if (user?.id) {
      fetchAttendance();
    }
  }, [user?.id, filterMonth]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const supabase = getSupabaseClient();

      // Récupérer les infos de l'élève
      const { data: studentData } = await supabase
        .from('students')
        .select('id, full_name, class_id, classes:class_id (name)')
        .eq('user_id', user.id)
        .single();

      if (studentData) {
        setStudentInfo(studentData);
      }

      const studentId = studentData?.id || user.id;

      // Calculer les dates du mois
      const [year, month] = filterMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      // Récupérer les présences
      const { data, error: fetchError } = await supabase
        .from('attendance')
        .select('id, date, status, recorded_at')
        .eq('student_id', studentId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (fetchError && fetchError.code !== '42P01') {
        throw fetchError;
      }

      setAttendance(data || []);

      // Calculer les stats
      const presentCount = (data || []).filter(a => a.status === 'present').length;
      const absentCount = (data || []).filter(a => a.status === 'absent').length;
      const lateCount = (data || []).filter(a => a.status === 'late').length;
      const total = (data || []).length;

      setStats({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total,
        rate: total > 0 ? Math.round((presentCount / total) * 100) : 100,
      });
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Erreur lors du chargement des présences');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-600" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'En retard';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Présences</h1>
        <p className="mt-1 text-sm text-gray-500">
          Historique de mes présences en classe
        </p>
      </div>

      {/* Filtre mois */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Error */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
          <p className="text-xs text-gray-500">Taux de présence</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-gray-500">Présences</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-gray-500">Absences</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-xs text-gray-500">Retards</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du mois</span>
          <span className="text-sm text-gray-500">{stats.total} jours enregistrés</span>
        </div>
        <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
          {stats.present > 0 && (
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
              title={`${stats.present} présences`}
            ></div>
          )}
          {stats.late > 0 && (
            <div
              className="bg-yellow-500 transition-all"
              style={{ width: `${(stats.late / (stats.total || 1)) * 100}%` }}
              title={`${stats.late} retards`}
            ></div>
          )}
          {stats.absent > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(stats.absent / (stats.total || 1)) * 100}%` }}
              title={`${stats.absent} absences`}
            ></div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span> Présent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded"></span> Retard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span> Absent
          </span>
        </div>
      </div>

      {/* Liste des présences */}
      {attendance.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune présence enregistrée</h3>
          <p className="text-sm text-gray-500">
            Aucune donnée de présence pour cette période.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {studentInfo?.classes?.name || 'Ma classe'}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
